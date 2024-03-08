document.addEventListener("DOMContentLoaded", function () {
  var resetBtn = document.getElementById("resetBtn");
  var loginBtn = document.getElementById("login");
  var pass = document.getElementById("psw");
  var initPass = "admin";
  var passValue = "";
  if (pass.value === "" || pass.value === null) {
    loginBtn.disabled = true;
    resetBtn.disabled = true;
    console.log("disabled");
  }
  async function retrievePass() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(["password"], function (result) {
        if (!result.password) {
          chrome.storage.sync.set(
            {
              password: initPass,
            },
            function () {
              console.log("password is stored");
              chrome.storage.sync.get(["password"], function (result) {
                console.log("password is stored", result);
              });
              resolve(result);
            }
          );
        } else {
          console.log("Password already exist:", result);
          resolve(result);
        }
      });
    });
  }
  async function main() {
    try {
      let passResult = await retrievePass();
      passValue = passResult.password;
      // Do something with fetchedSites here
    } catch (error) {
      console.error("Error retrieving password:", error);
    }
  }

  main();
  pass.addEventListener("input", function () {
    if (pass.value.trim() === "" || pass.value === null) {
      // If empty, disable the button
      loginBtn.disabled = true;
      resetBtn.disabled = true;
    } else if (pass.placeholder === "Enter New Password") {
      loginBtn.disabled = true;
    } else {
      // If not empty, enable the button
      loginBtn.disabled = false;
      resetBtn.disabled = false;
    }
  });
  resetBtn.addEventListener("click", function () {
    if (resetBtn.textContent === "Set New") {
      if (pass.value === passValue) {
        pass.placeholder = "Enter New Password";
        pass.value = "";
        resetBtn.textContent = "Save";
        loginBtn.disabled = true;
      } else {
        alert("Wrong Password");
      }
    } else {
      pass.placeholder = "Enter Password";
      loginBtn.disabled = true;
      pass.value = "";
      //   chrome.storage.sync.set(
      //     {
      //       password: pass.value,
      //     },
      //     function () {
      //       console.log("password is changed");
      //     }
      //   );
      resetBtn.textContent = "Set New";
    }
  });
  loginBtn.addEventListener("click", function () {
    if (pass.value === passValue) {
      window.location.href = "index.html";
    }
  });
});
