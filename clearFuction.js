function clearFunc() {
    var apiToken = localStorage.getItem('apiToken');

    const fetchData = async () => {
        try {
  
          if (apiToken) {
            // const response = await fetch('http://localhost:8000/ads_users/delete', {
            const response = await fetch('http://retail-extension.bnpi.dev/ads_users/delete', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${apiToken}`,
              },
            });
  
            if (response.ok) {
              alert('Данные успешно очищены!')
            } else {
              alert(`Ошибка запроса: ${response.status}`)
            }
          }
        } catch (error) {
          console.error('Произошла ошибка:', error);
        }
      };
  
      fetchData();
}

const clearFuncLink = document.getElementById("clearFuncButton");
clearFuncLink.addEventListener("click", async (event) => {
  event.preventDefault();
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: clearFunc,
  });
});