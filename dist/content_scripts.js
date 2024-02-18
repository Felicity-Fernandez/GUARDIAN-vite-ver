import * as toxicity from "@tensorflow-models/toxicity";
import nlp from "compromise";
import { badWords } from "./profanity.js";
let timer = 2; // Total time limit in minutes
// let consumed = 0; // Total time spent on all blocked sites in minutes
const blockStartTimes = {}; // Object to store start times for each blocked site

chrome.runtime.sendMessage({ action: "getBlockSites" }, (toBlockSites) => {
  const currentUrl = window.location.href;
  const blockSite = toBlockSites.find((site) => currentUrl.includes(site));

  if (blockSite) {
    console.log(window.location.href);

    window.location.href = "about:blank";

    // Generate a unique identifier for this tab
    const tabId = Date.now().toString();

    // Check if start time is recorded for the site in this tab, if not, record it
    if (!blockStartTimes[blockSite]) {
      blockStartTimes[blockSite] = {};
    }
    if (!blockStartTimes[blockSite][tabId]) {
      blockStartTimes[blockSite][tabId] = new Date().getTime();
    }

    // Check if time limit is exceeded
    setInterval(() => {
      const currentTime = new Date().getTime();
      const timeElapsed =
        (currentTime - blockStartTimes[blockSite][tabId]) / (1000 * 60); // Convert milliseconds to minutes

      let consumed = calculateTotalTime(blockStartTimes); // Recalculate total time spent on all blocked sites
      if (consumed >= timer) {
        window.location.href = "about:blank";
      }
    }, 1000); // Check every second
  }
});
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    consumed = 0;
    console.log("Consumed time reset to 0 at midnight.");
  }
}, 60000);
function calculateTotalTime(blockStartTimes) {
  let total = 0;
  for (const site in blockStartTimes) {
    for (const tabId in blockStartTimes[site]) {
      const startTime = blockStartTimes[site][tabId];
      const currentTime = new Date().getTime();
      total += (currentTime - startTime) / (1000 * 60); // Convert milliseconds to minutes
    }
  }
  return total;
}

const profanityPattern = `(${badWords
  .map((word) => word.replace(/[-/\\^$*+?.()|[\]{}]/gi, "\\$&"))
  .join("|")})`;
let tweets = null;
// The minimum prediction confidence.
const threshold = 0.9;

// const labelsToInclude = ["identity_attack", "insult", "threat", "toxicity"];
// toxicity.load(threshold).then((model) => {
//   chrome.runtime.sendMessage({ action: "getFilterSites" }, (toFilterSites) => {
//     const currentUrl = window.location.href;
//     if (toFilterSites.some((site) => currentUrl.includes(site))) {
//       console.log("true");

//       // If DOMContentLoaded has already occured, execute the logic immediately
//       if (
//         document.readyState === "complete" ||
//         document.readyState === "interactive"
//       ) {
//         const interval = setInterval(() => {
//           if (
//             document.querySelector('[data-testid = "cellInnerDiv"]')
//               ?.parentElement
//           ) {
//             console.log("ready...");
//             clearInterval(interval);
//             processTweets();
//           }
//         }, 100);
//       }
//     }
//   });
//   function processTweets() {
//     console.log("started");
//     let targetNode = document.querySelector(
//       '[data-testid = "cellInnerDiv"]'
//     ).parentElement;

//     //console.log(targetNode);

//     // Options for the observer (which mutations to observe)
//     const config = { attributes: true, childList: true, subtree: true };

//     // Callback function to execute when mutations are observed
//     const callback = (mutationList, observer) => {
//       for (const mutation of mutationList) {
//         if (mutation.type === "childList") {
//           //console.log("A child node has been added or removed.");
//           tweets = document.querySelectorAll('[dir = "auto"]');

//           // console.log(tweets);
//         }
//       }
//       // console.log(tweets);

//       if (tweets && tweets?.length < 100000 && tweets?.length > 0) {
//         observer.disconnect();
//         [...tweets].forEach(async (tweet) => {
//           var xpathExpression = "//*[contains(text(), 'a')]";

//           // Evaluate the XPath expression
//           var xpathresult = document.evaluate(
//             xpathExpression,
//             document,
//             null,
//             XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
//             null
//           );
//           console.log(xpathresult);
//           for (var i = 0; i < xpathresult.snapshotLength; i++) {
//             var matchedElement = xpathresult.snapshotItem(i);
//             // Do something with the selected elements
//             console.log(matchedElement);
//           }

//           const fetchedTweet = nlp(tweet.textContent);
//           const filteredTweet = fetchedTweet
//             .match(profanityPattern)
//             .replace("****");
//           const predictions = await model.classify([tweet.textContent]);
//           const toxicityScores = predictions;

//           console.log("Toxicity Scores:", toxicityScores);

//           const matchedLabels = toxicityScores
//             .filter((score) => score.results[0].match)
//             .map((score) => score.label);

//           if (matchedLabels.length > 0) {
//             // Tweet is toxic
//             console.log("Tweet is toxic:", tweet.innerText);
//             let caption = "";
//             for (const array of filteredTweet.document) {
//               for (const word of array) {
//                 caption += " " + word.text;
//               }
//             }
//             tweet.textContent = caption;
//           } else {
//             // Tweet is not toxic
//             console.log("Tweet is not toxic:", tweet.innerText);
//           }
//         });
//       }
//     };

//     // Create an observer instance linked to the callback function
//     const observer = new MutationObserver(callback);

//     // Start observing the target node for configured mutations
//     observer.observe(targetNode, config);
//   }
// });
