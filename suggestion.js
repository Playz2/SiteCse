emailjs.init("9TxvQQPaf5gXJvgIp"); 

const form = document.getElementById("sugestionform");

form.addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs.sendForm("service_gq5zawj", "template_k7n2ff1", form)
    .then(function () {
      document.getElementById("succesMessage").style.display = "block";
      document.getElementById("errorMessage").style.display = "none";
      form.reset();
    }, function (error) {
      document.getElementById("succesMessage").style.display = "none";
      document.getElementById("errorMessage").style.display = "block";
      console.error("FAILED...", error);
    });
});