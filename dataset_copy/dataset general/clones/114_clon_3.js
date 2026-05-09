const NavUtilities = {
    // Utility for attaching events to DOM elements, handling cross-browser quirks.
    attachDomEvent: function(targetElement, eventName, handlerFunction, useCaptureFlag) {
        // Normalize the capture flag to a boolean, defaulting to false if not provided.
        const captureOption = Boolean(useCaptureFlag);

        if (targetElement.addEventListener) {
            // Modern browsers: utilize the standard addEventListener method.
            targetElement.addEventListener(eventName, handlerFunction, captureOption);
            return true; // Operation successful.
        } else if (targetElement.attachEvent) {
            // Legacy Internet Explorer: employ the proprietary attachEvent method.
            // Note the mandatory 'on' prefix for the event type.
            const attachResult = targetElement.attachEvent('on' + eventName, handlerFunction);
            return attachResult; // Returns a boolean indicating success.
        } else {
            // Fallback for very old or non-compliant browsers: direct property assignment.
            // This approach overwrites any existing handler for the same event.
            targetElement['on' + eventName] = handlerFunction;
            // Implicit success; no specific return value for this case.
        }
    }
};

// Core module for managing browser history states within a Single-Page Application context.
const HistoryManager = (function() {
    // Details pertaining to the client's browser environment.
    let clientEnv = {
        isIE: false,
        isFirefox: false,
        isSafari: false,
        isOpera: false,
        versionNum: -1 // Specific version number where relevant.
    };

    // The default fragment identifier to use when none is explicitly provided.
    let defaultFragmentId = '';

    // The most recently observed full URL in the browser's address bar.
    let currentBrowserUrl = document.location.href;

    // The URL of the page at the moment of initial load.
    let initialPageUrl = document.location.href;

    // The hash fragment present in the URL upon initial page load.
    let initialUrlFragment = document.location.hash;

    // Base URL for the hidden history iframe, specifically for IE.
    let iframeSourcePrefix = 'history/historyFrame.html?';

    // Safari-specific: tracks the current size of the native browser history.
    let currentHistoryEntryCount = -1;

    // Safari-specific: a manually managed array of application state fragments.
    let fragmentHistory = [];

    // Represents the application's state at the very beginning.
    const initialAppState = createHistoryState(initialPageUrl, initialPageUrl + '#' + initialUrlFragment, initialUrlFragment);

    // Stack containing states that have been navigated *away from* (for "back" functionality).
    let pastStates = [];
    // Stack containing states that have been navigated *back from* (for "forward" functionality).
    let futureStates = [];

    // Analyze the User-Agent string to determine browser type and version.
    const userAgentString = navigator.userAgent.toLowerCase();

    if (userAgentString.includes("opera")) {
        clientEnv.isOpera = true;
    } else if (userAgentString.includes("msie")) {
        clientEnv.isIE = true;
        // Parse IE version from the User-Agent string.
        const ieVersionStart = userAgentString.indexOf('msie') + 4;
        clientEnv.versionNum = parseFloat(userAgentString.substring(ieVersionStart));
    } else if (userAgentString.includes("safari") && !userAgentString.includes("chrome")) {
        clientEnv.isSafari = true;
        // Parse Safari version, excluding Chrome which also contains "safari".
        const safariVersionStart = userAgentString.indexOf('safari') + 7;
        clientEnv.versionNum = parseFloat(userAgentString.substring(safariVersionStart));
    } else if (userAgentString.includes("gecko") && !userAgentString.includes("webkit")) {
        clientEnv.isFirefox = true; // Gecko-based, excluding WebKit browsers.
    }

    // Special flag for managing IE7's initial load behavior.
    if (clientEnv.isIE && clientEnv.versionNum === 7) {
        window["_ie_initial_load_done"] = false;
    }

    // --- DOM Element Retrieval Functions ---

    // Retrieves the hidden iframe element used for IE's history management.
    function retrieveHistoryIframe() {
        return document.getElementById('ie_historyFrame');
    }

    // Fetches the container div where Firefox-specific anchor elements are placed.
    function getFirefoxAnchorContainer() {
        return document.getElementById('firefox_anchorDiv');
    }

    // Obtains the container div for Safari's form-based history submission.
    function fetchSafariFormContainer() {
        return document.getElementById('safari_formDiv');
    }

    // Gets the hidden input field used by Safari to persist history states.
    function getSafariPersistenceField() {
        return document.getElementById("safari_remember_field");
    }

    // --- Flash Player Interaction Functions ---

    // Locates a Flash player object, either by a given ID or by searching the DOM.
    // This function accounts for different embedding patterns (object, embed, SWFObject2).
    function findFlashPlayer(playerIdentifier) {
        // Attempt to find the player by its ID first.
        if (playerIdentifier && document.getElementById(playerIdentifier)) {
            const containerElement = document.getElementById(playerIdentifier);
            // Check if the container itself is the player and supports ExternalInterface.
            if (typeof containerElement.SetVariable !== "undefined") {
                return containerElement;
            } else {
                // Otherwise, search for nested <object> or <embed> tags within the container.
                const nestedObjects = containerElement.getElementsByTagName("object");
                const nestedEmbeds = containerElement.getElementsByTagName("embed");

                for (let j = 0; j < nestedObjects.length; j++) {
                    if (typeof nestedObjects[j].browserURLChange !== "undefined") {
                        return nestedObjects[j];
                    }
                }
                for (let k = 0; k < nestedEmbeds.length; k++) {
                    if (typeof nestedEmbeds[k].browserURLChange !== "undefined") {
                        return nestedEmbeds[k];
                    }
                }
            }
        } else {
            // If no ID is provided or found, scan the entire document for players.
            const allEmbeds = document.getElementsByTagName("embed");
            const allObjects = document.getElementsByTagName("object");

            // Prioritize embeds, then objects, as per common Flash embedding practices.
            for (let i = 0; i < allEmbeds.length; i++) {
                if (typeof allEmbeds[i].browserURLChange !== "undefined") {
                    return allEmbeds[i];
                }
            }
            for (let i = 0; i < allObjects.length; i++) {
                if (typeof allObjects[i].browserURLChange !== "undefined") {
                    return allObjects[i];
                }
            }
        }
        return undefined; // No compatible Flash player found.
    }

    // Gathers all Flash player objects detected on the current page.
    function getAllFlashPlayers() {
        const foundPlayers = [];

        // Iterate through all <object> tags.
        const objectElements = document.getElementsByTagName('object');
        for (let i = 0; i < objectElements.length; i++) {
            if (typeof objectElements[i].browserURLChange !== "undefined") {
                foundPlayers.push(objectElements[i]);
            }
        }

        // If no players were found via <object> (or as a fallback), check <embed> tags.
        if (foundPlayers.length === 0) {
            const embedElements = document.getElementsByTagName('embed');
            for (let i = 0; i < embedElements.length; i++) {
                if (typeof embedElements[i].browserURLChange !== "undefined") {
                    foundPlayers.push(embedElements[i]);
                }
            }
        }
        return foundPlayers;
    }

    // --- URL Fragment (Hash) Management ---

    // Extracts the hash fragment from the IE history iframe's URL.
    function getIframeUrlFragment() {
        const iframeDocument = retrieveHistoryIframe().contentWindow.document;
        let fragmentPart = String(iframeDocument.location.search); // IE uses search part for hash in iframe.

        // Remove the leading '?' if present to get the pure fragment.
        if (fragmentPart.length > 0 && fragmentPart.startsWith("?")) {
            fragmentPart = fragmentPart.slice(1);
        }
        return fragmentPart;
    }

    // Retrieves the current URL hash fragment, excluding the '#' symbol.
    function getCurrentHashFragment() {
       // Direct use of document.location.hash can be inconsistent; parse from href.
       const fullPageUrl = document.location.href;
       const hashSymbolIndex = fullPageUrl.indexOf('#');
       return (hashSymbolIndex >= 0) ? fullPageUrl.slice(hashSymbolIndex + 1) : '';
    }

    // Updates the browser's URL hash fragment.
    function updateUrlHash(newHashValue) {
       // Ensure an empty hash is represented by '#' to prevent browser issues.
       const effectiveHash = (newHashValue === '') ? '#' : newHashValue;
       document.location.hash = effectiveHash;
    }

    // --- Application State Management ---

    // Creates a standardized object to represent a historical application state.
    function createHistoryState(basePath, fullPath, appFragment) {
        return {
            basePath: basePath,
            fullPath: fullPath,
            appFragment: appFragment,
            pageTitle: null // Reserved for potential future use (e.g., document.title).
        };
    }

    /*
     * Records a new application state into the browser's history.
     *   basePath: The URL portion preceding the hash.
     *   fullPath: The complete URL, including the hash fragment.
     *   appFragment: The hash fragment itself, representing the application's internal state.
     */
    function recordHistoryEntry(basePath, fullPath, appFragment) {
        // Any new navigation clears the "forward" history.
        futureStates = [];

        // Internet Explorer-specific history handling.
        if (clientEnv.isIE) {
            // Special handling for the very first history entry, potentially from iframe creation.
            if (appFragment === defaultFragmentId && document.location.href === initialPageUrl && window['_ie_initial_load_done']) {
                currentBrowserUrl = initialPageUrl; // Reset current URL to initial.
                return; // Suppress this initial, potentially redundant, navigation.
            }

            // Adjust URL for default fragment if applicable, and if not the very first action.
            if ((!appFragment || appFragment === defaultFragmentId) && window['_ie_initial_load_done']) {
                fullPath = basePath + '#' + defaultFragmentId;
                appFragment = defaultFragmentId;
            } else {
                // Instruct the hidden IE history iframe to navigate, thereby creating a history entry.
                retrieveHistoryIframe().src = iframeSourcePrefix + appFragment;
            }
            // Also ensure the main document's hash is updated.
            updateUrlHash(appFragment);
        } else {
            // Non-IE browser specific logic.

            // If this is the first entry and it matches the initial state, update initialAppState.
            // This handles cases where the default URL is explicitly navigated to.
            if (pastStates.length === 0 && initialAppState.appFragment === appFragment) {
                initialAppState.basePath = basePath;
                initialAppState.fullPath = fullPath;
            }
            // If the new fragment is identical to the last one, update the existing entry.
            const lastPastState = pastStates[pastStates.length - 1];
            if (lastPastState && lastPastState.appFragment === appFragment) {
                pastStates[pastStates.length - 1] = createHistoryState(basePath, fullPath, appFragment);
            }

            // Safari-specific history handling.
            if (clientEnv.isSafari) {
                // Older Safari versions required form submission to alter history.
                if (clientEnv.versionNum <= 419.3) {
                    const currentPageFile = window.location.pathname.split('/').pop(); // Get filename from path.
                    const formHtml = `<form name="historyForm" action="${currentPageFile}#${appFragment}" method="GET"></form>`;
                    fetchSafariFormContainer().innerHTML = formHtml;

                    // Transfer existing query string parameters to the form as hidden inputs.
                    const queryString = window.location.search.substring(1);
                    if (queryString) {
                        queryString.split("&").forEach(paramPair => {
                            const [key, value] = paramPair.split("=");
                            if (key) { // Ensure key exists before creating input.
                                const hiddenInput = document.createElement("input");
                                hiddenInput.type = "hidden";
                                hiddenInput.name = key;
                                hiddenInput.value = value || ''; // Handle value possibly being undefined.
                                document.forms.historyForm.appendChild(hiddenInput);
                            }
                        });
                    }
                    document.forms.historyForm.submit();
                } else {
                    // Modern Safari can directly manipulate top.location.hash.
                    top.location.hash = appFragment;
                }
                // Manually record the fragment in our Safari-specific history array.
                fragmentHistory[history.length] = appFragment;
                persistSafariStates(); // Save this manual history.
            } else {
                // For other browsers (e.g., Firefox), create a named anchor and update the hash.
                createAndSetAnchor(appFragment);
                updateUrlHash(appFragment);
            }
        }
        // Add the newly created state to the 'pastStates' stack.
        pastStates.push(createHistoryState(basePath, fullPath, appFragment));
    }

    // Stores the Safari-specific history fragments into a hidden DOM field.
    function persistSafariStates() {
        if (clientEnv.isSafari) {
            const persistenceField = getSafariPersistenceField();
            if (persistenceField) {
                persistenceField.value = fragmentHistory.join(",");
            }
        }
    }

    // Handles a detected "back" navigation event in the browser.
    function handleBrowserBack() {
        // The most recent state is at the top of 'pastStates'.
        const lastState = pastStates.pop();
        if (!lastState) {
            return; // No states to go back from.
        }

        // The state we just navigated away from now goes into 'futureStates'.
        futureStates.push(lastState);
    }

    // Handles a detected "forward" navigation event in the browser.
    function handleBrowserForward() {
        // The next state for "forward" is at the top of 'futureStates'.
        const nextState = futureStates.pop();
        if (!nextState) {
            return; // No states to go forward to.
        }
        // Move this state back to 'pastStates'.
        pastStates.push(nextState);
    }

    // Handles a navigation event that is neither a simple back nor forward.
    function handleDirectNavigation() {
        // Any direct navigation clears the 'futureStates' stack.
        futureStates = [];
    }

    /*
     * Periodically inspects the browser's URL for changes and reacts accordingly.
     * This function is designed to be called repeatedly by an external timer.
     */
    function monitorUrlChanges() {
        // IE-specific URL change detection and synchronization.
        if (clientEnv.isIE) {
            const currentDocumentUrl = document.location.href;
            // Detect if the browser's URL has changed from our last recorded state.
            if (currentBrowserUrl !== currentDocumentUrl && currentBrowserUrl + '#' !== currentDocumentUrl) {
                // This often indicates a user-initiated navigation or history manipulation.
                if (clientEnv.versionNum < 7) {
                    // Older IE versions may require a full page reload to correctly sync the URL.
                    currentBrowserUrl = currentDocumentUrl;
                    document.location.reload();
                } else {
                    // For IE7+, compare the main document's hash with the iframe's hash.
                    const mainHash = getCurrentHashFragment();
                    const iframeHash = getIframeUrlFragment();
                    if (mainHash !== iframeHash) {
                        // Synchronize the iframe's source to update IE's internal history.
                        retrieveHistoryIframe().src = iframeSourcePrefix + mainHash;
                    }
                }
            }
        }

        // Safari-specific URL change detection.
        if (clientEnv.isSafari) {
            // Safari's history.length property is crucial for detecting navigation.
            if (currentHistoryEntryCount >= 0 && history.length !== currentHistoryEntryCount) {
                currentHistoryEntryCount = history.length; // Update our internal counter.
                const targetFragment = fragmentHistory[currentHistoryEntryCount]; // Retrieve state from our manual history.

                notifyFlashPlayers(targetFragment); // Inform Flash players of the change.
                persistSafariStates(); // Re-save the state after potential modification.
            }
        }

        // Firefox-specific URL change detection and stack management.
        if (clientEnv.isFirefox) {
            const currentDocumentUrl = document.location.href;
            if (currentBrowserUrl !== currentDocumentUrl) {
                const currentHash = getCurrentHashFragment();
                const pastStatesCurrentLength = pastStates.length;

                let navigationType = {
                    isBack: false,
                    isForward: false,
                    isArbitrary: false
                };

                // Check for "back" navigation.
                const potentialBackStateIndex = pastStatesCurrentLength - 2;
                if (potentialBackStateIndex >= 0 && pastStates[potentialBackStateIndex].appFragment === currentHash) {
                    navigationType.isBack = true;
                    handleBrowserBack();
                } else if ((currentHash === initialUrlFragment || currentDocumentUrl === initialPageUrl) && pastStatesCurrentLength === 1) {
                    // Special case: going back to the very initial state.
                    navigationType.isBack = true;
                    handleBrowserBack();
                }

                // If not "back", check for "forward" navigation.
                if (!navigationType.isBack && futureStates.length > 0 && futureStates[futureStates.length - 1].appFragment === currentHash) {
                    navigationType.isForward = true;
                    handleBrowserForward();
                }

                // If neither back nor forward, it implies an arbitrary jump (e.g., direct URL change, or deep history navigation).
                if (!navigationType.isBack && !navigationType.isForward) {
                    // Search if the current hash exists anywhere in our history stacks.
                    const foundInPast = pastStates.some(state => state.appFragment === currentHash);
                    const foundInFuture = futureStates.some(state => state.appFragment === currentHash);

                    if (foundInPast || foundInFuture) {
                        navigationType.isArbitrary = true;
                        handleDirectNavigation(); // Clear forward stack on arbitrary navigation.
                    }
                }

                // Update the last known URL and inform Flash players about the change.
                currentBrowserUrl = currentDocumentUrl;
                notifyFlashPlayers(currentHash);
            }
        }
    }

    // Helper function to notify one or more Flash player instances about a URL change.
    function notifyFlashPlayers(fragment) {
        // Determine if multiple players need to be addressed, based on a global flag.
        const multiplePlayerMode = typeof window.BrowserHistory_multiple !== "undefined" && window.BrowserHistory_multiple === true;
        if (multiplePlayerMode) {
            const allPlayers = getAllFlashPlayers();
            allPlayers.forEach(player => {
                // Ensure the player object exists and has the expected ExternalInterface method.
                if (player && typeof player.browserURLChange === 'function') {
                    player.browserURLChange(fragment);
                }
            });
        } else {
            const singlePlayer = findFlashPlayer(); // Find the primary player.
            if (singlePlayer && typeof singlePlayer.browserURLChange === 'function') {
                singlePlayer.browserURLChange(fragment);
            }
        }
    }

    // Creates and appends a named anchor element to the DOM for history tracking.
    function createAndSetAnchor(fragmentToAnchor) {
       // Only add the anchor if one with the same name doesn't already exist.
       if (document.getElementsByName(fragmentToAnchor).length === 0) {
           const anchorContainer = getFirefoxAnchorContainer();
           if (anchorContainer) {
               anchorContainer.innerHTML += `<a name="${fragmentToAnchor}">${fragmentToAnchor}</a>`;
           }
       }
    }

    // --- Module Initialization ---
    let initializationComplete = false; // Flag to prevent multiple initializations.

    const initModule = function () {
        if (initializationComplete) {
            console.warn("HistoryManager module has already been initialized.");
            return;
        }

        // IE-specific setup: create and append the hidden history iframe.
        if (clientEnv.isIE) {
            let derivedIframeUrl = '';
            // Dynamically determine the iframe's path relative to the current script.
            const scriptTags = document.getElementsByTagName('script');
            for (let i = 0; i < scriptTags.length; i++) {
                const scriptPath = scriptTags[i].src;
                if (scriptPath.includes("history.js")) { // Assumes the script is named 'history.js'.
                    derivedIframeUrl = scriptPath.replace("history.js", "historyFrame.html");
                    break;
                }
            }
            // Update the global iframe source prefix with the derived path.
            iframeSourcePrefix = derivedIframeUrl + "?";

            const historyIframe = document.createElement("iframe");
            historyIframe.id = 'ie_historyFrame';
            historyIframe.name = 'ie_historyFrame';
            historyIframe.src = 'javascript:false;'; // Classic IE trick to prevent initial navigation.

            // Append the iframe to the document body, with a setTimeout for robustness.
            try {
                document.body.appendChild(historyIframe);
            } catch(e) {
                // Fallback for cases where document.body might not be fully ready.
                setTimeout(() => {
                    document.body.appendChild(historyIframe);
                }, 0);
            }
        }

        // Safari-specific setup: create hidden persistence fields and form containers.
        if (clientEnv.isSafari) {
            // Container for the hidden input field that stores history fragments.
            const rememberDiv = document.createElement("div");
            rememberDiv.id = 'safari_rememberDiv';
            // Position off-screen to hide it from view.
            rememberDiv.style.cssText = 'position: absolute; left: -9999px; top: -9999px; overflow: hidden;';
            document.body.appendChild(rememberDiv);
            rememberDiv.innerHTML = '<input type="text" id="safari_remember_field" style="width: 1px; height: 1px; border: none; padding: 0;">';

            // Container for the form used in older Safari versions for history manipulation.
            const formContainer = document.createElement("div");
            formContainer.id = 'safari_formDiv';
            formContainer.style.display = 'none'; // Hide this container.
            document.body.appendChild(formContainer);

            // Safari reloader iframe, also hidden.
            const reloaderContainer = document.createElement('div');
            reloaderContainer.id = 'safari_reloader_container';
            reloaderContainer.style.cssText = 'position: absolute; left: -9999px; top: -9999px; overflow: hidden; width: 1px; height: 1px;';
            document.body.appendChild(reloaderContainer);
            reloaderContainer.innerHTML = '<iframe id="safari_reloader_iframe" src="about:blank" frameborder="0" scrolling="no"></iframe>';

            // Attempt to restore history fragments from the hidden persistence field.
            const persistenceField = document.getElementById("safari_remember_field");
            if (persistenceField && persistenceField.value !== "") {
                fragmentHistory = persistenceField.value.split(",");
            }
        }

        // Firefox-specific setup: create a hidden container for anchor elements.
        if (clientEnv.isFirefox) {
            const anchorContainer = document.createElement("div");
            anchorContainer.id = 'firefox_anchorDiv';
            anchorContainer.style.display = 'none'; // Keep this element hidden.
            document.body.appendChild(anchorContainer);
        }
        
        initializationComplete = true; // Mark initialization as complete.
    };

    // Public interface exposed by the HistoryManager module.
    return {
        // Initiates the HistoryManager module, setting up browser-specific elements.
        init: initModule,
        // Provides read-only access to the Safari-specific fragment history array.
        getFragmentHistory: () => [...fragmentHistory], // Return a shallow copy.
        // Provides read-only access to the stack of past application states.
        getPastStates: () => [...pastStates], // Return a shallow copy.
        // Provides read-only access to the stack of future application states.
        getFutureStates: () => [...futureStates], // Return a shallow copy.
        // Exposes the function to find Flash player objects.
        retrieveFlashPlayer: findFlashPlayer,
        // Method to programmatically add a new state to the browser history.
        addApplicationState: recordHistoryEntry,
        // Method to be called periodically by an external timer to detect URL changes.
        pollForUrlChanges: monitorUrlChanges,
        // Provides a copy of the detected browser information.
        getBrowserInfo: () => ({ ...clientEnv })
    };
})();