//NEW CHECKBOX
document.addEventListener("DOMContentLoaded", function () {
  // async function retrieveBlockSites() {
  //   return new Promise((resolve, reject) => {
  //     chrome.storage.sync.get(["cenWords"], function (result) {
  //       if (!result.censorWords) {
  //         var censorWords = [];
  //         chrome.storage.sync.set(
  //           {
  //             censorWords: censorWords,
  //           },
  //           function () {
  //             console.log("Array is stored");
  //             chrome.storage.sync.get(["cenWords"], function (result) {
  //               console.log("Array is stored", result);
  //             });
  //             resolve(result);
  //           }
  //         );
  //       }
  //     });
  //   });
  // }
  let date = new Date();

  const tabs = document.querySelectorAll(".tab");
  const contentItems = document.querySelectorAll(".content-item");

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      // Remove 'active' class from all tabs and content items
      tabs.forEach((t) => t.classList.remove("active"));
      contentItems.forEach((c) => c.classList.remove("fade-in"));

      // Add 'active' class to the clicked tab
      tab.classList.add("active");

      // Show the corresponding content item and add fade-in animation
      contentItems[index].classList.add("fade-in");
    });
  });
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
  let timer = 0;
  let censorWords = [];
  chrome.storage.sync.get(["time", "censorWords"], function (result) {
    timer = result.time;
    censorWords = result.censorWords;
    console.log(timer);
    document.getElementById("currentLimit").textContent = timer;
  });

  var addBtn = document.getElementById("addBtn");
  addBtn.addEventListener("click", function () {
    const site = document.getElementById("newSite").value;
    if (site) {
      if (blockSites.includes(site)) {
        return;
      }
      blockSites.push(site);
      chrome.storage.sync.set({ blockSites: blockSites }, function () {
        console.log("blockSites updated:", blockSites);
      });
      document.getElementById(
        "list"
      ).innerHTML += `<li id="item-${site}"><label class="checkbox-label">${site}<input type="checkbox" checked><span class="checkmark"></span></label></li>`;
      document.getElementById("newSite").value = "";
    }
  });

  var setBtn = document.getElementById("setBtn");
  setBtn.addEventListener("click", function () {
    const time = document.getElementById("limit").value;
    if (time) {
      chrome.storage.sync.set({ time: parseInt(time) }, function () {
        console.log("time updated:", parseInt(time));
      });
      document.getElementById("currentLimit").textContent = time;
      document.getElementById("limit").value = "";
    }
  });

  var addWrd = document.getElementById("addWrd");
  addWrd.addEventListener("click", function () {
    const word = document.getElementById("newWord").value;
    if (word) {
      if (censorWords.includes(word)) {
        return;
      }
      censorWords.push(word);
      chrome.storage.sync.set({ censorWords: censorWords }, function () {
        console.log("censorWords updated:", censorWords);
      });
      document.getElementById("newWord").value = "";
    }
  });
});
