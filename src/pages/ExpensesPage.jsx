import { useEffect, useState } from "react";
import api from "../services/api";

function ExpensesPage() {
  const [tipos, setTipos] = useState([]);
  const [despesas, setDespesas] = useState([]);
  const [form, setForm] = useState({
    descricao: "",
    tipoId: "",
    valor: "",
    data: "",
    statusPagamento: "aberto",
  });
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarTipos();
    carregarDespesas();
  }, []);

  const carregarTipos = async () => {
    const res = await api.get("/expense-types");
    setTipos(res.data);
  };

  const carregarDespesas = async () => {
    const res = await api.get("/expenses");
    setDespesas(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      await api.post("/expenses", {
        descricao: form.descricao,
        tipo: { id: form.tipoId },
        valor: parseFloat(form.valor),
        data: form.data,
        statusPagamento: form.statusPagamento,
      });

      setSucesso("Despesa cadastrada com sucesso!");
      setForm({
        descricao: "",
        tipoId: "",
        valor: "",
        data: "",
        statusPagamento: "aberto",
      });
      carregarDespesas();
    } catch (err) {
      setErro("Erro ao cadastrar despesa.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Cadastro de Despesas</h3>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Descrição</label>
          <input
            type="text"
            name="descricao"
            className="form-control"
            value={form.descricao}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Tipo de Despesa</label>
          <select
            name="tipoId"
            className="form-select"
            value={form.tipoId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione</option>
            {tipos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.descricao} ({t.frequencia})
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label">Valor (R$)</label>
          <input
            type="number"
            name="valor"
            className="form-control"
            value={form.valor}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Data</label>
          <input
            type="date"
            name="data"
            className="form-control"
            value={form.data}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Status</label>
          <select
            name="statusPagamento"
            className="form-select"
            value={form.statusPagamento}
            onChange={handleChange}
          >
            <option value="aberto">Aberto</option>
            <option value="pago">Pago</option>
          </select>
        </div>

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Salvar Despesa
          </button>
        </div>
      </form>

      <hr className="my-4" />
      <h5>Despesas registradas</h5>
      <ul className="list-group">
        {despesas.map((d) => (
          <li key={d.id} className="list-group-item">
            {d.descricao} - R$ {Number(d.valor).toFixed(2)} em{" "}
            {new Date(d.data).toLocaleDateString("pt-BR")} ({d.statusPagamento})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ExpensesPage;
