((globalScope, SysEnv) => {
    "use strict";

    // Helper for string inclusion checks to reduce repetition and make it more functional
    const checkStringPresence = (source, target) => source.includes(target);

    /**
     * @module SysEnv.platformInfo
     * @description Gathers and exposes detailed operating system information.
     * @returns {object} An object containing various OS detection flags and details.
     */
    SysEnv.platformInfo = (() => { // Rename TD.os to SysEnv.platformInfo
        // Internal constants for OS identifiers
        const WIN_IDENTIFIER = "win";
        const MAC_IDENTIFIER = "mac";
        const UNIX_IDENTIFIER = "x11";
        const LINUX_IDENTIFIER = "linux";
        const ANDROID_IDENTIFIER = "android";
        const IPHONE_IDENTIFIER = "iphone";
        const IPOD_IDENTIFIER = "ipod";
        const IPAD_IDENTIFIER = "ipad";

        // Extract raw user agent data, ensure it's available
        const userAgentRaw = globalScope.navigator?.userAgent?.toLowerCase() || ''; // Use optional chaining, provide default
        const appVersionRaw = globalScope.navigator?.appVersion?.toLowerCase() || ''; // Use optional chaining, provide default

        // Initialize the platform data object with default values
        const currentPlatform = { // Rename 'os' to 'currentPlatform'
            isWindows: false, // Rename 'win' to 'isWindows'
            isMacOS: false,   // Rename 'mac' to 'isMacOS'
            isUnixLike: false, // Rename 'unix' to 'isUnixLike'
            isLinux: false,   // Rename 'linux' to 'isLinux'
            isAndroid: false, // Rename 'android' to 'isAndroid'
            isIOS: false,     // Rename 'ios' to 'isIOS'
            isMobile: false,  // Rename 'phone' to 'isMobile'
            isIPhone: false,  // Rename 'iphone' to 'isIPhone'
            isIPad: false,    // Rename 'ipad' to 'isIPad'
            platformName: "Unknown OS", // Rename 'name' to 'platformName'
            platformVersion: "N/A"      // Rename 'version' to 'platformVersion'
        };

        // Early exit if navigator is not available (e.g., in a non-browser environment)
        if (!globalScope.navigator) {
            console.warn("SysEnv.platformInfo: navigator object not found. Cannot detect OS.");
            return currentPlatform;
        }

        // --- Core OS Detection ---
        // Using `includes` directly for cleaner checks
        currentPlatform.isWindows = checkStringPresence(appVersionRaw, WIN_IDENTIFIER);
        currentPlatform.isMacOS = checkStringPresence(appVersionRaw, MAC_IDENTIFIER);
        currentPlatform.isUnixLike = checkStringPresence(appVersionRaw, UNIX_IDENTIFIER);
        currentPlatform.isLinux = checkStringPresence(appVersionRaw, LINUX_IDENTIFIER);

        // Android detection
        if (checkStringPresence(userAgentRaw, ANDROID_IDENTIFIER)) {
            currentPlatform.isAndroid = true;
            currentPlatform.isMobile = true;
        }

        // iOS detection (including iPhone, iPod, iPad)
        const isAppleMobileDevice = checkStringPresence(userAgentRaw, IPOD_IDENTIFIER) ||
                                    checkStringPresence(userAgentRaw, IPHONE_IDENTIFIER) ||
                                    checkStringPresence(userAgentRaw, IPAD_IDENTIFIER);

        if (isAppleMobileDevice) {
            currentPlatform.isIOS = true;
            // macOS is a desktop OS, iOS is mobile. If it's iOS, it's not macOS.
            currentPlatform.isMacOS = false; // Override if previously set by 'mac' in appVersion
            currentPlatform.isMobile = true;

            if (checkStringPresence(userAgentRaw, IPOD_IDENTIFIER) || checkStringPresence(userAgentRaw, IPHONE_IDENTIFIER)) {
                currentPlatform.isIPhone = true;
            } else if (checkStringPresence(userAgentRaw, IPAD_IDENTIFIER)) { // Use else if for explicit iPad
                currentPlatform.isIPad = true;
            }
        }

        // --- Version and Name Extraction ---
        let detectedVersion = "N/A"; // Use let for mutable version string

        /**
         * Extracts version string from a source string based on a pattern.
         * @param {string} source - The string to search within (e.g., user agent).
         * @param {string} pattern - The pattern to split by (e.g., 'android ').
         * @param {string} [separator=';'] - The character to split the version string by.
         * @returns {string} The extracted and cleaned version string, or "N/A".
         */
        const extractVersionFromPattern = (source, pattern, separator = ';') => {
            const matches = source.split(pattern);
            if (matches.length > 1 && matches[1]) { // Ensure there's a part after the pattern
                let ver = matches[1].split(separator)[0];
                return ver.replace(/_/g, '.').trim();
            }
            return "N/A";
        };

        if (currentPlatform.isWindows) {
            currentPlatform.platformName = "Microsoft Windows";
            // Re-evaluate Windows versions using a map for clarity and extensibility
            const winVerMap = new Map([
                ['win16', '3.11'], ['95', '95'], ['98', '98'], ['nt 4.0', 'NT 4.0'],
                ['nt 5.0', '2000'], [' me ', 'ME'], ['nt 5.1', 'XP'],
                ['nt 5.2', 'Server 2003'], ['nt 6.0', 'Vista'], ['nt 6.1', '7'],
                ['nt 6.2', '8'], ['nt 6.3', '8.1'], ['nt 10.0', '10'] // Added newer versions
            ]);

            for (const [key, val] of winVerMap.entries()) {
                if (appVersionRaw.includes(key)) { // Use includes for map keys
                    detectedVersion = val;
                    break; // Found the version, exit loop
                }
            }
            currentPlatform.platformVersion = detectedVersion;

        } else if (currentPlatform.isMacOS) { // Use else if to avoid conflicting assignments
            currentPlatform.platformName = "Apple macOS"; // More specific name
            detectedVersion = extractVersionFromPattern(userAgentRaw, 'mac os x ');
            if (detectedVersion !== "N/A") {
                currentPlatform.platformVersion = `macOS ${detectedVersion}`; // Prepend 'macOS'
            } else {
                currentPlatform.platformVersion = "Unknown macOS version";
            }
        } else if (currentPlatform.isUnixLike) {
            currentPlatform.platformName = "Unix-like System"; // More generic name
        } else if (currentPlatform.isLinux) {
            currentPlatform.platformName = "Linux Distribution"; // More specific name
            // No version extraction in original for generic linux, keeping it.
        } else if (currentPlatform.isAndroid) {
            currentPlatform.platformName = "Google Android";
            detectedVersion = extractVersionFromPattern(userAgentRaw, 'android ');
            currentPlatform.platformVersion = detectedVersion;
        } else if (currentPlatform.isIOS) {
            currentPlatform.platformName = "Apple iOS";
            detectedVersion = extractVersionFromPattern(userAgentRaw, ' os ');
            currentPlatform.platformVersion = detectedVersion;

            // Refine platform name for specific iOS devices
            if (currentPlatform.isIPhone) {
                currentPlatform.platformName = "Apple iOS (iPhone/iPod)";
            } else if (currentPlatform.isIPad) {
                currentPlatform.platformName = "Apple iOS (iPad)";
            }
        }

        return currentPlatform;
    })();

})(globalScope, globalScope.SysEnv = globalScope.SysEnv || {}); // Ensure SysEnv is created or retrieved

((globalScope, SysEnv) => {
    "use strict";

    /**
     * @module SysEnv.clientAgent
     * @description Detects and provides information about the client browser.
     * @returns {object} An object containing various browser detection flags and details.
     */
    SysEnv.clientAgent = (() => { // Rename TD.browser to SysEnv.clientAgent
        const clientApp = globalScope.navigator?.appName?.toLowerCase() || ''; // Rename appName to clientApp
        const agentString = globalScope.navigator?.userAgent?.toLowerCase() || ''; // Rename userAgent to agentString
        const vendorString = globalScope.navigator?.vendor?.toLowerCase() || ''; // Rename vendor to vendorString

        const browserInfo = { // Rename 'browser' to 'browserInfo'
            isWebkitEngine: false, // Rename 'webkit' to 'isWebkitEngine'
            isChromeBrowser: false, // Rename 'chrome' to 'isChromeBrowser'
            isSafariBrowser: false, // Rename 'safari' to 'isSafariBrowser'
            isMSInternetExplorer: false, // Rename 'msie' to 'isMSInternetExplorer'
            isMozillaFirefox: false, // Rename 'firefox' to 'isMozillaFirefox'
            isOperaBrowser: false, // Rename 'opera' to 'isOperaBrowser'
            browserName: "Unknown Client", // Rename 'name' to 'browserName'
            browserVersion: "Undefined" // Rename 'version' to 'browserVersion'
        };

        // Guard clause for navigator object
        if (!globalScope.navigator) {
            console.warn("SysEnv.clientAgent: navigator object not found. Cannot detect browser.");
            return browserInfo;
        }

        // Constants for browser identifiers
        const IE_KEYWORD = "msie";
        const FIREFOX_KEYWORD = "firefox";
        const OPERA_ENGINE_KEYWORD = "presto"; // Opera used Presto engine, but user agent might just say "Opera"
        const CHROME_VENDOR_KEYWORD = "google";
        const SAFARI_VENDOR_KEYWORD = "apple";

        let currentVersion = "Undefined"; // Use let for version

        // --- Webkit-based browser detection (Chrome, Safari) ---
        // Prioritize more specific detections first
        if (vendorString) {
            const isGoogleVendor = vendorString.includes(CHROME_VENDOR_KEYWORD);
            const isAppleVendor = vendorString.includes(SAFARI_VENDOR_KEYWORD);

            if (isGoogleVendor || isAppleVendor) {
                browserInfo.isWebkitEngine = true;

                if (isGoogleVendor) {
                    browserInfo.isChromeBrowser = true;
                    browserInfo.browserName = "Google Chrome";
                    currentVersion = agentString.split('chrome/')[1]?.split(' ')[0] || "Unknown"; // Use optional chaining for safer access
                } else if (isAppleVendor) { // Use else if for Safari to avoid conflicts
                    browserInfo.isSafariBrowser = true;
                    browserInfo.browserName = "Apple Safari";
                    currentVersion = agentString.split('version/')[1]?.split(' ')[0] || "Unknown";
                }
            }
        }

        // --- Other browser detections ---
        // Use a series of `else if` to ensure only one main browser is detected
        if (agentString.includes(FIREFOX_KEYWORD)) {
            browserInfo.isMozillaFirefox = true;
            browserInfo.browserName = "Mozilla Firefox";
            currentVersion = agentString.split('firefox/')[1]?.split(' ')[0] || "Unknown";
        } else if (agentString.includes(OPERA_ENGINE_KEYWORD) || agentString.includes('opera')) { // Also check for 'opera' string
            browserInfo.isOperaBrowser = true;
            browserInfo.browserName = "Opera Browser";
            currentVersion = agentString.split('version/')[1]?.split(' ')[0] || agentString.split('opera/')[1]?.split(' ')[0] || "Unknown"; // Handle both patterns
        } else if (agentString.includes(IE_KEYWORD) || (clientApp === "microsoft internet explorer")) { // Add appName check for older IE
            browserInfo.isMSInternetExplorer = true;
            browserInfo.browserName = "Microsoft Internet Explorer";
            // Extract version for IE, which can be tricky
            const ieMatch = agentString.match(/(msie |rv:)(\d+\.\d+)/); // More robust regex for IE/Trident
            if (ieMatch && ieMatch[2]) {
                currentVersion = ieMatch[2];
            } else {
                currentVersion = "Unknown";
            }
        }

        // Final version assignment
        browserInfo.browserVersion = currentVersion;

        return browserInfo;
    })();

})(globalScope, globalScope.SysEnv = globalScope.SysEnv || {});

((globalScope, SysEnv, voidValue) => { // Renamed undefined to voidValue, using modern arrow function
    "use strict";

    // Utility for debouncing resize events
    const debounce = (func, delay) => {
        let timeoutId;
        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(this, args), delay);
        };
    };

    /**
     * @module SysEnv.responsiveQueryHandler
     * @description Manages and provides information about active CSS media queries based on viewport width.
     * @returns {object} An object containing media query parsing and active query detection logic.
     */
    SysEnv.responsiveQueryHandler = (() => { // Rename TD.mq to SysEnv.responsiveQueryHandler
        const queryState = { // Rename 'mq' to 'queryState'
            minWidthPattern: /min-(device-){0,1}width:\s*(\d+)px/gi, // Renamed regex, simplified capture group
            maxWidthPattern: /max-(device-){0,1}width:\s*(\d+)px/gi, // Renamed regex
            currentViewportWidth: 0, // Initialized to 0, will be updated
            processedStyleSheets: [], // Renamed 'stylesheets' to 'processedStyleSheets'
            activeQueryDefinitions: {}, // Renamed 'queries' to 'activeQueryDefinitions'
            resizeThrottleTimer: null, // Renamed 'resizeTimer' for clarity
            activeScreenSegment: 0, // Renamed 'screen'
            currentActiveMediaQuery: null // Renamed 'currentMQ'
        };

        // Guard clause for document.styleSheets availability
        if (!globalScope.document?.styleSheets) {
            console.warn("SysEnv.responsiveQueryHandler: document.styleSheets not available. Media queries cannot be processed.");
            return queryState; // Return an empty state
        }

        // Initial setup function
        const initializeQuerySystem = () => { // Rename 'init' to 'initializeQuerySystem'
            queryState.processedStyleSheets = filterRelevantStyleSheets(Array.from(globalScope.document.styleSheets)); // Use Array.from and filter
            queryState.activeQueryDefinitions = parseAllStyleSheetRules(queryState.processedStyleSheets);
            updateCurrentMediaQueryState();
        };

        /**
         * Filters stylesheets to exclude print media and invalid ones.
         * @param {CSSStyleSheet[]} sheets - The collection of stylesheets.
         * @returns {CSSStyleSheet[]} Filtered stylesheets.
         */
        const filterRelevantStyleSheets = (sheets) => { // Rename 'selectStylesheets'
            return sheets.filter(sheet => {
                try { // Added try-catch for accessing sheet.mediaText, which can throw for cross-origin stylesheets
                    const mediaText = sheet.media.mediaText || String(sheet.media);
                    return mediaText.indexOf('print') === -1;
                } catch (e) {
                    // console.warn("Could not access stylesheet media due to security restrictions:", e); // Optional logging
                    return false; // Exclude inaccessible stylesheets
                }
            });
        };

        /**
         * Parses all rules within stylesheets to extract media query definitions.
         * @param {CSSStyleSheet[]} sheets - Filtered stylesheets.
         * @returns {object} An object mapping min-widths to an array of query definitions.
         */
        const parseAllStyleSheetRules = (sheets) => { // Rename 'parseStylesheets'
            const gatheredLayouts = {}; // Rename 'layouts'

            for (const sheet of sheets) { // Use for...of loop
                const processMediaQueryString = (mediaString) => {
                    const layoutDef = {};
                    layoutDef.min = mediaString.match(queryState.minWidthPattern);
                    layoutDef.max = mediaString.match(queryState.maxWidthPattern);

                    if (!layoutDef.min && !layoutDef.max) {
                        return null; // No min/max width found, skip
                    }

                    // Helper to extract integer from regex match
                    const extractWidth = (matchArray) =>
                        matchArray ? parseInt(matchArray[0].split(':')[1].trim(), 10) : voidValue; // Use voidValue

                    layoutDef.min = extractWidth(layoutDef.min) ?? 0; // Use nullish coalescing operator
                    layoutDef.max = extractWidth(layoutDef.max) ?? Infinity; // Use Infinity for 'to infinity and beyond!'

                    layoutDef.queryText = mediaString; // Rename 'query' to 'queryText'
                    return layoutDef;
                };

                // Process sheet-level media (e.g., <link media="...">)
                let sheetMediaText = '';
                try {
                    sheetMediaText = sheet.media.mediaText || String(sheet.media);
                } catch (e) {
                    // SysEnv.log?.('Failed to access sheet.mediaText for parsing.', e); // Use optional chaining for SysEnv.log
                }

                if (sheetMediaText && sheetMediaText.indexOf('print') === -1) {
                    const sheetLayout = processMediaQueryString(sheetMediaText);
                    if (sheetLayout) {
                        gatheredLayouts[sheetLayout.min] = gatheredLayouts[sheetLayout.min] || [];
                        gatheredLayouts[sheetLayout.min].push(sheetLayout);
                    }
                }

                // Process rules within the stylesheet (e.g., @media rules)
                let cssRules = null;
                try {
                    cssRules = sheet.cssRules || sheet.rules;
                } catch (e) {
                    // SysEnv.log?.('Failed to read CSS rules from stylesheet: ', e);
                    continue; // Skip to next stylesheet
                }

                if (cssRules) {
                    for (const rule of cssRules) {
                        // Check if it's a CSSMediaRule and not for print
                        if (rule.media && (rule instanceof globalScope.CSSMediaRule || rule.type === globalScope.CSSRule.MEDIA_RULE)) {
                            const ruleMediaText = rule.media.mediaText || String(rule.media);
                            if (ruleMediaText.indexOf('print') === -1) {
                                const ruleLayout = processMediaQueryString(ruleMediaText);
                                if (ruleLayout) {
                                    gatheredLayouts[ruleLayout.min] = gatheredLayouts[ruleLayout.min] || [];
                                    gatheredLayouts[ruleLayout.min].push(ruleLayout);
                                }
                            }
                        }
                    }
                }
            }

            // Sort queries by min-width, then by max-width
            for (const minKey in gatheredLayouts) {
                if (Object.prototype.hasOwnProperty.call(gatheredLayouts, minKey)) {
                    gatheredLayouts[minKey].sort((a, b) => {
                        // Infinity should come last in ascending order
                        if (a.max === Infinity && b.max !== Infinity) return 1;
                        if (b.max === Infinity && a.max !== Infinity) return -1;
                        return a.max - b.max;
                    });
                }
            }

            return gatheredLayouts;
        };

        /**
         * Updates the current active media query state based on the viewport width.
         * Dispatches a custom event 'SysEnvMediaQueryChange' if the active query changes.
         */
        const updateCurrentMediaQueryState = () => { // Rename 'getCurrentMQ'
            const oldActiveMQ = queryState.currentActiveMediaQuery;
            queryState.currentViewportWidth = globalScope.innerWidth || globalScope.document.documentElement.clientWidth || globalScope.document.body.clientWidth;

            const allMinKeys = Object.keys(queryState.activeQueryDefinitions).map(Number).sort((a, b) => a - b);
            let matchingQueries = [];
            queryState.activeScreenSegment = 0; // Reset segment

            for (const minWidth of allMinKeys) {
                if (minWidth <= queryState.currentViewportWidth) { // Use <= for inclusive check
                    matchingQueries = queryState.activeQueryDefinitions[minWidth];
                    queryState.activeScreenSegment++; // Increment segment count
                } else {
                    break; // No need to check further min-widths as keys are sorted
                }
            }

            // Find the most specific (smallest max-width or Infinity) among the matching queries
            queryState.currentActiveMediaQuery = null;
            for (const queryDef of matchingQueries) {
                if (queryDef.max >= queryState.currentViewportWidth) {
                    // This query matches. If we already have one, check if this is "better" (smaller max)
                    if (!queryState.currentActiveMediaQuery || queryDef.max < queryState.currentActiveMediaQuery.max) {
                        queryState.currentActiveMediaQuery = queryDef;
                    }
                }
            }

            // If no specific query found, but there are matching queries, pick the last one (largest min-width)
            if (!queryState.currentActiveMediaQuery && matchingQueries.length > 0) {
                 queryState.currentActiveMediaQuery = matchingQueries[matchingQueries.length - 1];
            }

            // Dispatch custom event if the active media query has changed
            if (oldActiveMQ?.queryText !== queryState.currentActiveMediaQuery?.queryText) {
                const event = new CustomEvent('SysEnvMediaQueryChange', {
                    detail: {
                        oldQuery: oldActiveMQ,
                        newQuery: queryState.currentActiveMediaQuery,
                        viewport: queryState.currentViewportWidth
                    }
                });
                globalScope.dispatchEvent(event);
            }
        };

        // Debounced resize handler
        const handleViewportResize = debounce(() => { // Rename 'resize', use debounce
            updateCurrentMediaQueryState();
        }, 100); // 100ms debounce delay

        // Initial setup call
        initializeQuerySystem();

        // Event listener setup using modern methods
        globalScope.addEventListener('resize', handleViewportResize, { passive: true }); // Add passive for performance

        return queryState;
    })();
})(globalScope, globalScope.SysEnv = globalScope.SysEnv || {}, undefined); // Pass undefined explicitly for the voidValue parameter

((globalScope, SysEnv) => {
    "use strict";

    // Helper to create and append DOM elements
    const createAndAppendElement = (parent, tag, classes = [], textContent = '', id = '') => {
        const element = globalScope.document.createElement(tag);
        if (classes.length) element.classList.add(...classes);
        if (textContent) element.textContent = textContent;
        if (id) element.id = id;
        parent.appendChild(element);
        return element;
    };

    /**
     * @namespace SysEnv.debugOverlay
     * @description Provides a small debug overlay to display current system environment info.
     * This module aims to provide visibility into detected OS, browser, and active media query.
     */
    const debugOverlayModule = (() => {
        let overlayContainer = null; // Rename 'el' to 'overlayContainer'
        let isOverlayVisible = false; // Add state for visibility

        // Constants for DOM element IDs and classes
        const OVERLAY_ID = 'sys_env_debug_panel';
        const OVERLAY_CLASS = 'sys-env-debug-panel';
        const INFO_SECTION_CLASS = 'sys-env-info-section';
        const TOGGLE_BUTTON_ID = 'sys_env_toggle_btn';

        /**
         * Initializes the debug overlay, creating it if it doesn't exist.
         * Prevents re-initialization if already present.
         */
        const initializeDebugPanel = () => { // Rename 'init'
            overlayContainer = globalScope.document.getElementById(OVERLAY_ID);

            if (overlayContainer) {
                console.log("SysEnv debug panel already initialized.");
                return false; // Panel already exists
            }

            // Create the main container for the debug panel
            overlayContainer = createAndAppendElement(globalScope.document.body, 'div', [OVERLAY_CLASS], '', OVERLAY_ID);
            overlayContainer.style.cssText = `
                position: fixed; bottom: 10px; right: 10px; z-index: 9999;
                background: rgba(0,0,0,0.8); color: white; padding: 10px;
                border-radius: 5px; font-family: monospace; font-size: 12px;
                max-width: 300px; max-height: 80vh; overflow-y: auto;
                box-shadow: 0 2px 10px rgba(0,0,0,0.5);
                display: none; /* Initially hidden */
            `;
            isOverlayVisible = false; // Ensure state matches style

            // Add a toggle button
            const toggleButton = createAndAppendElement(globalScope.document.body, 'button', [], 'Toggle SysEnv Debug', TOGGLE_BUTTON_ID);
            toggleButton.style.cssText = `
                position: fixed; bottom: 10px; right: 320px; z-index: 9999;
                background: #007bff; color: white; border: none; padding: 5px 10px;
                border-radius: 3px; cursor: pointer; font-size: 10px;
            `;
            toggleButton.addEventListener('click', togglePanelVisibility);

            // Populate the overlay with information
            updatePanelContent();

            // Listen for media query changes to update the panel
            globalScope.addEventListener('SysEnvMediaQueryChange', updatePanelContent);

            return true;
        };

        /**
         * Toggles the visibility of the debug panel.
         */
        const togglePanelVisibility = () => {
            if (overlayContainer) {
                isOverlayVisible = !isOverlayVisible;
                overlayContainer.style.display = isOverlayVisible ? 'block' : 'none';
            }
        };

        /**
         * Updates the content of the debug panel with fresh system information.
         */
        const updatePanelContent = () => {
            if (!overlayContainer) return;

            // Clear previous content
            overlayContainer.innerHTML = '';

            // Guard against missing SysEnv components
            if (!SysEnv || !SysEnv.platformInfo || !SysEnv.clientAgent || !SysEnv.responsiveQueryHandler) {
                createAndAppendElement(overlayContainer, 'p', [], 'SysEnv components not fully loaded or available.');
                return;
            }

            // OS Information
            const osSection = createAndAppendElement(overlayContainer, 'div', [INFO_SECTION_CLASS]);
            createAndAppendElement(osSection, 'h4', [], 'OS Details:');
            for (const [key, value] of Object.entries(SysEnv.platformInfo)) {
                // Display true booleans or non-booleans, skip false booleans
                if (typeof value !== 'boolean' || value === true) {
                    createAndAppendElement(osSection, 'p', [], `${key}: ${value}`);
                }
            }

            // Browser Information
            const browserSection = createAndAppendElement(overlayContainer, 'div', [INFO_SECTION_CLASS]);
            createAndAppendElement(browserSection, 'h4', [], 'Browser Details:');
            for (const [key, value] of Object.entries(SysEnv.clientAgent)) {
                if (typeof value !== 'boolean' || value === true) {
                    createAndAppendElement(browserSection, 'p', [], `${key}: ${value}`);
                }
            }

            // Media Query Information
            const mqSection = createAndAppendElement(overlayContainer, 'div', [INFO_SECTION_CLASS]);
            createAndAppendElement(mqSection, 'h4', [], 'Media Query:');
            const currentMQ = SysEnv.responsiveQueryHandler.currentActiveMediaQuery;
            const viewportWidth = SysEnv.responsiveQueryHandler.currentViewportWidth;

            createAndAppendElement(mqSection, 'p', [], `Viewport: ${viewportWidth}px`);
            createAndAppendElement(mqSection, 'p', [], `Active Segment: ${SysEnv.responsiveQueryHandler.activeScreenSegment}`);

            if (currentMQ) {
                createAndAppendElement(mqSection, 'p', [], `Min-Width: ${currentMQ.min === 0 ? '0px' : currentMQ.min + 'px'}`);
                createAndAppendElement(mqSection, 'p', [], `Max-Width: ${currentMQ.max === Infinity ? 'Infinity' : currentMQ.max + 'px'}`);
                createAndAppendElement(mqSection, 'p', [], `Query: ${currentMQ.queryText}`);
            } else {
                createAndAppendElement(mqSection, 'p', [], 'No specific media query active.');
            }
        };

        // Export public methods for external control if needed
        return {
            init: initializeDebugPanel,
            show: () => { if (overlayContainer) { overlayContainer.style.display = 'block'; isOverlayVisible = true; } },
            hide: () => { if (overlayContainer) { overlayContainer.style.display = 'none'; isOverlayVisible = false; } },
            toggle: togglePanelVisibility,
            refresh: updatePanelContent
        };
    })();

    // Auto-initialize the debug panel when the DOM is ready
    if (globalScope.document.readyState === 'loading') {
        globalScope.document.addEventListener('DOMContentLoaded', debugOverlayModule.init);
    } else {
        debugOverlayModule.init();
    }

    // Expose the module if needed, though it's self-initializing
    SysEnv.debugOverlay = debugOverlayModule;

})(window, window.SysEnv = window.SysEnv || {});