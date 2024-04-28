let toFilterSites = ["twitter.com"];
// const res = "Text changed by extension!";
let toBlockSites = [
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getFilterSites") {
    sendResponse(toFilterSites);
  }
});
//   } else if (message.action === "getBlockSites") {
//     sendResponse(toBlockSites);
//   } else if (message.action === "updateBlockSites") {
//     const { site, checked } = message;
//     if (checked) {
//       if (!toBlockSites.includes(site)) {
//         toBlockSites.push(site);
//       }
//     } else {
//       const index = toBlockSites.indexOf(site);
//       if (index !== -1) {
//         toBlockSites.splice(index, 1);
//       }
//     }
//   }
//   console.log("Updated toBlockSites:", toBlockSites);
// });

// Background Script

// Event listener for when a new tab is created
// chrome.tabs.onCreated.addListener(function (tab) {
//   // Send a message to the content script to clear the interval
//   chrome.tabs.sendMessage(tab.id, { action: "clearInterval" });
// });

// // Event listener for when a tab is switched to
// chrome.tabs.onActivated.addListener(function (activeInfo) {
//   // Send a message to the content script to clear the interval
//   chrome.tabs.sendMessage(activeInfo.tabId, { action: "clearInterval" });
// });

// Background Script
// let activeTabUrl;
// // Get details of the currently active tab
// chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//   // tabs[0] contains details about the active tab
//   if (tabs[0]) {
//     activeTabUrl = tabs[0].url;
//     console.log("Currently active tab URL:", activeTabUrl);
//   }
// });

// let fetchedSites = [];
// let blockStartTimes = {};
// let timer = 0;
// let recentConsumed = 0;
// let blockSite = "";
// let tabId = "";
// let lastDate = "";
// let included = false;
// let intervalId;
// async function retrieveBlockSites() {
//   return new Promise((resolve, reject) => {
//     chrome.storage.sync.get(
//       ["blockSites", "time", "consumed", "date"],
//       function (result) {
//         if (!result.blockSites) {
//           var blockSites = [
//             "youtube.com",
//             "facebook.com",
//             "instagram.com",
//             "tiktok.com",
//           ];
//           var initialTime = 0;
//           var initialConsumed = 0;
//           var initialDate = new Date().toDateString();
//           chrome.storage.sync.set(
//             {
//               blockSites: blockSites,
//               time: initialTime,
//               consumed: initialConsumed,
//               date: initialDate,
//             },
//             function () {
//               console.log("Array is stored");
//               chrome.storage.sync.get(
//                 ["blockSites", "time", "consumed"],
//                 function (result) {
//                   console.log("Array is stored", result);
//                 }
//               );
//               resolve(result);
//             }
//           );
//         } else {
//           console.log("Array already exists:", result);
//           resolve(result);
//         }
//       }
//     );
//   });
// }

// async function main() {
//   try {
//     fetchedSites = await retrieveBlockSites();
//     let siteList = fetchedSites.blockSites;
//     timer = fetchedSites.time;
//     recentConsumed = fetchedSites.consumed;
//     lastDate = fetchedSites.date;
//     console.log(siteList);
//     console.log("fetched", fetchedSites);
//     // const currentUrl = window.location.href;
//     if (siteList.some((site) => activeTabUrl.includes(site))) {
//       included = true;
//       console.log(activeTabUrl);
//       blockSite = siteList.find((site) => activeTabUrl.includes(site));
//       getRecentConsumed(null);

//       // Generate a unique identifier for this tab
//       tabId = Date.now().toString();

//       // Check if start time is recorded for the site in this tab, if not, record it
//       if (!blockStartTimes[blockSite]) {
//         blockStartTimes[blockSite] = {};
//       }
//       if (!blockStartTimes[blockSite][tabId]) {
//         blockStartTimes[blockSite][tabId] = new Date().getTime();
//       }
//     } else {
//       console.log("not included");
//     }
//     // Do something with fetchedSites here
//   } catch (error) {
//     console.error("Error retrieving block sites:", error);
//   }
// }

// main().then((result) => {
//   if (included) {
//     interval();
//   }
// });

// function interval() {
//   intervalId = setInterval(() => {
//     const currentTime = new Date().getTime();
//     const timeElapsed =
//       (currentTime - blockStartTimes[blockSite][tabId]) / (1000 * 60); // Convert milliseconds to minutes

//     let consumed = calculateTotalTime(blockStartTimes);
//     console.log("consumed", consumed); // Recalculate total time spent on all blocked sites
//     main().then((result) => {
//       getRecentConsumed(consumed);
//     });
//   }, 1000);
// }

// function stopInterval() {
//   clearInterval(intervalId);
// }

// function getRecentConsumed(consumed) {
//   console.log("get recentConsumed called");

//   if (recentConsumed >= timer * 60 * 1000) {
//     let newDate = new Date().toDateString();
//     if (lastDate !== newDate) {
//       recentConsumed = 0;
//       chrome.storage.sync.set(
//         { consumed: recentConsumed, date: newDate },
//         function () {
//           console.log("consumed updated:", 0);
//         }
//       );
//     } else {
//       // window.location.href = "about:blank";
//       // Background Script

//       // Get details of the currently active tab
//       chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
//         // tabs[0] contains details about the active tab
//         if (tabs[0]) {
//           // Update the URL of the active tab to "about:blank"
//           chrome.tabs.update(tabs[0].id, { url: "about:blank" });
//         }
//       });
//       clearInterval(intervalId);
//       chrome.storage.sync.set({ date: newDate }, function () {
//         console.log("date updated:", newDate);
//       });
//     }

//     //console.log(consumed, timer);
//   } else {
//     recentConsumed = recentConsumed + consumed;
//     chrome.storage.sync.set({ consumed: recentConsumed }, function () {
//       console.log("consumed updated:", recentConsumed);
//     });
//   }
// }
// function calculateTotalTime(blockStartTimes) {
//   let total = 0;
//   for (const site in blockStartTimes) {
//     for (const tabId in blockStartTimes[site]) {
//       const startTime = blockStartTimes[site][tabId];
//       const currentTime = new Date().getTime();
//       total += (currentTime - startTime) / 1000; // Convert milliseconds to minutes
//     }
//   }
//   return total;
// }
