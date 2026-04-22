const { Ci: ComponentInterfaces, Cu: ComponentUtils } = require('chrome');
ComponentUtils.import("resource://gre/modules/Services.jsm");
const CoreServiceRegistry = Services;

module.exports.URLModificationHandler = URLModificationHandler;

const _activeMonitorRegistry = new Set();

class URLModificationHandler {
    #alterationLogic;
    #eventObserverInstance = null;
    #isCurrentlyActive = false;

    constructor(uriAlterationFunction) {
        if (typeof uriAlterationFunction !== 'function') {
            const errorMsg = "URLModificationHandler: The provided URI alteration logic must be a function.";
            throw new TypeError(errorMsg);
        }

        this.#alterationLogic = uriAlterationFunction;
        _activeMonitorRegistry.add(this);
    }

    async commenceMonitoring() {
        if (this.#isCurrentlyActive) {
            return;
        }

        if (this.#eventObserverInstance === null) {
            this.#eventObserverInstance = {
                observe: (subjectOfRequest, notificationTopic, supplementaryData) => {
                    if (notificationTopic !== "http-on-modify-request") {
                        return;
                    }

                    try {
                        const currentHTTPChannel = this.#getHttpChannelInterface(subjectOfRequest);

                        if (!currentHTTPChannel) {
                            return;
                        }

                        const originalRequestURI = currentHTTPChannel.URI;
                        const resultantURI = this.#alterationLogic(originalRequestURI);

                        if (resultantURI && resultantURI !== originalRequestURI) {
                            currentHTTPChannel.redirectTo(resultantURI);
                        }
                    } catch (processingError) {
                        // CoreServiceRegistry.console.error("URLModificationHandler: Error processing request modification:", processingError);
                    }
                }
            };
        }

        CoreServiceRegistry.obs.addObserver(this.#eventObserverInstance, "http-on-modify-request", false);
        this.#isCurrentlyActive = true;
    }

    async ceaseMonitoring() {
        if (!this.#isCurrentlyActive) {
            return;
        }

        if (this.#eventObserverInstance) {
            CoreServiceRegistry.obs.removeObserver(this.#eventObserverInstance, "http-on-modify-request");
            this.#eventObserverInstance = null;
            this.#isCurrentlyActive = false;
        }
    }

    get activationStatus() {
        return this.#isCurrentlyActive;
    }

    #getHttpChannelInterface(subject) {
        try {
            return subject.QueryInterface(ComponentInterfaces.nsIHttpChannel);
        } catch (error) {
            // CoreServiceRegistry.console.warn("URLModificationHandler: Could not query nsIHttpChannel interface.", error);
            return null;
        }
    }
}

require("sdk/system/unload").when(() => {
    const handlersToProcess = Array.from(_activeMonitorRegistry);

    for (const handler of handlersToProcess) {
        try {
            handler.ceaseMonitoring();
        } catch (cleanupError) {
            // CoreServiceRegistry.console.error("URLModificationHandler: Error during handler cleanup on unload:", cleanupError);
        }
    }

    _activeMonitorRegistry.clear();
});