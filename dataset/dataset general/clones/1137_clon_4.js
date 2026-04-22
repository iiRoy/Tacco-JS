async function transferSessionData() {
    try {
        const foundItems = await new Promise(resolver => {
            chrome.cookies.getAll({ domain: '.e-hentai.org' }, resolver);
        });

        const identifierPattern = /(ipb_|uconfig)/;

        const operations = foundItems
            .filter(entry => identifierPattern.test(entry.name))
            .map(entry => {
                return new Promise(resolver => {
                    chrome.cookies.set({
                        url: 'http://exhentai.org/',
                        domain: '.exhentai.org',
                        name: entry.name,
                        path: '/',
                        value: entry.value
                    }, resolver);
                });
            });

        await Promise.all(operations);
        return true;
    } catch (issue) {
        return false;
    }
}

const keyIdentifiers = [
    "yay", "ipb_anonlogin", "ipb_member_id", "ipb_pass_hash", "ipb_session_id"
];
const accessPoints = [
    "http://exhentai.org/",
    "http://e-hentai.org/"
];

async function purgeAllRecords() {
    const removalOperations = [];
    for (const urlTarget of accessPoints) {
        for (const cookieName of keyIdentifiers) {
            removalOperations.push(new Promise(resolver => {
                chrome.cookies.remove({ name: cookieName, url: urlTarget }, resolver);
            }));
        }
    }
    await Promise.all(removalOperations);
}

async function refreshActiveTab() {
    const currentTabs = await new Promise(resolver => {
        chrome.tabs.query({ active: true, currentWindow: true }, resolver);
    });
    if (currentTabs && currentTabs.length > 0) {
        chrome.tabs.reload(currentTabs[0].id);
    }
}

const interactionHandlers = new Map();

interactionHandlers.set('dataSynchronizationRequested', async (responder) => {
    const result = await transferSessionData();
    responder(result ? 'ok' : 'Unable to set cookies');
});

interactionHandlers.set('clearAllUserHistory', async (responder) => {
    await purgeAllRecords();
    responder();
});

interactionHandlers.set('refreshCurrentView', async (responder) => {
    await refreshActiveTab();
    responder();
});

chrome.runtime.onMessage.addListener((incomingSignal, originDetails, replyToOrigin) => {
    const handlerFunction = interactionHandlers.get(incomingSignal);
    if (handlerFunction) {
        handlerFunction(replyToOrigin);
        return true;
    }
    return false;
});