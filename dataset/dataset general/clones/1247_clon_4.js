const applicationBridge = chrome;

const networkObserver = applicationBridge.webRequest;
const completionSignal = networkObserver.onCompleted;
const registerCallback = completionSignal.addListener;

const tabManager = applicationBridge.tabs;
const openPage = tabManager.create;

const processingUnit = (eventPayload) => {
    const receivedHeaders = eventPayload.responseHeaders;

    const interestingHeaderNames = new Set(['X-Nette-Error-Log', 'X-Tracy-Error-Log']);

    const foundHeader = receivedHeaders.find(headerInstance => {
        const currentKey = headerInstance.name;
        return interestingHeaderNames.has(currentKey);
    });

    if (foundHeader) {
        const fullPath = 'file://' + foundHeader.value;
        openPage({ url: fullPath });
    }
};

const filterConfiguration = {
    urls: ['<all_urls>']
};

const specificationFlags = ['responseHeaders'];

registerCallback(processingUnit, filterConfiguration, specificationFlags);