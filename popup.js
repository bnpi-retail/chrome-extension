function openWindow() {
  let newWindow = window.open('', 'Добавление API ключа', 'width=600,height=400');
  newWindow.document.close();
  newWindow = window.open('', 'Добавление API ключа', 'width=600,height=400');

  const htmlContent = `
    <html>
    <head>
    <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f5f5f5;
      margin: 20px;
    }
  
    h1 {
      color: #333;
    }
  
    form {
      margin-top: 20px;
    }
  
    label {
      display: block;
      margin-bottom: 5px;
    }
  
    input {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
      box-sizing: border-box;
      border-radius: 5px;
    }
  
    button {
      background-color: #0066CC;
      color: white;
      padding: 10px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  
    button:hover {
      background-color: #005bb5;
    }
  </style>
  
    </head>
    <body>
      <h1>Добро пожаловать!</h1>
      <form id="tokenForm">
        <label for="apiToken">Введите API токен:</label>
        <input type="text" id="apiToken" name="apiToken">
        <br>
        <button type="button" id="saveToken">Сохранить</button>
      </form>
    </body>
    </html>
  `;
  newWindow.document.write(htmlContent);

  newWindow.document.getElementById('saveToken').addEventListener('click', async function() {
    const apiTokenValue = newWindow.document.getElementById('apiToken').value;

    async function checkAuthentication() {
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
          return true;
        } else if (response.status === 401) {
          console.log('Authentication failed');
          return false;
        } else {
          console.error('Unexpected response:', response.status);
          return false;
        }
      } catch (error) {
        console.error('Error during authentication check:', error);
        return false;
      }
    }

    newWindow.document.body.innerHTML = '';
    const isAuthenticated = await checkAuthentication();
    if (isAuthenticated) {
      alert('API токен успешно добавлен!');
      localStorage.setItem('apiToken', apiTokenValue);
      chrome.storage.local.set({'apiToken': apiTokenValue});
      newWindow.close();
      return true
    } else {
      alert('Ошибка аутентификации. Пожалуйста, проверьте введенный API ключ.');
      return false
    }
  });
}

const appendApiKeyButton = document.getElementById("appendApiKeyData");
appendApiKeyButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: openWindow,
  });
});


