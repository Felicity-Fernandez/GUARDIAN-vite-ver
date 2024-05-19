import { badWords } from "./profanity.js";
document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.sync.get(["censorWords"], function (result) {
    const wordslist = result.censorWords;

    for (const words of wordslist) {
      document.getElementById(
        "wordList"
      ).innerHTML += `<li id="item-${words}">${words}</li>`;
    }
    for (const words of badWords) {
      document.getElementById(
        "defaultList"
      ).innerHTML += `<li id="item-${words}">${words}</li>`;
    }
  });
});
