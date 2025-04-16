let lastScroll = 0;
const nav = document.querySelector(".main-nav");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll) {
    nav.style.top = "-120px"; // Hide
  } else {
    nav.style.top = "0"; // Show
  }

  lastScroll = currentScroll;
});