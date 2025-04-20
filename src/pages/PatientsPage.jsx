import { useEffect, useState } from "react";
import Cleave from "cleave.js/react";
import api from "../services/api";

function PatientsPage() {
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    whatsapp: "",
    email: "",
    senha: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    cep: "",
    observacoes: "",
  });
  const [errors, setErrors] = useState({});
  const [loadingCep, setLoadingCep] = useState(false);
  const [sucesso, setSucesso] = useState("");

  useEffect(() => {
    carregarPacientes();
  }, []);

  const carregarPacientes = async () => {
    try {
      const res = await api.get("/patients");
      setPacientes(res.data);
    } catch (error) {
      console.error("Erro ao carregar pacientes:", error);
    }
  };

  const validarCPF = (cpf) => {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
    let resto = soma % 11;
    let digito1 = resto < 2 ? 0 : 11 - resto;
    if (parseInt(cpf[9]) !== digito1) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
    resto = soma % 11;
    let digito2 = resto < 2 ? 0 : 11 - resto;
    return parseInt(cpf[10]) === digito2;
  };

  const validarCEP = (cep) => /^[0-9]{5}-?[0-9]{3}$/.test(cep);
  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validarWhatsapp = (telefone) => {
    const cleaned = telefone.replace(/\D/g, "");
    return cleaned.length === 11 && cleaned.startsWith("9", 2);
  };

  const buscarEndereco = async (cep) => {
    const cleanedCep = cep.replace(/\D/g, "");
    if (!validarCEP(cleanedCep)) {
      setErrors((prev) => ({ ...prev, cep: "CEP inválido" }));
      return;
    }

    setLoadingCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await res.json();
      if (data.erro) {
        setErrors((prev) => ({ ...prev, cep: "CEP não encontrado" }));
        setLoadingCep(false);
        return;
      }
      setForm((prev) => ({
        ...prev,
        rua: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
      }));
      setErrors((prev) => ({ ...prev, cep: null }));
    } catch {
      setErrors((prev) => ({ ...prev, cep: "Erro ao buscar endereço" }));
    } finally {
      setLoadingCep(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "cep") buscarEndereco(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!validarCPF(form.cpf)) newErrors.cpf = "CPF inválido";
    if (!validarEmail(form.email)) newErrors.email = "E-mail inválido";
    if (!validarWhatsapp(form.whatsapp))
      newErrors.whatsapp = "WhatsApp inválido";
    if (!validarCEP(form.cep)) newErrors.cep = "CEP inválido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.post("/patients", form);
      setSucesso("Paciente cadastrado com sucesso!");
      setForm({
        nome: "",
        cpf: "",
        whatsapp: "",
        email: "",
        senha: "",
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        cep: "",
        observacoes: "",
      });
      setErrors({});
      carregarPacientes();
    } catch {
      setErrors({ submit: "Erro ao cadastrar paciente." });
    }
  };

  const getInputClass = (name) =>
    `form-control ${errors[name] ? "is-invalid" : ""}`;

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Cadastro de Pacientes</h3>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nome</label>
          <input
            type="text"
            name="nome"
            className={getInputClass("nome")}
            value={form.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">CPF</label>
          <Cleave
            name="cpf"
            options={{
              delimiters: [".", ".", "-"],
              blocks: [3, 3, 3, 2],
              numericOnly: true,
            }}
            value={form.cpf}
            onChange={handleChange}
            className={getInputClass("cpf")}
            required
          />
          {errors.cpf && <div className="invalid-feedback">{errors.cpf}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">WhatsApp</label>
          <Cleave
            name="whatsapp"
            options={{
              delimiters: ["(", ") ", "-"],
              blocks: [0, 2, 5, 4],
              numericOnly: true,
            }}
            value={form.whatsapp}
            onChange={handleChange}
            className={getInputClass("whatsapp")}
            required
          />
          {errors.whatsapp && (
            <div className="invalid-feedback">{errors.whatsapp}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">E-mail</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={getInputClass("email")}
            required
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Senha</label>
          <input
            type="password"
            name="senha"
            value={form.senha}
            onChange={handleChange}
            className={getInputClass("senha")}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">CEP</label>
          <div className="d-flex align-items-center">
            <Cleave
              name="cep"
              options={{ delimiters: ["-"], blocks: [5, 3], numericOnly: true }}
              value={form.cep}
              onChange={handleChange}
              className={getInputClass("cep")}
              required
            />
            {loadingCep && (
              <div
                className="spinner-border spinner-border-sm ms-2 text-primary"
                role="status"
              ></div>
            )}
          </div>
          {errors.cep && <div className="invalid-feedback">{errors.cep}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Rua</label>
          <input
            type="text"
            name="rua"
            value={form.rua}
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Número</label>
          <input
            type="text"
            name="numero"
            value={form.numero}
            onChange={handleChange}
            className={getInputClass("numero")}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Bairro</label>
          <input
            type="text"
            name="bairro"
            value={form.bairro}
            className="form-control"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Cidade</label>
          <input
            type="text"
            name="cidade"
            value={form.cidade}
            className="form-control"
            disabled
          />
        </div>

        <div className="col-12">
          <label className="form-label">Observações</label>
          <textarea
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {errors.submit && (
          <div className="alert alert-danger">{errors.submit}</div>
        )}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Salvar Paciente
          </button>
        </div>
      </form>

      <hr className="my-4" />

      <h5>Pacientes cadastrados</h5>
      <ul className="list-group">
        {pacientes.map((p) => (
          <li className="list-group-item" key={p.id}>
            <strong>{p.nome}</strong> — {p.cpf} — {p.whatsapp}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PatientsPage;
