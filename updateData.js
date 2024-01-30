function updatePopupInfo() {
    try {
        chrome.storage.local.get('apiToken', async (result) => {
            var apiToken = result.apiToken;

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
                    const data = await response.json();
                    var requests = data['search'];
                    var ads = data['product'];
                    const sessionHeader = document.getElementById('sessionHeader');
                    const counterInfo = document.getElementById('counterInfo');
                    const downloadCSVFileButton = document.getElementById('downloadCSVFileButton');
                    const sendToOdooButton = document.getElementById('sendToOdooButton');
                    const clearFuncButton = document.getElementById('clearFuncButton');

                    console.log(`requests: ${requests}, ads: ${ads}`);

                    if (requests === 0 && ads === 0) {
                        sessionHeader.style.display = 'none';
                        counterInfo.style.display = 'none';
                        downloadCSVFileButton.style.display = 'none';
                        sendToOdooButton.style.display = 'none';
                        clearFuncButton.style.display = 'none';
                        
                    } else {
                        sessionHeader.style.display = 'block';
                        counterInfo.innerText = `Загружено ${ads} товаров по ${requests} запросам`;
                        counterInfo.style.display = 'block';
                        downloadCSVFileButton.style.display = 'block';
                        sendToOdooButton.style.display = 'block';
                        clearFuncButton.style.display = 'block';
                    }
                } else {
                    console.log(`Ошибка запроса: ${response.status}`);
                    // alert(`Ошибка запроса: ${response.status}`);
                }
            }
        });
    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    updatePopupInfo();
    setInterval(updatePopupInfo, 1000);
});