async function collectManyData() {
    var apiToken = localStorage.getItem('apiToken');
  
    try {
      // const response = await fetch('http://localhost:8000/take_requests/', {
      const response = await fetch('https://retail-extension.bnpi.dev/take_requests/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiToken}`,
        },
      });
  
      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        var search = responseData.searches[0];
        var length_query = responseData.length_query;
        if (length_query === 1) {
          alert(`Данные получены: ${search}`);
        } else if (length_query === 0) {
          alert(`Нет доступных запросов!`);
        }
      } else {
        alert(`Ошибка запроса: ${response.status}`);
      }
    } catch (error) {
      alert(`Произошла ошибка: ${error}`);
    }
  
    if (search) {
      const encodedSearch = search.replace(/ /g, '+');
      const url = `https://www.ozon.ru/search/?text=${encodedSearch}&from_global=true`;
  
      const serverQuery = localStorage.getItem('serverQueries');
      const serverQueryList = serverQuery ? JSON.parse(serverQuery) : [];
      serverQueryList.push(search);
      localStorage.setItem('serverQueries', JSON.stringify(serverQueryList));
      console.log(serverQueryList);
      const newTab = window.open(url, '_blank');
    }
    // newTab.focus();
    // await new Promise(resolveTimeout => setTimeout(resolveTimeout, 3000));
    // buttonStartParser.click();
}

const takeRequestsButton = document.getElementById("takeRequestsButton");
takeRequestsButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: collectManyData,
  });
});