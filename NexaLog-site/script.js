let autenticado = false;

function showCadastro(){
  trocarTela("cadastroPage");
}

function voltarLogin(){
  trocarTela("loginPage");
}

function verificacao(){
  trocarTela("verificacaoPage");
}

function confirmarVerificacao(){
  autenticado = true;
  entrarSistema();
}

function login(){
  autenticado = true;
  entrarSistema();
}

function entrarSistema(){
  trocarTela("loadingPage");

  setTimeout(()=>{
    document.getElementById("loadingPage").style.display="none";
    document.getElementById("appPage").style.display="block";
  },2000);
}

function trocarTela(id){
  document.querySelectorAll("section").forEach(sec=>{
    sec.style.display="none";
  });
  document.getElementById(id).style.display="flex";
}

function toggleMenu(){
  document.getElementById("sidebar").classList.toggle("active");
}

function navigate(id){
  document.querySelectorAll(".page").forEach(p=>{
    p.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}