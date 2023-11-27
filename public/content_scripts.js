// import nlp from "compromise";

console.log("running");
let tweets = null;
chrome.runtime.sendMessage({ action: "getFilterSites" }, (toFilterSites) => {
  const currentUrl = window.location.href;
  if (toFilterSites.some((site) => currentUrl.includes(site))) {
    console.log("true");
    // document.addEventListener("DOMContentLoaded", processTweets);

    // If DOMContentLoaded has already occurred, execute the logic immediately
    if (
      document.readyState === "complete" ||
      document.readyState === "interactive"
    ) {
      const interval = setInterval(() => {
        if (
          document.querySelector('[data-testid = "cellInnerDiv"]')
            ?.parentElement
        ) {
          console.log("ready...");
          clearInterval(interval);
          processTweets();
        }
      }, 1000);
    }
  }
});
function processTweets() {
  console.log("started");
  let targetNode = document.querySelector(
    '[data-testid = "cellInnerDiv"]'
  ).parentElement;

  console.log(targetNode);

  // Options for the observer (which mutations to observe)
  const config = { attributes: true, childList: true, subtree: true };

  // Callback function to execute when mutations are observed
  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        console.log("A child node has been added or removed.");
        tweets = document.querySelectorAll('[data-testid = "cellInnerDiv"]');

        // console.log(tweets);
      }
    }
    console.log(tweets);
    // if (tweets) {
    //   [...tweets].forEach((tweet) => {
    //     console.log(tweets);
    //     const doc = nlp(tweet);
    //     const filtered = doc.match("(swear|badword|offensive|arse)").replace("****");
    //     tweet.innerText.replace(filtered.out("text"));
    //     console.log(tweet.innerText);
    //   });
    // }
  };

  // Create an observer instance linked to the callback function
  const observer = new MutationObserver(callback);

  // Start observing the target node for configured mutations
  observer.observe(targetNode, config);
  // const tweets = document.querySelectorAll(
  //   ".css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-kzbkwu"
  // );
  // console.log(tweets);
  // [...tweets].forEach((tweet) => {
  //   // const doc = nlp(tweet);
  //   // const filtered = doc.match("(swear|badword|offensive|arse)").replace("****");
  //   // tweet.innerText.replace(filtered.out("text"));
  //   console.log(tweet.innerText);
  // });
}
console.log(tweets);
