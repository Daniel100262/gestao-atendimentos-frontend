import { useEffect, useState } from "react";
import api from "../services/api";

function FinancePage() {
  const [inicio, setInicio] = useState("");
  const [fim, setFim] = useState("");
  const [resumo, setResumo] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const hoje = new Date();
    const primeiroDia = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    setInicio(primeiroDia.toISOString().substring(0, 10));
    setFim(ultimoDia.toISOString().substring(0, 10));
  }, []);

  useEffect(() => {
    if (inicio && fim) carregarResumo();
  }, [inicio, fim]);

  const carregarResumo = async () => {
    try {
      const res = await api.get("/financas", {
        params: { inicio, fim },
      });
      setResumo(res.data);
    } catch (err) {
      setErro("Erro ao carregar finanças.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Resumo Financeiro</h3>

      <div className="row mb-4">
        <div className="col-md-4">
          <label className="form-label">Início</label>
          <input
            type="date"
            className="form-control"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label className="form-label">Fim</label>
          <input
            type="date"
            className="form-control"
            value={fim}
            onChange={(e) => setFim(e.target.value)}
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button className="btn btn-primary w-100" onClick={carregarResumo}>
            Buscar
          </button>
        </div>
      </div>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {resumo && (
        <>
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card text-bg-success mb-3">
                <div className="card-body">
                  <h5 className="card-title">Receitas</h5>
                  <p className="card-text">
                    R$ {resumo.totalReceitas.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-bg-danger mb-3">
                <div className="card-body">
                  <h5 className="card-title">Despesas</h5>
                  <p className="card-text">
                    R$ {resumo.totalDespesas.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-bg-secondary mb-3">
                <div className="card-body">
                  <h5 className="card-title">Saldo</h5>
                  <p className="card-text">R$ {resumo.saldo.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <h5 className="mt-4">Receitas</h5>
          <ul className="list-group mb-4">
            {resumo.receitas.map((r) => (
              <li key={r.id} className="list-group-item">
                {r.paciente?.nome || "Paciente"} —{" "}
                {r.tipoAtendimento?.descricao} —{" "}
                {new Date(r.dataHora).toLocaleString("pt-BR")} — R${" "}
                {Number(r.valor).toFixed(2)}
              </li>
            ))}
          </ul>

          <h5>Despesas</h5>
          <ul className="list-group">
            {resumo.despesas.map((d) => (
              <li key={d.id} className="list-group-item">
                {d.descricao} ({d.tipo?.descricao}) —{" "}
                {new Date(d.data).toLocaleDateString("pt-BR")} — R${" "}
                {Number(d.valor).toFixed(2)}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default FinancePage;
