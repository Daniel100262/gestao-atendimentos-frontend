import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import interactionPlugin from "@fullcalendar/interaction";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Modal, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import ptBrLocale from "@fullcalendar/core/locales/pt-br";
import api from "../services/api";

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [eventos, setEventos] = useState([]);
  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [atendimentosDoDia, setAtendimentosDoDia] = useState([]);
  const [show, setShow] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setUserName(payload.email.split("@")[0]);
    }
  }, []);

  useEffect(() => {
    async function carregarEventos() {
      const res = await api.get("/appointments");
      const eventosFormatados = res.data.map((item) => ({
        title: item.tipoAtendimento?.descricao || "Atendimento",
        date: item.dataHora,
      }));
      setEventos(eventosFormatados);
    }

    carregarEventos();
  }, []);

  const handleDateClick = async (arg) => {
    const dataSelecionada = arg.dateStr;
    setDiaSelecionado(dataSelecionada);

    const inicio = `${dataSelecionada}T00:00:00`;
    const fim = `${dataSelecionada}T23:59:59`;

    const res = await api.get(`/appointments/agenda/periodo`, {
      params: { inicio, fim },
    });

    setAtendimentosDoDia(res.data);
    setShow(true);
  };

  const handleAgendar = () => {
    if (!diaSelecionado) return;
    navigate("/appointments", {
      state: { dataHora: `${diaSelecionado}T08:00` },
    });
  };

  const handleEditar = (agendamento) => {
    navigate("/appointments", {
      state: {
        id: agendamento.id,
        pacienteId: agendamento.paciente?.id,
        tipoAtendimentoId: agendamento.tipoAtendimento?.id,
        dataHora: agendamento.dataHora,
        duracao: agendamento.duracao,
        valor: agendamento.valor,
        statusPagamento: agendamento.statusPagamento,
        recorrente: agendamento.recorrente,
        repeticoes: agendamento.repeticoes,
      },
    });
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <h3 className="fw-bold">Olá, {userName}! 👋</h3>
        <p className="text-muted">Aqui está sua agenda de atendimentos:</p>
      </div>

      <div className="shadow p-3 rounded bg-white">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={ptBrLocale}
          buttonText={{ today: "Hoje" }}
          events={eventos}
          dateClick={handleDateClick}
          height={750}
          contentHeight="auto"
          aspectRatio={1.6}
        />
      </div>

      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            Atendimentos do dia{" "}
            {diaSelecionado &&
              new Date(diaSelecionado + "T00:00:00").toLocaleDateString(
                "pt-BR"
              )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {atendimentosDoDia.length === 0 && (
            <p className="text-muted">Nenhum atendimento agendado.</p>
          )}
          {atendimentosDoDia.map((item, index) => (
            <div
              key={item.id || index}
              className="border rounded p-2 mb-2"
              style={{ cursor: "pointer" }}
              onClick={() => handleEditar(item)}
            >
              <strong>{item.paciente?.nome}</strong> —{" "}
              {new Date(item.dataHora).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              ({item.tipoAtendimento?.descricao})
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>
            Fechar
          </Button>
          <Button
            variant="primary"
            onClick={handleAgendar}
            disabled={!diaSelecionado}
          >
            Agendar novo
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Dashboard;
