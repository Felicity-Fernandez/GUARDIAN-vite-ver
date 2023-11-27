// const nlp = require("compromise");
import nlp from "compromise";

let tweets = null;
chrome.runtime.sendMessage({ action: "getFilterSites" }, (toFilterSites) => {
  const currentUrl = window.location.href;
  if (toFilterSites.some((site) => currentUrl.includes(site))) {
    console.log("true");
    // document.addEventListener("DOMContentLoaded", processTweets);

    // If DOMContentLoaded has alreadcurredy oc, execute the logic immediately
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
        tweets = document.querySelectorAll('[dir = "auto"]');

        // console.log(tweets);
      }
    }
    // console.log(tweets);

    if (tweets && tweets?.length < 100000 && tweets?.length > 0) {
      observer.disconnect();
      [...tweets].forEach((tweet) => {
        //     console.log(tweets);
        //     const doc = nlp(tweet);
        //     const filtered = doc.match("(swear|badword|offensive|arse)").replace("****");
        //     tweet.innerText.replace(filtered.out("text"));
        var xpathExpression = "//*[contains(text(), 'a')]";

        // Evaluate the XPath expression
        var xpathresult = document.evaluate(
          xpathExpression,
          document,
          null,
          XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
          null
        );
        console.log(xpathresult);
        for (var i = 0; i < xpathresult.snapshotLength; i++) {
          var matchedElement = xpathresult.snapshotItem(i);
          // Do something with the selected elements
          console.log(matchedElement);
        }

        const fetchedTweet = nlp(tweet.textContent);
        const filteredTweet = fetchedTweet
          .match(
            "(a|the|an|is|are|at|in|on|i|you|he|she|it|we|they|am|was|were|be|been|being|have|has|had|do|does|did|will|would|shall|should|may|might|must|can|could|of|to|and|or|for|nor|but|yet|so|with|without|about|above|across|after|against|along|among|around|at|before|behind|below|beneath|beside|between|beyond|by|down|during|except|for|from|inside|into|like|near|of|off|on|onto|out|outside|over|since|through|throughout|till|to|toward|under|underneath|until|up|upon|with|within|without|according to|because of|by means of|in addition to|in front of|in place of|in spite of|instead of|on account of|out of|as well as|due to|in case of|in front of|in order to|in place of|in spite of|on account of|out of|as well as|due to|in case of|in front of|in order to|in place of|in spite of|on account of|out of|as well as|due to|in case of|in front of|in order to|in place of|in spite of|on account of|out of|as well as|due to|in case of|in front of|in order to|in place of|in spite of|on account of|out of|as well as|due to|in case of|in front of|in order to|in place of|in spite of|on account of|out of|as well as|due to|in case of|in front of|in order to|in place of|in spite of|on account of|out of|as well as|due to|in case of|in front of|in order to|in place of|in spite of|on account of|out of|as well as|due to|in case of|in front of|in order to|in place of|in spite of|on account of|out of|as well as|due to|in case of)"
          )
          .replace("****");
        console.log(filteredTweet);
        let caption = "";
        for (const array of filteredTweet.document) {
          for (const word of array) {
            caption += " " + word.text;
          }
        }

        tweet.textContent = caption;
        console.log(caption, "CAPTION");
        console.log(tweet.innerText);
      });
    }
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
