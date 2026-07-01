const API_URL = "https://localhost:7071/api";
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

// ============================================================
//                         AUTENTICAÇÃO 
// ============================================================

function showCadastro() { trocarTela("cadastroPage"); }
function voltarLogin() { trocarTela("loginPage"); }
function voltarCadastro() { trocarTela("cadastroPage"); }

async function login() {
  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value;

  if (!email || !email.includes("@")) { alert("Digite um e-mail válido"); return; }
  if (!senha) { alert("Digite sua senha"); return; }

  try {
    const resposta = await fetch(`${API_URL}/Usuario/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, senha })
    });

    if (!resposta.ok) { alert("Email ou senha inválidos"); return; }

    const usuario = await resposta.json();
    localStorage.setItem("nomeUsuario", usuario.nome);
    localStorage.setItem("cargoUsuario", usuario.tipoUsuario);
    localStorage.setItem("loginEmail", email);
    entrarSistema();

  } catch (erro) {
    console.error(erro);
    alert("Erro ao conectar com o servidor");
  }
}

async function verificarSessao() {
  try {
    const resposta = await fetch(`${API_URL}/Usuario/sessao`, {
      method: "GET",
      credentials: "include"
    });

    if (!resposta.ok) return;

    const usuario = await resposta.json();
    localStorage.setItem("nomeUsuario", usuario.nomeUsuario);
    localStorage.setItem("cargoUsuario", usuario.tipoUsuario);
    console.log("Sessão encontrada:", usuario);
    entrarSistema();

  } catch (erro) {
    console.log("Nenhuma sessão ativa.");
  }
}

function verificacao() {
  const email = document.getElementById("cadastroEmail").value.trim();
  const senha = document.getElementById("cadastroSenha").value;
  const confirmar = document.getElementById("cadastroConfirmarSenha").value;

  if (!email || !email.includes("@")) { alert("Digite um e‑mail válido"); return; }
  if (!senha || senha.length < 8) { alert("A senha deve ter no mínimo 8 caracteres"); return; }
  if (senha !== confirmar) { alert("As senhas não coincidem"); return; }

  // Vai direto para o cadastro, sem verificação por email
  confirmarVerificacao();
}

async function confirmarVerificacao() {
  const nome = document.getElementById("cadastroNome").value;
  const email = document.getElementById("cadastroEmail").value;
  const senha = document.getElementById("cadastroSenha").value;

  try {
    const resposta = await fetch(`${API_URL}/Usuario/cadastro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ nome, email, senha, tipoUsuario: "Operador" })
    });

    if (!resposta.ok) { alert(await resposta.text()); return; }

    alert("Cadastro realizado com sucesso!");

    const respostaLogin = await fetch(`${API_URL}/Usuario/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, senha })
    });

    if (!respostaLogin.ok) {
      alert("Usuário cadastrado, mas não foi possível fazer o login automático.");
      trocarTela("loginPage");
      return;
    }

    const usuario = await respostaLogin.json();
    localStorage.setItem("nomeUsuario", usuario.nome);
    localStorage.setItem("cargoUsuario", usuario.tipoUsuario);
    localStorage.setItem("loginEmail", email);
    entrarSistema();

  } catch (erro) {
    console.error(erro);
    alert("Erro ao conectar com o servidor.");
  }
}

function showCadastro() { trocarTela("cadastroPage"); }
function voltarLogin() { trocarTela("loginPage"); }
function voltarCadastro() { trocarTela("cadastroPage"); }

async function logout() {
  try {
    await fetch(`${API_URL}/Usuario/logout`, { method: "POST", credentials: "include" });
  } catch (erro) {
    console.error("Erro ao realizar logout:", erro);
  }

  localStorage.clear();
  document.getElementById("appPage").style.display = "none";
  trocarTela("loginPage");
}

// ============================================================
//                         PERMISSÕES
// ============================================================

// Ajuste os cargos conforme as regras reais do seu backend
const PERMISSOES_PAGINA = {
  dashboard:   ["Administrador", "Gerente", "Operador"],
  estoque:     ["Administrador", "Gerente", "Operador"],
  relatorios:  ["Administrador", "Gerente"],
  cadastro:    ["Administrador", "Gerente"],
  assistente:  ["Administrador", "Gerente", "Operador"],
};

function cargoTemAcesso(paginaId) {
  const cargo = localStorage.getItem("cargoUsuario");
  const permitidos = PERMISSOES_PAGINA[paginaId];
  if (!permitidos) return true; // página sem restrição cadastrada
  return permitidos.includes(cargo);
}

// ============================================================
//                         USUÁRIO 
// ============================================================

function atualizarUsuario() {
  const cargo = localStorage.getItem("cargoUsuario");
  const userDiv = document.getElementById("userCargo");
  if (!userDiv) return;
  userDiv.textContent = cargo || "Admin";
}

function trocarTela(id) {
  document.querySelectorAll("section.auth-page, section.loading-page")
    .forEach(s => s.style.display = "none");
  const tela = document.getElementById(id);
  if (tela) tela.style.display = "flex";
}

function entrarSistema() {
  document.querySelectorAll("section.auth-page, section.loading-page")
    .forEach(s => s.style.display = "none");

  const app = document.getElementById("appPage");
  if (app) app.style.display = "flex";

  atualizarUsuario();
  atualizarTudo();
}

function irParaConta() {
  const email = localStorage.getItem("loginEmail");
  const cargo = localStorage.getItem("cargoUsuario");
  document.getElementById("infoEmail").textContent = email;
  document.getElementById("infoCargo").textContent = cargo;
  navigate("conta");
}

// ============================================================
//                         NAVEGAÇÃO 
// ============================================================

function navigate(id, btn) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  const pagina = document.getElementById(id);
  if (pagina) pagina.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active-nav"));
  if (btn) btn.classList.add("active-nav");

  if (window.innerWidth <= 900) {
    document.getElementById("sidebar").classList.remove("active");
  }
}

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
}

// ============================================================
//                         VERIFICAÇÃO 
// ============================================================

document.querySelectorAll("#verificacaoPage .codigo input")
  .forEach((input, index, arr) => {
    input.addEventListener("input", () => {
      if (input.value.length === 1 && index < arr.length - 1) {
        arr[index + 1].focus();
      }
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && input.value === "" && index > 0) {
        arr[index - 1].focus();
      }
    });
  });

// ============================================================
//                         PRODUTOS 
// ============================================================

function adicionarProduto() {
  const nome = document.getElementById("nomeProduto").value.trim();
  const quantidade = document.getElementById("quantidadeProduto").value;
  const validade = document.getElementById("validadeProduto").value;
  let descricao = document.getElementById("descricaoProduto").value.trim();

  if (!descricao) descricao = gerarDescricaoAutomatica(nome);
  if (!nome || !quantidade || !validade) { showToast("Preencha todos os campos obrigatórios"); return; }

  const produto = {
    id: Date.now(),
    nome,
    quantidade: Number(quantidade),
    validade,
    descricao: descricao || "Sem descrição",
    data: new Date().toLocaleDateString()
  };

  produtos.push(produto);
  salvar();
  atualizarTudo();

  document.getElementById("nomeProduto").value = "";
  document.getElementById("quantidadeProduto").value = "";
  document.getElementById("validadeProduto").value = "";
  document.getElementById("descricaoProduto").value = "";

  showToast("Produto cadastrado com sucesso.");
}

function removerProduto(id) {
  produtos = produtos.filter(p => p.id !== id);
  salvar();
  atualizarTudo();
  showToast("Produto removido");
}

function salvar() {
  localStorage.setItem("produtos", JSON.stringify(produtos));
}

// ============================================================
//                         ESTOQUE 
// ============================================================

function aumentar(id, estoqueMax) {
  const span = document.getElementById(`qtd-${id}`);
  let valor = Number(span.textContent);
  if (valor < estoqueMax) span.textContent = valor + 1;
}

function diminuir(id) {
  const span = document.getElementById(`qtd-${id}`);
  let valor = Number(span.textContent);
  if (valor > 0) span.textContent = valor - 1;
}

function removerQuantidade(id) {
  const produto = produtos.find(p => p.id === id);
  const span = document.getElementById(`qtd-${id}`);
  const quantidadeRemover = Number(span.textContent);

  if (quantidadeRemover <= 0) { showToast("Selecione uma quantidade para remover"); return; }

  produto.quantidade -= quantidadeRemover;

  if (produto.quantidade <= 0) {
    produtos = produtos.filter(p => p.id !== id);
    showToast("Produto removido completamente");
  } else {
    showToast("Quantidade removida com sucesso");
  }

  salvar();
  atualizarTudo();
}

// ============================================================
//                     ATUALIZAÇÃO DE TELAS 
// ============================================================

function atualizarTudo() {
  atualizarEstoque();
  atualizarDashboard();
  atualizarRelatorios();
}

function atualizarEstoque() {
  const lista = document.getElementById("estoqueLista");
  if (!lista) return;

  lista.innerHTML = produtos.map(p => {
    const vencendo = diasRestantes(p.validade) <= 7;
    return `
      <div class="product-card ${vencendo ? 'warning' : ''}">
        <h3>${p.nome}</h3>
        <p>Qtd em estoque: ${p.quantidade}</p>
        <p>Validade: ${p.validade}</p>
        <div class="controle-quantidade">
          <button onclick="diminuir(${p.id})">-</button>
          <span id="qtd-${p.id}">0</span>
          <button onclick="aumentar(${p.id}, ${p.quantidade})">+</button>
        </div>
        <button onclick="removerQuantidade(${p.id})" class="btn-danger">Remover</button>
      </div>
    `;
  }).join("");
}

function atualizarDashboard() {
  const total = document.getElementById("totalProdutos");
  const venc = document.getElementById("produtosVencendo");
  const hist = document.getElementById("historicoLista");

  if (total) total.textContent = produtos.length;
  if (venc) venc.textContent = produtos.filter(p => diasRestantes(p.validade) <= 7).length;
  if (hist) hist.innerHTML = produtos.map(p => `<li>${p.data} - ${p.nome} (${p.quantidade})</li>`).join("");
}

function atualizarRelatorios() {
  const cad = document.getElementById("relTotalCad");
  const est = document.getElementById("relTotalEstoque");
  const container = document.getElementById("relatorioCards");

  if (cad) cad.textContent = produtos.length;
  if (est) est.textContent = produtos.reduce((s, p) => s + p.quantidade, 0);
  if (!container) return;

  container.innerHTML = produtos.map(p => {
    const vencido = diasRestantes(p.validade) < 0;
    return `
      <div class="rel-card ${vencido ? 'vencido' : ''}">
        <h3>${p.nome}</h3>
        <p><strong>Quantidade:</strong> ${p.quantidade}</p>
        <p><strong>Validade:</strong> ${p.validade}</p>
        <p><strong>Entrada:</strong> ${p.data}</p>
        <p><strong>Descrição:</strong> ${p.descricao || "Sem descrição"}</p>
      </div>
    `;
  }).join("");
}

function diasRestantes(data) {
  const hoje = new Date();
  const v = new Date(data);
  return Math.ceil((v - hoje) / (1000 * 60 * 60 * 24));
}

// ============================================================
//                       ASSISTENTE DE IA 
// ============================================================

function responderIA() {
  const input = document.getElementById("perguntaIA");
  const perguntaOriginal = input.value.trim();
  const pergunta = perguntaOriginal.toLowerCase();

  if (!pergunta) return;

  adicionarMensagem(perguntaOriginal, "user-msg");
  adicionarMensagem(gerarRespostaIA(pergunta), "ia-msg");
  input.value = "";
}

function gerarRespostaIA(pergunta) {
  if (produtos.length === 0) return "Ainda não há produtos cadastrados.";

  if (pergunta.includes("quantidade") || pergunta.includes("total") || pergunta.includes("quantos")) {
    return `Existem atualmente ${produtos.length} produtos cadastrados.`;
  }

  if (pergunta.includes("vencido") || pergunta.includes("vencendo") || pergunta.includes("vencidos")) {
    const vencidos = produtos.filter(p => diasRestantes(p.validade) < 0);
    return vencidos.length === 0
      ? "Nenhum produto está vencido."
      : "Produtos vencidos: " + vencidos.map(p => p.nome).join(", ");
  }

  if (pergunta.includes("baixo") || pergunta.includes("acabando") || pergunta.includes("abaixo")) {
    const baixos = produtos.filter(p => p.quantidade <= 5);
    return baixos.length === 0
      ? "Nenhum produto está com estoque baixo."
      : "Estoque baixo: " + baixos.map(p => `${p.nome} (${p.quantidade})`).join(", ");
  }

  return "Posso informar sobre total de produtos, estoque baixo ou vencimentos.";
}

function adicionarMensagem(texto, classe) {
  const chat = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.className = `msg ${classe}`;
  div.textContent = texto;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

// ============================================================
//                       DESCRIÇÃO AUTOMÁTICA 
// ============================================================

function gerarDescricaoAutomatica(nome) {
  nome = nome.toLowerCase();
  const alimenticios = ["farinha", "açúcar", "sal", "fermento", "leite", "ovos"];
  if (alimenticios.some(item => nome.includes(item))) {
    return "Produto alimentício utilizado no preparo de refeições. Conservar em local seco e arejado.";
  }
  return `${nome}, produto destinado ao uso comercial. Verifique validade e condições de armazenamento.`;
}

// ============================================================
//                         NOTIFICAÇÕES 
// ============================================================

function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

// ============================================================
//                         INICIALIZAÇÃO 
// ============================================================

window.onload = () => {
  atualizarTudo();
  verificarSessao();
};