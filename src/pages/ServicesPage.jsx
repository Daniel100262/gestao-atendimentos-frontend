import { useEffect, useState } from "react";
import api from "../services/api";

function ServicesPage() {
  const [tipos, setTipos] = useState([]);
  const [form, setForm] = useState({
    descricao: "",
    valorPadrao: "",
    duracaoPadrao: "",
  });
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  const carregarTipos = async () => {
    const res = await api.get("/service-types");
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
      await api.post("/service-types", {
        descricao: form.descricao,
        valorPadrao: parseFloat(form.valorPadrao),
        duracaoPadrao: parseInt(form.duracaoPadrao),
      });
      setForm({ descricao: "", valorPadrao: "", duracaoPadrao: "" });
      setSucesso("Tipo de atendimento cadastrado com sucesso!");
      carregarTipos();
    } catch {
      setErro("Erro ao cadastrar tipo.");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Tipos de Atendimento</h3>
      <form onSubmit={handleSubmit} className="row g-3 mt-3">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Valor padrão (R$)"
            value={form.valorPadrao}
            onChange={(e) => setForm({ ...form, valorPadrao: e.target.value })}
            required
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Duração (min)"
            value={form.duracaoPadrao}
            onChange={(e) =>
              setForm({ ...form, duracaoPadrao: e.target.value })
            }
            required
          />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">
            Salvar
          </button>
        </div>
      </form>

      {sucesso && <div className="alert alert-success mt-3">{sucesso}</div>}
      {erro && <div className="alert alert-danger mt-3">{erro}</div>}

      <ul className="list-group mt-4">
        {tipos.map((t) => (
          <li key={t.id} className="list-group-item">
            <strong>{t.descricao}</strong> — R$ {t.valorPadrao} /{" "}
            {t.duracaoPadrao} min
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ServicesPage;
