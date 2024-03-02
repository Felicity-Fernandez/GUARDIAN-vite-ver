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
  } else if (message.action === "getBlockSites") {
    sendResponse(toBlockSites);
  } else if (message.action === "updateBlockSites") {
    const { site, checked } = message;
    if (checked) {
      if (!toBlockSites.includes(site)) {
        toBlockSites.push(site);
      }
    } else {
      const index = toBlockSites.indexOf(site);
      if (index !== -1) {
        toBlockSites.splice(index, 1);
      }
    }
  }
  console.log("Updated toBlockSites:", toBlockSites);
});
