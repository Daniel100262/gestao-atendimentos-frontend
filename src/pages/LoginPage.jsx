import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      const response = await api.post("/auth/login", {
        email,
        password: senha,
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("role", payload.role);
      localStorage.setItem("userEmail", payload.email);

      if (payload.precisaTrocarSenha) {
        navigate("/trocar-senha");
      } else if (payload.role === "admin") {
        navigate("/usuarios");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      setErro("Email ou senha inválidos.");
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ minHeight: "100vh" }}
    >
      <div
        className="card shadow-lg p-5"
        style={{ maxWidth: 420, width: "100%", borderRadius: 16 }}
      >
        <h3 className="text-center mb-4 fw-bold">Bem-vindo 👋</h3>
        <p className="text-center text-muted mb-4">
          Acesse sua conta para continuar
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold">E-mail</label>
            <input
              type="email"
              className="form-control form-control-lg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Senha</label>
            <input
              type="password"
              className="form-control form-control-lg"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              placeholder="********"
            />
          </div>

          {erro && <div className="alert alert-danger mt-2">{erro}</div>}

          <button
            type="submit"
            className="btn btn-primary w-100 mt-3 py-2 fw-semibold"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
