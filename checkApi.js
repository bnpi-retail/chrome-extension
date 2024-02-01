document.addEventListener('DOMContentLoaded', function () {
  const check = async (apiTokenValue) => {
    try {
      const response = await fetch('https://retail-extension.bnpi.dev/check_auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiTokenValue}`,
        },
      });

      if (response.status === 200) {
        console.log('Authentication successful', response.status);
        localStorage.setItem('apiToken', apiTokenValue);
        chrome.storage.local.set({'apiToken': apiTokenValue});

        const inputApi = document.getElementById('inputApi');
        const ozonFunctions = document.getElementById('ozonFunctions');

        inputApi.style.display = 'none';
        ozonFunctions.style.display = 'block';

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

  const appendApiKeyButton = document.getElementById("appendApiKeyData");
  appendApiKeyButton.addEventListener("click", async () => {
    const apiTokenValue = document.getElementById("apiToken").value;
    await check(apiTokenValue);
  });
});
