CandyPromotions = {
    // CSS class for the primary promotional container element
    promoBoxStyleClass: 'candy-promo-container',
    // Prefix for the DOM ID of promotional container elements
    promoBoxIdPre: 'candy-promo-slot-',
    // Suffix for the ID of the iframe within a promo container
    promoFrameIdSuff: '-inner-frame',
    // Data attribute name for the desired width of the promotional element
    promoBoxWidthAttr: 'data-candy-promo-width',
    // Data attribute name for the desired height of the promotional element
    promoBoxHeightAttr: 'data-candy-promo-height',
    // Boolean flag indicating if analytics tracking is active
    trackingEnabled: false,
    // URL for the default content of the friendly iframe
    frameContentUrl: '/candy_content.html?v2',
    // Length of the random number string appended to URLs for cache busting
    urlNonceLen: 18,
    // The current random number value used for URL nonces
    urlNonceVal: 0,
    // Object holding data parameters for ad server requests
    promoSrvData: {},
    // Cache for pre-fetched promotional creative content
    promoContent: {},
    // Store for direct JavaScript URLs for promotions
    promoScriptUrls: {},
    // ID for the full-screen interstitial overlay element
    introOverlayElementId: 'candy-interstitial-overlay',
    // CSS class to apply to the HTML root element when an interstitial is active
    introPageClass: 'candy-interstitial-active',
    // Duration in milliseconds before the interstitial automatically closes
    introDurationMs: 15000,
    // Stores the type of interstitial currently being displayed, or false if none
    introPromoType: false,
    // The currently selected promotional content provider
    promoProvider: false,
    // Configuration object for different promotional content providers
    promoProviders: {
        // Implementation for IGN's ad wrapper service
        ignPromoWrapper: {
            // Generates the request URL for fetching promos from IGN's wrapper
            fetchUrl: function (systemObj, desiredPromos) {
                var resourceInfo = systemObj.promoSrvData; // Access stored promotional data
                var targetUrl = 'http://wrapper.ign.com/services/ads/pagetype/'+resourceInfo.pagetype+'/sizes/'+desiredPromos.toString()+'.js?callback=?'; // Construct base URL

                // Incorporate 'special' parameters found in the current page's query string
                var currentDocLoc = document.location; // Get current page's location object
                if (currentDocLoc.search.indexOf('special') !== -1) { // Check if 'special' exists in query
                    var queryParameters = currentDocLoc.search.substr(1).split('&'); // Parse query string
                    for (var i = 0, paramCount = queryParameters.length; i < paramCount; i++) { // Loop through parameters
                        if (queryParameters[i].indexOf('special') !== -1) { // If parameter is a 'special' one
                            targetUrl += '&'+queryParameters[i]; // Append it to the ad request URL
                        }
                    }
                }

                // Add all other relevant data from promoSrvData to the URL
                for (var singleParam in resourceInfo) { // Iterate over data properties
                    // 'pagetype' is already part of the URL path, so skip it here
                    if (singleParam === 'pagetype') {
                        continue;
                    }
                    var paramValue = resourceInfo[singleParam]; // Get the value for the current parameter
                    // If the value is an array, encode and append each element
                    if (systemObj._isCollection(paramValue)) {
                        for (var j = 0, valueCount = paramValue.length; j < valueCount; j++) {
                            targetUrl += '&'+singleParam+'='+encodeURIComponent(paramValue[j]);
                        }
                    } else {
                        // Otherwise, encode and append the single value
                        targetUrl += '&'+singleParam+'='+encodeURIComponent(paramValue);
                    }
                }

                // Include the document referrer if it's available
                var refererString = document.referrer;
                if (refererString !== '') {
                    targetUrl += '&r='+encodeURIComponent(refererString);
                }
                return targetUrl;
            },
            // Callback handler for the JSONP response from IGN's wrapper
            jsonpProcessor: function (systemObj, promosToDisplay) {
                return function (jsonResponse) {
                    var introSize = 'prestitial'; // Identifier for a prestitial ad
                    // Populate the promoContent cache with the creatives received in the JSON response
                    for (var k = 0, responseLen = jsonResponse.length; k < responseLen; k++) {
                        // Determine if the current ad is an interstitial type
                        if (jsonResponse[k].size.slice(-7) === 'stitial') { // Use slice for substring from end
                            if (jsonResponse[k].trackImpression === false) {
                                // This is a valid interstitial ad
                                systemObj.introPromoType = introSize;
                                systemObj.promoContent[introSize] = jsonResponse[k].promoCreative;
                            } else {
                                // An interstitial that should not be displayed (e.g., empty or placeholder)
                                systemObj.promoContent[introSize] = '';
                            }
                        } else {
                            // Store regular ad creatives by their size/type
                            systemObj.promoContent[jsonResponse[k].size] = jsonResponse[k].promoCreative;
                        }
                    }
                    systemObj._handleFetchedPromos(promosToDisplay); // Continue processing after creatives are cached
                };
            }
        },
        // Placeholder for Google Ad Manager (DFP) integration
        googleAdManager: {
            // TODO: Implement the URL generation logic for DFP
            fetchUrl: function (desiredPromos, resourceInfo) {
                return 'http://example.com/ads/'+desiredPromos.toString()+'.jsonp';
            },
            // TODO: Implement the JSONP callback processing for DFP
            jsonpProcessor: function (systemObj, promosToDisplay) {
                return function (jsonResponse) {
                    // Logic to populate systemObj.promoContent with DFP creatives
                };
            }
        }
    },

    // Initiates the rendering process for a given set of promotions
    displayPromotions: function (itemsToPresent) {
        // Normalize input: if a single string is provided, convert it to an array
        if (typeof itemsToPresent === 'string') {
            itemsToPresent = new Array(itemsToPresent);
        }

        // Decide whether to fetch creatives from an ad server or use direct script URLs
        if (this.promoProvider !== false) {
            this._presentPromoContent(itemsToPresent); // Render using cached creative content
        } else {
            this._presentPromoScripts(itemsToPresent); // Render using direct JavaScript URLs
        }
    },

    // Displays the full-screen interstitial/prestitial overlay
    openIntroScreen: function () {
        // Add a specific CSS class to the HTML element to enable full-page styling for the overlay
        // This helps manage z-index and hide elements like Flash that might interfere
        var docRootElement = document.getElementsByTagName('html')[0];
        var introOverlayEl = document.getElementById(this.introOverlayElementId);
        docRootElement.className = this.introPageClass; // Apply the class
        introOverlayEl.style.display = 'block'; // Make the overlay visible

        // Set a timer to automatically dismiss the interstitial after a set duration
        this.introTimerHandle = setTimeout(
            (function(moduleRef) { // Use a closure to maintain 'this' context
                return function() { moduleRef.closeIntroScreen(); };
            })(this),
            this.introDurationMs
        );
    },

    // Hides the full-screen interstitial/prestitial overlay
    closeIntroScreen: function () {
        // Clear any active auto-dismiss timer, in case the interstitial was closed manually
        clearTimeout(this.introTimerHandle);

        // Remove the special styling applied to the page's HTML element
        var docRootElement = document.getElementsByTagName('html')[0];
        var introOverlayEl = document.getElementById(this.introOverlayElementId);
        docRootElement.className = ''; // Remove the class
        introOverlayEl.style.display = 'none'; // Hide the overlay element

        // Trigger the rendering of any promotions that were deferred until the interstitial closed
        this.delayedPromoDisplay();
    },

    // Placeholder function for rendering promotions after an interstitial has been dismissed
    delayedPromoDisplay: function () {
        // This function's implementation is dynamically assigned when an interstitial is present
    },

    // Sets custom width and height properties on a friendly iframe element
    setFrameDimensions: function (targetFrame, newWidth, newHeight) {
        if (typeof newWidth === 'number') targetFrame.frameWidth = newWidth;
        if (typeof newHeight === 'number') targetFrame.frameHeight = newHeight;
    },

    // Callback function executed when a friendly iframe has completed loading
    frameLoadedHandler: function (childFrameWin) {
        var loadCompleteTime = new Date().getTime(); // Capture the timestamp of load completion
        if (this.trackingEnabled) { // If analytics tracking is enabled
            _trackerQueue.push([ // Send data to the analytics queue
                '_recordEvent',
                'Candy Promotions', // Event category
                childFrameWin.frameElement.promoKind, // Type of promotion
                childFrameWin.frameElement.promoScriptUrl, // URL of the promotion script
                loadCompleteTime - childFrameWin.moduleStartTime // Time taken for load
            ]);
        }
        this._formatPromoContainer(childFrameWin); // Adjust the styling of the promotion's parent container
    },

    // Internal method to style the parent container of a promotional iframe
    _formatPromoContainer: function (childFrameWin) {
        var targetFrame = childFrameWin.frameElement; // Reference to the iframe element

        // If the iframe indicates no content (zero width and height) and its parent is currently visible, hide the parent.
        // This prevents visual layout shifts caused by empty ad slots.
        if (targetFrame.frameWidth === 0
            && targetFrame.frameHeight === 0
            && targetFrame.parentNode.style.display !== 'none') {
            targetFrame.parentNode.style.display = 'none'; // Hide the parent element
        } else {
            // Set dimensions on the iframe itself, then on its parent container.
            // This order is critical to prevent layout bouncing when iframes are dynamically updated.
            targetFrame.style.cssText += ';width:'+targetFrame.frameWidth+'px;height:'+targetFrame.frameHeight+'px;';
            // Ensure the parent container is visible and set its width, allowing height to adjust automatically
            targetFrame.parentNode.style.cssText = 'width:'+targetFrame.frameWidth+'px;height:auto;display:block;';
        }
    },

    // Internal method to iterate through promo categories and insert them into the DOM
    _deployPromotions: function (promoCategories) {
        for (var i = 0, categoryCount = promoCategories.length; i < categoryCount; i++) {
            var currentCategory = promoCategories[i]; // Get the current promotion category

            // If no ad server is configured and a script URL is missing for this category, log a warning
            if (this.promoProvider === false && !(currentCategory in this.promoScriptUrls)) {
                this._logWarning('Failed to render candy promotion. No script URL has been defined for category "'+currentCategory+'".');
                continue; // Skip to the next category
            }
            // If an ad server is configured and creative content is missing, log a warning
            if (this.promoProvider !== false && !(currentCategory in this.promoContent)) {
                this._logWarning('Failed to render candy promotion. No creative content has been defined for category "'+currentCategory+'".');
                continue; // Skip to the next category
            }
            // Proceed to create and insert the friendly iframe for the promotion
            this._buildAndInsertFrame(currentCategory);
        }
    },

    // Internal method to create and append a friendly iframe into a promotional container
    _buildAndInsertFrame: function (promoKind) {
        var promoBoxDomId = this.promoBoxIdPre+promoKind; // Construct the full DOM ID for the target container
        var promoContainer = document.getElementById(promoBoxDomId); // Retrieve the container element
        if (typeof promoContainer === 'undefined' || promoContainer === null) {
            this._logWarning('Failed to render candy promotion. No DOM element with ID "'+promoBoxDomId+'" exists.');
            return false; // Abort if the container is not found
        }

        // Before clearing content, save the height of any existing iframe to prevent layout shifts
        var existingPromoFrame = document.getElementById(promoBoxDomId+this.promoFrameIdSuff);
        if (typeof existingPromoFrame !== 'undefined' && existingPromoFrame !== null
            && typeof existingPromoFrame.frameHeight !== 'undefined' && existingPromoFrame.frameHeight !== null) {
            promoContainer.style.height = existingPromoFrame.frameHeight+'px'; // Apply previous height to container
        }

        // Clear all existing content within the promotional container
        promoContainer.innerHTML = '';

        // If an ad server is in use and the creative for this promo is empty, do not create an iframe
        if (this.promoProvider !== false && this.promoContent[promoKind] === '') {
            // Also, remove the empty creative from the cache to ensure it's not reused
            delete this.promoContent[promoKind];
            return;
        }

        // Create the new iframe element
        var promoFrameId = promoBoxDomId+this.promoFrameIdSuff;
        var newFrame = document.createElement('iframe');
        newFrame.id = promoFrameId; // Set the iframe's ID
        newFrame.name = promoFrameId; // Set the iframe's name (important for some operations)
        newFrame.src = this.frameContentUrl; // Set the URL for the iframe's content
        newFrame.style.border = '0px'; // Remove default border styling
        newFrame.width = 0; // Initialize width to 0
        newFrame.height = 0; // Initialize height to 0
        newFrame.scrolling = 'no'; // Disable scrollbars
        newFrame.seamless = 'seamless'; // HTML5 attribute for seamless integration
        // Assign custom properties for width and height based on data attributes from the container
        newFrame.frameWidth = promoContainer.getAttribute(this.promoBoxWidthAttr);
        newFrame.frameHeight = promoContainer.getAttribute(this.promoBoxHeightAttr);
        newFrame.promoKind = promoKind; // Store the promotion category as a custom property
        if (this.promoProvider !== false) {
            newFrame.promoCreative = this.promoContent[promoKind]; // Store the creative content directly
            // Remove the creative from cache after use
            delete this.promoContent[promoKind];
        } else {
            newFrame.promoScriptUrl = this.promoScriptUrls[promoKind]; // Store the JavaScript URL
        }
        // Apply Internet Explorer-specific styling adjustments
        if (navigator.userAgent.indexOf("MSIE") !== -1) {
            newFrame.frameBorder = '0'; // IE-specific way to remove border
            newFrame.allowTransparency = 'true'; // IE-specific transparency setting
        }
        // Append the newly created iframe into its designated promotional container
        promoContainer.appendChild(newFrame);
    },

    // Internal method to manage the rendering of promotions that require creative content fetching
    _presentPromoContent: function (promosToDisplay) {
        var promosToRetrieve = []; // Array to hold promo types that need to be fetched
        // Identify which promotions still need their creative content
        for (var i = 0, promoCount = promosToDisplay.length; i < promoCount; i++) {
            if (!(promosToDisplay[i] in this.promoContent)) {
                promosToRetrieve.push(promosToDisplay[i]); // Add to the list of promos to fetch
            }
        }

        // Only initiate a JSONP request if there are promotions that need fetching
        if (promosToRetrieve.length > 0) {
            this._loadJsonp( // Execute the JSONP request
                this.promoProviders[this.promoProvider].fetchUrl(this, promosToRetrieve), // Get the URL from the configured provider
                this.promoProviders[this.promoProvider].jsonpProcessor(this, promosToDisplay) // Get the callback handler from the provider
            );
        } else {
            this._handleFetchedPromos(promosToDisplay); // If all creatives are already available, proceed directly
        }
    },

    // Internal method to handle rendering of promotions that use direct JavaScript URLs
    _presentPromoScripts: function (promosToDisplay) {
        this._updateScriptUrlsWithNonce(); // Apply cache-busting nonces to all script URLs
        this._deployPromotions(promosToDisplay); // Then proceed to deploy the promotions
    },

    // Internal callback function invoked once promotional content (or URLs) is ready
    _handleFetchedPromos: function(promosToDisplay) {
        if (this.introPromoType !== false) {
            // If an interstitial is configured, prepare a callback to render other ads after it's hidden
            var deferredPromos = [];
            for (var i = 0, promoCount = promosToDisplay.length; i < promoCount; i++) {
                var currentPromo = promosToDisplay[i];
                // Build a list of promotions to be rendered later, excluding the interstitial itself
                if (currentPromo !== this.introPromoType) {
                    deferredPromos.push(currentPromo);
                }
            }
            // Assign the deferred rendering logic to the dedicated callback property
            this.delayedPromoDisplay = (function (moduleRef) {
                return function () { moduleRef._deployPromotions(deferredPromos); };
            })(this);

            // Immediately deploy only the interstitial promotion
            this._deployPromotions([this.introPromoType]);
            // Reset the interstitial type to prevent it from being processed again
            this.introPromoType = false;

            // Finally, display the interstitial overlay to the user
            this.openIntroScreen();
        } else {
            // If no interstitial is involved, simply render all promotions directly
            this._deployPromotions(promosToDisplay);
        }
    },

    // Internal method to add a unique random number (nonce) to promotional JavaScript URLs
    // This helps in cache busting for ad refreshes
    _updateScriptUrlsWithNonce: function () {
        if (this.urlNonceVal === 0) {
            this.urlNonceVal = Math.floor(Math.random()*Math.pow(10, this.urlNonceLen)); // Generate an initial random nonce
        } else {
            this.urlNonceVal++; // Increment the nonce for subsequent requests
        }
        var nonceQueryKey = 'candy-nonce'; // The query parameter key for the nonce
        var newNonceParam = nonceQueryKey + '=' + this.urlNonceVal; // The new nonce parameter string
        var regexPattern = new RegExp(nonceQueryKey + '=\\d{' + this.urlNonceLen + '}', 'g'); // Regex to find an existing nonce parameter

        for (promoKind in this.promoScriptUrls) { // Iterate through all stored promotional script URLs
            var scriptUrl = this.promoScriptUrls[promoKind];
            var foundMatches = scriptUrl.match(regexPattern); // Search for an existing nonce in the URL
            // If a nonce parameter is already present in the URL
            if (foundMatches !== null) {
                this.promoScriptUrls[promoKind] = scriptUrl.replace(foundMatches[0], newNonceParam); // Replace it with the new nonce
            } else {
                // If no nonce is found, add it to the URL
                var questionMarkIndex = scriptUrl.search(/\?/); // Find the position of the first '?'
                // If a query string already exists, insert the nonce at its beginning
                if (questionMarkIndex !== -1) {
                    this.promoScriptUrls[promoKind] = scriptUrl.replace('?', '?' + newNonceParam + '&');
                } else {
                    // Otherwise, append the nonce to the end of the URL
                    this.promoScriptUrls[promoKind] = scriptUrl.replace(/&*$/, '&' + newNonceParam);
                }
            }
        }
    },

    // Internal utility method for performing JSONP requests
    _loadJsonp: function(requestUrl, responseHandler) {
        // Validate that the URL contains the JSONP callback placeholder
        if (requestUrl.indexOf('=?') === -1) {
            this._logWarning('The candy jsonp request URL must specify the callback placeholder, e.g., "callback=?".');
            return;
        }
        // Validate that a valid function is provided as the response handler
        if (typeof responseHandler !== 'function') {
            this._logWarning('The candy jsonp response handler must be a function.');
            return;
        }
        var generatedFuncName = 'jsonp'+Math.floor(Math.random()*10000000000); // Generate a unique, temporary global function name

        // Define the temporary global callback function that the JSONP script will invoke
        // This function will then execute the provided responseHandler and attempt to clean itself up
        window[generatedFuncName] = function(jsonPayload) {
            responseHandler(jsonPayload); // Call the actual response handler
            // Attempt to remove the dynamically created global function
            try {
                delete window[generatedFuncName]; // Standard way for modern browsers
            } catch(e) {
                window[generatedFuncName] = undefined; // Fallback for environments (like IE) that prevent deleting window properties
            }
        };

        // Create a script element to fetch the external JSONP resource
        var scriptElement = document.createElement('script');
        scriptElement.src = requestUrl.split('=?').join('='+generatedFuncName); // Replace the placeholder with the actual function name
        document.getElementsByTagName('head')[0].appendChild(scriptElement); // Insert the script into the document's head
    },

    // Internal utility method to check if a given variable is an array
    _isCollection: function (inputVar) {
      return Object.prototype.toString.call(inputVar) === '[object Array]';
    },

    // Internal utility method for logging warning messages to the browser console
    _logWarning: function (messageText) {
        if (window.console && console.warn) { // Check if console.warn is available
            console.warn(messageText); // Output the warning message
        }
    }
}