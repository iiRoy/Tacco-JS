class MediaAcquisitionAgent {
    constructor() {
        this.listenerOperational = false;
        this.interceptionRoutine = this.interceptionRoutine.bind(this);
        this.startEngine();
    }

    processResourceAcquisition(sourceIdentifier, targetTabId) {
        if (this.listenerOperational) {
            chrome.webRequest.onBeforeRequest.removeListener(this.interceptionRoutine);
            this.listenerOperational = false;
        }

        chrome.tabs.sendMessage(targetTabId, {
            requestType: "obtainAsset",
            assetUrl: sourceIdentifier
        });

        setTimeout(() => {
            this.activateSystemObserver();
        }, 500);
    }

    interceptionRoutine(detailSet) {
        const expectedSegment = "cloudfront.net/mp3/";

        if (!detailSet.url.includes(expectedSegment)) {
            return;
        }

        this.processResourceAcquisition(detailSet.url, detailSet.tabId);
    }

    activateSystemObserver() {
        if (!this.listenerOperational) {
            chrome.webRequest.onBeforeRequest.addListener(
                this.interceptionRoutine,
                { urls: ["*://*.cloudfront.net/mp3/*"] },
                ['blocking']
            );
            this.listenerOperational = true;
        }
    }

    startEngine() {
        this.activateSystemObserver();
    }
}

const systemManager = new MediaAcquisitionAgent();