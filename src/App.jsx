import "./App.css";
import Sidebar from "./pages/Sidebar";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import About from "./pages/About";
import PrivateRoute from "./Componentes/PrivateRoute";
import { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import { AuthContext } from "./Componentes/contexts/AuthContext";

function App() {
  const { token, login, logout } = useContext(AuthContext);
  const isAuthenticated = Boolean(token);

  return (
    <div className="app-root">
      <Sidebar
        isAuthenticated={isAuthenticated}
        onLogout={logout}
      />
      <div className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/login"
            element={<Login login={login} />}
          />
          <Route path="/sobre" element={<About />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;  