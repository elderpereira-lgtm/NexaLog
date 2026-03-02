let produtos = 
JSON.parse(localStorage.getItem("produtos")) || [];

// Login
function showCadastro() {trocarTela("cadastroPage");}
function voltarLogin() {trocarTela("loginPage");}
function login(){

  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value;

  if(!email || !email.includes("@")){
    alert("Digite um e‑mail válido");
    return;
  }

  if(!senha || senha.length < 8){
    alert("A senha deve ter no mínimo 8 caracteres");
    return;
  }

  let cargo = "Admin"; // Cargo padrão

  if(email.endsWith("@gestor.3irmaos.br")){
    cargo = "Gestor";
  }
  else if(email.endsWith("@operador.3irmaos.br")){
    cargo = "Operador de Estq.";
  }

  localStorage.setItem("cargoUsuario", cargo);
  localStorage.setItem("loginEmail", email);
  entrarSistema();
}

// Passa de um espaço númerico para outro na verificação

document.querySelectorAll("#verificacaoPage .codigo input")
.forEach((input, index, arr) => {

  input.addEventListener("input", () => {
    if (input.value.length === 1 && index < arr.length - 1) {
      arr[index + 1].focus();
    }
  });

});

// Botão voltar verificação 

function voltarCadastro(){
  trocarTela("cadastroPage"); 
}

function verificacao(){

  const email = document.getElementById("cadEmail").value.trim();
  const senha = document.getElementById("cadSenha").value;

  const confirmar = document.querySelector(
    "#cadastroPage input[placeholder='Confirmar senha']"
  ).value;

  // Validação de email
  if(!email || !email.includes("@")){
    alert("Digite um e‑mail válido");
    return;
  }

  // Validação de senha
  if(!senha || senha.length < 8){
    alert("A senha deve ter no mínimo 8 caracteres");
    return;
  }

  // Confirmação de senha
  if(senha !== confirmar){
    alert("As senhas não coincidem");
    return;
  }

  trocarTela("verificacaoPage");
}
function confirmarVerificacao() {

  const inputs = document.querySelectorAll("#verificacaoPage .codigo input");

  let codigo = "";

  inputs.forEach(input => {
    codigo += input.value.trim();
  });

  // Verifica se digitou os 6 dígitos
  if (codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
    alert("Digite o código completo de 6 dígitos");
    return;
  }

  // Código válido (simulação)
  entrarSistema();
}

function entrarSistema(){
  trocarTela("loadingPage");

  setTimeout(()=>{

    document.getElementById("loadingPage").style.display="none";
    document.getElementById("appPage").style.display="flex";

    atualizarUsuario();

    atualizarTudo();

  },1500);
}

function atualizarUsuario(){

  const cargo = localStorage.getItem("cargoUsuario");
  const userDiv = document.getElementById("userCargo");

  if(!userDiv) return;

  if(cargo){
    userDiv.textContent = cargo;
  } else {
    userDiv.textContent = "Admin";
  }
}
function trocarTela(id){
  document.querySelectorAll("section.auth-page, section.loading-page")
   .forEach(s=>s.style.display="none");
  
  const tela = document.getElementById(id);
  if(tela) tela.style.display="flex";
}

// Menu
function navigate(id, btn){

  document.querySelectorAll(".page").forEach(p=>{
    p.classList.remove("active");
  });

  const pagina = document.getElementById(id);
  if(pagina) pagina.classList.add("active");

  document.querySelectorAll(".nav-item").forEach(b=>{
    b.classList.remove("active-nav");
  });

  if(btn) btn.classList.add("active-nav");

  if(window.innerWidth <= 900){
    document.getElementById("sidebar").classList.remove("active");
  }
}

function toggleMenu(){
  document.getElementById("sidebar").classList.toggle("active");
}

// Produtos

function adicionarProduto(){

  const nome = document.getElementById("nomeProduto").value.trim();
  const quantidade = document.getElementById("quantidadeProduto").value;
  const validade = document.getElementById("validadeProduto").value;
  let descricao = document.getElementById("descricaoProduto").value.trim();

if(!descricao){
  descricao = gerarDescricaoAutomatica(nome);
}

  if(!nome || !quantidade || !validade){
    showToast("Preencha todos os campos obrigatórios");
    return;
  }

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

  document.getElementById("nomeProduto").value="";
  document.getElementById("quantidadeProduto").value="";
  document.getElementById("validadeProduto").value="";
  document.getElementById("descricaoProduto").value="";

  showToast("Produto cadastrado com sucesso.");
}


function removerProduto(id){
  produtos = produtos.filter(p=>p.id!==id);
  salvar();
  atualizarTudo();
  showToast("Produto removido");
}

function salvar(){
  localStorage.setItem("produtos",JSON.stringify(produtos));
}

function aumentar(id, estoqueMax){
  const span = document.getElementById(`qtd-${id}`);
  let valor = Number(span.textContent);

  if(valor < estoqueMax){
    span.textContent = valor + 1;
  }
}

function diminuir(id){
  const span = document.getElementById(`qtd-${id}`);
  let valor = Number(span.textContent);

  if(valor > 0){
    span.textContent = valor - 1;
  }
}

function removerQuantidade(id){

  const produto = produtos.find(p => p.id === id);
  const span = document.getElementById(`qtd-${id}`);
  const quantidadeRemover = Number(span.textContent);

  if(quantidadeRemover <= 0){
    showToast("Selecione uma quantidade para remover");
    return;
  }

  produto.quantidade -= quantidadeRemover;

  if(produto.quantidade <= 0){
    produtos = produtos.filter(p => p.id !== id);
    showToast("Produto removido completamente");
  } else {
    showToast("Quantidade removida com sucesso");
  }

  salvar();
  atualizarTudo();
}

// Atualizações

function atualizarTudo(){
  atualizarEstoque();
  atualizarDashboard();
  atualizarRelatorios();
}

function atualizarEstoque(){
  const lista = document.getElementById("estoqueLista");
  if(!lista) return;

  lista.innerHTML = produtos.map(p=>{
    const vencendo = diasRestantes(p.validade) <= 7;

    return `
      <div class="product-card ${vencendo?'warning':''}">
        <h3>${p.nome}</h3>
        <p>Qtd em estoque: ${p.quantidade}</p>
        <p>Validade: ${p.validade}</p>

        <div class="controle-quantidade">
          <button onclick="diminuir(${p.id})">-</button>
          <span id="qtd-${p.id}">0</span>
          <button onclick="aumentar(${p.id}, ${p.quantidade})">+</button>
        </div>

        <button onclick="removerQuantidade(${p.id})" class="btn-danger">
          Remover
        </button>
      </div>
    `;
  }).join("");
}

function atualizarDashboard(){

  const total = document.getElementById("totalProdutos");
  const venc = document.getElementById("produtosVencendo");
  const hist = document.getElementById("historicoLista");

  if(total) total.textContent = produtos.length;

  if(venc){
    venc.textContent = produtos.filter(p=>diasRestantes(p.validade)<=7).length;
  }

  if(hist){
    hist.innerHTML = produtos
      .map(p=>`<li>${p.data} - ${p.nome} (${p.quantidade})</li>`)
      .join("");
  }
}

function atualizarRelatorios(){

  const cad = document.getElementById("relTotalCad");
  const est = document.getElementById("relTotalEstoque");
  const container = document.getElementById("relatorioCards");

  if(cad) cad.textContent = produtos.length;

  if(est){
    est.textContent = produtos.reduce((s,p)=>s+p.quantidade,0);
  }

  if(!container) return;

  container.innerHTML = produtos.map(p=>{

    const dias = diasRestantes(p.validade);
    const vencido = dias < 0;

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

function diasRestantes(data){
  const hoje = new Date();
  const v = new Date(data);
  return Math.ceil((v-hoje)/(1000*60*60*24));
}

// Toast

function showToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),3000);
}
// Assistente Inteligente SIMULADA

function responderIA(){

  const input = document.getElementById("perguntaIA");
  const perguntaOriginal = input.value.trim();
  const pergunta = perguntaOriginal.toLowerCase();

  if(!pergunta) return;

  adicionarMensagem(perguntaOriginal, "user-msg");

  let resposta = gerarRespostaIA(pergunta);

  adicionarMensagem(resposta, "ia-msg");

  input.value = "";
}

function gerarRespostaIA(pergunta){

  if(produtos.length === 0){
    return "Ainda não há produtos cadastrados.";
  }

  if(pergunta.includes("quantos") || pergunta.includes("total")){
    return `Existem atualmente ${produtos.length} produtos cadastrados.`;
  }

  if(pergunta.includes("vencido") || pergunta.includes("vencendo")){
    const vencidos = produtos.filter(p => diasRestantes(p.validade) < 0);
    if(vencidos.length === 0){
      return "Nenhum produto está vencido.";
    }
    return "Produtos vencidos: " + vencidos.map(p => p.nome).join(", ");
  }

  if(pergunta.includes("baixo") || pergunta.includes("acabando")){
    const baixos = produtos.filter(p => p.quantidade <= 5);
    if(baixos.length === 0){
      return "Nenhum produto está com estoque baixo.";
    }
    return "Estoque baixo: " + baixos.map(p => p.nome + " (" + p.quantidade + ")").join(", ");
  }

  return "Posso informar sobre total de produtos, estoque baixo ou vencimentos.";
}

function adicionarMensagem(texto, classe){

  const chat = document.getElementById("chatBox");

  const div = document.createElement("div");
  div.className = `msg ${classe}`;
  div.textContent = texto;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

//Assistente Inteligente gerando descrições dos produtos castrados, SIMULAÇÂO

function gerarDescricaoAutomatica(nome){

  nome = nome.toLowerCase();

  // Produtos alimentícios
  if(nome.includes("farinha") || nome.includes("açucar") || nome.includes("sal") || nome.includes("fermento") || nome.includes("leite") || nome.includes("ovos")){
    return "Produto alimentício utilizado no preparo de refeições. Conservar em local seco e arejado.";
  }
  // Mensagem padronizada
  return `Produto ${nome} destinado ao uso comercial. Verifique validade e condições de armazenamento.`;
}
// Init

window.onload = atualizarTudo;

//Página da conta
function irParaConta(){

  const email = document.getElementById("loginEmail").value;
  const cargo = localStorage.getItem("cargoUsuario");
  document.getElementById("infoEmail").textContent = email;
  document.getElementById("infoCargo").textContent = cargo;

  navigate("conta");
}

function logout(){
  localStorage.removeItem("cargoUsuario");

  document.getElementById("appPage").style.display = "none";
  document.getElementById("loginPage").style.display = "flex";

}