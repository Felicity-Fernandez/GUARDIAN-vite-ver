//OLD CHECKBOX
//let blockSites = [];

//chrome.runtime.sendMessage({ action: "getBlockSites" }, (toBlockSites) => {
//  blockSites = toBlockSites;
//  console.log(blockSites);

//  for (const site of blockSites) {
//    console.log(site);
//    document.getElementById(
//      "list"
//    ).innerHTML += `<li id="item-${site}"><input type="checkbox" checked>${site}</li>`;
//  }
//   setInterval(() => {
// Iterate through each checkbox
//  blockSites.forEach((siteName) => {
//    const checkbox = document.getElementById(`item-${siteName}`).firstChild;
//    if (checkbox) {
//      console.log(checkbox);
//      checkbox.addEventListener("change", (e) => {
//        const isChecked = e.target.checked;
//        console.log(e.target.checked);
//        chrome.runtime.sendMessage({
//          action: "updateBlockSites",
//          site: siteName,
//          checked: isChecked,
//        });
//      });
//    }
//  });
// console.log("Checking...");
//   }, 1000);
//});

//NEW CHECKBOX
let blockSites = [];

chrome.storage.sync.get(["blockSites"], function (result) {
  blockSites = result.blockSites;
  console.log(blockSites);

  for (const site of blockSites) {
    console.log(site);
    document.getElementById(
      "list"
    ).innerHTML += `<li id="item-${site}"><label class="checkbox-label">${site}<input type="checkbox" checked><span class="checkmark"></span></label></li>`;
  }

  // Iterate through each checkbox
  blockSites.forEach((siteName) => {
    const checkbox = document
      .getElementById(`item-${siteName}`)
      .querySelector('input[type="checkbox"]');
    if (checkbox) {
      console.log(checkbox);
      checkbox.addEventListener("change", (e) => {
        const isChecked = e.target.checked;
        const site = siteName;
        console.log(e.target.checked);

        if (isChecked) {
          // If checkbox is checked, add the site to the blockSites array
          if (!blockSites.includes(site)) {
            blockSites.push(site);
          }
        } else {
          // If checkbox is unchecked, remove the site from the blockSites array
          const index = blockSites.indexOf(site);
          if (index !== -1) {
            blockSites.splice(index, 1);
          }
        }

        // Update the blockSites array in Chrome storage
        chrome.storage.sync.set({ blockSites: blockSites }, function () {
          console.log("blockSites updated:", blockSites);
        });
      });
    }
  });
});
