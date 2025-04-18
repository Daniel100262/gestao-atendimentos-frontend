import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    if (novaSenha !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }

    try {
      await api.post("/auth/trocar-senha", {
        email,
        novaSenha,
      });

      setSucesso("Senha alterada com sucesso!");

      localStorage.removeItem("userEmail");
      localStorage.removeItem("token");

      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setErro("Erro ao trocar a senha.");
    }
  };

  return (
    <div className="container d-flex align-items-center justify-content-center vh-100">
      <div className="card p-4 shadow" style={{ maxWidth: 400, width: "100%" }}>
        <h4 className="mb-3 text-center">Trocar Senha</h4>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">E-mail</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Nova Senha</label>
            <input
              type="password"
              className="form-control"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Confirme a Senha</label>
            <input
              type="password"
              className="form-control"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              required
            />
          </div>
          {erro && <div className="alert alert-danger">{erro}</div>}
          {sucesso && <div className="alert alert-success">{sucesso}</div>}
          <button type="submit" className="btn btn-success w-100">
            Alterar Senha
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordPage;
