
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
      navToggle.addEventListener('click', function() {
        navLinks.classList.toggle('show');
      });
    }
    

    document.addEventListener('click', function(event) {
      const isClickInside = navToggle.contains(event.target) || navLinks.contains(event.target);
      
      if (!isClickInside && navLinks.classList.contains('show')) {
        navLinks.classList.remove('show');
      }
    });
    

    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
      link.addEventListener('click', function() {
        navLinks.classList.remove('show');
      });
    });
  });