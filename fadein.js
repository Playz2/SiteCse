
const observerOptions = {
    root: null, 
    rootMargin: '0px',
    threshold: 0.15 
  };
  
  
  function handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
       
        observer.unobserve(entry.target);
      }
    });
  }
  
  
  const observer = new IntersectionObserver(handleIntersection, observerOptions);
  
  
  document.addEventListener('DOMContentLoaded', () => {
    
    const elementsToAnimate = document.querySelectorAll('.fade-in');
    
   
    elementsToAnimate.forEach(element => {
      observer.observe(element);
    });
  });