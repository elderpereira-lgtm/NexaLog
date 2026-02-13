let produtos = JSON.parse(localStorage.getItem("produtos")) || [];

function showCadastro(){trocarTela("cadastroPage");}
function voltarLogin(){trocarTela("loginPage");}
function verificacao(){trocarTela("verificacaoPage");}

function confirmarVerificacao(){
entrarSistema();
}

function login(){
entrarSistema();
}

function entrarSistema(){
trocarTela("loadingPage");
setTimeout(()=>{
document.getElementById("loadingPage").style.display="none";
document.getElementById("appPage").style.display="block";
atualizarEstoque();
atualizarHistorico();
},2000);
}

function trocarTela(id){
document.querySelectorAll("section").forEach(s=>s.style.display="none");
document.getElementById(id).style.display="flex";
}

function toggleMenu(){
document.getElementById("sidebar").classList.toggle("active");
}

function navigate(id){
document.querySelectorAll(".page").forEach(p=>p.classList.remove("active"));
document.getElementById(id).classList.add("active");
}

function adicionarProduto(){
let nome=document.getElementById("nomeProduto").value;
let quantidade=document.getElementById("quantidadeProduto").value;
let validade=document.getElementById("validadeProduto").value;

if(!nome||!quantidade||!validade){
alert("Preencha todos os campos");
return;
}

let produto={
nome,
quantidade,
validade,
data:new Date().toLocaleDateString()
};

produtos.push(produto);
localStorage.setItem("produtos",JSON.stringify(produtos));

atualizarEstoque();
atualizarHistorico();

document.getElementById("nomeProduto").value="";
document.getElementById("quantidadeProduto").value="";
document.getElementById("validadeProduto").value="";
}

function atualizarEstoque(){
let lista=document.getElementById("estoqueLista");
if(!lista)return;
lista.innerHTML="";
produtos.forEach(p=>{
lista.innerHTML+=`
<div class="produto-card">
<h4>${p.nome}</h4>
<p>Qtd: ${p.quantidade}</p>
<p>Validade: ${p.validade}</p>
</div>`;
});
}

function atualizarHistorico(){
let lista=document.getElementById("historicoLista");
if(!lista)return;
lista.innerHTML="";
produtos.forEach(p=>{
lista.innerHTML+=`
<li>${p.data} - Produto cadastrado: ${p.nome} (Qtd: ${p.quantidade})</li>`;
});
}