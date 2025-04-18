import { useEffect, useState } from "react";
import api from "../services/api";

function ExpenseTypesPage() {
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({
    descricao: "",
    frequencia: "aleatoria",
  });
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarTipos = async () => {
    const res = await api.get("/expense-types");
    setTipos(res.data);
  };

  useEffect(() => {
    carregarTipos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      await api.post("/expense-types", form);
      setForm({ descricao: "", frequencia: "aleatoria" });
      setSucesso("Tipo de despesa cadastrado com sucesso!");
      carregarTipos();
    } catch {
      setErro("Erro ao cadastrar tipo de despesa.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Cadastro de Tipos de Despesa</h3>

      <form onSubmit={handleSubmit} className="row g-3 mb-4">
        <div className="col-md-6">
          <label className="form-label">Descrição</label>
          <input
            type="text"
            name="descricao"
            className="form-control"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Frequência</label>
          <select
            className="form-select"
            value={form.frequencia}
            onChange={(e) => setForm({ ...form, frequencia: e.target.value })}
          >
            <option value="aleatoria">Aleatória</option>
            <option value="diaria">Diária</option>
            <option value="mensal">Mensal</option>
            <option value="anual">Anual</option>
          </select>
        </div>

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <div className="col-12">
          <button className="btn btn-primary">Salvar Tipo</button>
        </div>
      </form>

      <h5>Tipos cadastrados</h5>
      <ul className="list-group">
        {tipos.map((t) => (
          <li key={t.id} className="list-group-item">
            {t.descricao} ({t.frequencia})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExpenseTypesPage;
