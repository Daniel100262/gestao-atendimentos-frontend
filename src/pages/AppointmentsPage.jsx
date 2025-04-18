import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../services/api";

function AppointmentsPage() {
  const location = useLocation();

  const [pacientes, setPacientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [form, setForm] = useState({
    id: null,
    pacienteId: "",
    tipoAtendimentoId: "",
    dataHora: "",
    duracao: 0,
    valor: 0,
    statusPagamento: "aberto",
    recorrente: false,
    repeticoes: 1,
  });
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [pacientesRes, servicosRes] = await Promise.all([
        api.get("/patients"),
        api.get("/service-types"),
      ]);
      setPacientes(pacientesRes.data);
      setServicos(servicosRes.data);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (location.state) {
      const state = location.state;

      const dataHoraFormatada = state?.dataHora
        ? new Date(state.dataHora).toISOString().slice(0, 16)
        : "";

      setForm((prev) => ({
        ...prev,
        ...state,
        dataHora: dataHoraFormatada,
      }));
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "tipoAtendimentoId") {
      const selected = servicos.find((s) => s.id === value);
      setForm((prev) => ({
        ...prev,
        tipoAtendimentoId: value,
        valor: prev.id ? prev.valor : selected?.valorPadrao || 0,
        duracao: prev.id ? prev.duracao : selected?.duracaoPadrao || 60,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSucesso("");

    try {
      const payload = {
        paciente: { id: form.pacienteId },
        tipoAtendimento: { id: form.tipoAtendimentoId },
        dataHora: form.dataHora,
        duracao: parseInt(form.duracao),
        valor: parseFloat(form.valor),
        statusPagamento: form.statusPagamento,
        recorrente: form.recorrente,
        repeticoes: form.recorrente ? parseInt(form.repeticoes) : 0,
      };

      if (form.id) {
        await api.patch(`/appointments/${form.id}`, payload);
        setSucesso("Agendamento atualizado com sucesso!");
      } else {
        await api.post("/appointments", payload);
        setSucesso("Agendamento criado com sucesso!");
      }

      setForm({
        id: null,
        pacienteId: "",
        tipoAtendimentoId: "",
        dataHora: "",
        duracao: 60,
        valor: 0,
        statusPagamento: "aberto",
        recorrente: false,
        repeticoes: 1,
      });
    } catch (err) {
      setErro("Erro ao salvar atendimento.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">
        {form.id ? "Editar Atendimento" : "Agendar Atendimento"}
      </h3>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Paciente</label>
          <select
            name="pacienteId"
            className="form-select"
            value={form.pacienteId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Tipo de Atendimento</label>
          <select
            name="tipoAtendimentoId"
            className="form-select"
            value={form.tipoAtendimentoId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione</option>
            {servicos.map((s) => (
              <option key={s.id} value={s.id}>
                {s.descricao}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6">
          <label className="form-label">Data e Hora</label>
          <input
            type="datetime-local"
            className="form-control"
            name="dataHora"
            value={form.dataHora}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Duração (min)</label>
          <input
            type="number"
            className="form-control"
            name="duracao"
            value={form.duracao}
            onChange={handleChange}
            required
            disabled
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Valor (R$)</label>
          <input
            type="number"
            className="form-control"
            name="valor"
            value={form.valor}
            onChange={handleChange}
            required
            disabled
          />
        </div>

        <div className="col-md-4">
          <label className="form-label">Status Pagamento</label>
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

        <div
          className="col-12 col-md-4 d-flex align-items-center"
          style={{ marginTop: "3rem" }}
        >
          <div
            className="form-check form-switch ms-2"
            title="Use para repetir o atendimento semanalmente"
          >
            <input
              className="form-check-input"
              type="checkbox"
              id="recorrente"
              name="recorrente"
              checked={form.recorrente}
              onChange={handleChange}
            />
            <label className="form-check-label ms-2" htmlFor="recorrente">
              Atendimento recorrente
            </label>
          </div>
        </div>

        {form.recorrente && (
          <div className="col-md-4">
            <label className="form-label">Repetições</label>
            <input
              type="number"
              className="form-control"
              name="repeticoes"
              value={form.repeticoes}
              onChange={handleChange}
            />
          </div>
        )}

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            {form.id ? "Atualizar" : "Agendar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AppointmentsPage;
