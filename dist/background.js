let toFilterSites = ["twitter.com"];
const res = "Text changed by extension!";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getFilterSites") {
    sendResponse(toFilterSites);
  }
});
