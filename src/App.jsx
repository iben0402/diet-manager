import { Link, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Main from "./pages/Main.jsx";
import NotFound from "./pages/NotFound.jsx";
import "./App.css";

function App() {
  return (
    <div className="app-shell">
      <main className="page">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
