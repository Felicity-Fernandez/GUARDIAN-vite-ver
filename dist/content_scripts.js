import * as toxicity from "@tensorflow-models/toxicity";
import nlp from "compromise";
import { badWords } from "./profanity.js";

let fetchedSites = [];
let blockStartTimes = {};
let timer = 0;
let recentConsumed = 0;
let blockSite = "";
let tabId = "";
async function retrieveBlockSites() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(
      ["blockSites", "time", "consumed"],
      function (result) {
        if (!result.blockSites) {
          var blockSites = [
            "youtube.com",
            "facebook.com",
            "instagram.com",
            "tiktok.com",
          ];
          var initialTime = 0;
          var initialConsumed = 0;
          chrome.storage.sync.set(
            {
              blockSites: blockSites,
              time: initialTime,
              consumed: initialConsumed,
            },
            function () {
              console.log("Array is stored");
              chrome.storage.sync.get(
                ["blockSites", "time", "consumed"],
                function (result) {
                  console.log("Array is stored", result);
                }
              );
              resolve(result);
            }
          );
        } else {
          console.log("Array already exists:", result);
          resolve(result);
        }
      }
    );
  });
}

async function main() {
  try {
    fetchedSites = await retrieveBlockSites();
    let siteList = fetchedSites.blockSites;
    timer = fetchedSites.time;
    recentConsumed = fetchedSites.consumed;
    console.log(siteList);
    console.log("fetched", fetchedSites);
    const currentUrl = window.location.href;
    if (siteList.some((site) => currentUrl.includes(site))) {
      console.log(currentUrl);
      blockSite = siteList.find((site) => currentUrl.includes(site));
      // getRecentConsumed();

      // Generate a unique identifier for this tab
      tabId = Date.now().toString();

      // Check if start time is recorded for the site in this tab, if not, record it
      if (!blockStartTimes[blockSite]) {
        blockStartTimes[blockSite] = {};
      }
      if (!blockStartTimes[blockSite][tabId]) {
        blockStartTimes[blockSite][tabId] = new Date().getTime();
      }
    } else {
      console.log("not included");
    }
    // Do something with fetchedSites here
  } catch (error) {
    console.error("Error retrieving block sites:", error);
  }
}

main();

setInterval(() => {
  const currentTime = new Date().getTime();
  const timeElapsed =
    (currentTime - blockStartTimes[blockSite][tabId]) / (1000 * 60); // Convert milliseconds to minutes

  let consumed = calculateTotalTime(blockStartTimes); // Recalculate total time spent on all blocked sites
  main().then((result) => {
    // getRecentConsumed(consumed);

    if (consumed + recentConsumed >= timer) {
      window.location.href = "about:blank";
      console.log(consumed, timer);
    }
    recentConsumed = recentConsumed + consumed;
    chrome.storage.sync.set({ consumed: recentConsumed }, function () {
      console.log("consumed updated:", recentConsumed);
    });
  });
}, 1000); // Check every second

function getRecentConsumed(consumed) {
  if (recentConsumed) {
    // console.log(recentConsumed);
    if (recentConsumed >= timer) {
      window.location.href = "about:blank";
      //console.log(consumed, timer);
    } else {
      recentConsumed = recentConsumed + consumed;
      chrome.storage.sync.set({ consumed: recentConsumed }, function () {
        console.log("consumed updated:", recentConsumed);
      });
    }
  } else {
    // localStorage.setItem("consumed", consumed ?? 0);
  }
}
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
