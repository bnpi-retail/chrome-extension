chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const currentUrl = tabs[0].url;
    const expectedDomain = 'ozon.ru';
    const parametr = 'text=';    
    const collectDataButton = document.getElementById('collectDataButton');
    const errorMessage = document.getElementById('errorMessage');
    const body = document.body;
    
    if (!currentUrl.includes(expectedDomain) || !currentUrl.includes(parametr)) {
        collectDataButton.style.display = 'none';
        body.classList.add('disabled-body');
    } else {
        errorMessage.style.display = 'none';
        body.classList.remove('disabled-body');
        collectDataButton.style.display = 'block';
    }
});