class AdDisplayController {
    #containerStyleClass = 'ad-container';
    #elementIdentifierPrefix = 'advert-unit-';
    #frameIdentifierSuffix = '-display';
    #widthAttributeName = 'data-ad-width';
    #heightAttributeName = 'data-ad-height';
    #trackingEnabled = false;
    #frameContentUrl = '/ad-content-frame.html?v=4';
    #randomIdLength = 14;
    #currentRandomId = 0;
    #requestParameters = {};
    #creativeContentCache = {};
    #scriptSourceMap = {};
    #interstitialOverlayElementId = 'ad-overlay-screen';
    #interstitialPageClass = 'overlay-active';
    #interstitialDisplayDuration = 12000;
    #activeInterstitialType = null;
    #activeAdService = null;
    #interstitialTimerHandle = null;
    #postInterstitialRenderQueue = null;

    #adServiceConfigurations = new Map();

    constructor() {
        this.#adServiceConfigurations.set('ignWrapperService', {
            fetchUrl: (ctrl, requestUnits) => {
                const queryData = ctrl.#requestParameters;
                let url = new URL(`https://wrapper.ign.com/services/ads/pagetype/${queryData.pageContext}/sizes/${requestUnits.join(',')}.js`);
                url.searchParams.set('callback', '?');

                const currentPageUrl = new URL(document.location.href);
                currentPageUrl.searchParams.forEach((value, key) => {
                    if (key.includes('specificParam')) {
                        url.searchParams.append(key, value);
                    }
                });

                Object.entries(queryData).forEach(([paramKey, paramValue]) => {
                    if (paramKey === 'pageContext') {
                        return;
                    }
                    if (Array.isArray(paramValue)) {
                        paramValue.forEach(item => url.searchParams.append(paramKey, item));
                    } else {
                        url.searchParams.append(paramKey, paramValue);
                    }
                });

                const referrer = document.referrer;
                if (referrer) {
                    url.searchParams.set('r', referrer);
                }
                return url.toString();
            },
            processResponse: (ctrl, unitsToRender) => jsonPayload => {
                const interstitialKey = 'preRoll';
                jsonPayload.forEach(adItem => {
                    if (adItem.size.endsWith('stitial')) {
                        if (!adItem.impressionTrigger) {
                            ctrl.#activeInterstitialType = interstitialKey;
                            ctrl.#creativeContentCache[interstitialKey] = adItem.creativeContent;
                        } else {
                            ctrl.#creativeContentCache[interstitialKey] = '';
                        }
                    } else {
                        ctrl.#creativeContentCache[adItem.size] = adItem.creativeContent;
                    }
                });
                ctrl.#adFetchCompletionHandler(unitsToRender);
            }
        });

        this.#adServiceConfigurations.set('dfpService', {
            fetchUrl: (ctrl, requestUnits) => `https://example.com/ads/${requestUnits.join(',')}.jsonp`,
            processResponse: (ctrl, unitsToRender) => jsonPayload => {
                // Populate ctrl.#creativeContentCache with ad creatives
            }
        });
    }

    initiateAdRendering(unitsToRender) {
        const adUnits = Array.isArray(unitsToRender) ? unitsToRender : [unitsToRender];

        if (this.#activeAdService) {
            this.#handleCreativeRendering(adUnits);
        } else {
            this.#handleScriptUrlRendering(adUnits);
        }
    }

    presentInterstitial() {
        const pageRootElement = document.documentElement;
        const overlayElement = document.getElementById(this.#interstitialOverlayElementId);

        pageRootElement.classList.add(this.#interstitialPageClass);
        if (overlayElement) overlayElement.style.display = 'block';

        this.#interstitialTimerHandle = setTimeout(() => this.dismissInterstitial(), this.#interstitialDisplayDuration);
    }

    dismissInterstitial() {
        clearTimeout(this.#interstitialTimerHandle);

        const pageRootElement = document.documentElement;
        const overlayElement = document.getElementById(this.#interstitialOverlayElementId);

        pageRootElement.classList.remove(this.#interstitialPageClass);
        if (overlayElement) overlayElement.style.display = 'none';

        if (typeof this.#postInterstitialRenderQueue === 'function') {
            this.#postInterstitialRenderQueue();
        }
    }

    _setFrameDimensions(targetFrame, nominalWidth, nominalHeight) {
        if (typeof nominalWidth === 'number') targetFrame.customWidth = nominalWidth;
        if (typeof nominalHeight === 'number') targetFrame.customHeight = nominalHeight;
    }

    _frameLoadCallback(frameWindowRef) {
        const loadEndTime = new Date().getTime();
        if (this.#trackingEnabled && typeof _gaq !== 'undefined') {
            _gaq.push([
                '_trackEvent',
                'Ad System',
                frameWindowRef.frameElement.adUnitType,
                frameWindowRef.frameElement.adScriptSource,
                loadEndTime - frameWindowRef.initialLoadTime
            ]);
        }
        this._adjustFrameContainerStyling(frameWindowRef);
    }

    _adjustFrameContainerStyling(frameWindowRef) {
        const targetFrame = frameWindowRef.frameElement;
        const parentContainer = targetFrame.parentNode;

        if (targetFrame.customWidth === 0 && targetFrame.customHeight === 0 && parentContainer.style.display !== 'none') {
            parentContainer.style.display = 'none';
        } else {
            targetFrame.style.cssText = `width:${targetFrame.customWidth}px;height:${targetFrame.customHeight}px;border:none;`;
            parentContainer.style.cssText = `width:${targetFrame.customWidth}px;height:auto;display:block;`;
        }
    }

    _processAndEmbedAdvertisements(advertUnitKeys) {
        advertUnitKeys.forEach(unitKey => {
            if (!this.#activeAdService && !(unitKey in this.#scriptSourceMap)) {
                this._logWarning(`Failed to embed ad. No script URL defined for unit: "${unitKey}".`);
                return;
            }
            if (this.#activeAdService && !(unitKey in this.#creativeContentCache)) {
                this._logWarning(`Failed to embed ad. No creative content found for unit: "${unitKey}".`);
                return;
            }
            this._constructAndInsertFrame(unitKey);
        });
    }

    _constructAndInsertFrame(unitKey) {
        const containerId = this.#elementIdentifierPrefix + unitKey;
        const containerElement = document.getElementById(containerId);

        if (!containerElement) {
            this._logWarning(`Failed to embed ad. No DOM element with id "${containerId}" exists.`);
            return false;
        }

        const existingFrame = document.getElementById(containerId + this.#frameIdentifierSuffix);
        if (existingFrame && existingFrame.customHeight) {
            containerElement.style.height = `${existingFrame.customHeight}px`;
        }

        while (containerElement.firstChild) {
            containerElement.removeChild(containerElement.firstChild);
        }

        if (this.#activeAdService && this.#creativeContentCache[unitKey] === '') {
            delete this.#creativeContentCache[unitKey];
            return;
        }

        const newFrame = document.createElement('iframe');
        newFrame.id = containerId + this.#frameIdentifierSuffix;
        newFrame.name = newFrame.id;
        newFrame.src = this.#frameContentUrl;
        newFrame.style.border = '0';
        newFrame.width = 0;
        newFrame.height = 0;
        newFrame.scrolling = 'no';
        newFrame.setAttribute('seamless', 'seamless');

        newFrame.customWidth = parseInt(containerElement.getAttribute(this.#widthAttributeName), 10) || 0;
        newFrame.customHeight = parseInt(containerElement.getAttribute(this.#heightAttributeName), 10) || 0;
        newFrame.adUnitType = unitKey;
        newFrame.initialLoadTime = new Date().getTime();

        if (this.#activeAdService) {
            newFrame.adCreativeContent = this.#creativeContentCache[unitKey];
            delete this.#creativeContentCache[unitKey];
        } else {
            newFrame.adScriptSource = this.#scriptSourceMap[unitKey];
        }

        if (navigator.userAgent.includes("Trident") || navigator.userAgent.includes("MSIE")) {
            newFrame.setAttribute('frameBorder', '0');
            newFrame.setAttribute('allowTransparency', 'true');
        }

        containerElement.appendChild(newFrame);
        return true;
    }

    #handleCreativeRendering(unitsToRender) {
        const unitsToFetch = unitsToRender.filter(unit => !(unit in this.#creativeContentCache));

        if (unitsToFetch.length > 0) {
            const serviceConfig = this.#adServiceConfigurations.get(this.#activeAdService);
            if (serviceConfig) {
                const requestUrl = serviceConfig.fetchUrl(this, unitsToFetch);
                const responseHandler = serviceConfig.processResponse(this, unitsToRender);
                this._fetchDataViaJsonp(requestUrl, responseHandler);
            } else {
                this._logWarning(`Ad service "${this.#activeAdService}" configuration not found.`);
                this.#adFetchCompletionHandler(unitsToRender);
            }
        } else {
            this.#adFetchCompletionHandler(unitsToRender);
        }
    }

    #handleScriptUrlRendering(unitsToRender) {
        this._updateScriptUrlsWithRandomParam();
        this._processAndEmbedAdvertisements(unitsToRender);
    }

    #adFetchCompletionHandler(unitsToRender) {
        if (this.#activeInterstitialType) {
            const nonInterstitialUnits = unitsToRender.filter(unit => unit !== this.#activeInterstitialType);

            this.#postInterstitialRenderQueue = () => this._processAndEmbedAdvertisements(nonInterstitialUnits);

            this._processAndEmbedAdvertisements([this.#activeInterstitialType]);
            this.#activeInterstitialType = null;

            this.presentInterstitial();
        } else {
            this._processAndEmbedAdvertisements(unitsToRender);
        }
    }

    _updateScriptUrlsWithRandomParam() {
        this.#currentRandomId = this.#currentRandomId === 0
            ? Math.floor(Math.random() * Math.pow(10, this.#randomIdLength))
            : this.#currentRandomId + 1;

        const randomParamKey = 'cacheBuster';
        const newParamValue = `${randomParamKey}=${this.#currentRandomId}`;
        const regexPattern = new RegExp(`${randomParamKey}=\\d{${this.#randomIdLength}}`, 'g');

        Object.keys(this.#scriptSourceMap).forEach(unitKey => {
            let scriptUrl = this.#scriptSourceMap[unitKey];
            const urlObj = new URL(scriptUrl, document.baseURI);

            if (urlObj.searchParams.has(randomParamKey)) {
                urlObj.searchParams.set(randomParamKey, this.#currentRandomId);
            } else {
                urlObj.searchParams.append(randomParamKey, this.#currentRandomId);
            }
            this.#scriptSourceMap[unitKey] = urlObj.toString();
        });
    }

    _fetchDataViaJsonp(targetUrl, responseHandler) {
        if (!targetUrl.includes('callback=?')) {
            this._logWarning('JSONP URL must specify callback via "callback=?".');
            return;
        }
        if (typeof responseHandler !== 'function') {
            this._logWarning('JSONP response handler must be a function.');
            return;
        }

        const uniqueFunctionName = `jsonp_${Date.now()}_${Math.floor(Math.random() * 1e9)}`;

        window[uniqueFunctionName] = (jsonPayload) => {
            responseHandler(jsonPayload);
            try {
                delete window[uniqueFunctionName];
            } catch (e) {
                window[uniqueFunctionName] = undefined;
            }
        };

        const scriptElement = document.createElement('script');
        scriptElement.src = targetUrl.replace('callback=?', `callback=${uniqueFunctionName}`);
        document.head.appendChild(scriptElement);
    }

    _logWarning(message) {
        if (window.console && console.warn) {
            console.warn(`AdSystem Warning: ${message}`);
        }
    }

    setRequestParameters(params) {
        Object.assign(this.#requestParameters, params);
    }

    setScriptSources(sources) {
        Object.assign(this.#scriptSourceMap, sources);
    }

    setActiveAdService(serviceName) {
        if (this.#adServiceConfigurations.has(serviceName)) {
            this.#activeAdService = serviceName;
        } else {
            this._logWarning(`Attempted to set unknown ad service: "${serviceName}".`);
        }
    }

    setTrackingEnabled(isEnabled) {
        this.#trackingEnabled = !!isEnabled;
    }

    setFrameContentUrl(url) {
        this.#frameContentUrl = url;
    }

    setRandomIdLength(length) {
        if (typeof length === 'number' && length > 0) {
            this.#randomIdLength = length;
        } else {
            this._logWarning('Invalid random ID length provided.');
        }
    }
}

const AdPlacementSystem = new AdDisplayController();