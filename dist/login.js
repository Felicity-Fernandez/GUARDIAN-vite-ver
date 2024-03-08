document.addEventListener("DOMContentLoaded", function () {
  var resetBtn = document.getElementById("resetBtn");
  var loginBtn = document.getElementById("login");
  var pass = document.getElementById("psw");
  if (pass.value === "" || pass.value === null) {
    loginBtn.disabled = true;
    resetBtn.disabled = true;
    console.log("disabled");
  }
  pass.addEventListener("input", function () {
    if (pass.value.trim() === "" || pass.placeholder === "Enter New Username") {
      // If empty, disable the button
      loginBtn.disabled = true;
      resetBtn.disabled = true;
    } else {
      // If not empty, enable the button
      loginBtn.disabled = false;
      resetBtn.disabled = false;
    }
  });
  resetBtn.addEventListener("click", function () {
    if (resetBtn.textContent === "Set New") {
      pass.placeholder = "Enter New Password";
      pass.value = "";
      resetBtn.textContent = "Save";
      loginBtn.disabled = true;
    } else {
      pass.placeholder = "Enter Password";

      pass.value = "";
      resetBtn.textContent = "Set New";
    }
  });
  loginBtn.addEventListener("click", function () {
    window.location.href = "index.html";
  });
});
