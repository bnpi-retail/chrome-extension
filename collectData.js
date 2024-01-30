function collectData() {
    start_parsing_requests()
    const inputElement = document.querySelector('input[placeholder="Искать на Ozon"].tsBody500Medium');
    const searchQuery = inputElement ? inputElement.value : null;
    const allElements = document.querySelector('div.widget-search-result-container');
    const childElement = allElements.querySelector(':scope > div')
    const elements = Array.from(childElement.querySelectorAll(':scope > div')).slice(0, 10);

    function processElements(elements) {
      const links = [];
      
      elements.forEach(element => {
        const hrefElement = element.querySelector('a');
        if (hrefElement) {
          const href = 'https://www.ozon.ru' + hrefElement.getAttribute('href');
          links.push(href);
        }
      });
      return links;
    }
    localStorage.setItem('active', 0);
    const hrefs = processElements(elements);
    const maxRef = hrefs.length + 1;
    localStorage.setItem('maxRef', maxRef);
    
    chrome.runtime.sendMessage({ action: "openTab", hrefs: hrefs });
    const dataToSend = {
      search: searchQuery,
      elements: []
    };
    const storedDataString = localStorage.getItem('collectedDataArray');
    const storedDataArray = storedDataString ? JSON.parse(storedDataString) : [];
    storedDataArray.push(dataToSend);
    localStorage.setItem('collectedDataArray', JSON.stringify(storedDataArray));
    console.log(storedDataArray);

    function start_parsing_requests() {
      try {
        chrome.storage.local.get('apiToken', async (result) => {
          var apiTokenObject = await chrome.storage.local.get('apiToken');
          var apiToken = apiTokenObject.apiToken;
          console.log(`Апи ключ: ${apiToken}`);
    
          if (apiToken) {
            // const response = await fetch('http://localhost:8000/start_paring', {
            const response = await fetch('https://retail-extension.bnpi.dev/start_parsing', {
              method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${apiToken}`,
                },
              });
              if (response.ok) {
                console.log('Authentication successful', response.status);
              } else if (response.status === 401) {
                console.log('Authentication failed');
              } else {
                console.error('Unexpected response:', response.status);
              }
            } else {
              console.error('API is null');
            }
          });
      } catch (error) {
          console.error('Произошла ошибка:', error);
      }
    }
    
}

const collectDataButton = document.getElementById("collectDataButton");
collectDataButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: collectData,
  });
});