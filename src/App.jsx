import { auth } from "./firebase";

function App() {
  return (
    <div>
      <h1>React + Firebase OK</h1>
      <p>Auth instance: {auth ? "READY" : "NOPE"}</p>
    </div>
  );
}

export default App;