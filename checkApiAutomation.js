function checkApiAuto() {
  const inputApi = document.getElementById('inputApi');
  inputApi.style.display = 'none';

  const ozonFunctions = document.getElementById('ozonFunctions');
  ozonFunctions.style.display = 'none';
  
  const body = document.body;

  try {
    chrome.storage.local.get('apiToken', async (result) => {
      var apiTokenObject = await chrome.storage.local.get('apiToken');
      var apiToken = apiTokenObject.apiToken;
      console.log(`Апи ключ: ${apiToken}`);

      if (apiToken) {
        // const response = await fetch('http://localhost:8000/ads_users/statistics', {
        const response = await fetch('https://retail-extension.bnpi.dev/ads_users/statistics', {
          method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${apiToken}`,
            },
          });
          if (response.ok) {
            console.log('Authentication successful', response.status);
            inputApi.style.display = 'none';
            ozonFunctions.style.display = 'block';

          } else if (response.status === 401) {
            console.log('Authentication failed');
            ozonFunctions.style.display = 'none';
            inputApi.style.display = 'block';
            body.classList.add('check-api');

          } else {
            console.error('Unexpected response:', response.status);
            ozonFunctions.style.display = 'none';
            inputApi.style.display = 'block';
            body.classList.add('check-api');
          }

        } else {
          console.error('API is null');
          ozonFunctions.style.display = 'none';
          inputApi.style.display = 'block';
          body.classList.add('check-api');
        }
      });
  } catch (error) {
      console.error('Произошла ошибка:', error);
      ozonFunctions.style.display = 'none';
      inputApi.style.display = 'block';
      body.classList.add('check-api');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  checkApiAuto();
  setInterval(checkApiAuto, 100000);
});