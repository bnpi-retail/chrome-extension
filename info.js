if (window.location.hostname.includes('ozon')) {

  const info = document.createElement('div');
  info.classList.add('info_extension', 'container');
  document.body.append(info);

  const counterInfo = document.createElement('div');
  counterInfo.id = 'counterInfo';
  info.appendChild(counterInfo);

  // Download CSV
  const buttonCsv = createButton('Скачать csv', 'downloadData', 'info-button');
  buttonCsv.addEventListener('click', downloadCSVFile);
  info.appendChild(buttonCsv);

  // Send to Odoo
  const buttonSendOdoo = createButton('Отправить в odoo', 'sendData', 'info-button');
  buttonSendOdoo.addEventListener('click', sendData);
  info.appendChild(buttonSendOdoo);

  // Clear
  const buttonClear = createButton('Очистить', 'clearData');
  buttonClear.addEventListener('click', clearFunc);
  info.appendChild(buttonClear);
  
  const lineBreak3 = document.createElement('br');
  info.appendChild(lineBreak3);

  // Start Parser
  var buttonStartParser = createButton('Запустить парсер', 'collectData');
  buttonStartParser.addEventListener('click', collectData);
  info.appendChild(buttonStartParser);

  // Start Many Parser
  const buttonStartManyParser = createButton('Получить задачу с сервера', 'collectManyData');
  buttonStartManyParser.addEventListener('click', collectManyData);
  info.appendChild(buttonStartManyParser);

  const buttons = [buttonCsv, buttonSendOdoo, buttonClear, buttonStartParser, buttonStartManyParser];

  let isDragging = false;
  let offsetX, offsetY;
  
  const savedLeft = localStorage.getItem('infoLeft');
  const savedTop = localStorage.getItem('infoTop');
  
  if (savedLeft && savedTop) {
      info.style.left = savedLeft;
      info.style.top = savedTop;
  }
  
  // Обработчики событий для перемещения
  info.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - info.getBoundingClientRect().left;
      offsetY = e.clientY - info.getBoundingClientRect().top;
  });
  
  document.addEventListener('mouseup', () => {
      isDragging = false;
      savePosition();
  });
  
  document.addEventListener('mousemove', (e) => {
      if (isDragging) {
          const x = e.clientX - offsetX;
          const y = e.clientY - offsetY;
  
          info.style.left = `${x}px`;
          info.style.top = `${y}px`;
      }
  });
  
  // Обработчик события для кнопки
  buttons.forEach((button) => {
      button.addEventListener('click', () => {
          updateInfo();
      });
  });
  
  // Функция для сохранения позиции
  function savePosition() {
    localStorage.setItem('infoLeft', info.style.left);
    localStorage.setItem('infoTop', info.style.top);
  }

  // Добавляем кнопки в блок
  buttons.forEach((button) => {
    info.appendChild(button);
  });
  
  // Инициализация начальных значений
  updateInfo();
  setInterval(updateInfo, 1000);
}

async function collectManyData() {
  var apiTokenObject = await chrome.storage.local.get('apiToken');
  var apiToken = apiTokenObject.apiToken;

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

async function sendData() {
  try {
    var apiTokenObject = await chrome.storage.local.get('apiToken');
    var apiToken = apiTokenObject.apiToken;
    
    const storedDataString = localStorage.getItem('collectedDataArray');
    const storedDataArray = JSON.parse(storedDataString) || [];
  
      // const response = await fetch('http://localhost:8000/take_ozon_data/', {
      const response = await fetch('https://retail-extension.bnpi.dev/take_ozon_data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiToken}`,
      },
      body: JSON.stringify(storedDataArray),
    });

    const responseData = await response.text();

    console.log('Код статуса:', response.status);
    if (response.status === 200) {
      alert('Данные успешно отправлены');
      const storedDataArray = [];
      localStorage.setItem('collectedDataArray', JSON.stringify(storedDataArray));
      console.log('Data is cleared!');
      updateInfo();

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

function clearFunc() {
  const storedDataArray = [];
  localStorage.setItem('collectedDataArray', JSON.stringify(storedDataArray));
  console.log('Data is cleared!');
  updateInfo();
}

function collectData() {
  const inputElement = document.querySelector('input[placeholder="Искать на Ozon"].tsBody500Medium');
  const searchQuery = inputElement ? inputElement.value : null;
  const allElements = document.querySelector('div.widget-search-result-container');
  const childElement = allElements.querySelector(':scope > div')
  const elements = Array.from(childElement.querySelectorAll(':scope > div')).slice(0, 10);

  function processElements(elements) {
    const links = [];
    elements.forEach(element => {
      const hrefElement = element.querySelector(':scope > a');
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
}

function createButton(textContent, id) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = textContent;
  button.id = id;
  button.classList.add('info-button');
  return button;
}

function updateInfo() {
  const fetchData = async () => {
    try {
      var apiToken = localStorage.getItem('apiToken');

      if (apiToken) {
        const response = await fetch('https://retail-extension.bnpi.dev/ads_users/statistics', {
        // const response = await fetch('http://localhost:8000/ads_users/statistics', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Token ${apiToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          var requests = data['search'];
          var ads = data['product'];
          const counterInfo = document.getElementById('counterInfo');
          counterInfo.innerText = `Запросы: ${requests}, Товары: ${ads}`;
        } else {
          alert(`Ошибка запроса: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Произошла ошибка:', error);
    }
  };

  fetchData();
}

function downloadCSVFile() {
    function createCSVContent() {
      const storedDataString = localStorage.getItem('collectedDataArray');
      const storedDataArray = JSON.parse(storedDataString) || [];
      const csvContent = storedDataArray.map((item) => {
          const elements = item.elements.map((element) => {
            const name = element.name || '';
            const number = element.number || '';
            const search = element.search || '';
            const seller = element.seller || '';
            const sku = element.sku || '';
            const price = element.price || '';
            const price_without_sale = element.price_without_sale || '';
            const href = element.href || '';
            const price_with_card = element.price_with_card || '';
          return `${number},${search},${seller},${sku},${price},${price_without_sale},${price_with_card},${href},${name}`;
          }).join('\n');
      
          return elements;
      }).join('\n');
      
      return `number,search,seller,sku,price,price_without_sale,price_with_card,href,name\n${csvContent}`;
    }
    
    const csvFileContent = createCSVContent();
    const blob = new Blob([csvFileContent], { type: 'text/csv' });
    
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}