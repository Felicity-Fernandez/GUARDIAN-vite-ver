document.addEventListener("DOMContentLoaded", function () {
  var resetBtn = document.getElementById("resetBtn");
  var loginBtn = document.getElementById("login");
  var uname = document.getElementById("uname");
  var pass = document.getElementById("psw");
  if (uname.value === "" || uname.value === null) {
    loginBtn.disabled = true;
    console.log("disabled");
  }
  uname.addEventListener("input", function () {
    if (
      uname.value.trim() === "" ||
      uname.placeholder === "Enter New Username"
    ) {
      // If empty, disable the button
      loginBtn.disabled = true;
    } else {
      // If not empty, enable the button
      loginBtn.disabled = false;
    }
  });
  resetBtn.addEventListener("click", function () {
    uname.placeholder = "Enter New Username";
    pass.placeholder = "Enter New Password";
    resetBtn.textContent = "Save";
    resetBtn.addEventListener("click", function () {
      console.log(uname);
      //   var uname = document.getElementById("uname");
      //   var pass = document.getElementById("psw");
      //   chrome.storage.sync.set(
      //     { uname: uname.value, pass: pass.value },
      //     function () {
      //       console.log(
      //         "Username and Password updated:",
      //         uname.value,
      //         pass.value
      //       );
      //     }
      //   );
      //   resetBtn.textContent = "Reset";
      //   uname.value = "";
      //   pass.value = "";
      //   uname.placeholder = "Username";
      //   pass.placeholder = "Password";
    });
  });
});
