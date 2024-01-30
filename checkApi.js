document.addEventListener('DOMContentLoaded', function () {
  const appendApiKeyButton = document.getElementById("appendApiKeyData");

  console.log(appendApiKeyButton);

  const check = async (apiTokenValue) => {
    try {
      // const response = await fetch('http://localhost:8000/check_auth/', {
      const response = await fetch('https://retail-extension.bnpi.dev/check_auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiTokenValue}`,
        },
      });

      if (response.status === 200) {
        console.log('Authentication successful', response.status);
        alert('API токен успешно добавлен!');
        localStorage.setItem('apiToken', apiTokenValue);
        chrome.storage.local.set({'apiToken': apiTokenValue});
        return true;
        
      } else if (response.status === 401) {
        console.log('Authentication failed');
        alert('Authentication failed');
        return false;

      } else {
        console.error('Unexpected response:', response.status);
        alert('Unexpected response:', response.status);

        return false;
      }
    } catch (error) {
      console.error('Error during authentication check:', error);
      alert(`Error during authentication check: ${error}`);
      return false;
    }
  };

  appendApiKeyButton.addEventListener("click", async () => {
    const apiTokenValue = document.getElementById("apiToken").value;

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: check,
      args: [apiTokenValue],
    });
  });
});
