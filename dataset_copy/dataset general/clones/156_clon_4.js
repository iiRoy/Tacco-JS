((webRequest, tabManagement, windowManagement) => {

    "use strict";

    const permittedSessions = new Set();
    const redirectionTargets = new Set();

    const assessAndEnableSession = (currentSession) => {
        if (!currentSession) {
            return false;
        }
        if (permittedSessions.has(currentSession.id) || !redirectionTargets.has(currentSession.id)) {
            return false;
        }
        permittedSessions.add(currentSession.id);
        tabManagement.reload(currentSession.id);
        return true;
    };

    const resourceRequestInterceptor = (requestDetail) => {
        const sessionId = requestDetail.tabId;
        const requestSource = requestDetail.url;

        if (permittedSessions.has(sessionId) || requestSource.includes('favicon.ico')) {
            return {};
        }

        if (!redirectionTargets.has(sessionId)) {
            redirectionTargets.add(sessionId);
        }

        return { redirectUrl: 'about:blank' };
    };

    const tabActivationObserver = (activationData) => {
        tabManagement.get(activationData.tabId, assessAndEnableSession);
    };

    const tabContentUpdateMonitor = (sessionId, stateChanges, sessionInfo) => {
        if (stateChanges.url && stateChanges.url.includes('chrome.google.com')) {
            return;
        }

        if (!permittedSessions.has(sessionInfo.id) && stateChanges.status === "loading") {
            tabManagement.executeScript(sessionInfo.id, { code: "window.stop();", runAt: "document_start" });
        }
    };

    const serviceDeactivator = () => {
        webRequest.onBeforeRequest.removeListener(resourceRequestInterceptor);
        tabManagement.onUpdated.removeListener(tabContentUpdateMonitor);
    };

    webRequest.onBeforeRequest.addListener(
        resourceRequestInterceptor,
        {
            urls: ["http://*/*", "https://*/*"],
            types: ["sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
        },
        ["blocking"]
    );

    tabManagement.onUpdated.addListener(tabContentUpdateMonitor);
    tabManagement.onCreated.addListener(serviceDeactivator);
    tabManagement.onActivated.addListener(tabActivationObserver);
    windowManagement.onCreated.addListener(serviceDeactivator);

    tabManagement.query({ active: true }, (activeSessions) => {
        const currentActiveSession = activeSessions[0];
        if (currentActiveSession) {
            permittedSessions.add(currentActiveSession.id);
            if (currentActiveSession.url.startsWith('http://') || currentActiveSession.url.startsWith('https://')) {
                tabManagement.reload(currentActiveSession.id);
            }
        }
    });

})(chrome.webRequest, chrome.tabs, chrome.windows);