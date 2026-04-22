/*!
 * Navigation API JavaScript Utility v4.2.0
 *
 * Compatibility: IE8+, FF3+, Opera 9+, Safari, Chrome and others
 *
 * Copyright 2011-2014, D. Pakhtinov ( spb.piksel@gmail.com )
 *
 * http://spb-piksel.ru/
 *
 * Released under dual MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Last Modified: 2014-11-06 21:35
 */
(function(moduleLoader) {
    if (typeof define === 'function' && define['amd']) {
        // https://github.com/devote/HTML5-History-API/issues/57#issuecomment-43133600
        define(typeof document !== "object" || document.readyState !== "loading" ? [] : "html5-history-api", moduleLoader);
    } else {
        moduleLoader();
    }
})(function() {
    // Define application context object
    var appCtx = (typeof window === 'object' ? window : this) || {};
    // Halt execution if window.history is absent or if the utility is already loaded
    if (!appCtx.history || "emulate" in appCtx.history) return appCtx.history;
    // Reference to the document object
    var pageDoc = appCtx.document;
    // Reference to the main HTML element
    var rootElement = pageDoc.documentElement;
    // Reference to the base Object constructor
    var baseObj = appCtx['Object'];
    // Reference to the JSON utility object
    var jsonUtil = appCtx['JSON'];
    // Reference to the native Location object instance
    var currentLoc = appCtx.location;
    // Reference to the native History object instance
    var nativeHist = appCtx.history;
    // New instance of 'History'. Defaults to the original object instance
    var histMgr = nativeHist;
    // Reference to the native 'history.pushState' method
    var pushHistEntry = nativeHist.pushState;
    // Reference to the native 'history.replaceState' method
    var replaceHistEntry = nativeHist.replaceState;
    // Flag indicating HTML5 History API support
    var supportsHistAPI = !!pushHistEntry;
    // Verifies the presence of a 'state' object in the History interface
    var hasHistStateObj = 'state' in nativeHist;
    // Reference to 'Object.defineProperty' method
    var defineObjProp = baseObj.defineProperty;
    // New instance of 'Location'; for IE8, uses an HTMLAnchorElement instead of a plain object
    var locProxy = reconfigureProperty({}, 't') ? {} : pageDoc.createElement('a');
    // Prefix for event names
    var evtPrefix = '';
    // String holding the name of the method to add event listeners
    var addListenerMeth = appCtx.addEventListener ? 'addEventListener' : (evtPrefix = 'on') && 'attachEvent';
    // String holding the name of the method to remove event listeners
    var removeListenerMeth = appCtx.removeEventListener ? 'removeEventListener' : 'detachEvent';
    // String holding the name of the method to dispatch events
    var dispatchEvtMeth = appCtx.dispatchEvent ? 'dispatchEvent' : 'fireEvent';
    // References to native event methods
    var attachEvt = appCtx[addListenerMeth];
    var detachEvt = appCtx[removeListenerMeth];
    var triggerEvt = appCtx[dispatchEvtMeth];
    // Default configuration options
    var configOpts = {"basePath": '/', "enableRedirect": 0, "pathType": '/', "initialize": 0};
    // Key for session cache storage
    var sessionCacheKey = '__navAPI__';
    // Anchor Element used for URL parsing
    var urlParserLink = pageDoc.createElement('a');
    // Last known URL before a change
    var previousURL = currentLoc.href;
    // Control URL to address an Opera bug
    var popStateURLCheck = '';
    // Flag to fix Safari 8 event triggering
    var triggerWinEvts = 1;
    // Flag to trigger 'onpopstate' event on initial page load
    var fireInitialState = false;
    // Flag indicating if history.location is being used by external code
    var locationOverrideFlag = 0;
    // Storage for 'state' objects within the current session
    var stateCache = {};
    // Object to store custom event handlers
    var customHandlers = {};
    // Stores the last document title
    var prevDocTitle = pageDoc.title;

    /**
     * Properties within the global 'window' object that will be overridden
     * to prevent conflicts with the library's functionality.
     *
     * @type {Object}
     */
    var eventHandlers = {
        "onHashChange": null,
        "onPopState": null
    };

    /**
     * Workaround for Chrome on iOS.
     * See https://github.com/devote/HTML5-History-API/issues/29
     */
    var chromeQuickFix = function(originalFunc, funcArgs) {
        var fixRequired = appCtx.history !== nativeHist;
        if (fixRequired) {
            appCtx.history = nativeHist;
        }
        originalFunc.apply(nativeHist, funcArgs);
        if (fixRequired) {
            appCtx.history = histMgr;
        }
    };

    /**
     * Properties that will be replaced or added to the
     * 'window.history' object, including the 'history.location'
     * object, for comprehensive URL management.
     *
     * @type {Object}
     */
    var historyExtensions = {
        /**
         * Configures library initialization settings.
         *
         * @param {null|String} [basePath] The base path for the site; defaults to "/".
         * @param {null|String} [pathType] String to substitute after the anchor; defaults to "/".
         * @param {null|Boolean} [enableRedirect] Activates URL redirection.
         */
        "configure": function(basePath, pathType, enableRedirect) {
            configOpts["basePath"] = ('' + (basePath == null ? configOpts["basePath"] : basePath))
                .replace(/(?:^|\/)[^\/]*$/, '/');
            configOpts["pathType"] = pathType == null ? configOpts["pathType"] : pathType;
            configOpts["enableRedirect"] = enableRedirect == null ? configOpts["enableRedirect"] : !!enableRedirect;
        },
        /**
         * @namespace history
         * @param {String} [pathType]
         * @param {String} [basePath]
         */
        "redirect": function(pathType, basePath) {
            histMgr['configure'](basePath, pathType);
            basePath = configOpts["basePath"];
            if (appCtx.top == appCtx.self) {
                var relativeURI = parseWebAddress(null, false, true)._relative;
                var currentPath = currentLoc.pathname + currentLoc.search;
                if (supportsHistAPI) {
                    currentPath = currentPath.replace(/([^\/])$/, '$1/');
                    if (relativeURI != basePath && (new RegExp("^" + basePath + "$", "i")).test(currentPath)) {
                        currentLoc.replace(relativeURI);
                    }
                } else if (currentPath != basePath) {
                    currentPath = currentPath.replace(/([^\/])\?/, '$1/?');
                    if ((new RegExp("^" + basePath, "i")).test(currentPath)) {
                        currentLoc.replace(basePath + '#' + currentPath.
                            replace(new RegExp("^" + basePath, "i"), configOpts["pathType"]) + currentLoc.hash);
                    }
                }
            }
        },
        /**
         * Adds a new state object entry to the history stack.
         *
         * @namespace history
         * @param {Object} stateData
         * @param {string} pageTitle
         * @param {string} [targetURL]
         */
        pushNewState: function(stateData, pageTitle, targetURL) {
            var tempTitle = pageDoc.title;
            if (prevDocTitle != null) {
                pageDoc.title = prevDocTitle;
            }
            pushHistEntry && chromeQuickFix(pushHistEntry, arguments);
            updateState(stateData, targetURL);
            pageDoc.title = tempTitle;
            prevDocTitle = pageTitle;
        },
        /**
         * Updates the state object, title, and optionally the URL
         * of the current entry in the history.
         *
         * @namespace history
         * @param {Object} stateData
         * @param {string} pageTitle
         * @param {string} [targetURL]
         */
        replaceCurrentState: function(stateData, pageTitle, targetURL) {
            var tempTitle = pageDoc.title;
            if (prevDocTitle != null) {
                pageDoc.title = prevDocTitle;
            }
            delete stateCache[currentLoc.href];
            replaceHistEntry && chromeQuickFix(replaceHistEntry, arguments);
            updateState(stateData, targetURL, true);
            pageDoc.title = tempTitle;
            prevDocTitle = pageTitle;
        },
        /**
         * The 'history.location' object mimics 'window.location',
         * though its behavior might differ slightly in HTML4 browsers.
         *
         * @namespace history
         */
        "locationProxy": {
            set: function(newValue) {
                if (locationOverrideFlag === 0) locationOverrideFlag = 1;
                appCtx.location = newValue;
            },
            get: function() {
                if (locationOverrideFlag === 0) locationOverrideFlag = 1;
                return supportsHistAPI ? currentLoc : locProxy;
            }
        },
        /**
         * A state object represents a user interface state.
         *
         * @namespace history
         */
        "currentState": {
            get: function() {
                return stateCache[currentLoc.href] || null;
            }
        }
    };

    /**
     * Properties for the 'history.locationProxy' object.
     * This object resembles 'window.location', but may behave
     * differently in HTML4-only browsers.
     *
     * @type {Object}
     */
    var locationExtensions = {
        /**
         * Navigates to the specified page.
         *
         * @namespace history.locationProxy
         */
        navigate: function(url) {
            if (('' + url).indexOf('#') === 0) {
                updateState(null, url);
            } else {
                currentLoc.assign(url);
            }
        },
        /**
         * Refreshes the current page.
         *
         * @namespace history.locationProxy
         */
        refresh: function() {
            currentLoc.reload();
        },
        /**
         * Removes the current page from session history and
         * navigates to the provided page.
         *
         * @namespace history.locationProxy
         */
        replaceEntry: function(url) {
            if (('' + url).indexOf('#') === 0) {
                updateState(null, url, true);
            } else {
                currentLoc.replace(url);
            }
        },
        /**
         * Returns the current page's full URL.
         *
         * @namespace history.locationProxy
         */
        toURIString: function() {
            return this.fullURI;
        },
        /**
         * Returns the current page's full URL.
         * Can be set to navigate to a different page.
         *
         * @namespace history.locationProxy
         */
        "fullURI": {
            get: function() {
                return parseWebAddress()._href;
            }
        },
        /**
         * Returns the current page's protocol.
         *
         * @namespace history.locationProxy
         */
        "uriProtocol": null,
        /**
         * Returns the current page's host and port number.
         *
         * @namespace history.locationProxy
         */
        "uriHost": null,
        /**
         * Returns the current page's host.
         *
         * @namespace history.locationProxy
         */
        "hostName": null,
        /**
         * Returns the current page's port number.
         *
         * @namespace history.locationProxy
         */
        "hostPort": null,
        /**
         * Returns only the current page's path.
         *
         * @namespace history.locationProxy
         */
        "pathSegment": {
            get: function() {
                return parseWebAddress()._pathname;
            }
        },
        /**
         * Returns the current page's query string,
         * starting with '?' and ending before '#'.
         *
         * @namespace history.locationProxy
         */
        "querySegment": {
            get: function() {
                return parseWebAddress()._search;
            }
        },
        /**
         * Returns the current page's hash string,
         * starting with '#' and extending to the end of the line.
         *
         * @namespace history.locationProxy
         */
        "hashSegment": {
            set: function(newValue) {
                updateState(null, ('' + newValue).replace(/^(#|)/, '#'), false, previousURL);
            },
            get: function() {
                return parseWebAddress()._hash;
            }
        }
    };

    /**
     * A utility no-op function.
     *
     * @return {void}
     */
    function noOperation() {
        // placeholder
    }

    /**
     * Prepares parts of a given or current URL for use within the library.
     *
     * @param {string} [inputURI] The URL string to parse.
     * @param {boolean} [isWinLoc] Indicates if the input is from window.location.
     * @param {boolean} [notAPI] Indicates if History API is not to be used for parsing.
     * @return {Object} An object containing parsed URL components.
     */
    function parseWebAddress(inputURI, isWinLoc, notAPI) {
        var urlRegex = /(?:(\w+\:))?(?:\/\/(?:[^@]*@)?([^\/:\?#]+)(?::([0-9]+))?)?([^\?#]*)(?:(\?[^#]+)|\?)?(?:(#.*))?/;
        if (inputURI != null && inputURI !== '' && !isWinLoc) {
            var currentParsed = parseWebAddress(),
                baseTag = pageDoc.getElementsByTagName('base')[0];
            if (!notAPI && baseTag && baseTag.getAttribute('href')) {
              // Fix for IE ignoring relative base tags.
              // See http://stackoverflow.com/questions/3926197/html-base-tag-and-local-folder-path-with-internet-explorer
              baseTag.href = baseTag.href;
              currentParsed = parseWebAddress(baseTag.href, null, true);
            }
            var parsedPathname = currentParsed._pathname, parsedProtocol = currentParsed._protocol;
            // Convert to string type
            inputURI = '' + inputURI;
            // Convert relative links to absolute
            inputURI = /^(?:\w+\:)?\/\//.test(inputURI) ? inputURI.indexOf("/") === 0
                ? parsedProtocol + inputURI : inputURI : parsedProtocol + "//" + currentParsed._host + (
                inputURI.indexOf("/") === 0 ? inputURI : inputURI.indexOf("?") === 0
                    ? parsedPathname + inputURI : inputURI.indexOf("#") === 0
                    ? parsedPathname + currentParsed._search + inputURI : parsedPathname.replace(/[^\/]+$/g, '') + inputURI
                );
        } else {
            inputURI = isWinLoc ? inputURI : currentLoc.href;
            // If current browser does not support History API
            if (!supportsHistAPI || notAPI) {
                // Get hash fragment
                inputURI = inputURI.replace(/^[^#]*/, '') || "#";
                // Form absolute link from hash
                // https://github.com/devote/HTML5-History-API/issues/50
                inputURI = currentLoc.protocol.replace(/:.*$|$/, ':') + '//' + currentLoc.host + configOpts['basePath']
                    + inputURI.replace(new RegExp("^#[\/]?(?:" + configOpts["pathType"] + ")?"), "");
            }
        }
        // Normalize links of the form: /../../
        urlParserLink.href = inputURI;
        // Decompose the link into its constituent parts
        var regexMatch = urlRegex.exec(urlParserLink.href);
        // Host name with port number
        var uriHostPort = regexMatch[2] + (regexMatch[3] ? ':' + regexMatch[3] : '');
        // Path segment
        var uriPath = regexMatch[4] || '/';
        // Query string
        var uriQuery = regexMatch[5] || '';
        // Hash segment
        var uriHash = regexMatch[6] === '#' ? '' : (regexMatch[6] || '');
        // Relative link (no protocol, no host)
        var relativeLink = uriPath + uriQuery + uriHash;
        // Special links for hash-based routing if History API is not supported
        var noHashPath = uriPath.replace(new RegExp("^" + configOpts["basePath"], "i"), configOpts["pathType"]) + uriQuery;
        // Final structured result
        return {
            _href: regexMatch[1] + '//' + uriHostPort + relativeLink,
            _protocol: regexMatch[1],
            _host: uriHostPort,
            _hostname: regexMatch[2],
            _port: regexMatch[3] || '',
            _pathname: uriPath,
            _search: uriQuery,
            _hash: uriHash,
            _relative: relativeLink,
            _noHashPath: noHashPath,
            _special: noHashPath + uriHash
        }
    }

    /**
     * Initializes the storage for custom state objects.
     */
    function cacheSetup() {
        var cacheStore;
        /**
         * sessionStorage can throw an error if cookies are disabled
         * (e.g., Chrome content settings when running inside a Facebook IFrame).
         * See: https://github.com/devote/HTML5-History-API/issues/34
         * And: http://stackoverflow.com/a/12976988/669360
         */
        try {
            cacheStore = appCtx['sessionStorage'];
            cacheStore.setItem(sessionCacheKey + 't', '1');
            cacheStore.removeItem(sessionCacheKey + 't');
        } catch(error) {
            cacheStore = {
                getItem: function(key) {
                    var cookie = pageDoc.cookie.split(key + "=");
                    return cookie.length > 1 && cookie.pop().split(";").shift() || 'null';
                },
                setItem: function(key, value) {
                    var currentStates = {};
                    // Insert current element into cookie
                    if (currentStates[currentLoc.href] = histMgr.currentState) {
                        pageDoc.cookie = key + '=' + jsonUtil.stringify(currentStates);
                    }
                }
            }
        }

        try {
            // Retrieve cache from browser storage
            stateCache = jsonUtil.parse(cacheStore.getItem(sessionCacheKey)) || {};
        } catch(error) {
            stateCache = {};
        }

        // Attach event handler for page unload
        attachEvt(evtPrefix + 'unload', function() {
            // Save current state objects
            cacheStore.setItem(sessionCacheKey, jsonUtil.stringify(stateCache));
        }, false);
    }

    /**
     * This method attempts to override or add properties in the browser.
     * Some browsers restrict overriding certain properties.
     * This function tries to achieve the desired outcome despite such restrictions.
     *
     * @param {Object} targetObj The object where the property will be overridden/added.
     * @param {String} propertyName The name of the property to be modified.
     * @param {Object} [propDescriptor] An object containing set/get property definitions.
     * @param {Function} [onWrapperCreated] Callback function when a wrapper is created.
     * @return {Object|Boolean} Returns the modified object on success, or false on failure.
     */
    function reconfigureProperty(targetObj, propertyName, propDescriptor, onWrapperCreated) {
        var testMode = 0;
        // Test only if descriptor is undefined
        if (!propDescriptor) {
            propDescriptor = {set: noOperation};
            testMode = 1;
        }
        var originalProp = baseObj.getOwnPropertyDescriptor(targetObj, propertyName);
        // Test only if the property exists
        if (testMode && !originalProp) {
            return false;
        }
        var currentDescriptor = {
            "configurable": true,
            "enumerable": true,
            "get": propDescriptor.get || function() {
                return originalProp.get.apply(this, arguments);
            },
            "set": propDescriptor.set || function() {
                return originalProp.set.apply(this, arguments);
            }
        };
        // Check if the property is writable
        if (originalProp && originalProp.writable !== undefined) {
            currentDescriptor.writable = originalProp.writable;
        }
        // Attempt to define the property
        try {
            defineObjProp(targetObj, propertyName, currentDescriptor);
            if (onWrapperCreated) {
                onWrapperCreated(defineObjProp(targetObj, propertyName, currentDescriptor));
            }
        } catch(error) {
            // Fallback for older browsers
            if (targetObj.__defineGetter__) {
                targetObj.__defineGetter__(propertyName, currentDescriptor.get);
                targetObj.__defineSetter__(propertyName, currentDescriptor.set);
                if (onWrapperCreated) {
                    onWrapperCreated(targetObj[propertyName]);
                }
            }
            return false;
        }
        return targetObj;
    }

    /**
     * Updates the browser's history state and URL.
     *
     * @param {Object} newStateObj The state object to associate with the history entry.
     * @param {string} newURL The new URL for the history entry.
     * @param {boolean} [replaceEntry] If true, replaces the current history entry; otherwise, pushes a new one.
     * @param {string} [prevUrl] Previous URL for specific hash handling.
     */
    function updateState(newStateObj, newURL, replaceEntry, prevUrl) {
        var processedURL = parseWebAddress(newURL);
        var activeURL = normalizeUrl(currentLoc.href);
        var activeHash = currentLoc.hash;
        var previousActiveURL = prevUrl || activeURL;

        if (supportsHistAPI) {
            // Store state object
            stateCache[processedURL._href] = newStateObj;

            // Update location object
            for (var key in processedURL) {
                if (processedURL.hasOwnProperty(key)) {
                    locProxy[key.substr(1)] = processedURL[key];
                }
            }

            // Trigger popstate/hashchange events if URL changes
            if (normalizeUrl(locProxy.href) != normalizeUrl(activeURL)) {
                var popStateEvent = createEvent('PopState');
                if (popStateEvent.state = newStateObj) {
                    triggerEvent('popstate', popStateEvent);
                }
            }
            if (locProxy.hash != activeHash) {
                var hashChangeEvent = createEvent('HashChange');
                triggerEvent('hashchange', hashChangeEvent);
            }
            // Update previous URL reference
            previousURL = activeURL;
        } else {
            // Emulate history for older browsers
            if (newURL != null) {
                if (replaceEntry) {
                    currentLoc.replace(processedURL._special);
                } else {
                    currentLoc.assign(processedURL._special);
                }
            } else if (normalizeUrl(previousActiveURL) != normalizeUrl(activeURL)) {
                var activePath = parseWebAddress(activeURL);
                var oldHashValue = activePath._hash;
                var newHashValue = processedURL._hash;
                var hashValChanged = oldHashValue != newHashValue;
                var urlHasChanged = activePath._href != processedURL._href;

                // Trigger popstate event
                var popStateEvent = createEvent('PopState');
                if (popStateEvent.state = newStateObj) {
                    triggerEvent('popstate', popStateEvent);
                }

                // Trigger hashchange event if hash changed
                if (hashValChanged || urlHasChanged) {
                    var hashChangeEvent = createEvent('HashChange');
                    triggerEvent('hashchange', hashChangeEvent);
                }
            }
        }
    }

    /**
     * Handles the 'popstate' event.
     *
     * @param {Event} popEvent The popstate event object.
     */
    function onPopState(popEvent) {
        var eventState = popEvent.state;
        var currentParsedURL = parseWebAddress();
        var currentHref = normalizeUrl(currentLoc.href);
        var targetHref = normalizeUrl(urlParserLink.href);
        var urlChanged = currentHref != previousURL;

        // Restore state object if available
        if (eventState) {
            stateCache[currentParsedURL._href] = eventState;
        }

        // Update document title if applicable
        if (prevDocTitle != null) {
            pageDoc.title = prevDocTitle;
        }

        // Force reload for certain conditions (e.g., Opera bug)
        if (popStateURLCheck && currentHref == targetHref) {
            return;
        }
        popStateURLCheck = currentHref;

        // Trigger hashchange if only the hash changed
        if (urlChanged && currentLoc.hash != parseWebAddress(previousURL)._hash) {
            var hashChangeEvent = createEvent('HashChange');
            triggerEvent('hashchange', hashChangeEvent);
        }

        // Update previous URL
        previousURL = currentHref;

        // If history.location is not being externally managed, apply changes
        if (!locationOverrideFlag) {
            // Update location proxy properties
            for (var key in currentParsedURL) {
                if (currentParsedURL.hasOwnProperty(key)) {
                    locProxy[key.substr(1)] = currentParsedURL[key];
                }
            }
        }
    }

    /**
     * Handles the 'hashchange' event.
     */
    function onHashChange() {
        var currentHref = normalizeUrl(currentLoc.href);
        var currentParsedURL = parseWebAddress();

        // Update document title if applicable
        if (prevDocTitle != null) {
            pageDoc.title = prevDocTitle;
        }

        // If history.location is not being externally managed, apply changes
        if (!locationOverrideFlag) {
            // Update location proxy properties
            for (var key in currentParsedURL) {
                if (currentParsedURL.hasOwnProperty(key)) {
                    locProxy[key.substr(1)] = currentParsedURL[key];
                }
            }
        }

        // Trigger popstate if URL changed significantly (not just hash)
        if (currentHref != previousURL) {
            var popStateEvent = createEvent('PopState');
            triggerEvent('popstate', popStateEvent);
        }

        // Update previous URL
        previousURL = currentHref;
    }

    /**
     * Creates a custom DOM event.
     *
     * @param {string} eventName The name of the event.
     * @param {boolean} [canBubble] Whether the event bubbles.
     * @param {boolean} [canCancel] Whether the event can be cancelled.
     * @param {Object} [eventDetail] Custom data for the event.
     * @return {Event} The created event object.
     */
    function createEvent(eventName, canBubble, canCancel, eventDetail) {
        var customEvt;
        try {
            customEvt = pageDoc.createEvent('HTMLEvents');
            customEvt.initEvent(eventName, canBubble || false, canCancel || false);
        } catch(error) {
            customEvt = pageDoc.createEvent('CustomEvent');
            customEvt.initCustomEvent(eventName, canBubble || false, canCancel || false, eventDetail || null);
        }
        return customEvt;
    }

    /**
     * Normalizes a URL string by removing trailing slashes and hash for comparison.
     *
     * @param {string} inputUrl The URL to normalize.
     * @return {string} The normalized URL.
     */
    function normalizeUrl(inputUrl) {
        return (inputUrl || '').replace(/#$/, '');
    }

    /**
     * Initializes the library's functionality.
     */
    function initialize() {
        // If History API is not supported, initialize storage and redirect
        if (!supportsHistAPI) {
            cacheSetup();
            histMgr.redirect();
        }

        // If History API is supported
        if (supportsHistAPI) {
            // Set up initial state if not already done
            if (!histMgr.currentState) {
                histMgr.replaceCurrentState(null, pageDoc.title, currentLoc.href);
            }
            // Trigger initial popstate event if configured
            if (fireInitialState) {
                onPopState(createEvent('PopState', false, false, histMgr.currentState));
            }
        }

        // Configure event handlers for window
        reconfigureProperty(appCtx, 'onpopstate', {set: function(handler) {
            eventHandlers.onPopState = handler;
        }, get: function() {
            return eventHandlers.onPopState;
        }});
        reconfigureProperty(appCtx, 'onhashchange', {set: function(handler) {
            eventHandlers.onHashChange = handler;
        }, get: function() {
            return eventHandlers.onHashChange;
        }});

        // Attach native event listeners
        attachEvt(evtPrefix + 'popstate', onPopState, false);
        attachEvt(evtPrefix + 'hashchange', onHashChange, false);

        // Override window.history methods and properties
        reconfigureProperty(appCtx, 'history', {set: function(newValue) {
            histMgr = newValue;
        }, get: function() {
            return histMgr;
        }}, function(original) {
            // Copy properties from original history object
            for (var key in original) {
                if (original.hasOwnProperty(key)) {
                    histMgr[key] = original[key];
                }
            }
        });

        // Extend history object with custom descriptors
        for (var key in historyExtensions) {
            if (historyExtensions.hasOwnProperty(key)) {
                reconfigureProperty(histMgr, key, historyExtensions[key]);
            }
        }

        // Extend location proxy object with custom descriptors
        for (var key in locationExtensions) {
            if (locationExtensions.hasOwnProperty(key)) {
                reconfigureProperty(locProxy, key, locationExtensions[key]);
            }
        }
    }

    /**
     * Attaches an event handler to the global object.
     *
     * @param {string} eventName The name of the event.
     * @param {Function} eventHandler The handler function.
     * @param {boolean} [useCaptureFlag] Use capture phase.
     */
    function attachEvent(eventName, eventHandler, useCaptureFlag) {
        if (!customHandlers[eventName]) {
            customHandlers[eventName] = [];
        }
        customHandlers[eventName].push(eventHandler);
        // Also attach to native if available and not a 'popstate' event
        if (appCtx[addListenerMeth] && eventName != 'popstate') {
            attachEvt(eventName, eventHandler, useCaptureFlag || false);
        }
    }

    /**
     * Detaches an event handler from the global object.
     *
     * @param {string} eventName The name of the event.
     * @param {Function} eventHandler The handler function.
     * @param {boolean} [useCaptureFlag] Use capture phase.
     */
    function detachEvent(eventName, eventHandler, useCaptureFlag) {
        if (customHandlers[eventName]) {
            for (var i = 0; i < customHandlers[eventName].length; i++) {
                if (customHandlers[eventName][i] === eventHandler) {
                    customHandlers[eventName].splice(i, 1);
                    break;
                }
            }
        }
        // Also detach from native if available and not a 'popstate' event
        if (appCtx[removeListenerMeth] && eventName != 'popstate') {
            detachEvt(eventName, eventHandler, useCaptureFlag || false);
        }
    }

    /**
     * Triggers a custom event on the global object.
     *
     * @param {string} eventName The name of the event.
     * @param {Object} [eventData] Custom data for the event.
     */
    function triggerEvent(eventName, eventData) {
        var handlerList = customHandlers[eventName];
        // Trigger custom handlers
        if (handlerList) {
            for (var i = 0; i < handlerList.length; i++) {
                handlerList[i].apply(appCtx, [eventData]);
            }
        }
        // Trigger 'on' attributes on window if enabled
        if (triggerWinEvts && typeof eventHandlers[eventName] == 'function') {
            eventHandlers[eventName].apply(appCtx, [eventData]);
        }
        // Dispatch native event if available
        if (appCtx[dispatchEvtMeth]) {
            triggerEvt(evtPrefix + eventName, eventData);
        } else if (appCtx[addListenerMeth]) {
            // Fallback for older browsers
            appCtx[evtPrefix + eventName] = eventData;
        }
    }

    // Initialize the library
    initialize();
});