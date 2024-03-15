document.addEventListener("DOMContentLoaded", function () {
  let resetBtn = document.getElementById("resetBtn");
  let loginBtn = document.getElementById("login");
  let pass = document.getElementById("psw");
  let paragraphs = document.getElementsByTagName("p");
  let initPass = "admin";
  let passValue = "";

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

  main().then((result) => {
    pass.addEventListener("input", function () {
      if (pass.value === "" || pass.value === null) {
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
        if (pass.value === passValue) {
          paragraphs[0].textContent = "";
          paragraphs[1].textContent = "Click 'Save' to set new password";
          pass.placeholder = "Enter New Password";
          pass.value = "";
          resetBtn.textContent = "Save";
          loginBtn.disabled = true;
        } else {
          alert("Wrong Password");
        }
      } else {
        // loginBtn.disabled = true;
        chrome.storage.sync.set(
          {
            password: pass.value,
          },
          function (result) {
            console.log("password is changed");
            pass.placeholder = "Enter Password";
            paragraphs[0].textContent = "Want to set new password?";
            paragraphs[1].textContent =
              "Enter saved credential then click button below";
            pass.value = "";
            console.log("password is changed:", pass.value);
            resetBtn.textContent = "Set New";
          }
        );
      }
    });
    loginBtn.addEventListener("click", function () {
      main().then((result) => {
        if (pass.value === passValue) {
          window.location.href = "index.html";
        } else {
          alert("Wrong Password");
        }
      });
    });
  });
});
