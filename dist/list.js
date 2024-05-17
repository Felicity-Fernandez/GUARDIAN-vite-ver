document.addEventListener("DOMContentLoaded", function () {
  chrome.storage.sync.get(["censorWords"], function (result) {
    wordslist = result.censorWords;

    for (const words of wordslist) {
      document.getElementById(
        "wordList"
      ).innerHTML += `<li id="item-${words}">${words}</li>`;
    }
  });
});
