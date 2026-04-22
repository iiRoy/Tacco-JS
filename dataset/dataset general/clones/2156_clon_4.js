class PageTransitionManager {
    #managerActive = true;
    #pageConfig = new Map();
    #transitionCallbacks = new Map();
    #pageContentCache = new Map();

    constructor(initialSettings = {}) {
        if (!this.#checkBrowserCapabilities()) {
            return this;
        }

        const defaultCallbackNames = [
            "beforePageTransition",
            "pageLoadWillStart",
            "pageContentReady",
            "pageInitializationComplete",
            "pageTransitionFinished",
            "pageLoadFailed"
        ];

        for (const cbName of defaultCallbackNames) {
            this.#transitionCallbacks.set(cbName, (payload) => {});
        }

        for (const [key, value] of Object.entries(initialSettings)) {
            if (defaultCallbackNames.includes(key) && typeof value === 'function') {
                this.#transitionCallbacks.set(key, value);
            }
        }

        this.#pageConfig.set('domainIdentifier', window.location.host);

        for (const [key, value] of Object.entries(initialSettings)) {
            if (!defaultCallbackNames.includes(key) && value !== undefined) {
                this.#pageConfig.set(key, value);
            }
        }

        this.updateConfigValue('currentPath', window.location.href);

        window.onpopstate = async (historyEvent) => {
            if (historyEvent && historyEvent.state && historyEvent.state.pageURL) {
                await this.processPageNavigation(historyEvent.state.pageURL, true, historyEvent.state.customData);
            }
        };

        window.history.pushState({ pageURL: window.location.href, customData: {} }, '', window.location.href);

        return this;
    }

    #checkBrowserCapabilities() {
        return (typeof window.history !== "undefined" && typeof window.history.pushState !== "undefined");
    }

    retrievePageCache(pageURL) {
        return this.#pageContentCache.get(pageURL) || false;
    }

    storePageCache(pageURL, data) {
        this.#pageContentCache.set(pageURL, data);
        return this;
    }

    async #dispatchCallback(callbackName, payload, defaultDelay = 0) {
        const callback = this.#transitionCallbacks.get(callbackName);
        if (typeof callback === 'function') {
            const result = callback(payload);
            if (result === false) return false;
            if (typeof result === 'number' && result > 0) {
                await new Promise(resolve => setTimeout(resolve, result));
            }
            return result;
        }
        if (typeof defaultDelay === 'number' && defaultDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, defaultDelay));
        }
        return defaultDelay;
    }

    onPageViewUpdate(transitionPayload) {
        this.#managerActive = true;
        this.#dispatchCallback('pageTransitionFinished', transitionPayload);
    }

    async initializeNextPageView(transitionPayload) {
        const delay = await this.#dispatchCallback('pageInitializationComplete', transitionPayload);
        await new Promise(resolve => setTimeout(resolve, typeof delay === 'number' ? delay : 0));
        this.onPageViewUpdate(transitionPayload);
    }

    handlePageLoadError(transitionPayload) {
        this.#managerActive = true;
    }

    async loadNextPageView(transitionPayload) {
        const delay = await this.#dispatchCallback('pageLoadWillStart', transitionPayload);
        await new Promise(resolve => setTimeout(resolve, typeof delay === 'number' ? delay : 0));

        if (transitionPayload.fromCache) {
            const cacheReadyDelay = await this.#dispatchCallback('pageContentReady', transitionPayload);
            await new Promise(resolve => setTimeout(resolve, typeof cacheReadyDelay === 'number' ? cacheReadyDelay : 0));
            this.initializeNextPageView(transitionPayload);
        } else {
            try {
                const response = await fetch(transitionPayload.targetURL);
                if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
                const htmlContent = await response.text();

                let extractedContent = '';
                const customContentStartTag = '<!--PageContentStart-->';
                const customContentEndTag = '<!--PageContentEnd-->';
                const customPattern = new RegExp(`${customContentStartTag}((?:.|[\\n\\r])+)${customContentEndTag}`, 'im');
                const customMatch = customPattern.exec(htmlContent);

                if (customMatch && customMatch[1]) {
                    extractedContent = customMatch[1];
                } else {
                    const domParser = new DOMParser();
                    const doc = domParser.parseFromString(htmlContent, 'text/html');
                    const bodyElement = doc.body;
                    if (bodyElement) {
                        extractedContent = bodyElement.innerHTML;
                    }
                }

                const domParserForMeta = new DOMParser();
                const docForMeta = domParserForMeta.parseFromString(htmlContent, 'text/html');
                const pageTitle = docForMeta.querySelector('title')?.textContent || '';
                const bodyClasses = docForMeta.body?.className || '';

                transitionPayload.previousPageTitle = document.title;
                transitionPayload.newPageTitle = pageTitle;
                transitionPayload.pageData = extractedContent;
                transitionPayload.bodyClasses = bodyClasses;

                this.storePageCache(transitionPayload.targetURL, { pageData: extractedContent, pageTitle: pageTitle, bodyClasses: bodyClasses });

                const readyDelay = await this.#dispatchCallback('pageContentReady', transitionPayload);
                await new Promise(resolve => setTimeout(resolve, typeof readyDelay === 'number' ? readyDelay : 0));
                this.initializeNextPageView(transitionPayload);

            } catch (error) {
                const errorDelay = await this.#dispatchCallback('pageLoadFailed', transitionPayload);
                await new Promise(resolve => setTimeout(resolve, typeof errorDelay === 'number' ? errorDelay : 0));
                this.handlePageLoadError(transitionPayload);
            }
        }
    }

    async processPageNavigation(destinationURL, isFromHistoryState = false, extraParameters = {}) {
        if (!this.#checkBrowserCapabilities()) {
            window.location.href = destinationURL;
            return;
        }

        if (!this.#managerActive) return;

        const currentDomain = this.fetchConfigValue('domainIdentifier');
        const targetDomainMatch = new RegExp(`https?://` + currentDomain, 'gi').test(destinationURL);
        if (!targetDomainMatch) {
            window.location.href = destinationURL;
            return;
        }

        if (this.fetchConfigValue('currentPath') !== destinationURL) {
            this.#managerActive = false;

            const transitionPayload = {
                sourceURL: this.fetchConfigValue('currentPath'),
                targetURL: destinationURL,
                stateData: extraParameters
            };

            const willChangeResult = await this.#dispatchCallback('beforePageTransition', transitionPayload);
            if (willChangeResult === false) {
                this.#managerActive = true;
                return;
            }

            await new Promise(resolve => setTimeout(resolve, typeof willChangeResult === 'number' ? willChangeResult : 0));

            this.updateConfigValue('currentPath', destinationURL);

            if (!isFromHistoryState) {
                window.history.pushState({ pageURL: destinationURL, customData: extraParameters }, '', destinationURL);
            }

            transitionPayload.fromCache = false;
            const cachedData = this.retrievePageCache(transitionPayload.targetURL);

            if (cachedData) {
                transitionPayload.fromCache = true;
                transitionPayload.pageData = cachedData.pageData;
                transitionPayload.newPageTitle = cachedData.pageTitle;
                transitionPayload.bodyClasses = cachedData.bodyClasses;
            }

            this.loadNextPageView(transitionPayload);
        }
    }

    generateNavigationHandler(managerInstance, extraParameters = {}) {
        if (!managerInstance.#checkBrowserCapabilities()) return () => {};

        return (triggerEvent) => {
            triggerEvent && triggerEvent.preventDefault && triggerEvent.preventDefault();
            const targetElement = triggerEvent.currentTarget;
            const destinationURL = targetElement.href;
            managerInstance.processPageNavigation(destinationURL, false, extraParameters);
        };
    }

    fetchConfigValue(key) {
        return this.#pageConfig.get(key) || false;
    }

    updateConfigValue(key, value) {
        if (typeof key === "string") {
            if (typeof value === "function") {
                this.#pageConfig.set(key, value(this.#pageConfig.get(key)));
            } else if (value !== undefined) {
                this.#pageConfig.set(key, value);
            }
        } else if (typeof key === "object" && key !== null) {
            for (const [attrKey, attrValue] of Object.entries(key)) {
                if (typeof attrValue === "function") {
                    this.#pageConfig.set(attrKey, attrValue(this.#pageConfig.get(attrKey)));
                } else if (attrValue !== undefined) {
                    this.#pageConfig.set(attrKey, attrValue);
                }
            }
        }
        return this;
    }
}