import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import "../styles/goals.css";

const initialGoal = {
  calories: "",
  proteins: "",
  fats: "",
  carbs: "",
  to: "None",
};

function Goals() {
  const [user, setUser] = useState(() => auth.currentUser);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState(initialGoal);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const today = () => new Date().toISOString().slice(0, 10);

  const handleCancel = () => {
    setShowForm(false);
    setNewGoal(initialGoal);
    setError(null);
  };

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (fbUser) => {
      setUser(fbUser);
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) {
      setGoals([]);
      return;
    }

    const goalsRef = collection(db, "goals");
    const q = query(goalsRef, where("uid", "==", user.uid));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .sort((a, b) => {
          const aTs = a.createdAt?.seconds || 0;
          const bTs = b.createdAt?.seconds || 0;
          return bTs - aTs;
        });
      setGoals(data);
    }, (err) => {
      setError(err.message || "Failed to load goals.");
    });

    return unsub;
  }, [user]);

  const handleAddGoal = async (event) => {
    event.preventDefault();
    if (!showForm) {
      setShowForm(true);
      setError(null);
      return;
    }
    if (!user) {
      setError("You must be logged in to add a goal.");
      return;
    }

    const proteinsNum = Number(newGoal.proteins);
    const carbsNum = Number(newGoal.carbs);
    const fatsNum = Number(newGoal.fats);
    const caloriesNum = Number(newGoal.calories);

    if (
      !Number.isFinite(proteinsNum) ||
      !Number.isFinite(carbsNum) ||
      !Number.isFinite(fatsNum) ||
      !Number.isFinite(caloriesNum)
    ) {
      setError("All fields must be numbers.");
      return;
    }

    const macroCalories = proteinsNum * 4 + carbsNum * 4 + fatsNum * 9;
    const macroRounded = Math.round(macroCalories);
    const caloriesRounded = Math.round(caloriesNum);
    const tolerance = 5;
    const gap = caloriesRounded - macroRounded;

    if (Math.abs(gap) > tolerance) {
      const adjustWord = gap > 0 ? "Add" : "Remove";
      const gCarbProt = Math.ceil(Math.abs(gap) / 4);
      const gFat = Math.ceil(Math.abs(gap) / 9);
      setError(
        `Calories mismatch by ${gap > 0 ? "+" : ""}${gap} kcal. ${adjustWord} about ${gCarbProt}g carbs/proteins or ${gFat}g fats (±${tolerance} kcal allowed).`
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // close out the latest goal range by setting its "to" date to today
      const latestGoalId = [...goals]
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))[0]?.id;
      if (latestGoalId) {
        await updateDoc(doc(db, "goals", latestGoalId), { to: today(), uid: user.uid });
      }

      const payload = {
        calories: caloriesNum,
        proteins: proteinsNum,
        fats: fatsNum,
        carbs: carbsNum,
        from: today(),
        to: newGoal.to || "None",
        uid: user.uid,
        createdAt: serverTimestamp(),
      };
      const docRef = await addDoc(collection(db, "goals"), payload);

      // Optimistically show the new goal while waiting for snapshot
      setGoals((prev) => [
        { id: docRef.id, ...payload },
        ...prev.filter((g) => g.id !== docRef.id),
      ]);
      setNewGoal(initialGoal);
    } catch (err) {
      setError(err.message || "Failed to save goal.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="goals-page">
      <form className="goals-form" onSubmit={handleAddGoal}>
        <div className="goals-header">
          <h1>
            Your Goals, <span className="light-weight">keep it up</span>
          </h1>
          <button
            className="default-button add-goal-btn"
            type="button"
            onClick={() => setShowForm(true)}
            disabled={saving}
          >
            + Add new
          </button>
        </div>
        {error && !showForm && <div className="goals-error">{error}</div>}

        {showForm && (
          <>
            <div className="goal-fields-row">
              <label className="goal-field">
                <span>Calories</span>
                <input
                  type="number"
                  value={newGoal.calories}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, calories: e.target.value })
                  }
                  required
                />
              </label>
              <label className="goal-field">
                <span>Proteins</span>
                <input
                  type="number"
                  value={newGoal.proteins}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, proteins: e.target.value })
                  }
                  required
                />
              </label>
              <label className="goal-field">
                <span>Fats</span>
                <input
                  type="number"
                  value={newGoal.fats}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, fats: e.target.value })
                  }
                  required
                />
              </label>
              <label className="goal-field">
                <span>Carbs</span>
                <input
                  type="number"
                  value={newGoal.carbs}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, carbs: e.target.value })
                  }
                  required
                />
              </label>
            </div>
            {error && <div className="goals-error">{error}</div>}
            <div className="goal-actions">
              <button
                className="default-button add-goal-btn save-goal-btn"
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save goal"}
              </button>
              <button
                type="button"
                className="cancel-goal-btn default-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </form>

      <div className="goals-table-wrapper">
        <table className="goals-table">
          <thead>
            <tr>
              <th>
                <span className="material-symbols-outlined header-icon">
                  today
                </span>
                From
              </th>
              <th>
                <span className="material-symbols-outlined header-icon">
                  event
                </span>
                To
              </th>
              <th>
                <span className="material-symbols-outlined header-icon">
                  local_fire_department
                </span>
                Calories
              </th>
              <th>
                <span className="material-symbols-outlined header-icon">egg_alt</span>
                Proteins
              </th>
              <th>
                <span className="material-symbols-outlined header-icon">
                  water_drop
                </span>
                Fats
              </th>
              <th>
                <span className="material-symbols-outlined header-icon">
                  graph_5
                </span>
                Carbs
              </th>
            </tr>
          </thead>
          <tbody>
            {goals.length === 0 ? (
              <tr>
                <td colSpan={6} className="empty-row">
                  {user ? "No goals yet." : "Log in to view your goals."}
                </td>
              </tr>
            ) : (
              goals.map((goal) => (
                <tr key={goal.id}>
                  <td>{goal.from}</td>
                  <td>
                    {goal.to === "None" ? (
                      <span className="goal-current">Current</span>
                    ) : (
                      goal.to
                    )}
                  </td>
                  <td>{goal.calories}</td>
                  <td>{goal.proteins}</td>
                  <td>{goal.fats}</td>
                  <td>{goal.carbs}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Goals;
