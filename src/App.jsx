import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Main from "./pages/Main.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Goals from "./pages/Goals.jsx";
import Recipes from "./pages/Recipes.jsx";
import Plan from "./pages/Plan.jsx";
import GroceryList from "./pages/GroceryList.jsx";
import Measurements from "./pages/Measurements.jsx";
import Friends from "./pages/Friends.jsx";
import Invite from "./pages/Invite.jsx";
import Settings from "./pages/Settings.jsx";
import Help from "./pages/Help.jsx";
import NotFound from "./pages/NotFound.jsx";
import LayoutWithSidebar from "./components/LayoutWithSidebar.jsx";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/*" element={<LayoutWithSidebar />}>
            <Route path="main" element={<Main />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="goals" element={<Goals />} />
            <Route path="recipes" element={<Recipes />} />
            <Route path="plan" element={<Plan />} />
            <Route path="grocery-list" element={<GroceryList />} />
            <Route path="measurements" element={<Measurements />} />
            <Route path="friends" element={<Friends />} />
            <Route path="invite" element={<Invite />} />
            <Route path="settings" element={<Settings />} />
            <Route path="help" element={<Help />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;
