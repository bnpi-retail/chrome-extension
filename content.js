const dataAd = {
    number: null,
    search: null,
    href: null,
    seller: null,
    sku: null,
    price_with_card: null,
    price: null,
    price_without_sale: null,
    name: null,
    pictures: null,
};

let active = parseInt(localStorage.getItem('active'), 10) || 0;
active += 1;
localStorage.setItem('active', active);
active_progress = active * 10
localStorage.setItem('progress', active_progress.toString());
chrome.storage.local.set({ 'progress': active_progress })


async function waitForElementByXPath(xPathList, maxAttempts = 10, interval = 100) {

    for (const xPath of xPathList) {
        var attempts = 0;

        const result = document.evaluate(
            xPath,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        );

        const element = result.singleNodeValue;

        if (element) {
            console.log(`Found element with XPath '${xPath}'.`);
            return element;
        }

        attempts++;

        if (attempts >= maxAttempts) {
            console.log(`Maximum attempts reached. Element not found with any XPath.`);
        }
    
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    return null;
}

async function main() {
    dataAd.number = active

    var href = window.location.href
    dataAd['href'] = href
    console.log(href);

    var sku = href.split('?')[0].split('/').slice(-2, -1)[0].split('-').pop();
    dataAd['sku'] = sku
    console.log(sku);

    var search = decodeURIComponent(href.split('keywords=')[1].replace(/\+/g, " ")).split('&')[0];
    dataAd['search'] = search.replace(/,/g, '')
    console.log(search);

    const nameElement = await waitForElementByXPath([
        "/html/body/div[1]/div/div[1]/div[4]/div[2]/div/div/div[1]/div/h1",
    ]);
    if (nameElement) {
        const nameText = nameElement.textContent
        if (nameText) {
            dataAd['name'] = nameText.trim().replace(/,/g, '');
        }
    }
    const elementPriceWithCard = await waitForElementByXPath([
        "/html/body/div[1]/div/div[1]/div[4]/div[3]/div[2]/div[2]/div[2]/div/div[1]/div/div/div[1]/div[1]/button/span/div/div[1]/div/div/span",
        "/html/body/div[1]/div/div[1]/div[4]/div[3]/div[2]/div[2]/div/div/div[1]/div/div/div[1]/div[1]/button/span/div/div[1]/div/div/span",
    ]);
    if (elementPriceWithCard) {
        const priceWithCardText = elementPriceWithCard.textContent
        if (priceWithCardText) {
            dataAd['price_with_card'] = priceWithCardText.replace(/\s/g, '').replace(/,/g, '').replace('₽', '').trim();
        }
    }
    const elementPrice = await waitForElementByXPath([
        "/html/body/div[1]/div/div[1]/div[4]/div[3]/div[2]/div[2]/div[2]/div/div[1]/div/div/div[1]/div[2]/div/div[1]/span[1]",
        "/html/body/div[1]/div/div[1]/div[4]/div[3]/div[2]/div[2]/div/div/div[1]/div/div/div[1]/div/div/div[1]/span[1]",
    ]);
    if (elementPrice) {
        const priceText = elementPrice.textContent
        if (priceText) {
            dataAd['price'] = priceText.replace(/\s/g, '').replace(/\s/g, '').replace(/,/g, '').replace('₽', '').trim();
        }
    }
    const elementPriceWithoutSale = await waitForElementByXPath([
        "/html/body/div[1]/div/div[1]/div[4]/div[3]/div[2]/div[2]/div[2]/div/div[1]/div/div/div[1]/div[2]/div/div[1]/span[2]",
        "/html/body/div[1]/div/div[1]/div[4]/div[3]/div[2]/div[2]/div/div/div[1]/div/div/div[1]/div/div/div[1]/span[2]",
        "/html/body/div[1]/div/div[1]/div[4]/div[3]/div[2]/div[2]/div/div/div[1]/div/div/div[1]/div[1]/button/span/div/div[1]/div/div/span",
    ]);
    if (elementPriceWithoutSale) {
        const priceWithoutSaleText = elementPriceWithoutSale.textContent
        if (priceWithoutSaleText) {
            dataAd['price_without_sale'] = priceWithoutSaleText.replace(/\s/g, '').replace('₽', '').replace(/,/g, '').trim();
        }
    }
    const elementPictures = await waitForElementByXPath([
        "/html/body/div[1]/div/div[1]/div[4]/div[3]/div[1]/div[1]/div[1]/div/div[2]/div/div/div/div/div[1]/div/img",
        "/html/body/div[1]/div/div[1]/div[4]/div[3]/div[1]/div[1]/div[1]/div/div[2]/div/div/div/div[2]/div[1]/div/div[2]/video-player//div/div/div[1]/video",
    ]);
    if (elementPictures) {
        const imageUrl = elementPictures.src;
        if (imageUrl) {
            dataAd['pictures'] = imageUrl;
        }
    }

    for (;;) {
        const elementSeller = await waitForElementByXPath([
            "/html/body/div[1]/div/div[1]/div[6]/div/div[1]/div[2]/div/div/div/div[1]/div/div/div[2]/div[1]/div/a",
            "/html/body/div[1]/div/div[1]/div[6]/div/div[1]/div[2]/div/div/div/div[1]/div/div/div/div[1]/div[2]/a",
        ]);
        try {
            const textSeller = elementSeller.textContent
            if (textSeller === null) {
                continue
            }
            else if (textSeller) {
                dataAd['seller'] = textSeller.replace(/,/g, '');
                break
            }
        } catch (error) {
            continue
        }
    } 

    const storedDataString = localStorage.getItem('collectedDataArray');
    let storedData;

    try {
        storedData = JSON.parse(storedDataString) || [];
    } catch (error) {
        console.error('Ошибка при преобразовании строки в массив объектов:', error);
    }

    let lastData = storedData[storedData.length - 1];
    lastData.elements.push(dataAd);
    console.log('Final data:', dataAd);
    console.log('Last data:', lastData);
    localStorage.setItem('collectedDataArray', JSON.stringify(storedData));
    localStorage.setItem('pageClose', 1);

    var apiToken = localStorage.getItem('apiToken');
    try {
    //   const response = await fetch('http://localhost:8000/ads_users/', {
      const response = await fetch('https://retail-extension.bnpi.dev/ads_users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${apiToken}`,
        },
        body: JSON.stringify(dataAd),
      });

      if (response.ok) {
        // alert('Данные успешно собраны!');
      } else {
        alert(`Ошибка запроса: ${response.status}`);
      }
    } catch (error) {
      alert(`Произошла ошибка: ${error}`);
    }

    if (active === lastNumber) {
        const openWindow = localStorage.getItem('openWindow');
        const apiToken = localStorage.getItem('apiToken');
        window.open(`https://retail-react.bnpi.dev/contact?apiToken=${apiToken}`, 'Проверка собранных товаров', 'width=600,height=400');
        // window.open(`http://localhost:3000/contact?apiToken=${apiToken}`, 'Проверка собранных товаров', 'width=600,height=400');
        localStorage.setItem('openWindow', '0');
    }
}

let max = parseInt(localStorage.getItem('maxRef'), 10);
var lastNumber = max - 1 

const currentUrl = window.location.href;
const expectedDomain = 'ozon.ru/product';

if (currentUrl.includes(expectedDomain)) {
    // if (active < max) {
        localStorage.setItem('openWindow', '1');
        main();
    // } 
}