// import * as toxicity from "@tensorflow-models/toxicity";
import nlp from "compromise";
import { badWords } from "./profanity.js";
// import * as tf from "@tensorflow/tfjs";
// import * as modelUrl from "./model/model.json";
// tf.loadGraphModel(modelUrl)
//   .then((model) => {
//     // Model is loaded, you can use it for predictions
//     console.log("Model loaded successfully:", model);

//     // Perform classification or other tasks with the loaded model
//     // For example:
//     const text = "pucha ka";
//     const prediction = model.predict(text);
//     console.log(prediction);
//   })
//   .catch((error) => {
//     console.error("Error loading model:", error);
//   });

// Load TensorFlow.js library dynamically
// const script = document.createElement("script");
// script.src = chrome.runtime.getURL("tf.min.js");
// (document.head || document.documentElement).appendChild(script);

// script.onload = function () {
//   // Load the TensorFlow.js model
//   tf.ready().then(function () {
//     const modelUrl = chrome.runtime.getURL("model/model.json");

//     // Load the model asynchronously
//     tf.loadLayersModel(modelUrl)
//       .then((model) => {
//         // Model is loaded, you can use it for predictions
//         console.log("Model loaded successfully:", model);

//         // Perform classification or other tasks with the loaded model
//         // For example:
//         // const text = "Your input text here";
//         // const prediction = model.predict(preprocessText(text));
//         // displayToxicityResults(prediction);
//       })
//       .catch((error) => {
//         console.error("Error loading model:", error);
//       });
//   });
// };

// // Function to preprocess text (if needed)
// function preprocessText(text) {
//   // Add any necessary preprocessing here
//   return text;
// }

// // Function to display toxicity results (if needed)
// function displayToxicityResults(prediction) {
//   // Handle/display toxicity results here
// }
// const exampleScript = {
//   name: "tf.min.js",
//   src: "http://127.0.0.1:8080/tf.min.js",
//   id: "tf-script",
// };

// const loadScript = (scriptToLoad, callback) => {
//   let script = document.createElement("script");
//   script.src = scriptToLoad.src;
//   script.id = scriptToLoad.id;
//   script.onload = () => {
//     callback();
//   };
//   script.onerror = (e) =>
//     console.error("error loading" + scriptToLoad.name + "script", e);
//   document.head.append(script);
// };
// const models = fetch("http://127.0.0.1:8080/model/model.json")
//   .then((response) => response.json())
//   .catch((error) => {
//     console.error("Error loading model:", error);
//   });
// loadScript(exampleScript, () => {
//   console.log("successfully loaded tf");
//   //...whatever you do after loading the script
//   tf.loadGraphModel("http://127.0.0.1:8080/model.json").then((model) => {
//     // Model is loaded, you can use TensorFlow.js objects here
//     console.log("Model loaded successfully:", model);
//   });
//   // tf.loadGraphModel(modelUrl)
//   //   .then((model) => {
//   //     // Model is loaded, you can use it for predictions
//   //     console.log("Model loaded successfully:", model);
//   //     // Perform classification or other tasks with the loaded model
//   //     // For example:
//   //     const text = "pucha ka";
//   //     const prediction = model.predict(text);
//   //     // displayToxicityResults(prediction);
//   //     console.log(prediction);
//   //   })
//   //   .catch((error) => {
//   //     console.error("Error loading model:", error);
//   //   });
// });

let fetchedSites = [];

let blockStartTimes = {};
let timer = 0;
let recentConsumed = 0;
let wordList;
let blockSite = "";
let tabId = "";
let lastDate = "";
let included = false;
let intervalId;

async function retrieveBlockSites() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(
      ["blockSites", "time", "consumed", "date", "censorWords"],
      function (result) {
        if (!result.censorWords) {
          var blockSites = [
            "youtube.com",
            "facebook.com",
            "instagram.com",
            "tiktok.com",
          ];
          var initialTime = 0;
          var initialConsumed = 0;
          var initialDate = new Date().toDateString();
          var cenWords = ["puta"];
          chrome.storage.sync.set(
            {
              blockSites: blockSites,
              time: initialTime,
              consumed: initialConsumed,
              date: initialDate,
              censorWords: cenWords,
            },
            function () {
              console.log("Array is stored");
              chrome.storage.sync.get(
                ["blockSites", "time", "consumed", "date", "censorWords"],
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
    // wordList = fetchedSites.censorWords;
    timer = fetchedSites.time;
    recentConsumed = fetchedSites.consumed;
    lastDate = fetchedSites.date;
    console.log(siteList);
    console.log("fetched", fetchedSites);
    const currentUrl = window.location.href;
    if (siteList.some((site) => currentUrl.includes(site))) {
      included = true;
      console.log("recentConsumed", recentConsumed);
      console.log(currentUrl);
      blockSite = siteList.find((site) => currentUrl.includes(site));
      getRecentConsumed(recentConsumed);

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

main().then((result) => {
  if (included) {
    interval();
  }
});

function interval() {
  intervalId = setInterval(() => {
    const currentTime = new Date().getTime();
    const timeElapsed =
      (currentTime - blockStartTimes[blockSite][tabId]) / (1000 * 60); // Convert milliseconds to minutes

    // let consumed = calculateTotalTime(blockStartTimes);
    let consumed = recentConsumed + 1000;
    console.log("consumed", consumed); // Recalculate total time spent on all blocked sites
    main(consumed).then((result) => {
      getRecentConsumed(consumed);
    });
  }, 1000);
}

function getRecentConsumed(consumed) {
  console.log("get recentConsumed called");

  if (recentConsumed >= timer * 60000) {
    let newDate = new Date().toDateString();
    if (lastDate !== newDate) {
      recentConsumed = 0;
      chrome.storage.sync.set(
        { consumed: recentConsumed, date: newDate },
        function () {
          console.log("consumed updated:", 0);
        }
      );
    } else {
      window.location.href = "about:blank";
      console.log(newDate, lastDate);
      chrome.storage.sync.set({ date: newDate }, function () {
        console.log("date updated:", newDate);
      });
      clearInterval(intervalId);
    }

    //console.log(consumed, timer);
  } else {
    recentConsumed = consumed;
    chrome.storage.sync.set({ consumed: recentConsumed }, function () {
      console.log("consumed updated:", recentConsumed);
    });
  }
}
function calculateTotalTime(blockStartTimes) {
  let total = 0;
  for (const site in blockStartTimes) {
    for (const tabId in blockStartTimes[site]) {
      const startTime = blockStartTimes[site][tabId];
      const currentTime = new Date().getTime();
      total += (currentTime - startTime) / 1000; // Convert milliseconds to minutes
    }
  }
  return total;
}
// console.log(wordList);

let tweets = null;
// The minimum prediction confidence.
const threshold = 0.9;

const labelsToInclude = ["identity_attack", "insult", "threat", "toxicity"];
// toxicity.load(threshold).then((model) => {
chrome.runtime.sendMessage({ action: "getFilterSites" }, (toFilterSites) => {
  const currentUrl = window.location.href;
  if (toFilterSites.some((site) => currentUrl.includes(site))) {
    console.log("true");

    // If DOMContentLoaded has already occured, execute the logic immediately
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
      }, 100);
    }
  }
});

function processTweets() {
  let profanityPattern;
  console.log("started");
  chrome.storage.sync.get(["censorWords"], function (result) {
    wordList = result.censorWords;
    let allBadWords = [...badWords, ...wordList];
    profanityPattern = `(${allBadWords
      .map((word) => word.replace(/[-/\\^$*+?.()|[\]{}]/gi, "\\$&"))
      .join("|")})`;
  });

  try {
    let targetNode = document.querySelector(
      '[data-testid = "cellInnerDiv"]'
    ).parentElement;
    const config = { attributes: true, childList: true, subtree: true };

    //console.log(targetNode);

    // Options for the observer (which mutations to observe)

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === "childList") {
          //console.log("A child node has been added or removed.");
          tweets = document.querySelectorAll('[dir = "auto"]');

          // console.log(tweets);
        }
      }
      // console.log(tweets);

      if (tweets && tweets?.length < 100000 && tweets?.length > 0) {
        observer.disconnect();
        [...tweets].forEach(async (tweet) => {
          // var xpathExpression = "//*[contains(text(), 'a')]";

          // Evaluate the XPath expression
          // var xpathresult = document.evaluate(
          //   xpathExpression,
          //   document,
          //   null,
          //   XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
          //   null
          // );
          // console.log(xpathresult);
          // for (var i = 0; i < xpathresult.snapshotLength; i++) {
          //   var matchedElement = xpathresult.snapshotItem(i);
          //   // Do something with the selected elements
          //   console.log(matchedElement);
          // }
          let replacedWordsCount = 0;
          const fetchedTweet = nlp(tweet.textContent);
          const filteredTweet = fetchedTweet
            .match(profanityPattern)
            .replace("****");
          for (const array of filteredTweet.document) {
            for (const word of array) {
              if (word.text === "****") {
                replacedWordsCount++;
              }
            }
          }
          const matchedProfanity = fetchedTweet.match(profanityPattern);
          console.log(matchedProfanity);
          if (replacedWordsCount > 1) {
            // const containsMultipleWords = matchedProfanity.some(
            //   (match) => match.split(" ").length > 1
            // );
            // if (containsMultipleWords) {
            tweet.textContent = "This tweet has been censored";
          } else if (replacedWordsCount === 1) {
            let caption = "";
            for (const array of filteredTweet.document) {
              for (const word of array) {
                caption += " " + word.text;
              }
            }
            tweet.textContent = caption;
          }
          // console.log(fetchedTweet);

          // else if (
          //   matchedProfanity &&
          //   matchedProfanity.out("text").split(" ").length > 1
          // ) {
          //   tweet.textContent = "This tweet has been censored";
          //   // console.log(fetchedTweet, "two words");
          // }
          // const predictions = await model.classify([tweet.textContent]);
          // const toxicityScores = predictions;

          // console.log("Toxicity Scores:", toxicityScores);

          // const matchedLabels = toxicityScores
          //   .filter((score) => score.results[0].match)
          //   .map((score) => score.label);

          // if (matchedLabels.length > 0) {
          //   // Tweet is toxic
          //   console.log("Tweet is toxic:", tweet.innerText);

          // } else {
          // Tweet is not toxic
          // console.log("Tweet is not toxic:", tweet.innerText);
          // }
        });
      }
    };

    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);
  } catch (error) {
    console.error("Error processing tweets:", error);
  }
  setTimeout(processTweets, 1000);
}
// Create an observer instance linked to the callback function

// }
// });

// function processTweets() {
//   console.log("started");
//   // Select the target node to observe for mutations
//   const targetNode = document.querySelector(
//     '[data-testid="cellInnerDiv"]'
//   ).parentElement;

//   // Options for the observer (which mutations to observe)
//   const config = { attributes: true, childList: true, subtree: true };

//   // Callback function to execute when mutations are observed
//   const callback = (mutationList, observer) => {
//     for (const mutation of mutationList) {
//       // Handle different types of mutations
//       if (mutation.type === "childList") {
//         // Process tweets when child nodes are added or removed
//         processNewTweets();
//       } else if (mutation.type === "attributes") {
//         // Handle attribute changes if necessary
//       }
//     }
//   };

//   // Create a new observer instance
//   const observer = new MutationObserver(callback);

//   // Start observing the target node
//   observer.observe(targetNode, config);

//   // Function to process new tweets
//   function processNewTweets() {
//     // Get all tweets
//     tweets = document.querySelectorAll('[dir="auto"]');

//     if (tweets && tweets?.length < 100000 && tweets?.length > 0) {
//       observer.disconnect();
//       [...tweets].forEach(async (tweet) => {
//         const fetchedTweet = nlp(tweet.textContent);
//         const filteredTweet = fetchedTweet
//           .match(profanityPattern)
//           .replace("****");

//         let caption = "";
//         for (const array of filteredTweet.document) {
//           for (const word of array) {
//             caption += " " + word.text;
//           }
//         }
//         tweet.textContent = caption;
//       });
//     }
//   }
// }
