// Loading inicial
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("loading-screen").style.display = "none";
    document.body.style.overflow = "auto";
  }, 1500);
});

// Abrir / fechar menu
function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("active");
}

// Navegação entre páginas
function navigate(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  document.getElementById(pageId).classList.add("active");

  document.getElementById("sidebar").classList.remove("active");
}