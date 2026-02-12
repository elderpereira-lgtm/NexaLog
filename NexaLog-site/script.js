function navigate(pageId) {

  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.remove('active');
  });

  document.getElementById(pageId).classList.add('active');

  event.target.classList.add('active');
}