let produtos = 
JSON.parse(localStorage.getItem("produtos")) || [];

/* ==== Login ====*/
function showCadastro() {trocarTela("cadastroPage");}
function voltarLogin() {trocarTela("loginPage");}
function login(){

  const email = document.getElementById("loginEmail").value.trim();
  const senha = document.getElementById("loginSenha").value;

  // ✔ Validação de email
  if(!email || !email.includes("@")){
    alert("Digite um e‑mail válido");
    return;
  }

  // ✔ Validação de senha
  if(!senha || senha.length < 8){
    alert("A senha deve ter no mínimo 8 caracteres");
    return;
  }

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

  // ✔ Validação de email
  if(!email || !email.includes("@")){
    alert("Digite um e‑mail válido");
    return;
  }

  // ✔ Validação de senha
  if(!senha || senha.length < 8){
    alert("A senha deve ter no mínimo 8 caracteres");
    return;
  }

  // ✔ Confirmação de senha
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

  // ✔ Verifica se digitou os 6 dígitos
  if (codigo.length !== 6 || !/^\d{6}$/.test(codigo)) {
    alert("Digite o código completo de 6 dígitos");
    return;
  }

  // ✔ Código válido (simulação)
  entrarSistema();
}

function entrarSistema(){
  trocarTela("loadingPage");
  setTimeout(()=>{
    document.getElementById("loadingPage").style.display="none";
    document.getElementById("appPage").style.display="flex";
    atualizarTudo();
  },1500);
}
function trocarTela(id){
  document.querySelectorAll("section.auth-page, section.loading-page")
   .forEach(s=>s.style.display="none");
  
  const tela = document.getElementById(id);
  if(tela) tela.style.display="flex";
}

/* ==== Menu ====*/
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

/* ================= PRODUTOS ================= */

function adicionarProduto(){

  const nome = document.getElementById("nomeProduto").value.trim();
  const quantidade = document.getElementById("quantidadeProduto").value;
  const validade = document.getElementById("validadeProduto").value;

  if(!nome || !quantidade || !validade){
    showToast("Preencha todos os campos");
    return;
  }

  const produto = {
    id: Date.now(),
    nome,
    quantidade: Number(quantidade),
    validade,
    data: new Date().toLocaleDateString()
  };

  produtos.push(produto);
  salvar();
  atualizarTudo();

  document.getElementById("nomeProduto").value="";
  document.getElementById("quantidadeProduto").value="";
  document.getElementById("validadeProduto").value="";

  showToast("Produto cadastrado com sucesso");
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

/* ================= ATUALIZAÇÕES ================= */

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
        <p>Qtd: ${p.quantidade}</p>
        <p>Validade: ${p.validade}</p>
        <button onclick="removerProduto(${p.id})" class="btn-danger">Remover</button>
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

  if(cad) cad.textContent = produtos.length;

  if(est){
    est.textContent = produtos.reduce((s,p)=>s+p.quantidade,0);
  }
}

function diasRestantes(data){
  const hoje = new Date();
  const v = new Date(data);
  return Math.ceil((v-hoje)/(1000*60*60*24));
}

/* ================= TOAST ================= */

function showToast(msg){
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),3000);
}

/* ================= INIT ================= */

window.onload = atualizarTudo;
