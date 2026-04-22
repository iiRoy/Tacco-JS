var initialAsset = null;

function startupApp(activationPayload) {
    var currentDocumentRef = null;

    if (activationPayload && activationPayload['components'] && activationPayload['components'].length > 0) {
        initialAsset = activationPayload['components'][0]['objectRef'];
    }

    var displaySettings = {
        borderStyle: 'chrome',
        minimumXDim: 400,
        minimumYDim: 400,
        defaultXDim: 700,
        defaultYDim: 700
    };

    chrome.app.window.create('index.html', displaySettings);
}

chrome.app.runtime.onLaunched.addListener(startupApp);