async function downloadCSVFile() {
  
  var apiTokenObject = await chrome.storage.local.get('apiToken');
  var apiToken = apiTokenObject.apiToken;

  // const response = await fetch('http://localhost:8000/ads_users/download', {
    const response = await fetch('https://retail-extension.bnpi.dev/ads_users/download', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${apiToken}`,
    },
  });

  if (response.ok) {
    const fileData = await response.blob();
    const fileUrl = URL.createObjectURL(fileData);
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = 'output.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    console.error('Failed to download file');
  }
}

const downloadCSVFileButton = document.getElementById("downloadCSVFileButton");
downloadCSVFileButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: downloadCSVFile,
  });
});