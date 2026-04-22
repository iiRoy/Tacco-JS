/*!
 * Navigation State Manager Library v1.0.0
 *
 * Compatibility: Modern browsers (ES6+)
 *
 * Copyright 2023, Your Name ( your.email@example.com )
 *
 * https://your-project-url.com/
 *
 * Licensed under the Apache License, Version 2.0:
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Last Modified: 2023-10-27 15:30
 */
((moduleFactory) => {
    // Check for AMD/RequireJS environment to define the module
    if (typeof define === 'function' && define.amd) {
        // Asynchronously load if document is not ready, otherwise define immediately.
        // This addresses potential issues with document state in some environments.
        const isDocReady = typeof document === 'object' && document.readyState !== 'loading';
        define(isDocReady ? [] : 'history-api-shim', moduleFactory);
    } else {
        // Execute the factory function directly for non-AMD environments
        moduleFactory();
    }
})(() => {
    // Determine the global context, prioritizing 'window' for browser environments.
    const universalGlobal = (typeof window === 'object' && window) || globalThis || {};

    // Prevent re-initialization if the shim is already active or native History API is missing.
    // The "navigationManager" property acts as a unique identifier for our shim.
    if (!universalGlobal.history || "navigationManager" in universalGlobal.history) {
        return universalGlobal.history;
    }

    // Establish fundamental references for core browser objects.
    const currentDocument = universalGlobal.document;
    const documentRootElement = currentDocument.documentElement;
    const nativeObjectConstructor = universalGlobal.Object;
    const jsonSerializer = universalGlobal.JSON;
    const currentWindowLocation = universalGlobal.location;
    const originalHistoryInstance = universalGlobal.history;

    // Our custom history object, initially mirroring the native one.
    let managedHistoryObject = originalHistoryInstance;

    // Preserve references to native History API methods.
    const originalPushState = originalHistoryInstance.pushState;
    const originalReplaceState = originalHistoryInstance.replaceState;

    // Detect native History API support.
    const isNativeHistoryAPIAvailable = !!originalPushState;

    // Check if the native history object exposes a 'state' property.
    const doesNativeHistorySupportState = 'state' in originalHistoryInstance;

    // Reference to Object.defineProperty, crucial for property manipulation.
    const defineObjectProperty = nativeObjectConstructor.defineProperty;

    // A temporary anchor element used for robust URL parsing across browsers.
    const urlParsingAnchor = currentDocument.createElement('a');

    // Configuration settings for the navigation manager.
    const managerConfigs = {
        basePath: '/',
        urlType: '/', // Used for hash-based routing in legacy browsers
        redirectEnabled: false,
        initialised: false
    };

    // Key for session storage to persist state data.
    const sessionPersistenceKey = '__navStateData__';

    // Track the last known URL to detect changes.
    let previousUrl = currentWindowLocation.href;

    // Store custom event handlers for internal use.
    const customEventHandlers = {};

    // Cache for parsed URL components to optimize performance.
    const parsedUrlCache = {};

    // Keep track of the last title set to manage document.title.
    let cachedDocumentTitle = currentDocument.title;

    // Flag to detect if 'history.location' is being accessed externally.
    let isHistoryLocationAccessed = false;

    // Utility for defining a property, with a fallback for older environments.
    // Returns `true` if `defineProperty` is supported and successful, `false` otherwise.
    const tryDefineProperty = (target, propName, propDescriptor) => {
        try {
            if (defineObjectProperty) {
                defineObjectProperty(target, propName, propDescriptor);
                return true;
            }
        } catch (e) {
            // IE8 can throw errors on defineProperty for DOM objects
            // console.warn("Failed to define property:", propName, e);
        }
        return false;
    };

    // Our custom location object. For IE8, we use an HTMLAnchorElement for its built-in URL parsing capabilities.
    const managedLocationObject = tryDefineProperty({}, 't', {set: () => {}}) ? {} : currentDocument.createElement('a');

    // Normalize event listener names for cross-browser compatibility.
    const standardAddEventListener = universalGlobal.addEventListener ? 'addEventListener' : 'attachEvent';
    const standardRemoveEventListener = universalGlobal.removeEventListener ? 'removeEventListener' : 'detachEvent';
    const standardDispatchEvent = universalGlobal.dispatchEvent ? 'dispatchEvent' : 'fireEvent';

    // Store references to the appropriate event methods.
    const attachEventMethod = universalGlobal[standardAddEventListener];
    const detachEventMethod = universalGlobal[standardRemoveEventListener];
    const triggerEventMethod = universalGlobal[standardDispatchEvent];

    // Prefix for event names if 'attachEvent' is used (e.g., 'on' for 'onclick').
    let eventNameConvention = universalGlobal.addEventListener ? '' : 'on';

    /**
     * Helper to fix Chrome's history object re-assignment issue in some contexts (e.g., iOS iframes).
     * Temporarily restores the native history object, executes the method, then restores the shim.
     * @param {Function} stateMethod - The native history method to call (pushState or replaceState).
     * @param {Array} methodArgs - Arguments to pass to the native method.
     */
    const chromeHistoryFix = (stateMethod, methodArgs) => {
        const needsFix = universalGlobal.history !== originalHistoryInstance;
        if (needsFix) {
            universalGlobal.history = originalHistoryInstance;
        }
        stateMethod.apply(originalHistoryInstance, methodArgs);
        if (needsFix) {
            universalGlobal.history = managedHistoryObject;
        }
    };

    /**
     * Internal state management utility. Updates the current state and triggers necessary events.
     * @param {Object} newState - The new state object.
     * @param {string} targetUrl - The URL associated with the new state.
     * @param {boolean} [isReplace=false] - True if this is a replace operation, false for push.
     */
    const updateInternalState = (newState, targetUrl, isReplace = false) => {
        const currentUrl = getCurrentUrlDetails().fullHref;

        // If replacing, remove the old state from storage before adding the new one.
        if (isReplace && currentUrl in parsedUrlCache) {
            delete parsedUrlCache[currentUrl];
        }

        // Store the new state object using the target URL as key.
        parsedUrlCache[targetUrl] = newState;

        // If the URL changes, update the 'previousUrl' tracker.
        if (targetUrl !== currentUrl) {
            previousUrl = targetUrl;
        }

        // Trigger a 'popstate' event if the URL has effectively changed.
        if (isNativeHistoryAPIAvailable && !isReplace && targetUrl !== currentUrl) {
            // A simple way to trigger popstate for pushState equivalent in shimmed environments
            // For actual pushState calls, the browser handles it.
            // This part is complex because browsers don't fire popstate on pushState/replaceState calls.
            // We're simulating it for consistency in a non-native context, but it's often not strictly needed
            // if the application listens to our custom 'statechange' event.
            // For this clone, we'll keep it simple and assume the app will react to the URL change.
        }
    };

    /**
     * Retrieves and parses URL components, with caching.
     * @param {string} [inputUrl] - The URL string to parse. Defaults to current window location.
     * @param {boolean} [forceNative=false] - If true, always use window.location for parsing.
     * @param {boolean} [isBaseUrlContext=false] - Special handling for base href resolution.
     * @returns {Object} An object containing various URL components.
     */
    const getCurrentUrlDetails = (inputUrl, forceNative = false, isBaseUrlContext = false) => {
        let effectiveUrl = inputUrl;

        // If no URL is provided, use the current browser URL.
        if (effectiveUrl === undefined || effectiveUrl === null || effectiveUrl === '') {
            effectiveUrl = currentWindowLocation.href;
        }

        // Check cache first for performance.
        if (parsedUrlCache[effectiveUrl]) {
            return parsedUrlCache[effectiveUrl];
        }

        const urlRegex = /^(?:(\w+):)?(?:\/\/)?(?:([^@]+)@)?([^/:]+)?(?::(\d+))?([^?#]*)?(?:\?([^#]*))?(?:#(.*))?$/;

        let processedUrl = effectiveUrl;

        // Logic for handling relative URLs and base tags.
        if (inputUrl !== undefined && inputUrl !== '' && !forceNative) {
            let currentPathDetails = getCurrentUrlDetails(undefined, true); // Get details of current window location
            const baseElement = currentDocument.getElementsByTagName('base')[0];

            if (!isBaseUrlContext && baseElement && baseElement.getAttribute('href')) {
                // Fix for IE's handling of relative base tags.
                urlParsingAnchor.href = baseElement.href;
                currentPathDetails = getCurrentUrlDetails(urlParsingAnchor.href, false, true);
            }

            const currentPathname = currentPathDetails.path;
            const currentProtocol = currentPathDetails.protocol;

            // Convert relative URL to absolute.
            processedUrl = String(processedUrl); // Ensure string type
            if (!/^(?:\w+:\/\/?|\/\/)/.test(processedUrl)) { // If not absolute or protocol-relative
                if (processedUrl.startsWith('/')) {
                    processedUrl = currentProtocol + '//' + currentPathDetails.hostNameAndPort + processedUrl;
                } else if (processedUrl.startsWith('?')) {
                    processedUrl = currentProtocol + '//' + currentPathDetails.hostNameAndPort + currentPathname + processedUrl;
                } else if (processedUrl.startsWith('#')) {
                    processedUrl = currentProtocol + '//' + currentPathDetails.hostNameAndPort + currentPathname + currentPathDetails.queryString + processedUrl;
                } else {
                    // Relative path, resolve against current directory
                    processedUrl = currentProtocol + '//' + currentPathDetails.hostNameAndPort + currentPathname.replace(/[^/]+$/, '') + processedUrl;
                }
            }
        } else {
            // Handle non-History API browsers (hash-based routing).
            if (!isNativeHistoryAPIAvailable || isBaseUrlContext) {
                processedUrl = processedUrl.replace(/^[^#]*/, '') || '#'; // Extract hash
                // Reconstruct full URL from hash for legacy support
                processedUrl = currentWindowLocation.protocol.replace(/:.*$|$/, ':') + '//' + currentWindowLocation.host + managerConfigs.basePath +
                    processedUrl.replace(new RegExp(`^#/?(?:${managerConfigs.urlType})?`), '');
            }
        }

        // Use a temporary anchor element to leverage browser's native URL parsing.
        urlParsingAnchor.href = processedUrl;
        const urlMatch = urlRegex.exec(urlParsingAnchor.href);

        if (!urlMatch) {
            // Fallback for unparseable URLs.
            return {
                fullHref: processedUrl, protocol: '', hostNameAndPort: '', hostname: '', port: '',
                path: '/', queryString: '', fragment: '', relativePath: '/', noHashPath: '', specialPath: ''
            };
        }

        const protocol = urlMatch[1] || '';
        const hostName = urlMatch[3] || '';
        const port = urlMatch[4] || '';
        const path = urlMatch[5] || '/';
        const queryString = urlMatch[6] ? `?${urlMatch[6]}` : '';
        const fragment = urlMatch[7] ? `#${urlMatch[7]}` : ''; // Ensure '#' prefix for fragment

        const fullHost = hostName + (port ? `:${port}` : '');
        const relativePath = path + queryString + fragment;
        const noHashPath = path.replace(new RegExp(`^${managerConfigs.basePath}`, 'i'), managerConfigs.urlType) + queryString;

        const urlDetails = {
            fullHref: `${protocol}//${fullHost}${relativePath}`,
            protocol: `${protocol}:`,
            hostNameAndPort: fullHost,
            hostname: hostName,
            port: port,
            path: path,
            queryString: queryString,
            fragment: fragment === '#' ? '' : fragment, // Normalize empty hash
            relativePath: relativePath,
            noHashPath: noHashPath,
            specialPath: noHashPath + fragment // Used for hash-based routing
        };

        parsedUrlCache[effectiveUrl] = urlDetails; // Cache the result
        return urlDetails;
    };

    /**
     * Initializes the session storage for state objects.
     * Includes a robust fallback for environments where sessionStorage is restricted (e.g., third-party cookies disabled).
     */
    const initializeStateStorage = () => {
        let currentSessionStore;
        try {
            // Attempt to use native sessionStorage.
            currentSessionStore = universalGlobal.sessionStorage;
            // Test if sessionStorage is actually usable.
            const testKey = `${sessionPersistenceKey}_test`;
            currentSessionStore.setItem(testKey, '1');
            currentSessionStore.removeItem(testKey);
        } catch (_error_) {
            // Fallback to a cookie-based storage if sessionStorage fails.
            // This is a simplified cookie implementation and might not cover all edge cases.
            currentSessionStore = {
                getItem: (key) => {
                    const cookieMatch = currentDocument.cookie.split('; ').find(row => row.startsWith(`${key}=`));
                    return cookieMatch ? decodeURIComponent(cookieMatch.split('=')[1]) : null;
                },
                setItem: (key, value) => {
                    // Set a session cookie.
                    currentDocument.cookie = `${key}=${encodeURIComponent(value)}; path=/`;
                }
            };
            // console.warn("SessionStorage unavailable, falling back to cookies.", _error_);
        }

        try {
            // Load existing state data from storage.
            const storedData = currentSessionStore.getItem(sessionPersistenceKey);
            parsedUrlCache.stateObjects = storedData ? jsonSerializer.parse(storedData) : {};
        } catch (_parseError_) {
            // Handle corrupted or unparseable stored data.
            parsedUrlCache.stateObjects = {};
            // console.error("Failed to parse stored state data, resetting.", _parseError_);
        }

        // Attach an event listener to persist state data before the page unloads.
        attachEventMethod(eventNameConvention + 'unload', () => {
            try {
                // Only save if there are actual state objects.
                if (nativeObjectConstructor.keys(parsedUrlCache.stateObjects).length > 0) {
                    currentSessionStore.setItem(sessionPersistenceKey, jsonSerializer.stringify(parsedUrlCache.stateObjects));
                }
            } catch (_saveError_) {
                // console.error("Failed to save state data to session storage.", _saveError_);
            }
        }, false);
    };

    // Placeholder for event handlers (if needed for custom events).
    const eventHandlerRegistry = {
        // Example: 'popstate': [func1, func2]
    };

    // Define properties and methods for our custom `history` object.
    const historyApiExtensions = {
        /**
         * Configures the navigation manager.
         * @param {string|null} [basePath] - The base path of the application (e.g., '/app/').
         * @param {string|null} [urlType] - Prefix for hash-based URLs (e.g., '!', for #!/path).
         * @param {boolean|null} [redirectEnabled] - Whether to automatically redirect for legacy URLs.
         */
        configure: function(basePath, urlType, redirectEnabled) {
            managerConfigs.basePath = String(basePath == null ? managerConfigs.basePath : basePath).replace(/(?:^|\/)[^/]*$/, '/');
            managerConfigs.urlType = urlType == null ? managerConfigs.urlType : urlType;
            managerConfigs.redirectEnabled = redirectEnabled == null ? managerConfigs.redirectEnabled : !!redirectEnabled;
        },

        /**
         * Handles redirection logic based on configuration.
         * Useful for transitioning from hash-based to History API URLs.
         * @param {string} [urlType] - Override for URL type.
         * @param {string} [basePath] - Override for base path.
         */
        performRedirect: function(urlType, basePath) {
            this.configure(basePath, urlType); // Apply any new configurations
            const currentBase = managerConfigs.basePath;

            // Only perform redirects if not in an iframe and redirecting is enabled.
            if (universalGlobal.top === universalGlobal.self && managerConfigs.redirectEnabled) {
                const urlDetails = getCurrentUrlDetails(undefined, false, true);
                let currentPath = currentWindowLocation.pathname + currentWindowLocation.search;

                if (isNativeHistoryAPIAvailable) {
                    // Ensure trailing slash for base path comparison.
                    currentPath = currentPath.replace(/([^/])$/, '$1/');
                    if (urlDetails.relativePath !== currentBase && (new RegExp(`^${currentBase}$`, 'i')).test(currentPath)) {
                        currentWindowLocation.replace(urlDetails.relativePath); // Redirect to cleaner URL
                    }
                } else if (currentPath !== currentBase) {
                    // For non-History API browsers, redirect to hash-based URL.
                    currentPath = currentPath.replace(/([^/])\?/, '$1/?'); // Ensure consistency
                    if ((new RegExp(`^${currentBase}`, 'i')).test(currentPath)) {
                        currentWindowLocation.replace(
                            `${currentBase}#${currentPath.replace(new RegExp(`^${currentBase}`, 'i'), managerConfigs.urlType)}${currentWindowLocation.hash}`
                        );
                    }
                }
            }
        },

        /**
         * Pushes a new state and URL onto the history stack.
         * @param {Object} stateData - The state object.
         * @param {string} pageTitle - The title for the new history entry.
         * @param {string} [pageUrl] - The new URL.
         */
        pushState: function(stateData, pageTitle, pageUrl) {
            const originalDocTitle = currentDocument.title;
            if (cachedDocumentTitle !== null) {
                currentDocument.title = cachedDocumentTitle; // Restore previous title before native call
            }
            originalPushState && chromeHistoryFix(originalPushState, arguments);
            updateInternalState(stateData, pageUrl || currentWindowLocation.href);
            currentDocument.title = originalDocTitle; // Revert title
            cachedDocumentTitle = pageTitle; // Store the new title
        },

        /**
         * Replaces the current state and URL in the history stack.
         * @param {Object} stateData - The state object.
         * @param {string} pageTitle - The title for the new history entry.
         * @param {string} [pageUrl] - The new URL.
         */
        replaceState: function(stateData, pageTitle, pageUrl) {
            const originalDocTitle = currentDocument.title;
            if (cachedDocumentTitle !== null) {
                currentDocument.title = cachedDocumentTitle; // Restore previous title
            }
            // Clear the old state from storage before replacing.
            const currentUrl = currentWindowLocation.href;
            if (currentUrl in parsedUrlCache) {
                delete parsedUrlCache[currentUrl];
            }

            originalReplaceState && chromeHistoryFix(originalReplaceState, arguments);
            updateInternalState(stateData, pageUrl || currentWindowLocation.href, true);
            currentDocument.title = originalDocTitle; // Revert title
            cachedDocumentTitle = pageTitle; // Store the new title
        },

        /**
         * Provides a 'location' object within history, mimicking window.location.
         * For legacy browsers, it exposes our custom 'managedLocationObject'.
         */
        navigationLocation: {
            set: function(newValue) {
                if (!isHistoryLocationAccessed) isHistoryLocationAccessed = true;
                universalGlobal.location = newValue; // Delegate to native window.location
            },
            get: function() {
                if (!isHistoryLocationAccessed) isHistoryLocationAccessed = true;
                return isNativeHistoryAPIAvailable ? currentWindowLocation : managedLocationObject;
            }
        },

        /**
         * The state object associated with the current history entry.
         */
        currentState: {
            get: function() {
                // Ensure stateObjects exists before accessing.
                return parsedUrlCache.stateObjects && parsedUrlCache.stateObjects[currentWindowLocation.href] || null;
            }
        }
    };

    // Define properties for our custom `history.location` object.
    const customLocationProperties = {
        /**
         * Navigates to a new URL.
         * If it's a hash-only change, it's handled internally.
         * @param {string} targetUrl - The URL to navigate to.
         */
        goTo: function(targetUrl) {
            if (String(targetUrl).startsWith('#')) {
                // If only hash changes, manage state internally without full page load.
                updateInternalState(null, targetUrl);
            } else {
                currentWindowLocation.assign(targetUrl);
            }
        },

        /**
         * Reloads the current page.
         */
        refresh: function() {
            currentWindowLocation.reload();
        },

        /**
         * Replaces the current history entry with a new URL.
         * @param {string} targetUrl - The URL to replace with.
         */
        swap: function(targetUrl) {
            if (String(targetUrl).startsWith('#')) {
                // If only hash changes, manage state internally.
                updateInternalState(null, targetUrl, true);
            } else {
                currentWindowLocation.replace(targetUrl);
            }
        },

        /**
         * Returns the full URL of the current page.
         */
        toString: function() {
            return this.href;
        },

        /**
         * Full URL string.
         */
        href: {
            get: function() {
                return getCurrentUrlDetails().fullHref;
            }
        },

        /**
         * Protocol of the current URL.
         */
        protocol: null, // Will be dynamically populated

        /**
         * Hostname and port.
         */
        hostAndPort: null, // Will be dynamically populated

        /**
         * Hostname only.
         */
        domainName: null, // Will be dynamically populated

        /**
         * Port number.
         */
        portNumber: null, // Will be dynamically populated

        /**
         * Pathname of the URL.
         */
        path: {
            get: function() {
                return getCurrentUrlDetails().path;
            }
        },

        /**
         * Query string part of the URL.
         */
        query: {
            get: function() {
                return getCurrentUrlDetails().queryString;
            }
        },

        /**
         * Hash (fragment) part of the URL.
         */
        fragment: {
            set: function(value) {
                // Ensure hash starts with '#'.
                const newHash = String(value).startsWith('#') ? String(value) : `#${String(value)}`;
                updateInternalState(null, newHash, false, previousUrl);
            },
            get: function() {
                return getCurrentUrlDetails().fragment;
            }
        }
    };

    /**
     * A no-operation function.
     */
    function noop() { /* This function intentionally does nothing */ }

    // --- Core Initialization Logic ---

    // Apply properties to the custom 'managedLocationObject' based on 'window.location'.
    // This makes 'history.location' behave like 'window.location' even in legacy browsers.
    for (const propKey in customLocationProperties) {
        if (customLocationProperties.hasOwnProperty(propKey)) {
            const descriptor = customLocationProperties[propKey];
            if (descriptor === null) {
                // If descriptor is null, create a simple getter/setter that delegates to window.location
                tryDefineProperty(managedLocationObject, propKey, {
                    get: () => getCurrentUrlDetails()[propKey], // Map to parsed URL details
                    set: (val) => {
                        // For properties like 'protocol', 'host', etc., setting implies navigation.
                        // This is a simplification; a full implementation would reconstruct the URL.
                        currentWindowLocation[propKey] = val;
                    },
                    enumerable: true,
                    configurable: true
                });
            } else if (typeof descriptor === 'object' && (descriptor.get || descriptor.set)) {
                // Use provided getter/setter.
                tryDefineProperty(managedLocationObject, propKey, descriptor);
            } else {
                // Simple method or value.
                managedLocationObject[propKey] = descriptor;
            }
        }
    }

    // Replace or add properties to the global 'window.history' object.
    for (const propKey in historyApiExtensions) {
        if (historyApiExtensions.hasOwnProperty(propKey)) {
            const descriptor = historyApiExtensions[propKey];
            if (typeof descriptor === 'object' && (descriptor.get || descriptor.set)) {
                tryDefineProperty(managedHistoryObject, propKey, descriptor);
            } else {
                managedHistoryObject[propKey] = descriptor;
            }
        }
    }

    // Special handling for IE8: if defineProperty failed for managedLocationObject,
    // we need to manually assign properties.
    if (!tryDefineProperty({}, 't', {set: noop})) {
        // This is a very basic fallback for truly ancient browsers.
        // The HTMLAnchorElement 'managedLocationObject' will already have many properties.
        // We ensure that the custom getters/setters are applied as methods if not as properties.
        for (const propKey in customLocationProperties) {
            if (customLocationProperties.hasOwnProperty(propKey)) {
                const descriptor = customLocationProperties[propKey];
                if (typeof descriptor === 'object' && (descriptor.get || descriptor.set)) {
                    // For IE8, we might just expose the getter as a method if a direct property define fails.
                    // This is a simplification for a clone, a real shim would be more complex.
                    if (descriptor.get && !managedLocationObject[propKey]) {
                        managedLocationObject[propKey] = descriptor.get;
                    }
                }
            }
        }
    }

    // Initialize state storage once the core objects are set up.
    initializeStateStorage();

    // Expose the custom history object globally.
    universalGlobal.history = managedHistoryObject;

    // Return the managed history object for AMD/CommonJS.
    return managedHistoryObject;
});