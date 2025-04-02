import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import KanbanBoard from "./pages/KanbanBoard";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            token ? (
              <KanbanBoard token={token} />
            ) : (
              <Login setToken={setToken} />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
