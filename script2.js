document.addEventListener("DOMContentLoaded", function () {
    const debateCarousel = document.querySelector("#debateCarousel");
    const debateSlides = document.querySelectorAll("#debateCarousel .slide");
  
    let debateIndex = 0;
    let debateInterval;
  
    function showDebateSlide(index) {
      debateIndex = index;
      if (debateIndex >= debateSlides.length) debateIndex = 0;
      if (debateIndex < 0) debateIndex = debateSlides.length - 1;
  
      debateCarousel.style.transform = `translateX(-${debateIndex * 100}%)`;
    }
  
    function nextDebateSlide() {
      showDebateSlide(debateIndex + 1);
    }
  
    function startDebateAutoScroll() {
      clearInterval(debateInterval);
      debateInterval = setInterval(nextDebateSlide, 3000);
    }
  

    showDebateSlide(0);
    startDebateAutoScroll();
  });
  document.addEventListener("DOMContentLoaded", function () {
    const majoreteCarousel = document.querySelector("#majoreteCarousel");
    const majoreteSlides = document.querySelectorAll("#majoreteCarousel .slide");
  
    let majoreteIndex = 0;
    let majoreteInterval;
  
    function showMajoreteSlide(index) {
      majoreteIndex = index;
      if (majoreteIndex >= majoreteSlides.length) majoreteIndex = 0;
      majoreteCarousel.style.transform = `translateX(-${majoreteIndex * 100}%)`;
    }
  
    function nextMajoreteSlide() {
      showMajoreteSlide(majoreteIndex + 1);
    }
  
    function startMajoreteAutoScroll() {
      clearInterval(majoreteInterval);
      majoreteInterval = setInterval(nextMajoreteSlide, 3500);
    }
  
    showMajoreteSlide(0);
    startMajoreteAutoScroll();
  });