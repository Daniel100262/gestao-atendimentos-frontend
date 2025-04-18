import { useEffect, useState } from "react";
import Cleave from "cleave.js/react";
import api from "../services/api";

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
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
    role: "usuario",
  });
  const [errors, setErrors] = useState({});
  const [sucesso, setSucesso] = useState("");
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    const res = await api.get("/users");
    setUsuarios(res.data);
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
      } else {
        setForm((prev) => ({
          ...prev,
          rua: data.logradouro,
          bairro: data.bairro,
          cidade: data.localidade,
        }));
        setErrors((prev) => ({ ...prev, cep: null }));
      }
    } catch {
      setErrors((prev) => ({ ...prev, cep: "Erro ao buscar CEP" }));
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
    setSucesso("");
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
      await api.post("/users", form);
      setSucesso("Usuário cadastrado com sucesso!");
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
        role: "usuario",
      });
      setErrors({});
      carregarUsuarios();
    } catch {
      setErrors({ submit: "Erro ao cadastrar usuário." });
    }
  };

  const getInputClass = (field) =>
    `form-control ${errors[field] ? "is-invalid" : ""}`;

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Cadastro de Usuários</h3>

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
            className={getInputClass("cpf")}
            value={form.cpf}
            onChange={handleChange}
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
            className={getInputClass("whatsapp")}
            value={form.whatsapp}
            onChange={handleChange}
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
            className={getInputClass("email")}
            value={form.email}
            onChange={handleChange}
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
            className={getInputClass("senha")}
            value={form.senha}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">CEP</label>
          <Cleave
            name="cep"
            options={{ delimiters: ["-"], blocks: [5, 3], numericOnly: true }}
            className={getInputClass("cep")}
            value={form.cep}
            onChange={handleChange}
            required
          />
          {loadingCep && <div className="form-text">Buscando endereço...</div>}
          {errors.cep && <div className="invalid-feedback">{errors.cep}</div>}
        </div>

        <div className="col-md-6">
          <label className="form-label">Rua</label>
          <input
            type="text"
            name="rua"
            className="form-control"
            value={form.rua}
            disabled
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Número</label>
          <input
            type="text"
            name="numero"
            className={getInputClass("numero")}
            value={form.numero}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Bairro</label>
          <input
            type="text"
            name="bairro"
            className="form-control"
            value={form.bairro}
            disabled
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Cidade</label>
          <input
            type="text"
            name="cidade"
            className="form-control"
            value={form.cidade}
            disabled
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Perfil</label>
          <select
            name="role"
            className={getInputClass("role")}
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="usuario">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>

        {errors.submit && (
          <div className="alert alert-danger">{errors.submit}</div>
        )}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Salvar Usuário
          </button>
        </div>
      </form>

      <hr className="my-4" />
      <h5>Usuários cadastrados</h5>
      <ul className="list-group">
        {usuarios.map((u) => (
          <li className="list-group-item" key={u.id}>
            <strong>{u.nome}</strong> — {u.email} ({u.role})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UsuariosPage;
