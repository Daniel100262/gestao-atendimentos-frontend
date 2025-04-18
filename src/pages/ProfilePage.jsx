import { useEffect, useState } from "react";
import Cleave from "cleave.js/react";
import api from "../services/api";

function ProfilePage() {
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    whatsapp: "",
    rua: "",
    numero: "",
    bairro: "",
    cidade: "",
    cep: "",
  });

  const [errors, setErrors] = useState({});
  const [loadingCep, setLoadingCep] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [erroSenha, setErroSenha] = useState("");
  const [sucessoSenha, setSucessoSenha] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/me`);
        setForm(res.data);
      } catch (err) {
        setErro("Erro ao carregar dados do perfil.");
      }
    };

    fetchUser();
  }, []);

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validarWhatsapp = (telefone) => {
    const cleaned = telefone.replace(/\D/g, "");
    return cleaned.length === 11 && cleaned.startsWith("9", 2);
  };
  const validarCEP = (cep) => /^[0-9]{5}-?[0-9]{3}$/.test(cep);

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
    setErro("");
    setSucesso("");

    const newErrors = {};
    if (!validarEmail(form.email)) newErrors.email = "E-mail inválido";
    if (!validarWhatsapp(form.whatsapp))
      newErrors.whatsapp = "WhatsApp inválido";
    if (!validarCEP(form.cep)) newErrors.cep = "CEP inválido";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await api.patch(`/users/me`, form);
      setSucesso("Perfil atualizado com sucesso!");
    } catch {
      setErro("Erro ao atualizar perfil.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErroSenha("");
    setSucessoSenha("");

    try {
      await api.post("/auth/trocar-senha", {
        email: form.email,
        novaSenha,
      });

      setNovaSenha("");
      setSucessoSenha("Senha atualizada com sucesso!");
    } catch {
      setErroSenha("Erro ao alterar senha.");
    }
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Meu Perfil</h3>

      <form onSubmit={handleSubmit} className="row g-3">
        <div className="col-md-6">
          <label className="form-label">Nome</label>
          <input
            type="text"
            name="nome"
            className="form-control"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">CPF</label>
          <Cleave
            name="cpf"
            value={form.cpf}
            options={{
              delimiters: [".", ".", "-"],
              blocks: [3, 3, 3, 2],
              numericOnly: true,
            }}
            className="form-control"
            disabled
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">E-mail</label>
          <input
            type="email"
            name="email"
            className={`form-control ${errors.email ? "is-invalid" : ""}`}
            value={form.email}
            disabled
          />
          {errors.email && (
            <small className="text-danger">{errors.email}</small>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">WhatsApp</label>
          <Cleave
            name="whatsapp"
            value={form.whatsapp}
            options={{
              delimiters: ["(", ") ", "-"],
              blocks: [0, 2, 5, 4],
              numericOnly: true,
            }}
            onChange={handleChange}
            className={`form-control ${errors.whatsapp ? "is-invalid" : ""}`}
          />
          {errors.whatsapp && (
            <small className="text-danger">{errors.whatsapp}</small>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">CEP</label>
          <Cleave
            name="cep"
            value={form.cep}
            options={{ delimiters: ["-"], blocks: [5, 3], numericOnly: true }}
            onChange={handleChange}
            className={`form-control ${errors.cep ? "is-invalid" : ""}`}
          />
          {loadingCep && (
            <div className="spinner-border spinner-border-sm ms-2" />
          )}
          {errors.cep && <small className="text-danger">{errors.cep}</small>}
        </div>

        {["rua", "numero", "bairro", "cidade"].map((field) => (
          <div className="col-md-6" key={field}>
            <label className="form-label text-capitalize">{field}</label>
            <input
              type="text"
              name={field}
              className="form-control"
              value={form[field]}
              onChange={handleChange}
              disabled={["rua", "bairro", "cidade"].includes(field)}
              required={field === "numero"}
            />
          </div>
        ))}

        {erro && <div className="alert alert-danger">{erro}</div>}
        {sucesso && <div className="alert alert-success">{sucesso}</div>}

        <div className="col-12">
          <button type="submit" className="btn btn-primary">
            Atualizar Perfil
          </button>
        </div>
      </form>

      <hr className="my-4" />

      <div>
        <button
          className="btn btn-outline-secondary mb-3"
          onClick={() => setShowPasswordForm(!showPasswordForm)}
        >
          {showPasswordForm ? "Cancelar" : "Alterar Senha"}
        </button>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nova Senha</label>
              <input
                type="password"
                className="form-control"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                required
              />
            </div>

            <div className="col-12">
              <button type="submit" className="btn btn-success">
                Salvar Nova Senha
              </button>
            </div>

            {erroSenha && <div className="alert alert-danger">{erroSenha}</div>}
            {sucessoSenha && (
              <div className="alert alert-success">{sucessoSenha}</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default ProfilePage;
