import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import PatientsPage from "./pages/PatientsPage";
import UsersPage from "./pages/UsersPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import ExpensesPage from "./pages/ExpensesPage";
import FinancePage from "./pages/FinancePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ServicesPage from "./pages/ServicesPage";
import ExpenseTypesPage from "./pages/ExpenseTypesPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/trocar-senha" element={<ChangePasswordPage />} />

        <Route element={<Layout />}>
          {/* Apenas usuário comum */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute roles={["usuario"]}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute roles={["usuario"]}>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patients"
            element={
              <ProtectedRoute roles={["usuario"]}>
                <PatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/service-types"
            element={
              <ProtectedRoute roles={["usuario"]}>
                <ServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expense-types"
            element={
              <ProtectedRoute roles={["usuario"]}>
                <ExpenseTypesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute roles={["usuario"]}>
                <AppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute roles={["usuario"]}>
                <ExpensesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finances"
            element={
              <ProtectedRoute roles={["usuario"]}>
                <FinancePage />
              </ProtectedRoute>
            }
          />

          {/* Apenas admin */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute roles={["admin"]}>
                <UsersPage />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
