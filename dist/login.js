// import { input } from "@tensorflow/tfjs";

document.addEventListener("DOMContentLoaded", function () {
  let resetBtn = document.getElementById("resetBtn");
  let loginBtn = document.getElementById("login");
  let pass = document.getElementById("psw");
  let paragraphs = document.getElementsByTagName("p");
  let helpIcon = document.getElementById("help");
  let initPass = "admin";
  let passValue = "";
  let hint;
  let inputBox;
  let hintValue;
  let boolHint = false;

  function checkPass() {
    if (pass.value === "" || pass.value === null) {
      loginBtn.disabled = true;
      resetBtn.disabled = true;
      loginBtn.style.opacity = 0.5;
      resetBtn.style.opacity = 0.5;
      console.log("disabled");
    }
  }

  checkPass();

  // chrome.storage.sync.set({
  //   hint: "Default Password",
  // });
  async function retrievePass() {
    return new Promise((resolve, reject) => {
      chrome.storage.sync.get(["password", "hint"], function (result) {
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
      hint = passResult.hint;
      // console.log("Hint  is:", hint);
      // Do something with fetchedSites here
    } catch (error) {
      console.error("Error retrieving password:", error);
    }
  }

  main().then((result) => {
    paragraphs[0].textContent = "Hint: " + hint;
    pass.addEventListener("input", function () {
      if (pass.value === "" || pass.value === null) {
        // If empty, disable the button
        loginBtn.disabled = true;
        resetBtn.disabled = true;
        checkPass();
      } else {
        // If not empty, enable the button
        loginBtn.disabled = false;
        resetBtn.disabled = false;
        loginBtn.style.opacity = 1;
        resetBtn.style.opacity = 1;
      }
    });
    resetBtn.addEventListener("click", function () {
      if (resetBtn.textContent === "Set New") {
        if (pass.value === passValue) {
          paragraphs[0].textContent = "Save a 'Hint' to remember password";
          paragraphs[1].textContent = "Click 'Save' to set new password";
          paragraphs[2].textContent = "";
          pass.placeholder = "Enter New Password";
          pass.value = "";
          resetBtn.textContent = "Save";
          // loginBtn.disabled = true;
          loginBtn.style.display = "none";
          const targetDiv = document.getElementById("targetDiv");

          // Create the input element
          inputBox = document.createElement("input");
          inputBox.type = "text";
          inputBox.id = "hint";
          inputBox.placeholder = "Enter hint here";

          // Insert the input element into the target div
          targetDiv.appendChild(inputBox);
          hintValue = document.getElementById("hint");
          console.log(inputBox.id);
          boolHint = true;
          hint = hintValue.value;

          console.log(hintValue.value);
          checkPass();
        } else {
          alert("Wrong Password");
        }
      } else {
        // loginBtn.disabled = true;
        chrome.storage.sync.set(
          {
            password: pass.value,
            hint: hintValue.value,
          },
          function (result) {
            // console.log("password is changed", hintValue.value);
            hint = hintValue.value;
            inputBox.style.display = "none";

            paragraphs[0].textContent = "Hint: " + hint;
            paragraphs[1].textContent = "Want to set new password?";
            paragraphs[2].textContent =
              "Enter saved credential then click button below";
            pass.value = "";
            console.log("password is changed:", pass.value);
            resetBtn.textContent = "Set New";
            loginBtn.style.display = "block";
            hintValue.addEventListener("input", function () {
              if (hintValue.value === "" || hintValue.value === null) {
                // If empty, disable the button
                resetBtn.disabled = true;
              } else {
                // If not empty, enable the button

                resetBtn.disabled = false;

                resetBtn.style.opacity = 1;
              }
            });
            checkPass();
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
    helpIcon.addEventListener("click", function () {
      chrome.tabs.create({ url: "tutorial.html" });
    });
  });
});
