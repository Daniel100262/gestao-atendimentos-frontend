import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Layout.css";

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUserEmail(payload.email);
    setUserRole(payload.role);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="d-flex">
      <div className="sidebar p-3">
        <h5 className="text-center mb-4">🏥 Gestão de Atendimentos</h5>
        <ul className="nav flex-column">
          {userRole === "admin" && (
            <li className="nav-item">
              <Link
                className={`nav-link ${isActive("/usuarios") ? "active" : ""}`}
                to="/usuarios"
              >
                👥 Usuários
              </Link>
            </li>
          )}

          {userRole === "usuario" && (
            <>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/dashboard") ? "active" : ""
                  }`}
                  to="/dashboard"
                >
                  📅 Agenda
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/patients") ? "active" : ""
                  }`}
                  to="/patients"
                >
                  👤 Pacientes
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/service-types") ? "active" : ""
                  }`}
                  to="/service-types"
                >
                  📋 Tipos de Atendimento
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/appointments") ? "active" : ""
                  }`}
                  to="/appointments"
                >
                  🩺 Agendamentos
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/expense-types") ? "active" : ""
                  }`}
                  to="/expense-types"
                >
                  🗂 Tipos de Despesa
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/expenses") ? "active" : ""
                  }`}
                  to="/expenses"
                >
                  💸 Despesas
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${
                    isActive("/finances") ? "active" : ""
                  }`}
                  to="/finances"
                >
                  📊 Finanças
                </Link>
              </li>
              <li className="nav-item">
                <Link
                  className={`nav-link ${isActive("/profile") ? "active" : ""}`}
                  to="/profile"
                >
                  ⚙️ Perfil
                </Link>
              </li>
            </>
          )}

          <li className="nav-item mt-4">
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger w-100"
            >
              Sair
            </button>
          </li>
        </ul>

        <div className="mt-5 text-center small text-muted">
          <div>Logado como:</div>
          <strong>{userEmail}</strong>
        </div>
      </div>

      <div className="p-4 w-100 bg-body">
        <Outlet />
      </div>
    </div>
  );
}

export default Layout;
