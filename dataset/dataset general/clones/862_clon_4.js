(function(wndRef, docRef) {

    // Check if polyfill already active using a different global flag
    if (wndRef._historyPolyEmulated_ || !wndRef.history) {
        return wndRef.history;
    }
    wndRef._historyPolyEmulated_ = true; // Mark as active

    // References to native browser objects
    var nativeLocation = wndRef.location;
    var nativeHistory = wndRef.history;
    var nativeObject = wndRef.Object;
    var nativeJSON = wndRef.JSON;
    var nativeDefineProperty = nativeObject.defineProperty;

    // Our custom history object that will be exposed (initially points to native)
    var customHistoryObject = nativeHistory;

    // A temporary anchor element for robust URL parsing, avoiding direct regex for all parts
    var tempLinkElement = docRef.createElement('a');

    // Storage for state objects, mapped by full URL (different name and internal management)
    var stateRecordKeeper = {};

    // Internal event management system (different structure from original)
    var eventDistributor = (function() {
        var eventSubscriptions = {}; // Using an object to store arrays of handlers

        var registerEvent = function(eventName, handler) {
            if (!eventSubscriptions[eventName]) {
                eventSubscriptions[eventName] = [];
            }
            eventSubscriptions[eventName].push(handler);
        };

        var removeEvent = function(eventName, handler) {
            if (eventSubscriptions[eventName]) {
                eventSubscriptions[eventName] = eventSubscriptions[eventName].filter(function(h) {
                    return h !== handler;
                });
            }
        };

        var triggerEvent = function(eventName, eventPayload) {
            if (eventSubscriptions[eventName]) {
                eventSubscriptions[eventName].forEach(function(handler) {
                    if (typeof handler === 'function') {
                        handler.call(wndRef, eventPayload); // Call handler with window as context
                    }
                });
            }
        };

        return {
            subscribe: registerEvent,
            unsubscribe: removeEvent,
            dispatch: triggerEvent
        };
    })();

    // Configuration settings (renamed and re-structured)
    var pathConfig = {
        "basePathSegment": '/', // Corresponds to original 'basepath'
        "hashPrefixType": '/',  // Corresponds to original 'type'
        "autoRedirect": 0,      // Corresponds to original 'redirect'
        "initializationFlag": 0 // Corresponds to original 'init'
    };

    // Session storage key (renamed)
    var persistentStoreId = '_historyAPI_state_data_';

    // Last known URL to detect changes
    var previousPageURL = nativeLocation.href;

    // Last known document title
    var previousPageTitle = docRef.title;

    // Flag to indicate if history.location has been accessed
    var locationAccessTracker = 0;

    // Utility to define properties on objects, attempting defineProperty first (renamed)
    var propertySetter = function(targetObj, propKey, propDescriptor) {
        var testKey = '_temp_prop_test_';
        var canUseDefineProperty = false;
        try {
            nativeDefineProperty(targetObj, testKey, {value: 1});
            canUseDefineProperty = true;
            delete targetObj[testKey];
        } catch (e) {
            // defineProperty not fully supported or throws error (e.g., IE8)
        }

        if (canUseDefineProperty) {
            nativeDefineProperty(targetObj, propKey, propDescriptor);
            return true;
        } else {
            // Fallback for older browsers
            if (propDescriptor.value !== undefined) {
                targetObj[propKey] = propDescriptor.value;
                return true;
            } else if (propDescriptor.get || propDescriptor.set) {
                // Cannot truly emulate dynamic getters/setters without defineProperty.
                // Consistent with original's `redefineProperty` returning false in this case.
                return false;
            }
            return false; // No value, no getter/setter, nothing to set.
        }
    };

    // Check for native History API support (renamed)
    var isAPISupported = !!nativeHistory.pushState;

    // Custom location object for non-History API browsers (renamed)
    // For IE8, this will be an HTMLAnchorElement, not a pure object.
    var customLocationObject = (function() {
        var tempObj = {};
        if (propertySetter(tempObj, 'x', {value: 1})) {
            return {}; // Can use plain object if defineProperty works
        } else {
            return docRef.createElement('a'); // Fallback to anchor element for IE8
        }
    })();

    // URL Parsing Logic (completely rewritten, modular, avoiding original's monolithic regex)
    var URLDecomposer = (function() {
        var parseComponents = function(inputURL, isWindowLoc, forcePure) {
            var currentURLString = inputURL;

            // Handle base tag for relative URLs if not a pure URL operation
            if (inputURL != null && inputURL !== '' && !isWindowLoc && !forcePure) {
                var currentParsed = parseComponents(null, true); // Parse current window location
                var baseTag = docRef.getElementsByTagName('base')[0];
                if (baseTag && baseTag.getAttribute('href')) {
                    tempLinkElement.href = baseTag.href; // IE fix
                    currentParsed = parseComponents(tempLinkElement.href, false, true);
                }

                currentURLString = ('' + currentURLString); // Ensure string type
                if (!/^(?:\w+\:)?\/\//.test(currentURLString)) { // If not absolute
                    if (currentURLString.indexOf('/') === 0) { // Absolute path
                        currentURLString = currentParsed._protocol + '//' + currentParsed._host + currentURLString;
                    } else if (currentURLString.indexOf('?') === 0) { // Query string only
                        currentURLString = currentParsed._protocol + '//' + currentParsed._host + currentParsed._path + currentURLString;
                    } else if (currentURLString.indexOf('#') === 0) { // Hash only
                        currentURLString = currentParsed._protocol + '//' + currentParsed._host + currentParsed._path + currentParsed._query + currentURLString;
                    } else { // Relative path
                        var path = currentParsed._path;
                        currentURLString = currentParsed._protocol + '//' + currentParsed._host + path.replace(/[^\/]+$/g, '') + currentURLString;
                    }
                } else if (currentURLString.indexOf('/') === 0) { // Protocol-relative //example.com/path
                     currentURLString = currentParsed._protocol + currentURLString;
                }
            } else {
                currentURLString = isWindowLoc ? nativeLocation.href : wndRef.location.href;
                // If browser doesn't support History API, use hash-based routing
                if (!isAPISupported || forcePure) {
                    var hashPart = currentURLString.replace(/^[^#]*/, '') || "#";
                    // Reconstruct URL from hash for emulation
                    currentURLString = nativeLocation.protocol.replace(/:.*$|$/, ':') + '//' + nativeLocation.host + pathConfig["basePathSegment"] +
                        hashPart.replace(new RegExp("^#[\/]?(?:" + pathConfig["hashPrefixType"] + ")?"), "");
                }
            }

            tempLinkElement.href = currentURLString; // Let browser's anchor element do the heavy lifting

            var proto = tempLinkElement.protocol;
            var hst = tempLinkElement.host;
            var hstName = tempLinkElement.hostname;
            var prt = tempLinkElement.port;
            var pthName = tempLinkElement.pathname;
            var srch = tempLinkElement.search;
            var hsh = tempLinkElement.hash === '#' ? '' : (tempLinkElement.hash || '');

            var fullHref = proto + '//' + hst + pthName + srch + hsh;
            var relativePath = pthName + srch + hsh;
            var noHashPath = pthName.replace(new RegExp("^" + pathConfig["basePathSegment"], "i"), pathConfig["hashPrefixType"]) + srch;

            return {
                _fullLink: fullHref,
                _protocol: proto,
                _host: hst,
                _hostname: hstName,
                _port: prt,
                _path: pthName,
                _query: srch,
                _fragment: hsh,
                _relPath: relativePath,
                _hashPath: noHashPath,
                _specialPath: noHashPath + hsh
            };
        };
        return parseComponents;
    })();

    // Chrome specific fix for history object (renamed)
    var chromeHistoryFixer = function(methodToCall, argsArray) {
        var needsRestore = wndRef.history !== nativeHistory;
        if (needsRestore) {
            wndRef.history = nativeHistory;
        }
        methodToCall.apply(nativeHistory, argsArray);
        if (needsRestore) {
            wndRef.history = customHistoryObject;
        }
    };

    // Update state logic (renamed from `changeState`)
    var updateNavigationState = function(stateObj, urlString, isReplace) {
        var newURLDetails = URLDecomposer(urlString);
        var resolvedNewURL = newURLDetails._fullLink;

        // Store state object by the resolved URL
        stateRecordKeeper[resolvedNewURL] = stateObj;

        // If History API not supported, use hash routing
        if (!isAPISupported) {
            var targetHash = '#' + newURLDetails._specialPath;
            if (isReplace) {
                nativeLocation.replace(targetHash);
            } else {
                nativeLocation.assign(targetHash);
            }
            previousPageURL = resolvedNewURL; // Update internal tracker
            eventDistributor.dispatch('popstate', { state: stateRecordKeeper[resolvedNewURL] || null });
        } else {
            // For History API supported browsers, call native methods
            if (isReplace) {
                chromeHistoryFixer(nativeHistory.replaceState, [stateObj, docRef.title, urlString]);
            } else {
                chromeHistoryFixer(nativeHistory.pushState, [stateObj, docRef.title, urlString]);
            }
            previousPageURL = nativeLocation.href; // Update previous URL after native call
        }
    };

    // Session storage initialization (renamed and re-structured)
    var setupPersistentStorage = function() {
        var sessionStoreAccessor;
        try {
            sessionStoreAccessor = wndRef.sessionStorage;
            sessionStoreAccessor.setItem(persistentStoreId + 'test', '1');
            sessionStoreAccessor.removeItem(persistentStoreId + 'test');
        } catch (e) {
            // Fallback for sessionStorage if it throws an error (e.g., cookies disabled)
            sessionStoreAccessor = {
                getItem: function(key) {
                    var cookies = docRef.cookie.split(';');
                    for (var i = 0; i < cookies.length; i++) {
                        var cookie = cookies[i].trim();
                        if (cookie.indexOf(key + '=') === 0) {
                            return cookie.substring(key.length + 1);
                        }
                    }
                    return 'null'; // Default if not found
                },
                setItem: function(key, value) {
                    try {
                        // Store the entire state map as a JSON string in a cookie
                        docRef.cookie = key + '=' + value + '; path=/';
                    } catch (e) {
                        // Cookie setting failed
                    }
                }
            };
        }

        try {
            stateRecordKeeper = nativeJSON.parse(sessionStoreAccessor.getItem(persistentStoreId)) || {};
        } catch (e) {
            stateRecordKeeper = {};
        }

        // Attach unload event handler to save state to persistent storage
        wndRef.addEventListener('unload', function() {
            sessionStoreAccessor.setItem(persistentStoreId, nativeJSON.stringify(stateRecordKeeper));
        }, false);
    };

    // Initialize persistent storage
    setupPersistentStorage();

    // Custom history methods and properties (renamed `historyDescriptors`)
    var customHistoryAPI = {
        /**
         * Configure polyfill settings.
         */
        "configure": function(basePath, hashType, redirectFlag) {
            pathConfig["basePathSegment"] = ('' + (basePath == null ? pathConfig["basePathSegment"] : basePath))
                .replace(/(?:^|\/)[^\/]*$/, '/');
            pathConfig["hashPrefixType"] = hashType == null ? pathConfig["hashPrefixType"] : hashType;
            pathConfig["autoRedirect"] = redirectFlag == null ? pathConfig["autoRedirect"] : !!redirectFlag;
        },

        /**
         * Redirect logic for base paths.
         */
        "redirectPath": function(hashType, basePath) {
            customHistoryAPI['configure'](basePath, hashType);
            var currentBasePath = pathConfig["basePathSegment"];
            if (wndRef.top === wndRef.self) {
                var currentURLDetails = URLDecomposer(null, false, true);
                var currentPath = nativeLocation.pathname + nativeLocation.search;
                if (isAPISupported) {
                    currentPath = currentPath.replace(/([^\/])$/, '$1/');
                    if (currentURLDetails._relPath !== currentBasePath && (new RegExp("^" + currentBasePath + "$", "i")).test(currentPath)) {
                        nativeLocation.replace(currentURLDetails._relPath);
                    }
                } else if (currentPath !== currentBasePath) {
                    currentPath = currentPath.replace(/([^\/])\?/, '$1/?');
                    if ((new RegExp("^" + currentBasePath, "i")).test(currentPath)) {
                        nativeLocation.replace(currentBasePath + '#' + currentPath.
                            replace(new RegExp("^" + currentBasePath, "i"), pathConfig["hashPrefixType"]) + nativeLocation.hash);
                    }
                    // The original had a bug here where it would append hash twice if present.
                    // The above `+ nativeLocation.hash` is consistent with the original.
                }
            }
        },

        /**
         * Adds a state object to the history.
         */
        "addStateEntry": function(objState, entryTitle, entryURL) {
            var originalTitle = docRef.title;
            if (previousPageTitle != null) {
                docRef.title = previousPageTitle;
            }
            // Use native pushState if available, with Chrome fix
            if (isAPISupported) {
                chromeHistoryFixer(nativeHistory.pushState, [objState, entryTitle, entryURL]);
            }
            updateNavigationState(objState, entryURL); // Also manages state storage and hash emulation
            docRef.title = originalTitle;
            previousPageTitle = entryTitle;
        },

        /**
         * Updates the current history entry.
         */
        "updateStateEntry": function(objState, entryTitle, entryURL) {
            var originalTitle = docRef.title;
            if (previousPageTitle != null) {
                docRef.title = previousPageTitle;
            }
            // Remove old state from storage before replacing
            delete stateRecordKeeper[URLDecomposer()._fullLink];

            // Use native replaceState if available, with Chrome fix
            if (isAPISupported) {
                chromeHistoryFixer(nativeHistory.replaceState, [objState, entryTitle, entryURL]);
            }
            updateNavigationState(objState, entryURL, true); // Also manages state storage and hash emulation
            docRef.title = originalTitle;
            previousPageTitle = entryTitle;
        },

        /**
         * Custom location object similar to window.location.
         */
        "pageLocation": {
            set: function(val) {
                locationAccessTracker = 1;
                wndRef.location = val; // Direct assignment to window.location
            },
            get: function() {
                locationAccessTracker = 1;
                return isAPISupported ? nativeLocation : customLocationObject;
            }
        },

        /**
         * Current state object.
         */
        "currentState": {
            get: function() {
                return stateRecordKeeper[URLDecomposer()._fullLink] || null;
            }
        }
    };

    // Custom location object methods and properties (renamed `locationDescriptors`)
    var customLocationProps = {
        /**
         * Navigates to a new page.
         */
        "jumpTo": function(targetURL) {
            if (('' + targetURL).indexOf('#') === 0) {
                updateNavigationState(null, targetURL);
            } else {
                nativeLocation.assign(targetURL);
            }
        },

        /**
         * Reloads the current page.
         */
        "refresh": function() {
            nativeLocation.reload();
        },

        /**
         * Replaces the current page in history.
         */
        "swapWith": function(targetURL) {
            if (('' + targetURL).indexOf('#') === 0) {
                updateNavigationState(null, targetURL, true);
            } else {
                nativeLocation.replace(targetURL);
            }
        },

        /**
         * Returns the full URL.
         */
        "toString": function() {
            return this.fullLink;
        },

        /**
         * Full URL property.
         */
        "fullLink": {
            get: function() {
                return URLDecomposer()._fullLink;
            }
        },

        /**
         * Protocol property.
         */
        "scheme": { get: function() { return URLDecomposer()._protocol; } },
        /**
         * Host and port property.
         */
        "domainPort": { get: function() { return URLDecomposer()._host; } },
        /**
         * Hostname property.
         */
        "domainName": { get: function() { return URLDecomposer()._hostname; } },
        /**
         * Port property.
         */
        "portNum": { get: function() { return URLDecomposer()._port; } },
        /**
         * Pathname property.
         */
        "pathOnly": { get: function() { return URLDecomposer()._path; } },
        /**
         * Search string property.
         */
        "queryStr": { get: function() { return URLDecomposer()._query; } },
        /**
         * Hash fragment property.
         */
        "fragmentId": {
            set: function(val) {
                updateNavigationState(null, ('' + val).replace(/^(#|)/, '#'));
            },
            get: function() {
                return URLDecomposer()._fragment;
            }
        }
    };

    // Apply properties to customHistoryObject
    propertySetter(customHistoryObject, 'setup', {value: customHistoryAPI.configure});
    propertySetter(customHistoryObject, 'redirect', {value: customHistoryAPI.redirectPath});
    propertySetter(customHistoryObject, 'pushState', {value: customHistoryAPI.addStateEntry});
    propertySetter(customHistoryObject, 'replaceState', {value: customHistoryAPI.updateStateEntry});
    propertySetter(customHistoryObject, 'location', customHistoryAPI.pageLocation);
    propertySetter(customHistoryObject, 'state', customHistoryAPI.currentState);

    // Apply properties to customLocationObject
    propertySetter(customLocationObject, 'assign', {value: customLocationProps.jumpTo});
    propertySetter(customLocationObject, 'reload', {value: customLocationProps.refresh});
    propertySetter(customLocationObject, 'replace', {value: customLocationProps.swapWith});
    propertySetter(customLocationObject, 'toString', {value: customLocationProps.toString});
    propertySetter(customLocationObject, 'href', customLocationProps.fullLink);
    // For IE8 (where customLocationObject is an anchor), these properties might not be settable as getters.
    // However, the original code used `null` for these in `locationDescriptors`, implying direct access
    // to the native anchor properties in that fallback case. We ensure they are dynamic if possible.
    propertySetter(customLocationObject, 'protocol', customLocationProps.scheme);
    propertySetter(customLocationObject, 'host', customLocationProps.domainPort);
    propertySetter(customLocationObject, 'hostname', customLocationProps.domainName);
    propertySetter(customLocationObject, 'port', customLocationProps.portNum);
    propertySetter(customLocationObject, 'pathname', customLocationProps.pathOnly);
    propertySetter(customLocationObject, 'search', customLocationProps.queryStr);
    propertySetter(customLocationObject, 'hash', customLocationProps.fragmentId);

    // Event handling for native popstate and hashchange events
    var lastKnownURLForEvents = nativeLocation.href;

    var handleNativePopState = function(e) {
        var currentURL = nativeLocation.href;
        if (currentURL === previousPageURL) { // Prevent duplicate popstate on some browsers
            return;
        }
        previousPageURL = currentURL;
        eventDistributor.dispatch('popstate', { state: e.state || stateRecordKeeper[currentURL] || null });
    };

    var handleNativeHashChange = function(e) {
        var currentURL = nativeLocation.href;
        if (currentURL === previousPageURL) {
            return;
        }
        previousPageURL = currentURL;
        eventDistributor.dispatch('hashchange', {
            newURL: currentURL,
            oldURL: e.oldURL || lastKnownURLForEvents
        });
        lastKnownURLForEvents = currentURL; // Update for next hashchange
        eventDistributor.dispatch('popstate', { state: stateRecordKeeper[currentURL] || null });
    };

    wndRef.addEventListener('popstate', handleNativePopState, false);
    wndRef.addEventListener('hashchange', handleNativeHashChange, false);

    // Initial state firing logic (renamed `isFireInitialState`)
    if (pathConfig["initializationFlag"] === 0) {
        if (!isAPISupported) {
            var currentHashURL = URLDecomposer()._fullLink;
            if (currentHashURL !== previousPageURL) {
                // Manually trigger hashchange/popstate for initial load if URL is hash-based
                eventDistributor.dispatch('hashchange', { newURL: currentHashURL, oldURL: previousPageURL });
                eventDistributor.dispatch('popstate', { state: stateRecordKeeper[currentHashURL] || null });
            }
        } else if (nativeHistory.state) {
            // For History API, if there's an initial state, dispatch popstate
            eventDistributor.dispatch('popstate', { state: nativeHistory.state });
        }
        pathConfig["initializationFlag"] = 1; // Mark as initialized
    }

    // Override window event handlers (onpopstate, onhashchange) using our event system
    var originalOnPopState = wndRef.onpopstate;
    var originalOnHashChange = wndRef.onhashchange;

    propertySetter(wndRef, 'onpopstate', {
        get: function() {
            return originalOnPopState;
        },
        set: function(handler) {
            if (originalOnPopState) eventDistributor.unsubscribe('popstate', originalOnPopState);
            originalOnPopState = handler;
            if (handler) eventDistributor.subscribe('popstate', handler);
        }
    });

    propertySetter(wndRef, 'onhashchange', {
        get: function() {
            return originalOnHashChange;
        },
        set: function(handler) {
            if (originalOnHashChange) eventDistributor.unsubscribe('hashchange', originalOnHashChange);
            originalOnHashChange = handler;
            if (handler) eventDistributor.subscribe('hashchange', handler);
        }
    });

    // Replace native history object with our custom one
    wndRef.history = customHistoryObject;

    // Return the custom history object
    return customHistoryObject;

})(window, document);