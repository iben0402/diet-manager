import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import "../styles/goals.css";

const initialGoal = {
  from: "",
  to: "",
  calories: "",
  proteins: "",
  fats: "",
  carbs: "",
};

function Goals() {
  const [user, setUser] = useState(() => auth.currentUser);
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState(initialGoal);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

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
    const q = query(
      goalsRef,
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(data);
    });

    return unsub;
  }, [user]);

  const handleAddGoal = async (event) => {
    event.preventDefault();
    if (!showForm) {
      setShowForm(true);
      return;
    }
    if (!user) {
      setError("You must be logged in to add a goal.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await addDoc(collection(db, "goals"), {
        ...newGoal,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
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
          <button className="default-button add-goal-btn" type="submit" disabled={saving}>
            {saving ? "Saving..." : "+ Add new"}
          </button>
        </div>

        {showForm && (
          <>
            <div className="goal-fields-row">
              <label className="goal-field">
                <span>From</span>
                <input
                  type="text"
                  value={newGoal.from}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, from: e.target.value })
                  }
                  required
                />
              </label>
              <label className="goal-field">
                <span>To</span>
                <input
                  type="text"
                  value={newGoal.to}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, to: e.target.value })
                  }
                  required
                />
              </label>
              <label className="goal-field">
                <span>Calories</span>
                <input
                  type="text"
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
                  type="text"
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
                  type="text"
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
                  type="text"
                  value={newGoal.carbs}
                  onChange={(e) =>
                    setNewGoal({ ...newGoal, carbs: e.target.value })
                  }
                  required
                />
              </label>
            </div>
            {error && <div className="goals-error">{error}</div>}
          </>
        )}
      </form>

      <div className="goals-table-wrapper">
        <table className="goals-table">
          <thead>
            <tr>
              <th>
                <span className="material-symbols-outlined header-icon">
                  calendar_today
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
                <span className="material-symbols-outlined header-icon">egg</span>
                Proteins
              </th>
              <th>
                <span className="material-symbols-outlined header-icon">
                  oil_barrel
                </span>
                Fats
              </th>
              <th>
                <span className="material-symbols-outlined header-icon">
                  grain
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
                  <td>{goal.to}</td>
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
