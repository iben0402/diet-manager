import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import "../styles/recipes.css";
import { db } from "../firebase";

const CATEGORY_FILTERS = ["All", "Breakfast", "Dinner", "Lunch", "Dessert"];
const COLLECTION_FILTERS = ["All", "Recently made", "Favourites"];
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
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

    return () => unsubscribe();
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

  return (
    <div className="page-content recipes-page">
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
            <button type="button" className="add-recipe-button">
              <span className="material-symbols-outlined">add</span>
              Add new
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
                    >
                      <span className="material-symbols-outlined">
                        {recipe.isFavorite ? "favorite" : "favorite_border"}
                      </span>
                    </button>
                    <button
                      type="button"
                      className="recipe-action-button"
                      aria-label="Edit recipe"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      type="button"
                      className="recipe-action-button"
                      aria-label="Share recipe"
                    >
                      <span className="material-symbols-outlined">share</span>
                    </button>
                    <button
                      type="button"
                      className="recipe-action-button danger"
                      aria-label="Delete recipe"
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
