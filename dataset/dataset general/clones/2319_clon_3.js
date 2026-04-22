const PromotionEngine = (function() {
    // Internal configuration settings and default values for the ad system.
    const _systemConfig = {
        promoContainerClass: 'promo-area', // CSS class for identifying ad containers on the page
        promoElementIdPrefix: 'promo-unit-', // Prefix for unique DOM IDs of ad containers
        frameEmbedIdSuffix: '-embed', // Suffix appended to container ID to form the iframe ID
        widthAttributeKey: 'data-promo-width', // Custom HTML attribute for desired ad width
        heightAttributeKey: 'data-promo-height', // Custom HTML attribute for desired ad height
        enableAnalyticsTracking: false, // Flag to toggle integration with analytics platforms
        embeddedFrameSource: '/promo_content.html?v=4', // URL pointing to the friendly iframe content
        urlRandomizerLength: 10, // Length of the random number for cache-busting URLs
        overlayElementId: 'promo-interstitial-overlay', // ID for the full-page interstitial overlay element
        overlayActiveCssClass: 'promo-overlay-active', // CSS class applied to <html> when interstitial is active
        interstitialDisplayDelay: 12000, // Duration (in milliseconds) for which the interstitial is shown
        activeAdProviderKey: null, // The key of the currently selected ad provider (e.g., 'IgnitionAds')
        jsonpCallbackPrefix: '__promo_jsonp_cb_', // Prefix for dynamic JSONP callback function names
        providerIntegrations: {
            // Configuration for the IgnitionAds provider.
            IgnitionAds: {
                // Generates the URL to fetch ad creatives from the Ignition service.
                generateRequestUrl: function(engineContext, requestedAdUnits) {
                    const pageContext = engineContext._runtimeState.campaignContext;
                    if (!pageContext || !pageContext.pageType) {
                        engineContext._logWarning('Campaign context or page type is absent for IgnitionAds request.');
                        return '';
                    }

                    // Construct the base URL using template literals for clarity.
                    let requestUrl = new URL(`https://wrapper.ign.com/services/ads/pagetype/${pageContext.pageType}/sizes/${requestedAdUnits.join(',')}.js`);
                    requestUrl.searchParams.set('callback', '?'); // Standard JSONP callback placeholder

                    // Transfer special query parameters from the current page's URL.
                    const currentPageQuery = new URLSearchParams(window.location.search);
                    currentPageQuery.forEach((value, key) => {
                        if (key.startsWith('special')) {
                            requestUrl.searchParams.set(key, value);
                        }
                    });

                    // Append all campaign-specific data as URL parameters.
                    for (const paramKey in pageContext) {
                        if (paramKey === 'pageType') { // Already part of the URL path
                            continue;
                        }
                        const paramValue = pageContext[paramKey];
                        if (Array.isArray(paramValue)) {
                            paramValue.forEach(item => requestUrl.searchParams.append(paramKey, item));
                        } else {
                            requestUrl.searchParams.set(paramKey, paramValue);
                        }
                    }

                    // Include the document referrer if available.
                    if (document.referrer) {
                        requestUrl.searchParams.set('r', encodeURIComponent(document.referrer));
                    }
                    return requestUrl.toString();
                },
                // Processes the JSONP response containing ad creatives from Ignition.
                processResponseCallback: function(engineContext, unitsToProcess) {
                    return function(responseData) {
                        const interstitialTag = 'prestitial'; // Specific identifier for interstitial ads
                        
                        if (!Array.isArray(responseData)) {
                             engineContext._logWarning('IgnitionAds response was not an array. Cannot process creatives.');
                             return;
                        }

                        // Iterate through the received ad data and cache creatives.
                        responseData.forEach(adItem => {
                            if (!adItem || !adItem.size) {
                                engineContext._logWarning('Invalid ad item structure received from IgnitionAds.');
                                return;
                            }
                            if (adItem.size.endsWith('stitial')) {
                                // Differentiate between real interstitials and empty placeholders.
                                if (adItem.impressionTracker === false) {
                                    engineContext._runtimeState.activeInterstitialType = interstitialTag;
                                    engineContext._runtimeState.creativeCache.set(interstitialTag, adItem.creative);
                                } else {
                                    engineContext._runtimeState.creativeCache.set(interstitialTag, ''); // Cache empty creative
                                }
                            } else {
                                engineContext._runtimeState.creativeCache.set(adItem.size, adItem.creative);
                            }
                        });
                        engineContext._finalizePromotionHandling(unitsToProcess);
                    };
                }
            },
            // Placeholder for Google Ad Manager (DFP) integration.
            GoogleAdManager: {
                generateRequestUrl: function(engineContext, requestedAdUnits) {
                    engineContext._logWarning('GoogleAdManager integration is not yet fully functional.');
                    return `https://example.com/dfp-ads/${requestedAdUnits.join(',')}.jsonp`;
                },
                processResponseCallback: function(engineContext, unitsToProcess) {
                    return function(responseData) {
                        // TODO: Implement logic to populate engineContext._runtimeState.creativeCache with DFP creatives.
                        engineContext._logWarning('DFP creative processing logic needs implementation.');
                        engineContext._finalizePromotionHandling(unitsToProcess);
                    };
                }
            }
        }
    };

    // Internal runtime state variables, mutable during engine operation.
    const _runtimeState = {
        isInitialized: false, // Flag indicating if the engine has been initialized
        campaignContext: {}, // Dynamic data related to the current page or user session
        creativeCache: new Map(), // Stores ad creatives, keyed by ad type
        scriptUrls: new Map(), // Stores URLs for script-based ads, keyed by ad type
        currentRandomSeed: 0, // Current value for URL cache-busting
        activeInterstitialType: null, // The identifier of the interstitial ad currently being displayed
        interstitialTimerRef: null, // Reference to the interstitial dismissal timeout
        deferredRenderFunction: null, // A function to execute after the interstitial is dismissed
        jsonpGlobalCallbackCounter: 0 // Counter to generate unique JSONP callback IDs
    };

    // --- Utility Helper Functions ---

    /**
     * Safely retrieves a DOM element by ID or CSS selector.
     * @param {string} selector - The ID or CSS selector of the element.
     * @param {boolean} [isId=true] - True if selector is an ID, false for CSS selector.
     * @returns {HTMLElement|null} The found element or null if not found/invalid selector.
     */
    const _getDomElement = (selector, isId = true) => {
        if (!selector || typeof selector !== 'string') {
            PromotionEngine._logWarning('Invalid selector provided to _getDomElement.');
            return null;
        }
        return isId ? document.getElementById(selector) : document.querySelector(selector);
    };

    /**
     * Creates a new DOM element with specified attributes and styles.
     * @param {string} tagName - The HTML tag name (e.g., 'div', 'iframe').
     * @param {object} [attributes={}] - Key-value pairs for HTML attributes.
     * @param {object} [styles={}] - Key-value pairs for CSS styles.
     * @returns {HTMLElement} The newly created DOM element.
     */
    const _createDomElement = (tagName, attributes = {}, styles = {}) => {
        const el = document.createElement(tagName);
        for (const key in attributes) {
            el.setAttribute(key, attributes[key]);
        }
        Object.assign(el.style, styles); // Apply styles using Object.assign
        return el;
    };

    // Centralized registry for JSONP callbacks, avoiding direct global scope pollution.
    const _jsonpCallbackRegistry = new Map();

    /**
     * The main PromotionEngine object, exposing public API and managing internal logic.
     */
    const PromotionEngine = {
        /**
         * Initializes the PromotionEngine with optional custom configurations.
         * Must be called once before using other engine functionalities.
         * @param {object} [customSettings={}] - Configuration overrides.
         */
        initialize: function(customSettings = {}) {
            if (_runtimeState.isInitialized) {
                this._logWarning('PromotionEngine has already been initialized. Skipping re-initialization.');
                return;
            }

            // Merge provided settings with system defaults.
            Object.assign(_systemConfig, customSettings);

            // Set up a global handler for all JSONP responses to route them internally.
            window[_systemConfig.jsonpCallbackPrefix + 'handler'] = (callbackId, data) => {
                const specificCallback = _jsonpCallbackRegistry.get(callbackId);
                if (specificCallback) {
                    specificCallback(data);
                    _jsonpCallbackRegistry.delete(callbackId); // Clean up the callback after use
                } else {
                    this._logWarning(`JSONP callback with ID "${callbackId}" was not found or already executed.`);
                }
            };

            _runtimeState.isInitialized = true;
            this._logWarning('PromotionEngine successfully initialized.');
        },

        /**
         * Updates or sets the current campaign context data.
         * This data can be used by ad providers to tailor requests.
         * @param {object} contextData - Key-value pairs of campaign context.
         */
        setCampaignContext: function(contextData) {
            if (!_runtimeState.isInitialized) {
                this._logWarning('Engine not initialized. Call initialize() first before setting campaign context.');
                return;
            }
            if (typeof contextData !== 'object' || contextData === null) {
                this._logWarning('Invalid campaign context data provided. Must be an object.');
                return;
            }
            // Merge new context data, allowing updates.
            _runtimeState.campaignContext = { ..._runtimeState.campaignContext, ...contextData };
        },

        /**
         * Provides URLs for script-based advertising units.
         * These URLs will be loaded directly into iframes.
         * @param {object} urlMap - An object mapping ad type (string) to its script URL (string).
         */
        supplyScriptAdUrls: function(urlMap) {
            if (!_runtimeState.isInitialized) {
                this._logWarning('Engine not initialized. Call initialize() first before supplying script URLs.');
                return;
            }
            if (typeof urlMap !== 'object' || urlMap === null) {
                this._logWarning('Invalid script ad URLs provided. Must be an object.');
                return;
            }
            // Add or update script URLs in the internal map.
            for (const type in urlMap) {
                _runtimeState.scriptUrls.set(type, urlMap[type]);
            }
        },

        /**
         * Sets the ad provider that the engine should use for fetching creatives.
         * @param {string} providerIdentifier - The key identifying the ad provider (e.g., 'IgnitionAds').
         */
        selectAdProvider: function(providerIdentifier) {
            if (!_runtimeState.isInitialized) {
                this._logWarning('Engine not initialized. Call initialize() first before selecting an ad provider.');
                return;
            }
            if (!_systemConfig.providerIntegrations[providerIdentifier]) {
                this._logWarning(`Ad provider "${providerIdentifier}" is not configured or recognized.`);
                _systemConfig.activeAdProviderKey = null; // Reset if invalid
                return;
            }
            _systemConfig.activeAdProviderKey = providerIdentifier;
            this._logWarning(`Ad provider set to: "${providerIdentifier}".`);
        },

        /**
         * Initiates the display process for specified promotion units.
         * This is the primary entry point for rendering ads.
         * @param {string|string[]} unitIdentifiers - A single ad type string or an array of ad types to render.
         */
        displayPromotions: function(unitIdentifiers) {
            if (!_runtimeState.isInitialized) {
                this._logWarning('Engine not initialized. Call initialize() first before displaying promotions.');
                return;
            }
            if (!unitIdentifiers || (Array.isArray(unitIdentifiers) && unitIdentifiers.length === 0)) {
                this._logWarning('No promotion unit identifiers provided for display. Nothing to render.');
                return;
            }

            const promotionUnits = Array.isArray(unitIdentifiers) ? unitIdentifiers : [unitIdentifiers];

            if (_systemConfig.activeAdProviderKey) {
                this._requestCreativeContent(promotionUnits);
            } else {
                this._prepareScriptBasedPromotions(promotionUnits);
            }
        },

        /**
         * Presents a full-page interstitial promotion.
         * This involves activating an overlay and setting a timed dismissal.
         */
        presentInterstitial: function() {
            if (!_runtimeState.isInitialized) {
                this._logWarning('Engine not initialized. Call initialize() first.');
                return;
            }
            const htmlRootElement = _getDomElement('html', false);
            const interstitialOverlay = _getDomElement(_systemConfig.overlayElementId);

            if (!htmlRootElement || !interstitialOverlay) {
                this._logWarning('Required HTML root or interstitial overlay elements not found for presentation.');
                return;
            }

            // Prevent showing an interstitial if one is already active.
            if (htmlRootElement.classList.contains(_systemConfig.overlayActiveCssClass)) {
                this._logWarning('Interstitial is already active on the page.');
                return;
            }

            htmlRootElement.classList.add(_systemConfig.overlayActiveCssClass);
            interstitialOverlay.style.display = 'block'; // Make the overlay visible

            // Set a timeout to automatically hide the interstitial after a delay.
            _runtimeState.interstitialTimerRef = setTimeout(() => {
                this.dismissInterstitial();
            }, _systemConfig.interstitialDisplayDelay);
            this._logWarning('Interstitial promotion presented.');
        },

        /**
         * Hides the full-page interstitial promotion.
         * Clears any active timers and restores the page's original styling.
         */
        dismissInterstitial: function() {
            if (!_runtimeState.isInitialized) {
                this._logWarning('Engine not initialized. Call initialize() first.');
                return;
            }
            // Clear the auto-dismissal timer in case the user closes it manually.
            if (_runtimeState.interstitialTimerRef) {
                clearTimeout(_runtimeState.interstitialTimerRef);
                _runtimeState.interstitialTimerRef = null;
            }

            const htmlRootElement = _getDomElement('html', false);
            const interstitialOverlay = _getDomElement(_systemConfig.overlayElementId);

            if (!htmlRootElement || !interstitialOverlay) {
                this._logWarning('Required HTML root or interstitial overlay elements not found during dismissal.');
                return;
            }

            htmlRootElement.classList.remove(_systemConfig.overlayActiveCssClass);
            interstitialOverlay.style.display = 'none'; // Hide the overlay

            // Execute any promotions that were scheduled to render after the interstitial.
            if (typeof _runtimeState.deferredRenderFunction === 'function') {
                _runtimeState.deferredRenderFunction();
                _runtimeState.deferredRenderFunction = null; // Clear the function after execution
            }
            this._logWarning('Interstitial promotion dismissed.');
        },

        /**
         * This function acts as a placeholder for tasks that need to be executed
         * after an interstitial ad has been dismissed. It is dynamically assigned.
         */
        deferredPromotionRender: function() {
            // This method is intended to be dynamically overridden at runtime.
            this._logWarning('Deferred promotion render function called without a specific assignment. No ads will render.');
        },

        /**
         * Applies custom width and height attributes to an ad iframe element.
         * These dimensions can be used by the iframe's content or for container sizing.
         * @param {HTMLElement} frameElement - The iframe DOM element.
         * @param {number} widthValue - The desired width in pixels.
         * @param {number} heightValue - The desired height in pixels.
         */
        setFrameDimensions: function(frameElement, widthValue, heightValue) {
            if (!frameElement || !(frameElement instanceof HTMLElement)) {
                this._logWarning('Invalid frame element provided for dimension setting.');
                return;
            }
            // Store dimensions in dataset for modern access, and as direct properties for legacy compatibility.
            if (typeof widthValue === 'number' && widthValue >= 0) {
                frameElement.dataset.promoWidth = widthValue;
                frameElement.fifwidth = widthValue; // Legacy property
            }
            if (typeof heightValue === 'number' && heightValue >= 0) {
                frameElement.dataset.promoHeight = heightValue;
                frameElement.fifheight = heightValue; // Legacy property
            }
        },

        /**
         * Callback function executed when an embedded ad iframe finishes loading.
         * Handles analytics tracking and initial styling adjustments.
         * @param {Window} frameContentWindow - The `window` object of the loaded iframe.
         */
        onFrameLoaded: function(frameContentWindow) {
            if (!frameContentWindow || !frameContentWindow.frameElement) {
                this._logWarning('Invalid frame content window provided to onFrameLoaded handler.');
                return;
            }

            const loadFinishTimestamp = new Date().getTime();
            const loadedFrameElement = frameContentWindow.frameElement;

            // Integrate with Google Analytics (classic) if enabled.
            if (_systemConfig.enableAnalyticsTracking && typeof window._gaq !== 'undefined' && window._gaq.push) {
                window._gaq.push([
                    '_trackEvent',
                    'PromotionEngine', // Category
                    loadedFrameElement.dataset.promoType || 'unknown-promotion', // Action
                    loadedFrameElement.dataset.promoScriptUrl || loadedFrameElement.dataset.promoCreative || 'N/A', // Label
                    loadFinishTimestamp - (loadedFrameElement.dataset.loadStartTime || loadFinishTimestamp) // Value (time taken)
                ]);
            } else if (_systemConfig.enableAnalyticsTracking) {
                // Generic console logging for analytics if _gaq is not available.
                console.info('Analytics Event: Promotion Frame Loaded', {
                    type: loadedFrameElement.dataset.promoType,
                    source: loadedFrameElement.dataset.promoScriptUrl || loadedFrameElement.dataset.promoCreative,
                    duration: loadFinishTimestamp - (loadedFrameElement.dataset.loadStartTime || loadFinishTimestamp)
                });
            }
            this._adjustFrameContainerStyles(frameContentWindow);
        },

        /**
         * Adjusts the CSS styles of the ad iframe and its parent container
         * based on the determined ad content dimensions.
         * @param {Window} frameContentWindow - The `window` object of the iframe.
         */
        _adjustFrameContainerStyles: function(frameContentWindow) {
            if (!frameContentWindow || !frameContentWindow.frameElement) {
                this._logWarning('Invalid frame content window provided to _adjustFrameContainerStyles.');
                return;
            }
            const frameElement = frameContentWindow.frameElement;
            const parentContainer = frameElement.parentNode;

            const frameWidth = parseInt(frameElement.dataset.promoWidth || '0', 10);
            const frameHeight = parseInt(frameElement.dataset.promoHeight || '0', 10);

            // If the ad creative indicates zero dimensions, hide the container to prevent visual gaps.
            if (frameWidth === 0 && frameHeight === 0) {
                if (parentContainer && parentContainer.style.display !== 'none') {
                    parentContainer.style.display = 'none';
                }
            } else {
                // Apply dimensions to the iframe first for smoother rendering.
                Object.assign(frameElement.style, {
                    width: `${frameWidth}px`,
                    height: `${frameHeight}px`,
                    display: 'block' // Ensure iframe is visible
                });
                if (parentContainer) {
                    // Then apply dimensions to the parent container.
                    Object.assign(parentContainer.style, {
                        width: `${frameWidth}px`,
                        height: 'auto', // Allow container height to adjust
                        display: 'block' // Ensure container is visible
                    });
                }
            }
        },

        /**
         * Iterates through a list of promotion types and embeds their content (creatives or scripts)
         * into the corresponding DOM containers.
         * @param {string[]} promotionTypes - An array of promotion type identifiers.
         */
        _embedProcessedPromotions: function(promotionTypes) {
            if (!Array.isArray(promotionTypes) || promotionTypes.length === 0) {
                this._logWarning('No promotion types provided for embedding.');
                return;
            }

            promotionTypes.forEach(type => {
                const targetElementId = `${_systemConfig.promoElementIdPrefix}${type}`;
                const targetContainer = _getDomElement(targetElementId);

                if (!targetContainer) {
                    this._logWarning(`Failed to embed promotion: Target DOM element with ID "${targetElementId}" not found.`);
                    return;
                }

                // Determine if a creative or script URL is available for the current ad type.
                const hasCreative = _systemConfig.activeAdProviderKey && _runtimeState.creativeCache.has(type);
                const hasScriptUrl = !_systemConfig.activeAdProviderKey && _runtimeState.scriptUrls.has(type);

                if (!hasCreative && !hasScriptUrl) {
                    this._logWarning(`Failed to embed promotion "${type}". No creative or script URL found for the active provider.`);
                    return;
                }

                this._createAndAttachPromotionFrame(type, targetContainer);
            });
        },

        /**
         * Constructs and appends a new iframe for a specific promotion type into its designated container.
         * @param {string} promoType - The identifier for the promotion unit.
         * @param {HTMLElement} containerElement - The DOM element where the iframe will be appended.
         * @returns {boolean} True if the frame was successfully created and attached, false otherwise.
         */
        _createAndAttachPromotionFrame: function(promoType, containerElement) {
            if (!promoType || !containerElement || !(containerElement instanceof HTMLElement)) {
                this._logWarning('Invalid promotion type or container element provided for frame construction.');
                return false;
            }

            const frameIdentifier = `${containerElement.id}${_systemConfig.frameEmbedIdSuffix}`;

            // Preserve the height of any existing iframe to minimize layout shifts during refresh.
            const existingFrame = _getDomElement(frameIdentifier);
            if (existingFrame && existingFrame.fifheight) {
                containerElement.style.height = `${existingFrame.fifheight}px`;
            }

            // Clear any previous content within the container.
            containerElement.innerHTML = '';

            // If a creative was fetched but is empty, skip iframe creation.
            if (_systemConfig.activeAdProviderKey && _runtimeState.creativeCache.has(promoType) && _runtimeState.creativeCache.get(promoType) === '') {
                _runtimeState.creativeCache.delete(promoType); // Remove empty creative from cache
                this._logWarning(`Creative for "${promoType}" was empty. Not creating an iframe.`);
                return false;
            }

            // Create the new iframe element with default attributes and styles.
            const newIframe = _createDomElement('iframe', {
                id: frameIdentifier,
                name: frameIdentifier,
                src: _systemConfig.embeddedFrameSource,
                scrolling: 'no',
                seamless: 'seamless', // HTML5 for borderless frames
                frameborder: '0', // For compatibility with older browsers (e.g., IE)
                allowtransparency: 'true' // For compatibility with older browsers (e.g., IE)
            }, {
                border: '0px',
                width: '0', // Initial zero dimensions
                height: '0',
                display: 'block' // Ensure iframe itself is block-level
            });

            // Retrieve and set custom width/height from the container's attributes.
            const initialWidth = containerElement.getAttribute(_systemConfig.widthAttributeKey);
            const initialHeight = containerElement.getAttribute(_systemConfig.heightAttributeKey);
            this.setFrameDimensions(newIframe, parseInt(initialWidth, 10) || 0, parseInt(initialHeight, 10) || 0);

            // Store promotion-specific data in the iframe's dataset.
            newIframe.dataset.promoType = promoType;
            newIframe.dataset.loadStartTime = new Date().getTime(); // Timestamp for analytics

            if (_systemConfig.activeAdProviderKey) {
                newIframe.dataset.promoCreative = _runtimeState.creativeCache.get(promoType) || '';
                _runtimeState.creativeCache.delete(promoType); // Consume the creative from cache
            } else {
                newIframe.dataset.promoScriptUrl = _runtimeState.scriptUrls.get(promoType) || '';
            }

            containerElement.appendChild(newIframe);
            return true;
        },

        /**
         * Requests ad creative content from the currently configured ad provider.
         * This typically involves making a JSONP call.
         * @param {string[]} requestedUnits - An array of ad types for which creatives are needed.
         */
        _requestCreativeContent: function(requestedUnits) {
            if (!requestedUnits || requestedUnits.length === 0) {
                this._logWarning('No units requested for creative content retrieval.');
                this._finalizePromotionHandling(requestedUnits); // Proceed without creatives
                return;
            }
            if (!_systemConfig.activeAdProviderKey || !_systemConfig.providerIntegrations[_systemConfig.activeAdProviderKey]) {
                this._logWarning('No active ad provider configured or provider settings are missing. Skipping creative request.');
                this._finalizePromotionHandling(requestedUnits); // Proceed without creatives
                return;
            }

            const currentProvider = _systemConfig.providerIntegrations[_systemConfig.activeAdProviderKey];
            // Filter for units whose creatives are not already in the cache.
            const unitsToFetch = requestedUnits.filter(type => !_runtimeState.creativeCache.has(type));

            if (unitsToFetch.length > 0) {
                const creativeRequestUrl = currentProvider.generateRequestUrl(this, unitsToFetch);
                if (creativeRequestUrl) {
                    this._executeJsonpRequest(
                        creativeRequestUrl,
                        currentProvider.processResponseCallback(this, requestedUnits)
                    );
                } else {
                    this._logWarning('Failed to generate a valid request URL for ad creatives. JSONP request aborted.');
                    this._finalizePromotionHandling(requestedUnits);
                }
            } else {
                this._finalizePromotionHandling(requestedUnits); // All creatives are already cached.
            }
        },

        /**
         * Prepares script-based promotions by ensuring their URLs include cache-busting parameters,
         * then proceeds to embed them.
         * @param {string[]} unitsToPrepare - An array of ad types for script-based promotions.
         */
        _prepareScriptBasedPromotions: function(unitsToPrepare) {
            if (!unitsToPrepare || unitsToPrepare.length === 0) {
                this._logWarning('No units provided for script-based promotion preparation.');
                return;
            }
            this._refreshScriptRandomizers(); // Add or update random parameters in URLs
            this._embedProcessedPromotions(unitsToPrepare);
        },

        /**
         * Finalizes the promotion handling process after creatives/scripts are ready.
         * Manages interstitial logic and triggers the final ad embedding.
         * @param {string[]} allRequestedUnits - All original ad types requested for rendering.
         */
        _finalizePromotionHandling: function(allRequestedUnits) {
            if (!Array.isArray(allRequestedUnits) || allRequestedUnits.length === 0) {
                this._logWarning('No units provided to finalize promotion handling.');
                return;
            }

            if (_runtimeState.activeInterstitialType) {
                // If an interstitial is designated, separate it from other ads.
                const nonInterstitialUnits = allRequestedUnits.filter(unit => unit !== _runtimeState.activeInterstitialType);

                // Define a function to render the remaining ads after the interstitial is dismissed.
                _runtimeState.deferredRenderFunction = () => {
                    if (nonInterstitialUnits.length > 0) {
                        this._embedProcessedPromotions(nonInterstitialUnits);
                    } else {
                        this._logWarning('No non-interstitial promotions to render after dismissal.');
                    }
                };

                // Immediately embed and display only the interstitial ad.
                this._embedProcessedPromotions([_runtimeState.activeInterstitialType]);
                _runtimeState.activeInterstitialType = null; // Mark interstitial as handled for this cycle

                this.presentInterstitial(); // Show the interstitial overlay
            } else {
                // If no interstitial, embed all requested ads directly.
                this._embedProcessedPromotions(allRequestedUnits);
            }
        },

        /**
         * Updates or adds random cache-busting numbers to all configured script-based ad URLs.
         * This helps ensure fresh ad content is loaded on each request.
         */
        _refreshScriptRandomizers: function() {
            // Initialize or increment the random seed.
            if (_runtimeState.currentRandomSeed === 0) {
                _runtimeState.currentRandomSeed = Math.floor(Math.random() * (10 ** _systemConfig.urlRandomizerLength));
            } else {
                _runtimeState.currentRandomSeed++;
            }

            const randomQueryKey = 'promo-rand';
            const newRandomValue = `${randomQueryKey}=${_runtimeState.currentRandomSeed}`;
            // Regular expression to find existing randomizer parameters.
            const randomSearchPattern = new RegExp(`${randomQueryKey}=\\d{${_systemConfig.urlRandomizerLength}}`, 'g');

            _runtimeState.scriptUrls.forEach((url, adType) => {
                let updatedUrl = url;
                const existingRandomMatch = url.match(randomSearchPattern);

                if (existingRandomMatch) {
                    updatedUrl = url.replace(existingRandomMatch[0], newRandomValue);
                } else {
                    // If no randomizer exists, add it using the URL API for robustness.
                    try {
                        const urlObject = new URL(url, window.location.origin);
                        urlObject.searchParams.set(randomQueryKey, _runtimeState.currentRandomSeed);
                        updatedUrl = urlObject.toString();
                    } catch (e) {
                        this._logWarning(`Failed to parse or update URL "${url}" for randomizer: ${e.message}`);
                        // Fallback to simple append if URL parsing fails.
                        updatedUrl += (url.includes('?') ? '&' : '?') + newRandomValue;
                    }
                }
                _runtimeState.scriptUrls.set(adType, updatedUrl);
            });
        },

        /**
         * Executes a JSONP (JSON with Padding) request to fetch data from a cross-domain URL.
         * @param {string} requestUrl - The URL for the JSONP request, which must contain '=?'.
         * @param {Function} successCallback - The function to call with the JSON response data.
         */
        _executeJsonpRequest: function(requestUrl, successCallback) {
            if (!requestUrl || typeof requestUrl !== 'string' || !requestUrl.includes('=?')) {
                this._logWarning('Invalid JSONP request URL provided. It must contain "=?".');
                return;
            }
            if (typeof successCallback !== 'function') {
                this._logWarning('JSONP success callback must be a function.');
                return;
            }

            const uniqueCallbackId = `cb${_runtimeState.jsonpGlobalCallbackCounter++}`;
            const globalHandlerFunctionName = `${_systemConfig.jsonpCallbackPrefix}handler`;

            // Register the specific success callback with its unique ID.
            _jsonpCallbackRegistry.set(uniqueCallbackId, successCallback);

            // Replace the 'callback=?' in the URL with the global handler and unique ID.
            const scriptSource = requestUrl.replace('callback=?', `callback=${globalHandlerFunctionName}&cbid=${uniqueCallbackId}`);

            const jsonpScriptElement = _createDomElement('script', { src: scriptSource });
            document.head.appendChild(jsonpScriptElement);

            // Implement a timeout for JSONP requests to prevent indefinite waiting.
            const timeoutDuration = 15000; // 15 seconds
            const timeoutReference = setTimeout(() => {
                if (_jsonpCallbackRegistry.has(uniqueCallbackId)) {
                    this._logWarning(`JSONP request for "${requestUrl}" timed out.`);
                    _jsonpCallbackRegistry.delete(uniqueCallbackId); // Clean up the callback
                    jsonpScriptElement.remove(); // Remove the script element from DOM
                }
            }, timeoutDuration);

            // Clean up the script element once it has loaded/executed or failed.
            jsonpScriptElement.onload = jsonpScriptElement.onerror = () => {
                clearTimeout(timeoutReference); // Clear the timeout if script loads/errors before timeout
                jsonpScriptElement.remove(); // Remove the script element from DOM
            };
        },

        /**
         * Logs a warning message to the browser's console, if available.
         * @param {string} message - The warning message to log.
         */
        _logWarning: function(message) {
            if (window.console && console.warn) {
                console.warn(`[PromotionEngine Warning] ${message}`);
            }
        },

        // Expose internal state and configuration for debugging or advanced external interaction.
        _runtimeState: _runtimeState,
        _systemConfig: _systemConfig
    };

    return PromotionEngine;
})();