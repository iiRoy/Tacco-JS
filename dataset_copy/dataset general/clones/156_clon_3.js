(function(webRequestAPI, tabManagement, windowManagement){

    // Constants for configuration and frequently used strings, enhancing readability and maintainability.
    const BLANK_PAGE_REDIRECT_URL = 'about:blank'; // Target for blocked requests
    const EXCLUDED_HOST_PATTERN = 'chrome.google.com'; // Hostname for internal Chrome pages that shouldn't be scripted
    const SCRIPT_TO_HALT_PAGE = 'window.stop();'; // JavaScript to immediately stop page loading
    const PROTOCOL_HTTP = 'http://';
    const PROTOCOL_HTTPS = 'https://';
    const FAVICON_SUFFIX = '/favicon.ico'; // Common favicon pattern

    // Using Set objects for efficient storage and lookup of tab IDs.
    // 'processedViewIDs' stores identifiers of tabs that have been actively managed or "unblocked".
    // 'pendingBlockIDs' stores identifiers of tabs that are currently being blocked or are candidates for blocking.
    let processedViewIDs = new Set();
    let pendingBlockIDs = new Set();

    /**
     * Function to handle network requests before they are sent.
     * This is the core logic for redirecting unwanted requests.
     * @param {object} networkEventDetails - Details about the network request.
     * @returns {object} An object indicating whether to redirect or allow the request.
     */
    const routeIncomingNetworkCall = function(networkEventDetails) {
        const { tabId: currentPaneIdentifier, url: resourceAddress } = networkEventDetails;

        // Early exit: If the tab is already marked as processed, or if the request
        // is for a favicon (often non-critical), let it proceed.
        if (processedViewIDs.has(currentPaneIdentifier) || resourceAddress.endsWith(FAVICON_SUFFIX)) {
            return {}; // Allow the request to continue normally
        }

        // If this tab ID is not yet in the 'pendingBlockIDs' set, add it.
        // This ensures consistent blocking for new, unhandled tabs.
        if (!pendingBlockIDs.has(currentPaneIdentifier)) {
            pendingBlockIDs.add(currentPaneIdentifier);
            // console.log(`Initiating block for pane: ${currentPaneIdentifier}`); // Debugging line
        }

        // Redirect the request to a blank page, effectively preventing content load.
        return { redirectUrl: BLANK_PAGE_REDIRECT_URL };
    };

    /**
     * Helper function to evaluate the state of a browser tab and potentially activate it.
     * This involves moving it from 'pendingBlockIDs' to 'processedViewIDs' and reloading.
     * @param {object} paneInstance - The tab object to be evaluated.
     * @returns {Promise<boolean>} True if the tab was successfully activated and reloaded, false otherwise.
     */
    const assessAndEnablePane = async function(paneInstance) {
        // Validate the existence and basic structure of the pane object.
        if (!paneInstance || typeof paneInstance.id !== 'number') {
            // console.warn("Invalid pane object provided for assessment."); // Debugging line
            return false;
        }

        const paneIdentifier = paneInstance.id;

        // Conditions to skip activation:
        // 1. If the pane is already in the 'processedViewIDs' set.
        // 2. If the pane is NOT in the 'pendingBlockIDs' set (meaning it's not a candidate for unblocking).
        if (processedViewIDs.has(paneIdentifier) || !pendingBlockIDs.has(paneIdentifier)) {
            return false;
        }

        // Mark the pane as processed and remove it from the 'pendingBlockIDs' list.
        processedViewIDs.add(paneIdentifier);
        pendingBlockIDs.delete(paneIdentifier);

        // Attempt to reload the pane to apply the 'unblocking' effect.
        try {
            await tabManagement.reload(paneIdentifier);
            // console.log(`Pane ${paneIdentifier} reloaded and activated.`); // Debugging line
            return true;
        } catch (error) {
            // console.error(`Failed to reload pane ${paneIdentifier} during activation:`, error); // Debugging line
            return false;
        }
    };

    /**
     * Listener for when a browser tab becomes the active tab.
     * Triggers the assessment and potential activation of the newly focused tab.
     * @param {object} activationEventData - Data about the tab activation event.
     */
    const handlePaneFocusEvent = function(activationEventData) {
        tabManagement.get(activationEventData.tabId, assessAndEnablePane);
    };

    /**
     * Listener for updates to a browser tab (e.g., URL change, loading status).
     * Used to prevent scripting on certain URLs and to halt loading for unmanaged tabs.
     * @param {number} paneIdentifier - The ID of the updated tab.
     * @param {object} changeDetails - Details about the changes to the tab.
     * @param {object} paneObject - The full tab object after the update.
     */
    const handlePaneContentUpdate = function(paneIdentifier, changeDetails, paneObject) {
        // Guard clause: Do not attempt to script or interfere with internal Chrome pages
        // or the Chrome Web Store, as this is often restricted or problematic.
        if (paneObject && paneObject.url && paneObject.url.includes(EXCLUDED_HOST_PATTERN)) {
            return;
        }

        // Check if the pane is not yet in the 'processedViewIDs' set AND it's currently loading.
        // This targets tabs that are still in the process of fetching content but haven't been 'activated'.
        if (!processedViewIDs.has(paneIdentifier) && changeDetails.status === "loading") {
            // Execute a script to stop the page load at the earliest possible moment ('document_start').
            tabManagement.executeScript(paneIdentifier, {
                code: SCRIPT_TO_HALT_PAGE,
                runAt: "document_start"
            });
            // console.log(`Scripting pane ${paneIdentifier} to stop loading.`); // Debugging line
        }
    };

    /**
     * This function is called when a new tab or window is created.
     * Its purpose, as per the original code's unusual pattern, is to remove
     * specific event listeners, effectively "resetting" them. This might be
     * intended to prevent duplicate listener registrations or manage lifecycle.
     */
    const reinitializeExtensionListeners = function() {
        try {
            webRequestAPI.onBeforeRequest.removeListener(routeIncomingNetworkCall);
            tabManagement.onUpdated.removeListener(handlePaneContentUpdate);
            // console.info("Core extension listeners have been reinitialized (removed)."); // Debugging line
        } catch (e) {
            // console.warn("Failed to remove some listeners, they might not have been registered or were already removed.", e); // Debugging line
        }
    };


    // --- Event Listener Registrations ---

    // Register the listener for network requests.
    // This listener is crucial for implementing the redirection/blocking logic.
    webRequestAPI.onBeforeRequest.addListener(
        routeIncomingNetworkCall,
        {
            // Apply to all HTTP/HTTPS URLs.
            urls  : ["<all_urls>"],
            // Apply to various types of network resources.
            types : ["main_frame", "sub_frame", "stylesheet", "script", "image", "object", "xmlhttprequest", "other"]
        },
        // The "blocking" option allows the listener to modify or cancel the request.
        ["blocking"]
    );

    // Register the listener for tab updates.
    tabManagement.onUpdated.addListener(handlePaneContentUpdate);

    // Register the listener for tab activation events.
    tabManagement.onActivated.addListener(handlePaneFocusEvent);

    // Register the listener for new tab creation.
    // This triggers the unusual listener removal behavior.
    tabManagement.onCreated.addListener(reinitializeExtensionListeners);

    // Register the listener for new window creation.
    // This also triggers the unusual listener removal behavior.
    windowManagement.onCreated.addListener(reinitializeExtensionListeners);


    // --- Initial Setup and Activation ---

    // Query for the currently active tab in the current window to initialize its state.
    tabManagement.query({ active: true, currentWindow: true }, async function(activePanes) {
        // Ensure that at least one active tab was found.
        if (activePanes && activePanes.length > 0) {
            const initialActivePane = activePanes[0];

            // Add the ID of the initial active tab to the 'processedViewIDs' set.
            // This marks it as a tab that should not be blocked.
            processedViewIDs.add(initialActivePane.id);

            // If the active tab's URL starts with HTTP or HTTPS, reload it.
            // This ensures that the initial active tab properly loads its content
            // without being affected by any blocking logic that might have been
            // active before the extension fully initialized.
            if (initialActivePane.url && (initialActivePane.url.startsWith(PROTOCOL_HTTP) || initialActivePane.url.startsWith(PROTOCOL_HTTPS))) {
                try {
                    await tabManagement.reload(initialActivePane.id);
                    // console.log(`Initial active pane ${initialActivePane.id} reloaded for proper display.`); // Debugging line
                } catch (error) {
                    // console.error(`Failed to reload initial active pane ${initialActivePane.id}:`, error); // Debugging line
                }
            }
        } else {
            // console.warn("No active pane found during initial extension setup."); // Debugging line
        }
    });

})(chrome.webRequest, chrome.tabs, chrome.windows);