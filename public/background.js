let toFilterSites = ["twitter.com"];
let toBlockSites = [
  "youtube.com",
  "facebook.com",
  "instagram.com",
  "tiktok.com",
];
// const res = "Text changed by extension!";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getFilterSites") {
    sendResponse(toFilterSites);
  } else if (message.action === "getBlockSites") {
    sendResponse(toBlockSites);
  }
});
