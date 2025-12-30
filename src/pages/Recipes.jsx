import { useEffect, useMemo, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../styles/recipes.css";
import { auth, db } from "../firebase";

const CATEGORY_FILTERS = ["All", "Breakfast", "Dinner", "Lunch", "Dessert"];
const COLLECTION_FILTERS = ["All", "Recently made", "Favourites"];
const CATEGORY_OPTIONS = CATEGORY_FILTERS.filter((category) => category !== "All");
const STAT_FIELDS = [
  { id: "time", label: "Time", icon: "schedule", placeholder: "30 min" },
  {
    id: "calories",
    label: "Calories",
    icon: "local_fire_department",
    placeholder: "450",
  },
  { id: "proteins", label: "Proteins", icon: "egg_alt", placeholder: "25g" },
  { id: "fats", label: "Fats", icon: "water_drop", placeholder: "15g" },
  { id: "carbs", label: "Carbs", icon: "ac_unit", placeholder: "55g" },
];
const initialRecipeForm = {
  name: "",
  description: "",
  imageUrl: "",
  category: CATEGORY_OPTIONS[0],
  ingredients: "",
  time: "",
  calories: "",
  proteins: "",
  fats: "",
  carbs: "",
  steps: [""],
};
const FALLBACK_RECIPES = [
  {
    id: "placeholder-1",
    name: "Lorem ipsum pasta",
    category: "Dinner",
    isFavorite: true,
    lastMadeAt: "2024-06-05",
  },
  {
    id: "placeholder-2",
    name: "Dolor sit pancakes",
    category: "Breakfast",
    isFavorite: false,
    lastMadeAt: "2024-05-10",
  },
  {
    id: "placeholder-3",
    name: "Consectetur salad",
    category: "Lunch",
    isFavorite: false,
    lastMadeAt: null,
  },
];

function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(CATEGORY_FILTERS[0]);
  const [activeCollection, setActiveCollection] =
    useState(COLLECTION_FILTERS[0]);
  const [recipes, setRecipes] = useState([]);
  const [user, setUser] = useState(() => auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState(initialRecipeForm);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
    });

    const recipesRef = collection(db, "recipes");
    const unsubscribe = onSnapshot(
      recipesRef,
      (snapshot) => {
        if (snapshot.empty) {
          setRecipes(FALLBACK_RECIPES);
          setUsingFallback(true);
        } else {
          const docs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setRecipes(docs);
          setUsingFallback(false);
        }
        setLoading(false);
      },
      (snapshotError) => {
        console.error("Failed to load recipes", snapshotError);
        setError("Nie udało się załadować przepisów.");
        setRecipes(FALLBACK_RECIPES);
        setUsingFallback(true);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
      unsubscribeAuth();
    };
  }, []);

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return recipes.filter((recipe) => {
      const name = recipe.name || recipe.title || "";
      const matchesSearch = name.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        activeCategory === "All" ||
        (recipe.category || "All") === activeCategory;

      let matchesCollection = true;
      if (activeCollection === "Recently made") {
        matchesCollection = Boolean(recipe.lastMadeAt);
      } else if (activeCollection === "Favourites") {
        matchesCollection = Boolean(recipe.isFavorite);
      }

      return matchesSearch && matchesCategory && matchesCollection;
    });
  }, [recipes, searchQuery, activeCategory, activeCollection]);

  const handleToggleForm = () => {
    setShowForm((prev) => !prev);
    setNewRecipe(initialRecipeForm);
    setFormError(null);
    setFormSuccess("");
  };

  const handleFieldChange = (field, value) => {
    setNewRecipe((prev) => ({ ...prev, [field]: value }));
  };

  const handleStepChange = (index, value) => {
    setNewRecipe((prev) => {
      const updated = [...prev.steps];
      updated[index] = value;
      return { ...prev, steps: updated };
    });
  };

  const handleAddStep = () => {
    setNewRecipe((prev) => ({ ...prev, steps: [...prev.steps, ""] }));
  };

  const handleRemoveStep = (index) => {
    setNewRecipe((prev) => {
      const updated = prev.steps.filter((_, idx) => idx !== index);
      return { ...prev, steps: updated.length ? updated : [""] };
    });
  };

  const handleCancelForm = () => {
    setNewRecipe(initialRecipeForm);
    setFormError(null);
    setFormSuccess("");
    setShowForm(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      setFormError("Musisz być zalogowana, żeby dodać przepis.");
      return;
    }

    const trimmedName = newRecipe.name.trim();
    const trimmedDescription = newRecipe.description.trim();
    const stepsList = newRecipe.steps
      .map((step) => step.trim())
      .filter(Boolean);
    const ingredientsList = newRecipe.ingredients
      .split("\n")
      .map((ingredient) => ingredient.trim())
      .filter(Boolean);

    if (!trimmedName) {
      setFormError("Recipe name is required.");
      return;
    }
    if (stepsList.length === 0) {
      setFormError("Add at least one step.");
      return;
    }
    setFormError(null);
    setSaving(true);

    try {
      const payload = {
        name: trimmedName,
        description: trimmedDescription,
        imageUrl: newRecipe.imageUrl.trim(),
        ingredients: ingredientsList,
        steps: stepsList,
        category: newRecipe.category,
        time: newRecipe.time.trim(),
        calories: newRecipe.calories.trim(),
        proteins: newRecipe.proteins.trim(),
        fats: newRecipe.fats.trim(),
        carbs: newRecipe.carbs.trim(),
        isFavorite: false,
        uid: user.uid,
        createdAt: serverTimestamp(),
        lastMadeAt: null,
      };
      await addDoc(collection(db, "recipes"), payload);
      setFormSuccess("Recipe saved!");
      setNewRecipe(initialRecipeForm);
    } catch (submitError) {
      console.error("Failed to save recipe", submitError);
      setFormError("Failed to save recipe. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-content recipes-page">
      <h1>Recipes</h1>
      <section className="recipes-search">
        <label
          className="recipes-search-field"
          htmlFor="recipes-search-input"
        >
          <span className="material-symbols-outlined search-icon">search</span>
          <input
            id="recipes-search-input"
            type="search"
            placeholder="Search recipes"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </label>
      </section>

      <section className="recipes-filters">
        <div className="recipes-filter-card">
          <div className="filter-card-header">
            <h2>Categories</h2>
          </div>
          <div className="filter-chip-list">
            {CATEGORY_FILTERS.map((category) => (
              <button
                key={category}
                type="button"
                className={`filter-chip ${
                  activeCategory === category ? "is-active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="recipes-filter-card">
          <div className="filter-card-header">
            <h2>My recipes</h2>
            <button
              type="button"
              className="add-recipe-button"
              onClick={handleToggleForm}
            >
              <span className="material-symbols-outlined">
                {showForm ? "close" : "add"}
              </span>
              {showForm ? "Close form" : "Add new"}
            </button>
          </div>
          <div className="filter-chip-list">
            {COLLECTION_FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                className={`filter-chip ${
                  activeCollection === filter ? "is-active" : ""
                }`}
                onClick={() => setActiveCollection(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </section>

      {showForm && (
        <section className="recipe-create-section">
          <form className="recipe-create-card" onSubmit={handleSubmit}>
            <div className="recipe-form-hero">
              <div className="recipe-hero-visual">
                {newRecipe.imageUrl ? (
                  <img src={newRecipe.imageUrl} alt="Recipe preview" />
                ) : (
                  <span className="material-symbols-outlined">
                    add_photo_alternate
                  </span>
                )}
              </div>
              <div className="recipe-hero-fields">
                <div className="recipe-hero-basic">
                  <label className="recipe-form-field">
                    <span>Recipe name</span>
                    <input
                      type="text"
                      placeholder="Lorem ipsum"
                      value={newRecipe.name}
                      onChange={(event) =>
                        handleFieldChange("name", event.target.value)
                      }
                      required
                    />
                  </label>
                  <label className="recipe-form-field">
                    <span>Image link</span>
                    <input
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={newRecipe.imageUrl}
                      onChange={(event) =>
                        handleFieldChange("imageUrl", event.target.value)
                      }
                    />
                  </label>
                </div>
                <div className="recipe-hero-description">
                  <label className="recipe-form-field">
                    <span>Description</span>
                    <textarea
                      placeholder="Describe your recipe..."
                      value={newRecipe.description}
                      onChange={(event) =>
                        handleFieldChange("description", event.target.value)
                      }
                      rows={6}
                    />
                  </label>
                </div>
              </div>
            </div>

            <label className="recipe-form-field recipe-hero-category">
              <span>Category</span>
              <select
                value={newRecipe.category}
                onChange={(event) =>
                  handleFieldChange("category", event.target.value)
                }
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <div className="recipe-form-metrics">
              {STAT_FIELDS.map((field) => (
                <label key={field.id} className="metric-card">
                  <span className="material-symbols-outlined">{field.icon}</span>
                  <span className="metric-label">{field.label}</span>
                  <input
                    type="text"
                    value={newRecipe[field.id]}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      handleFieldChange(field.id, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>

            <div className="recipe-form-body">
              <div className="recipe-steps">
                <h3>Steps</h3>
                <ol>
                  {newRecipe.steps.map((step, index) => (
                    <li key={`step-${index}`}>
                      <textarea
                        rows={2}
                        placeholder={`Describe step ${index + 1}`}
                        value={step}
                        onChange={(event) =>
                          handleStepChange(index, event.target.value)
                        }
                      />
                      {newRecipe.steps.length > 1 && (
                        <button
                          type="button"
                          className="remove-step-button"
                          onClick={() => handleRemoveStep(index)}
                        >
                          Remove
                        </button>
                      )}
                    </li>
                  ))}
                </ol>
                <button
                  type="button"
                  className="add-step-button"
                  onClick={handleAddStep}
                >
                  <span className="material-symbols-outlined">add</span>
                  Add next step
                </button>
              </div>

              <div className="recipe-ingredients">
                <h3>Ingredients</h3>
                <textarea
                  rows={10}
                  placeholder="List each ingredient on a new line"
                  value={newRecipe.ingredients}
                  onChange={(event) =>
                    handleFieldChange("ingredients", event.target.value)
                  }
                />
              </div>
            </div>

            {formError && <div className="recipe-form-error">{formError}</div>}
            {formSuccess && (
              <div className="recipe-form-success">{formSuccess}</div>
            )}

            <div className="recipe-form-actions">
              <button
                className="default-button save-recipe-button"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save recipe"}
              </button>
              <button
                type="button"
                className="cancel-recipe-button"
                onClick={handleCancelForm}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="recipes-list">
        {error && (
          <div className="recipes-message error">
            {error} Wyświetlam przykładowe przepisy.
          </div>
        )}

        {loading ? (
          <div className="recipes-message">Ładowanie przepisów...</div>
        ) : filteredRecipes.length === 0 ? (
          <div className="recipes-message">
            {usingFallback
              ? "Brak przepisów — dodaj swój pierwszy!"
              : "Brak wyników dla wybranych filtrów."}
          </div>
        ) : (
          <div className="recipe-grid">
            {filteredRecipes.map((recipe) => (
              <article className="recipe-card" key={recipe.id}>
                <div className="recipe-card-body">
                  <div className="recipe-thumbnail">
                    {recipe.imageUrl ? (
                      <img src={recipe.imageUrl} alt={recipe.name} />
                    ) : (
                      <span className="material-symbols-outlined">
                        add_photo_alternate
                      </span>
                    )}
                  </div>

                  <div className="recipe-actions">
                    <button
                      type="button"
                      className="recipe-action-button favorite"
                      aria-label="Favourite recipe"
                      title={
                        recipe.isFavorite
                          ? "Remove from favourites"
                          : "Add to favourites"
                      }
                    >
                      <span className="material-symbols-outlined">
                        {recipe.isFavorite ? "favorite" : "favorite_border"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="recipe-action-button"
                      aria-label="Edit recipe"
                      title="Edit recipe"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      type="button"
                      className="recipe-action-button"
                      aria-label="Share recipe"
                      title="Share recipe"
                    >
                      <span className="material-symbols-outlined">share</span>
                    </button>
                    <button
                      type="button"
                      className="recipe-action-button danger"
                      aria-label="Delete recipe"
                      title="Delete recipe"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </div>

                <footer className="recipe-card-footer">
                  <p>{recipe.name || "Bez nazwy"}</p>
                </footer>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Recipes;
