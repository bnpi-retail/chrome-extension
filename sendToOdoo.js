async function sendData() {
  try {
    var apiToken = localStorage.getItem('apiToken');
      // const response = await fetch('http://localhost:8000/take_ozon_data/', {
      const response = await fetch('https://retail-extension.bnpi.dev/take_ozon_data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiToken}`,
      },
    });

    const responseData = await response.text();

    console.log('Код статуса:', response.status);
    if (response.status === 200) {
      console.log('Data is cleared!');

    } else {
      const res = `Произошла ошибка: ${response.status}`;
      alert(res);
    }
    console.log('Текст ответа:', responseData);
  } catch (error) {
    console.error('Ошибка запроса:', error);
    const res = `Произошла ошибка: ${response.status}`;
    alert(res);
  }
}

const sendToOdooButton = document.getElementById("sendToOdooButton");
sendToOdooButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: sendData,
  });
});