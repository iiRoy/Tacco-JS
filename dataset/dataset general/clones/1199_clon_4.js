((globalScope, absenceMarker) => {
    "use strict";

    // Public API object
    const ChronoForge = globalScope.ChronoForge = globalScope.ChronoForge || {};

    // --- Internal State and Utilities ---
    let engineConfigured = false;
    const configSettings = {};
    const activeTimers = new Set(); // Using a Set for timers instead of an array
    let setupRoutineCompleted = false; // Flag for ChronoForge.setup

    // Minimal placeholder for ChronoForge.getState, as it's a dependency for URL helpers
    // The original code assumes History.getState exists; this provides a minimal equivalent.
    ChronoForge.getState = ChronoForge.getState || function(a, b) { return null; };

    // JSON handler setup (MooTools compatibility)
    ChronoForge.jsonProcessor = globalScope.JSON; // Renamed jsonHandler to jsonProcessor
    if (ChronoForge.jsonProcessor) {
        ChronoForge.jsonProcessor.stringifier = ChronoForge.jsonProcessor.stringifier || globalScope.JSON.encode; // Renamed stringify to stringifier
        ChronoForge.jsonProcessor.parser = ChronoForge.jsonProcessor.parser || globalScope.JSON.decode;     // Renamed parse to parser
    }

    // Check for prior loading
    if (ChronoForge.setup) {
        throw new Error('ChronoForge.js Core functionality has already been established.');
    }

    // --- Core Setup Function ---
    ChronoForge.setup = function() {
        if (setupRoutineCompleted) return true;
        setupRoutineCompleted = true;

        if (!globalScope.ChronoForge.Adapter) {
            return false;
        }

        if (globalScope.ChronoForge.configureEngine) {
            globalScope.ChronoForge.configureEngine();
        }

        if (globalScope.ChronoForge.initializeLegacyHtml) { // Renamed from initHtml4
            globalScope.ChronoForge.initializeLegacyHtml();
        }

        return true;
    };

    // --- Internal Logging Module ---
    const internalLogger = (() => {
        const checkConsoleAvailability = () =>
            globalScope.console && typeof globalScope.console.log === 'function' && typeof globalScope.console.log.apply === 'function';
        let consoleIsReady = checkConsoleAvailability();

        const compileMessage = (msg, extraItems) => {
            let finalOutput = String(msg);
            extraItems.forEach(item => {
                if (typeof item === 'object' && ChronoForge.jsonProcessor && ChronoForge.jsonProcessor.stringifier) {
                    try {
                        finalOutput += "\n" + ChronoForge.jsonProcessor.stringifier(item);
                    } catch (e) {
                        finalOutput += "\n[Circular Object Detected]";
                    }
                } else {
                    finalOutput += "\n" + String(item);
                }
            });
            return finalOutput;
        };

        return {
            outputMessage: function() {
                const callArguments = Array.from(arguments);
                const primaryMessage = callArguments.shift();
                const secondaryArguments = callArguments;
                const fullText = compileMessage(primaryMessage, secondaryArguments);

                if (consoleIsReady) {
                    if (globalScope.console.debug) {
                        globalScope.console.debug.apply(globalScope.console, [primaryMessage].concat(secondaryArguments));
                    } else {
                        globalScope.console.log.apply(globalScope.console, [primaryMessage].concat(secondaryArguments));
                    }
                } else {
                    const fallbackDisplay = globalScope.document.getElementById('loggingArea'); // Renamed 'log' to 'loggingArea'
                    if (fallbackDisplay && fallbackDisplay.tagName === 'TEXTAREA') {
                        fallbackDisplay.value += fullText + "\n-----\n";
                        fallbackDisplay.scrollTop = fallbackDisplay.scrollHeight - fallbackDisplay.clientHeight;
                    } else {
                        globalScope.alert(fullText);
                    }
                }
                return true;
            },
            logVerbose: function() {
                if (configSettings.verboseLogging) {
                    this.outputMessage.apply(this, arguments);
                }
            }
        };
    })();

    ChronoForge.logVerbose = internalLogger.logVerbose;
    ChronoForge.outputMessage = internalLogger.outputMessage;

    // --- Browser Detection Module ---
    const browserAnalyzer = (() => {
        let cachedLegacyBrowserVersion = absenceMarker;
        let cachedIsLegacyBrowser = absenceMarker;

        const retrieveLegacyBrowserVersion = () => { // Renamed getInternetExplorerMajorVersion
            if (cachedLegacyBrowserVersion !== absenceMarker) {
                return cachedLegacyBrowserVersion;
            }

            let currentVersion = 3;
            const tempDiv = globalScope.document.createElement('div');
            const foundIElements = tempDiv.getElementsByTagName('i'); // Renamed 'all' to 'foundIElements'

            while ((tempDiv.innerHTML = '<!--[if gt IE ' + (++currentVersion) + ']><i></i><![endif]-->') && foundIElements[0]) {}

            cachedLegacyBrowserVersion = (currentVersion > 4) ? currentVersion : false;
            return cachedLegacyBrowserVersion;
        };

        const checkLegacyBrowserStatus = () => { // Renamed isInternetExplorer
            if (cachedIsLegacyBrowser !== absenceMarker) {
                return cachedIsLegacyBrowser;
            }
            cachedIsLegacyBrowser = Boolean(retrieveLegacyBrowserVersion());
            return cachedIsLegacyBrowser;
        };

        return {
            fetchLegacyBrowserVersion: retrieveLegacyBrowserVersion,
            isLegacyBrowser: checkLegacyBrowserStatus
        };
    })();

    ChronoForge.fetchLegacyBrowserVersion = browserAnalyzer.fetchLegacyBrowserVersion;
    ChronoForge.isLegacyBrowser = browserAnalyzer.isLegacyBrowser;

    // --- Core Engine Configuration ---
    ChronoForge.configureEngine = function() { // Renamed initCore
        if (engineConfigured) {
            return false;
        }
        engineConfigured = true;

        const userInitialConfig = ChronoForge.initialConfig || {}; // Using a different entry point for user config

        configSettings.hashMonitorFrequency = userInitialConfig.hashMonitorFrequency || 100; // Renamed hashChangeInterval
        configSettings.safariProbeFrequency = userInitialConfig.safariProbeFrequency || 500; // Renamed safariPollInterval
        configSettings.verifyInterval = userInitialConfig.verifyInterval || 500; // Renamed doubleCheckInterval
        configSettings.storagePause = userInitialConfig.storagePause || 1000; // Renamed storeInterval
        configSettings.activityDelay = userInitialConfig.activityDelay || 250; // Renamed busyDelay
        configSettings.verboseLogging = userInitialConfig.verboseLogging || false; // Renamed debug
        configSettings.initialPageTitle = userInitialConfig.initialPageTitle || globalScope.document.title;

        // Timer management
        ChronoForge.purgeAllTimers = function() { // Renamed clearAllIntervals
            activeTimers.forEach(id => globalScope.clearInterval(id));
            activeTimers.clear();
        };

        // Feature emulation and known flaws
        const featureEmulation = {}; // Renamed emulated
        const knownFlaws = {};       // Renamed bugs

        const currentNavigator = globalScope.navigator;
        const userAgentString = currentNavigator.userAgent;
        const browserVendor = currentNavigator.vendor;
        const nativeHistory = globalScope.history;

        featureEmulation.pushState = (() => {
            const hasNativePushState = nativeHistory && nativeHistory.pushState && nativeHistory.replaceState;
            const isIOSPriorTo4_3 = (/ Mobile\/([1-7][a-z]|(8([abcde]|f(1[0-8]))))/i).test(userAgentString);
            const isOlderWebKitEngine = (/AppleWebKit\/5([0-2]|3[0-2])/i).test(userAgentString);
            return !Boolean(hasNativePushState && !(isIOSPriorTo4_3 || isOlderWebKitEngine));
        })();

        featureEmulation.hashChange = (() => {
            const windowSupportsHashChange = ('onhashchange' in globalScope) || ('onhashchange' in globalScope.document);
            const isOldIE = browserAnalyzer.isLegacyBrowser() && browserAnalyzer.fetchLegacyBrowserVersion() < 8;
            return Boolean(!windowSupportsHashChange || isOldIE);
        })();

        ChronoForge.functionalityActive = !featureEmulation.pushState; // Renamed enabled

        const isAppleWebKitBased = browserVendor === 'Apple Computer, Inc.' && (/AppleWebKit\/5([0-2]|3[0-3])/.test(userAgentString));

        knownFlaws.setHashIssue = Boolean(!featureEmulation.pushState && isAppleWebKitBased); // Renamed setHash
        knownFlaws.safariPollingRequired = Boolean(!featureEmulation.pushState && isAppleWebKitBased); // Renamed safariPoll
        knownFlaws.ieDoubleCheckNeeded = Boolean(browserAnalyzer.isLegacyBrowser() && browserAnalyzer.fetchLegacyBrowserVersion() < 8); // Renamed ieDoubleCheck
        knownFlaws.hashEscapeRequired = Boolean(browserAnalyzer.isLegacyBrowser() && browserAnalyzer.fetchLegacyBrowserVersion() < 7); // Renamed hashEscape

        ChronoForge.featureEmulation = featureEmulation;
        ChronoForge.knownFlaws = knownFlaws;

        // Utility functions
        ChronoForge.isObjectEmpty = function(targetObj) { // Renamed isEmptyObject
            return Object.keys(targetObj).length === 0;
        };

        ChronoForge.replicateObject = function(sourceObj) { // Renamed cloneObject
            let duplicatedItem;
            if (sourceObj) { // Original checks if obj is truthy
                let serializedData;
                try {
                    serializedData = ChronoForge.jsonProcessor && ChronoForge.jsonProcessor.stringifier ? ChronoForge.jsonProcessor.stringifier(sourceObj) : null;
                } catch (e) {
                    // Replicating original's error propagation for JSON.stringify failures if it were to occur
                    // The original `cloneObject` does not have a try-catch, so if stringify fails, it would throw.
                    throw e;
                }
                duplicatedItem = ChronoForge.jsonProcessor && ChronoForge.jsonProcessor.parser && serializedData !== null ? ChronoForge.jsonProcessor.parser(serializedData) : {};
            } else {
                duplicatedItem = {};
            }
            return duplicatedItem;
        };

        // URL Processing Module
        const urlProcessor = (() => {
            const pageLocationDetails = globalScope.document.location;

            const retrieveRootAddress = () => { // Renamed getRootUrl
                let rootPath = pageLocationDetails.protocol + '//' + (pageLocationDetails.hostname || pageLocationDetails.host);
                if (pageLocationDetails.port) {
                    rootPath += ':' + pageLocationDetails.port;
                }
                rootPath += '/';
                return rootPath;
            };

            const acquireBaseLink = () => { // Renamed getBaseHref
                const baseElements = globalScope.document.getElementsByTagName('base');
                let baseLinkHref = '';
                if (baseElements.length === 1) {
                    baseLinkHref = baseElements[0].href.replace(/[^\/]+$/, '');
                }
                baseLinkHref = baseLinkHref.replace(/\/+$/, '');
                if (baseLinkHref) baseLinkHref += '/';
                return baseLinkHref;
            };

            const obtainBaseLocation = () => { // Renamed getBaseUrl
                return acquireBaseLink() || urlProcessor.getCurrentPageDirectory() || retrieveRootAddress();
            };

            const getCurrentPageAddress = () => { // Renamed getPageUrl
                const stateRecord = ChronoForge.getState(false, false);
                const recordURI = (stateRecord || {}).url || pageLocationDetails.href;
                const currentPageURI = recordURI.replace(/\/+$/, '').replace(/[^\/]+$/, (segment) => {
                    return (/\!/).test(segment) ? segment : segment + '/';
                });
                return currentPageURI;
            };

            const getCurrentPageDirectory = () => { // Renamed getBasePageUrl
                const directoryURI = pageLocationDetails.href.replace(/[#\?].*/, '').replace(/[^\/]+$/, (segment) => {
                    return (/[^\/]$/).test(segment) ? '' : segment;
                }).replace(/\/+$/, '') + '/';
                return directoryURI;
            };

            const resolveAbsoluteAddress = (inputURL, allowBaseRef) => { // Renamed getFullUrl
                let finalURL = inputURL;
                const initialChar = inputURL.substring(0, 1);
                allowBaseRef = (allowBaseRef === absenceMarker) ? true : allowBaseRef; // Replicate default parameter

                if (/[a-z]+\:\/\//.test(inputURL)) {
                    // Full URL, no change
                } else if (initialChar === '/') {
                    finalURL = retrieveRootAddress() + inputURL.replace(/^\/+/,'');
                } else if (initialChar === '#') {
                    finalURL = getCurrentPageAddress().replace(/#!*/,'') + inputURL;
                } else if (initialChar === '?') {
                    finalURL = getCurrentPageAddress().replace(/[\?#]!*/,'') + inputURL;
                } else {
                    if (allowBaseRef) {
                        finalURL = obtainBaseLocation() + inputURL.replace(/^(\!\/)+/,'');
                    } else {
                        finalURL = getCurrentPageDirectory() + inputURL.replace(/^(\!\/)+/,'');
                    }
                }
                return finalURL.replace(/\#$/,'');
            };

            const condenseRelativeAddress = (absoluteURL) => { // Renamed getShortUrl
                /* Preliminary processing */
                // The original function body was incomplete (only had `// Prepare`).
                // This clone reflects that incompleteness to maintain identical behavior.
                return absoluteURL; // Placeholder return
            };

            return {
                retrieveRootAddress: retrieveRootAddress,
                acquireBaseLink: acquireBaseLink,
                obtainBaseLocation: obtainBaseLocation,
                getCurrentPageAddress: getCurrentPageAddress,
                getCurrentPageDirectory: getCurrentPageDirectory,
                resolveAbsoluteAddress: resolveAbsoluteAddress,
                condenseRelativeAddress: condenseRelativeAddress
            };
        })();

        // Expose URL processing functions
        ChronoForge.retrieveRootAddress = urlProcessor.retrieveRootAddress;
        ChronoForge.acquireBaseLink = urlProcessor.acquireBaseLink;
        ChronoForge.obtainBaseLocation = urlProcessor.obtainBaseLocation;
        ChronoForge.getCurrentPageAddress = urlProcessor.getCurrentPageAddress;
        ChronoForge.getCurrentPageDirectory = urlProcessor.getCurrentPageDirectory;
        ChronoForge.resolveAbsoluteAddress = urlProcessor.resolveAbsoluteAddress;
        ChronoForge.condenseRelativeAddress = urlProcessor.condenseRelativeAddress;

        return true; // Indicate successful configuration
    };

})(window);