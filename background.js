chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "openTab") {
    openTabsSequentially(request.hrefs);
  }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'scrapeDataResult') {
        console.log('Received scrapeData result:', message.data);
        chrome.extension.getViews({ type: "popup" }).forEach(function(popup) {
            popup.handleScrapeDataResult(message.data);
        });
    }
});

function openTabsSequentially(hrefs) {
  async function openNextTab(index) {
      if (index < hrefs.length) {
          return new Promise(resolve => {
              chrome.tabs.create({ url: hrefs[index], active: false }, function(tab) {
                  chrome.tabs.onUpdated.addListener(async function listener(tabId, changeInfo) {
                      if (tabId === tab.id && changeInfo.status === "complete") {
                        chrome.tabs.onUpdated.removeListener(listener);
                        chrome.tabs.update(tab.id, { active: true });
                        await new Promise(resolveTimeout => setTimeout(resolveTimeout, 4000));
                        chrome.tabs.remove(tab.id);
                        resolve();
                      }
                  });
              });
          }).then(() => openNextTab(index + 1));
      }
  }
  openNextTab(0);
}
