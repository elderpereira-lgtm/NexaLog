const API_URL = "https://localhost:7071/api";
let produtos = [];
const MAPA_UNIDADE = { Kg: 0, Un: 1, L: 2, G: 3 };
const MAPA_UNIDADE_REVERSO = { 0: "Kg", 1: "Un", 2: "L", 3: "G" };

// ============================================================
//                         AUTENTICAÇÃO 
// ============================================================

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

const PERMISSOES_PAGINA = {
  dashboard: ["Administrador", "Gestor", "Operador"],
  estoque: ["Administrador", "Gestor", "Operador"],
  relatorios: ["Administrador", "Gestor"],
  cadastro: ["Administrador", "Gestor"],
  assistente: ["Administrador", "Gestor", "Operador"],
};

function cargoTemAcesso(paginaId) {
  const cargo = localStorage.getItem("cargoUsuario");
  const permitidos = PERMISSOES_PAGINA[paginaId];
  if (!permitidos) return true; // página sem restrição cadastrada
  return permitidos.includes(cargo);
}

function aplicarPermissoes() {
  document.querySelectorAll(".nav-item[data-page]").forEach(btn => {
    const pagina = btn.dataset.page;
    if (cargoTemAcesso(pagina)) {
      btn.style.display = "";
    } else {
      btn.style.display = "none";
    }
  });

  // Se a página ativa no momento não é mais permitida, manda pro dashboard
  const paginaAtiva = document.querySelector(".page.active");
  if (paginaAtiva && !cargoTemAcesso(paginaAtiva.id)) {
    const btnDashboard = document.querySelector('.nav-item[data-page="dashboard"]');
    navigate("dashboard", btnDashboard);
  }
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
  aplicarPermissoes();
  carregarProdutos();
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
  if (!cargoTemAcesso(id)) {
    showToast("Você não tem permissão para acessar essa área");
    return;
  }

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

async function carregarProdutos() {
  const resposta = await fetch(`${API_URL}/Produto`, {
    credentials: "include"
  });

  if (!resposta.ok) {
    showToast("Erro ao carregar produtos.");
    return;
  }

  produtos = await resposta.json();
  atualizarTudo();
}

async function adicionarProduto() {
  const nome = document.getElementById("nomeProduto").value.trim();
  const quantidade = document.getElementById("quantidadeProduto").value;
  const unidade = document.getElementById("unidadeProduto").value;
  const codigoProduto = document.getElementById("codProduto").value;
  const codigoLote = document.getElementById("codLote").value;
  const dataCadastro = new Date().toISOString().split("T")[0];
  const validade = document.getElementById("validadeProduto").value;
  let descricao = document.getElementById("descricaoProduto").value.trim();

  if (!descricao) {
    descricao = gerarDescricaoAutomatica(nome);
  }

  if (!nome || !quantidade || !validade || !codigoLote || !codigoProduto) {
    showToast("Preencha todos os campos obrigatórios");
    return;
  }

  try {

    const resposta = await fetch(`${API_URL}/Produto`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome,
        dataCadastro,
        dataValidade: validade,
        quantidade: Number(quantidade),
        unidade: MAPA_UNIDADE[unidade],
        codProduto: Number(codigoProduto),
        descricao
      })
    });

    if (!resposta.ok) {
      const erro = await resposta.text();
      showToast(erro || "Erro ao cadastrar produto.");
      return;
    }

    const produto = await resposta.json();

    const respostaLote = await fetch(`${API_URL}/Lote`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        quantidadeLote: Number(quantidade),
        codLote: codigoLote,
        dataValidade: validade,
        dataFabricacao: dataCadastro,
        fkProdutoIdProduto: produto.idProduto
      })
    });

    if (!respostaLote.ok) {
      const erro = await respostaLote.text();
      showToast(erro || "Erro ao cadastrar lote.");
      return;
    }

    // Limpar os campos
    document.getElementById("nomeProduto").value = "";
    document.getElementById("quantidadeProduto").value = "";
    document.getElementById("codProduto").value = "";
    document.getElementById("codLote").value = "";
    document.getElementById("validadeProduto").value = "";
    document.getElementById("descricaoProduto").value = "";

    // Atualizar a lista de produtos
    await carregarProdutos();

    showToast("Produto cadastrado com sucesso.");

  } catch (erro) {
    console.error(erro);
    showToast("Erro ao conectar com o servidor.");
  }
}

// ============================================================
//                         ESTOQUE 
// ============================================================

let produtoRemovendoId = null;

function abrirModalRemover(id) {
  const produto = produtos.find(p => p.idProduto === id);
  if (!produto) {
    showToast("Produto não encontrado.");
    return;
  }

  produtoRemovendoId = id;

  document.getElementById("removerNomeProduto").textContent = produto.nome;
  document.getElementById("removerEstoqueAtual").textContent = 
  `${produto.quantidade} ${MAPA_UNIDADE_REVERSO[produto.unidade]}`;
  document.getElementById("removerQuantidadeInput").value = "";

  document.getElementById("modalRemover").classList.add("show");
}

function fecharModalRemover() {
  document.getElementById("modalRemover").classList.remove("show");
  produtoRemovendoId = null;
}

async function confirmarRemocao() {
  if (!produtoRemovendoId) return;

  const produto = produtos.find(p => p.idProduto === produtoRemovendoId);
  if (!produto) {
    showToast("Produto não encontrado.");
    return;
  }

  const quantidadeRemover = Number(document.getElementById("removerQuantidadeInput").value);

  if (!quantidadeRemover || quantidadeRemover <= 0) {
    showToast("Digite uma quantidade válida.");
    return;
  }

  if (quantidadeRemover > produto.quantidade) {
    showToast("Quantidade maior que o estoque disponível.");
    return;
  }

  const novaQuantidade = produto.quantidade - quantidadeRemover;

  try {
    if (novaQuantidade <= 0) {
      const resposta = await fetch(`${API_URL}/Produto/${produto.idProduto}`, {
        method: "DELETE",
        credentials: "include"
      });

      if (!resposta.ok) {
        showToast("Erro ao remover produto.");
        return;
      }

      showToast("Produto removido completamente");
    } else {
      const resposta = await fetch(`${API_URL}/Produto/${produto.idProduto}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...produto, quantidade: novaQuantidade })
      });

      if (!resposta.ok) {
        showToast("Erro ao atualizar produto.");
        return;
      }

      showToast("Quantidade removida com sucesso");
    }

    fecharModalRemover();
    await carregarProdutos();

  } catch (erro) {
    console.error(erro);
    showToast("Erro ao conectar com o servidor.");
  }
}

// Atualizar produto

let produtoEditandoId = null;

function abrirModalEdicao(id) {
  const produto = produtos.find(p => p.idProduto === id);
  if (!produto) {
    showToast("Produto não encontrado.");
    return;
  }

  produtoEditandoId = id;

  document.getElementById("editNome").value = produto.nome;
  document.getElementById("editCodProduto").value = produto.codProduto;
  document.getElementById("editCodLote").value = produto.lotes?.[0]?.codLote ?? "";
  document.getElementById("editQuantidade").value = produto.quantidade;
  document.getElementById("editUnidade").value = MAPA_UNIDADE_REVERSO[produto.unidade];
  document.getElementById("editDescricao").value = produto.descricao ?? "";

  document.getElementById("modalEditar").classList.add("show");
}

function fecharModalEdicao() {
  document.getElementById("modalEditar").classList.remove("show");
  produtoEditandoId = null;
}

async function salvarEdicaoProduto() {
  if (!produtoEditandoId) return;

  const produto = produtos.find(p => p.idProduto === produtoEditandoId);
  if (!produto) {
    showToast("Produto não encontrado.");
    return;
  }

  const nome = document.getElementById("editNome").value.trim();
  const codProduto = document.getElementById("editCodProduto").value;
  const codLote = document.getElementById("editCodLote").value.trim();
  const quantidade = Number(document.getElementById("editQuantidade").value);
  const descricao = document.getElementById("editDescricao").value.trim();

  if (!nome || !codProduto || quantidade < 0) {
    showToast("Preencha os campos corretamente.");
    return;
  }

  const produtoAtualizado = {
    ...produto,
    nome,
    codProduto: Number(codProduto),
    quantidade,
    unidade: MAPA_UNIDADE[document.getElementById("editUnidade").value],
    descricao
  };

  try {
    const resposta = await fetch(`${API_URL}/Produto/${produtoEditandoId}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(produtoAtualizado)
    });

    if (!resposta.ok) {
      console.log(await resposta.text());
      showToast("Erro ao atualizar produto.");
      return;
    }

    // Atualiza o lote, se o produto tiver um
    const lote = produto.lotes?.[0];
    if (lote) {
      const loteAtualizado = { ...lote, codLote, quantidadeLote: quantidade };

      const respostaLote = await fetch(`${API_URL}/Lote/${lote.idLote}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loteAtualizado)
      });

      if (!respostaLote.ok) {
        console.log(await respostaLote.text());
        showToast("Produto atualizado, mas houve erro ao atualizar o lote.");
        fecharModalEdicao();
        await carregarProdutos();
        return;
      }
    }

    showToast("Produto atualizado com sucesso.");
    fecharModalEdicao();
    await carregarProdutos();

  } catch (erro) {
    console.error(erro);
    showToast("Erro ao conectar com o servidor.");
  }
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
    const vencendo = diasRestantes(p.dataValidade) <= 7;
    return `
      <div class="product-card ${vencendo ? 'warning' : ''}">
        <h3>${p.nome}</h3>
        <p>Qtd em estoque: <strong>${p.quantidade} ${MAPA_UNIDADE_REVERSO[p.unidade]}</strong></p>
        <p>Validade: <strong>${p.dataValidade}</strong></p>
        
        <!-- CONTÊINER DE AÇÕES LADO A LADO -->
      <div class="acoes-container">        
          <button class="btn-atualizar" onclick="abrirModalEdicao(${p.idProduto})">
            Atualizar
          </button>

          <button class="btn-danger" onclick="abrirModalRemover(${p.idProduto})">
            Remover
          </button>
      </div>
    </div>
    `;
  }).join("");
}

function atualizarDashboard() {
  const total = document.getElementById("totalProdutos");
  const venc = document.getElementById("produtosVencendo");
  const hist = document.getElementById("historicoLista");

  if (total) total.textContent = produtos.length;
  if (venc) venc.textContent = produtos.filter(p => diasRestantes(p.dataValidade) <= 7).length;
  if (hist) hist.innerHTML = produtos.map(p =>
    `<li>${p.dataCadastro} - ${p.nome} (${p.quantidade} ${MAPA_UNIDADE_REVERSO[p.unidade]})</li>`).join("");
}

function atualizarRelatorios() {
  const cad = document.getElementById("relTotalCad");
  const est = document.getElementById("relTotalEstoque");
  const container = document.getElementById("relatorioCards");

  if (cad) cad.textContent = produtos.length;
  if (est) est.textContent = produtos.reduce((s, p) => s + p.quantidade, 0);
  if (!container) return;

  container.innerHTML = produtos.map(p => {
    const vencido = diasRestantes(p.dataValidade) < 0;
    return `
      <div class="rel-card ${vencido ? 'vencido' : ''}">
        <h3>${p.nome}</h3>
        <p>Cód. Produto: ${p.codProduto}</p>
        <p>Cód. Lote: ${p.lotes?.[0]?.codLote ?? "-"}</p>
        <p>Qtd em estoque: ${p.quantidade} ${MAPA_UNIDADE_REVERSO[p.unidade]}</p>
        <p>Validade: ${p.dataValidade}</p>
        <p><strong>Entrada:</strong> ${p.dataCadastro}</p>
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
    const vencidos = produtos.filter(p => diasRestantes(p.dataValidade) < 0);
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

window.onload = async () => {
  await verificarSessao();
};