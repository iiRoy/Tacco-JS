WebNavigationTools = {
    attachListener: function(domElem, eventType, handlerFunc, capturePhase) {
        // Determine if event should be captured during the capturing phase; defaults to false.
        capturePhase = capturePhase || false;
        // Utilize the modern W3C event model if supported.
        if (domElem.addEventListener) {
            domElem.addEventListener(eventType, handlerFunc, capturePhase);
            return true; // Signal successful event registration.
        }
        // Fallback to Microsoft's legacy event model for older browsers.
        else if (domElem.attachEvent) {
            // Prepend 'on' to the event type for IE's attachEvent.
            var resultFlag = domElem.attachEvent('on' + eventType, handlerFunc);
            return resultFlag; // Return the outcome of the attachment.
        }
        // Basic assignment for very old browsers, which may overwrite existing handlers.
        else {
            domElem['on' + eventType] = handlerFunc; // Directly assign the handler.
        }
    }
}

WebNavigator = (function() {
    // Defines the characteristics of the detected user agent.
    var navAgent = {
        isIE: false,       // Flag indicating Internet Explorer.
        isFirefox: false,  // Flag indicating Mozilla Firefox.
        isSafari: false,   // Flag indicating Apple Safari.
        isOpera: false,    // Flag indicating Opera browser.
        agentVersion: -1   // The numerical version of the browser.
    };

    // The default URL hash fragment when no specific fragment is present.
    var initialFragment = '';

    // Stores the complete URL of the current location.
    var currentLocationRef = document.location.href;

    // The full URL when the application first loaded (primarily for IE's history).
    var startLocationRef = document.location.href;

    // The URL hash fragment present at the initial page load (for IE).
    var startFragment = document.location.hash;

    // The base path for the hidden history iframe's source, used by IE.
    var histFramePathPrefix = 'history/navigationFrame.html?';

    // Tracks the current length of the browser's native history, specifically for Safari.
    var currentHistoryCount = -1;

    // An array to manually manage history fragments for Safari.
    var fragmentTrail = [];

    // Represents the application's state upon initial loading.
    var firstState = composeStateEntry(startLocationRef, startLocationRef + '#' + startFragment, startFragment);

    // A stack containing states that have been navigated *back* from.
    var pastStates = [];
    // A stack holding states that can be navigated *forward* to.
    var futureStates = [];

    // An identifier for an active object, currently unused.
    var activeElementId = null;

    // Obtain and normalize the user agent string for browser detection.
    var userAgentString = navigator.userAgent.toLowerCase();

    // Identify Opera browser.
    if (userAgentString.indexOf("opera") !== -1) {
        navAgent.isOpera = true;
    }
    // Identify Internet Explorer and extract its version.
    else if (userAgentString.indexOf("msie") !== -1) {
        navAgent.isIE = true;
        navAgent.agentVersion = parseFloat(userAgentString.substring(userAgentString.indexOf('msie') + 4));
    }
    // Identify Safari and extract its version.
    else if (userAgentString.indexOf("safari") !== -1) {
        navAgent.isSafari = true;
        navAgent.agentVersion = parseFloat(userAgentString.substring(userAgentString.indexOf('safari') + 7));
    }
    // Identify Gecko-based browsers (e.g., Firefox).
    else if (userAgentString.indexOf("gecko") !== -1) {
        navAgent.isFirefox = true;
    }

    // Special flag for IE7 to manage initial load behavior.
    if (navAgent.isIE === true && navAgent.agentVersion === 7) {
        window["_msie_initial_load"] = false;
    }

    // --- Auxiliary functions for retrieving DOM elements ---

    // Locates the hidden iframe responsible for IE history.
    function retrieveHistoryFrame() {
        return document.getElementById('msie_history_frame');
    }

    // Finds the DIV element used for dynamically adding anchors in Firefox.
    function obtainAnchorElement() {
        return document.getElementById('gecko_anchor_container');
    }

    // Retrieves the DIV element that contains the form for Safari history management.
    function fetchFormElement() {
        return document.getElementById('webkit_form_container');
    }

    // Gets the input field where Safari stores its history state for persistence.
    function getPersistenceField() {
        return document.getElementById("webkit_remember_field");
    }

    // Obtains a Flash player object, capable of ExternalInterface communication.
    // Updated to support modern SWFObject2 deployments.
    function getFlashObject(objectId) {
        var idx; // Loop iteration variable.

        // Search for a specific object by ID first.
        if (objectId && document.getElementById(objectId)) {
            var targetObj = document.getElementById(objectId);
            // Check if it's a direct Flash object with SetVariable method.
            if (typeof targetObj.SetVariable !== "undefined") {
                return targetObj;
            } else {
                // If not direct, look for Flash objects within its children.
                var objTags = targetObj.getElementsByTagName("object");
                var embedTags = targetObj.getElementsByTagName("embed");
                for (idx = 0; idx < objTags.length; idx++) {
                    if (typeof objTags[idx].navigateURLChange !== "undefined")
                        return objTags[idx];
                }
                for (idx = 0; idx < embedTags.length; idx++) {
                    if (typeof embedTags[idx].navigateURLChange !== "undefined")
                        return embedTags[idx];
                }
            }
        }
        // If no specific ID, search the entire document for any Flash object.
        else {
            var objTags = document.getElementsByTagName("object");
            var embedTags = document.getElementsByTagName("embed");
            for (idx = 0; idx < embedTags.length; idx++) {
                if (typeof embedTags[idx].navigateURLChange !== "undefined") {
                    return embedTags[idx];
                }
            }
            for (idx = 0; idx < objTags.length; idx++) {
                if (typeof objTags[idx].navigateURLChange !== "undefined") {
                    return objTags[idx];
                }
            }
        }
        return undefined; // No Flash object found.
    }

    // Retrieves a collection of all Flash player objects on the page.
    function getAllFlashObjects() {
        var idx;
        var allObjects = []; // Array to collect all found Flash players.
        // Initially search for <object> tags.
        if (allObjects.length === 0) {
            var tempList = document.getElementsByTagName('object');
            for (idx = 0; idx < tempList.length; idx++) {
                if (typeof tempList[idx].navigateURLChange !== "undefined")
                    allObjects.push(tempList[idx]);
            }
        }
        // If no objects found or the first one is invalid, search for <embed> tags.
        if (allObjects.length === 0 || allObjects[0].object == null) {
            var tempList = document.getElementsByTagName('embed');
            for (idx = 0; idx < tempList.length; idx++) {
                if (typeof tempList[idx].navigateURLChange !== "undefined")
                    allObjects.push(tempList[idx]);
            }
        }
        return allObjects; // Returns the array of Flash player objects.
    }

    // Fetches the URL fragment from the content window of the IE history iframe.
    function fetchIframeFragment() {
        var frameDoc = retrieveHistoryFrame().contentWindow.document;
        var fragmentValue = String(frameDoc.location.search);
        // Handle cases where the search string is empty or just a question mark.
        if (fragmentValue.length === 1 && fragmentValue.charAt(0) === "?") {
            fragmentValue = "";
        }
        // Remove the leading '?' character if present.
        else if (fragmentValue.length >= 2 && fragmentValue.charAt(0) === "?") {
            fragmentValue = fragmentValue.substring(1);
        }
        return fragmentValue;
    }

    /* Acquires the current hash fragment from the URL, excluding the '#' symbol. */
    function getCurrentFragment() {
        // Using document.location.hash directly can sometimes be unreliable.
        var hashIndex = document.location.href.indexOf('#');
        return (hashIndex >= 0) ? document.location.href.substr(hashIndex + 1) : '';
    }

    /* Assigns a new hash fragment to the current URL. */
    function setCurrentFragment(fragmentValue) {
        // Direct assignment to document.location.hash can be tricky.
        if (fragmentValue === '') fragmentValue = '#' // Ensure a non-empty hash part.
        document.location.hash = fragmentValue;
    }

    // Constructs a standardized state object for tracking navigation history.
    function composeStateEntry(basePath, fullPath, appFragment) {
        return { 'basePath': basePath, 'fullPath': fullPath, 'appFragment': appFragment, 'pageTitle': null };
    }

    /* Appends a new entry to the browser's navigation history.
     *   basePath: The part of the URL before the hash fragment.
     *   fullPath: The complete URL, including the '#' and its following fragment.
     *   appFragment: Only the hash fragment portion of the URL.
     */
    function recordNavigationEntry(basePath, fullPath, appFragment) {

        // When a new entry is explicitly added, clear any forward history.
        futureStates = [];

        if (navAgent.isIE) {
            // For IE, if this is the initial fragment and initial load, it's a no-op.
            if (appFragment === initialFragment && document.location.href === startLocationRef && window['_msie_initial_load']) {
                currentLocationRef = startLocationRef;
                return;
            }
            // If the fragment is default during initial load, adjust the full path.
            if ((!appFragment || appFragment === initialFragment) && window['_msie_initial_load']) {
                fullPath = basePath + '#' + initialFragment;
                appFragment = initialFragment;
            } else {
                // For IE, update the hidden iframe's source to create a history entry.
                retrieveHistoryFrame().src = histFramePathPrefix + appFragment;
            }
            setCurrentFragment(appFragment); // Update the main window's URL hash.
        } else {

            // ADR: If navigating to the same fragment, update the existing state.
            if (pastStates.length === 0 && firstState.appFragment === appFragment) {
                firstState = composeStateEntry(basePath, fullPath, appFragment);
            } else if (pastStates.length > 0 && pastStates[pastStates.length - 1].appFragment === appFragment) {
                pastStates[pastStates.length - 1] = composeStateEntry(basePath, fullPath, appFragment);
            }

            if (navAgent.isSafari) {
                // Safari versions < 419.3 require a form submission to create history entries.
                if (navAgent.agentVersion <= 419.3) {
                    var fileName = window.location.pathname.toString();
                    fileName = fileName.substring(fileName.lastIndexOf("/") + 1);
                    fetchFormElement().innerHTML = '<form name="navigationForm" action="' + fileName + '#' + appFragment + '" method="GET"></form>';
                    // Transfer existing query string parameters to the new form.
                    var queryString = window.location.search.substring(1);
                    var queryStringParts = queryString.split("&");
                    for (var idx = 0; idx < queryStringParts.length; idx++) {
                        var tempPair = queryStringParts[idx].split("=");
                        var inputElem = document.createElement("input");
                        inputElem.type = "hidden";
                        inputElem.name = tempPair[0];
                        inputElem.value = tempPair[1];
                        document.forms.navigationForm.appendChild(inputElem);
                    }
                    document.forms.navigationForm.submit(); // Submit the form to change history.
                } else {
                    window.top.location.hash = appFragment; // Modern Safari can directly set hash.
                }
                // Safari needs manual history array maintenance.
                fragmentTrail[window.history.length] = appFragment;
                _saveStateData(); // Persist the custom history data.
            } else {
                // For Firefox and other modern browsers, use anchors and update hash.
                insertAnchorMark(appFragment);
                setCurrentFragment(appFragment);
            }
        }
        // Always add the newly created state to the back stack.
        pastStates.push(composeStateEntry(basePath, fullPath, appFragment));
    }

    // Stores Safari-specific history fragments in a hidden field.
    function _saveStateData() {
        if (navAgent.isSafari) {
            getPersistenceField().value = fragmentTrail.join(","); // Join fragments with commas.
        }
    }

    // Manages state changes when the browser's "back" button is used.
    function processBackNavigation() {
        // The current state is always the last one pushed onto the back stack.
        var currentEntry = pastStates.pop();
        if (!currentEntry) {
            return;
        } // No states to go back from.
        var previousEntry = pastStates[pastStates.length - 1];
        // If the back stack is empty, revert to the initial application state.
        if (!previousEntry && pastStates.length === 0) {
            previousEntry = firstState;
        }
        futureStates.push(currentEntry); // Move the current state to the forward stack.
    }

    // Manages state changes when the browser's "forward" button is used.
    function processForwardNavigation() {
        // This is an internal utility function.
        var nextEntry = futureStates.pop();
        if (!nextEntry) {
            return;
        } // No states to go forward to.
        pastStates.push(nextEntry); // Move the next state to the back stack.
    }

    // Handles scenarios where the URL is changed directly, not via history buttons.
    function processDirectUrlAccess() {
        // A direct URL change invalidates the forward history.
        futureStates = [];
    }

    /* Routinely checks for URL changes to detect browser navigation events. */
    function monitorUrlChanges() {

        if (navAgent.isIE) {
            // Detect if the main URL (excluding just the hash) has changed.
            if (currentLocationRef !== document.location.href && currentLocationRef + '#' !== document.location.href) {
                // This indicates a direct URL navigation or an external link click.
                // IE versions prior to 7 have a rendering bug where the address bar
                // doesn't update; a full page reload is required to fix this.
                if (navAgent.agentVersion < 7) {
                    currentLocationRef = document.location.href;
                    document.location.reload();
                } else {
                    // For IE7+, if the current hash doesn't match the iframe's, update the iframe.
                    if (getCurrentFragment() !== fetchIframeFragment()) {
                        var sourceToSet = histFramePathPrefix + getCurrentFragment();
                        retrieveHistoryFrame().src = sourceToSet;
                    }
                }
            }
        }

        if (navAgent.isSafari) {
            // Safari requires manual monitoring of the history length.
            if (currentHistoryCount >= 0 && window.history.length !== currentHistoryCount) {
                currentHistoryCount = window.history.length;
                var appFragment = fragmentTrail[currentHistoryCount]; // Retrieve the associated fragment.
                // Optional: if (appFragment === '') { appFragment = initialFragment; }

                // ADR: Check for multiple Flash instances scenario.
                if (typeof WebNavigator_multiInstance !== "undefined" && WebNavigator_multiInstance === true) {
                    var playerList = getAllFlashObjects();
                    for (var idx = 0; idx < playerList.length; idx++) {
                        playerList[idx].navigateURLChange(appFragment); // Notify each player.
                    }
                } else {
                    getFlashObject().navigateURLChange(appFragment); // Notify the primary player.
                }
                _saveStateData(); // Re-persist the updated state.
            }
        }
        if (navAgent.isFirefox) {
            // For Firefox, check if the full URL has undergone a change.
            if (currentLocationRef !== document.location.href) {
                var pastStateLength = pastStates.length;

                var navActions = {
                    back: false,    // Flag indicating a backward navigation.
                    forward: false, // Flag indicating a forward navigation.
                    set: false      // Flag for direct URL modification.
                }

                // Check for a back navigation, particularly to the very first state.
                if ((window.location.hash === startFragment || window.location.href === startLocationRef) && (pastStateLength === 1)) {
                    navActions.back = true;
                    processBackNavigation();
                }

                // First, attempt to detect a forward navigation.
                if (futureStates.length > 0) {
                    if (futureStates[futureStates.length - 1].appFragment === getCurrentFragment()) {
                        navActions.forward = true;
                        processForwardNavigation();
                    }
                }

                // If not a forward navigation, check for a backward step further in history.
                if ((pastStateLength >= 2) && (pastStates[pastStateLength - 2])) {
                    if (pastStates[pastStateLength - 2].appFragment === getCurrentFragment()) {
                        navActions.back = true;
                        processBackNavigation();
                    }
                }

                // If neither standard back nor forward, assume an arbitrary URL change.
                if (!navActions.back && !navActions.forward) {
                    var foundInHistory = {
                        back: -1,    // Index if found in pastStates.
                        forward: -1  // Index if found in futureStates.
                    }

                    // Scan both stacks to see if the URL matches an arbitrary entry.
                    for (var idx = 0; idx < pastStates.length; idx++) {
                        if (pastStates[idx].appFragment === getCurrentFragment() && idx !== (pastStateLength - 2)) {
                            directNavigation = true; // Marks as an arbitrary change.
                            foundInHistory.back = idx;
                        }
                    }
                    for (var idx = 0; idx < futureStates.length; idx++) {
                        if (futureStates[idx].appFragment === getCurrentFragment() && idx !== (pastStateLength - 2)) {
                            directNavigation = true; // Marks as an arbitrary change.
                            foundInHistory.forward = idx;
                        }
                    }
                    processDirectUrlAccess(); // Handle the arbitrary URL change.
                }

                // The Firefox URL has changed; notify the Flash application.
                currentLocationRef = document.location.href;
                var appFragment = getCurrentFragment();
                // Optional: if (appFragment === '') { appFragment = initialFragment; }

                // ADR: Support for multiple Flash instances.
                if (typeof WebNavigator_multiInstance !== "undefined" && WebNavigator_multiInstance === true) {
                    var playerList = getAllFlashObjects();
                    for (var idx = 0; idx < playerList.length; idx++) {
                        playerList[idx].navigateURLChange(appFragment);
                    }
                } else {
                    getFlashObject().navigateURLChange(appFragment);
                }
            }
        }
        // The original code had a setTimeout here, but it was commented out.
        // deferExecution(monitorUrlChanges, 50);
    }

    /* Injects a named anchor into the HTML document to legitimize it as a URL for Firefox. */
    function insertAnchorMark(appFragment) {
        // Only add the anchor if one with this name does not already exist.
        if (document.getElementsByName(appFragment).length === 0) {
            obtainAnchorElement().innerHTML += "<a name='" + appFragment + "'>" + appFragment + "</a>";
        }
    }

    // The primary initialization function for the WebNavigator module.
    var _startUp = function() {
        if (navAgent.isIE) {
            var scriptTags = document.getElementsByTagName('script');
            var frame_location_url;
            // Determine the path to the history frame HTML by inspecting script tags.
            for (var idx = 0, currentScript; currentScript = scriptTags[idx]; idx++) {
                if (currentScript.src.indexOf("navigation.js") !== -1) {
                    frame_location_url = (new String(currentScript.src)).replace("navigation.js", "navigationFrame.html");
                }
            }
            histFramePathPrefix = frame_location_url + "?";
            var frameSource = histFramePathPrefix;

            // Create and append the hidden iframe for IE history management.
            var historyIframe = document.createElement("iframe");
            historyIframe.id = 'msie_history_frame';
            historyIframe.name = 'msie_history_frame';
            historyIframe.src = 'javascript:false;'; // Prevents initial page load.

            try {
                document.body.appendChild(historyIframe);
            } catch (e) {
                // If appending fails immediately, defer it slightly.
                setTimeout(function() {
                    document.body.appendChild(historyIframe);
                }, 0);
            }
        }

        if (navAgent.isSafari) {
            // Create a hidden container for Safari's history persistence field.
            var persistenceContainer = document.createElement("div");
            persistenceContainer.id = 'webkit_persistence_container';
            document.body.appendChild(persistenceContainer);
            persistenceContainer.innerHTML = '<input type="text" id="webkit_remember_field" style="width: 500px;">';

            // Create a hidden container for Safari's history form.
            var formContainer = document.createElement("div");
            formContainer.id = 'webkit_form_container';
            document.body.appendChild(formContainer);

            // Create a reloader div for Safari, possibly an old workaround for history issues.
            var reloaderDiv = document.createElement('div');
            reloaderDiv.id = 'webkitreloader';
            var scriptTags = document.getElementsByTagName('script');
            var reloaderHtml;
            for (var idx = 0, currentScript; currentScript = scriptTags[idx]; idx++) {
                if (currentScript.src.indexOf("navigation.js") !== -1) {
                    reloaderHtml = (new String(currentScript.src)).replace(".js", ".html");
                }
            }
            reloaderDiv.innerHTML = '<iframe id="webkitreloader-iframe" src="about:blank" frameborder="no" scrolling="no"></iframe>';
            document.body.appendChild(reloaderDiv);
            reloaderDiv.style.position = 'absolute';
            reloaderDiv.style.left = reloaderDiv.style.top = '-9999px'; // Position off-screen.
            var reloaderIframe = reloaderDiv.getElementsByTagName('iframe')[0];

            // Load previously saved history fragments from the persistence field.
            if (document.getElementById("webkit_remember_field").value !== "") {
                fragmentTrail = document.getElementById("webkit_remember_field").value.split(",");
            }
        }

        if (navAgent.isFirefox) {
            // Create a hidden container for Firefox's dynamic anchors.
            var anchorContainer = document.createElement("div");
            anchorContainer.id = 'gecko_anchor_container';
            document.body.appendChild(anchorContainer);
        }

        // The original code had a setTimeout here, but it was commented out.
        // deferExecution(monitorUrlChanges, 50);
    }

    // Expose public methods and properties for the WebNavigator module.
    return {
        fragmentTrail: fragmentTrail,               // The array of Safari history fragments.
        getPastStates: function() { return pastStates; }, // Returns the back history stack.
        getFutureStates: function() { return futureStates }, // Returns the forward history stack.
        getFlashObject: getFlashObject,             // Function to retrieve a Flash object.
        recordNavigationEntry: recordNavigationEntry, // Main function to add a history entry.
        _startUp: _startUp,                         // Internal initialization function.
        _saveStateData: _saveStateData,             // Internal function to save Safari state data.
        _handleBack: processBackNavigation,         // Internal handler for back button events.
        _handleForward: processForwardNavigation,   // Internal handler for forward button events.
        _handleArbitrary: processDirectUrlAccess,   // Internal handler for direct URL access.
        monitorUrlChanges: monitorUrlChanges        // Function to periodically check for URL changes.
    };
})();