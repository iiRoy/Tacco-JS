(function() {
    // A mapping to store the blocking eligibility status for each active browser tab.
    // Using a Map for efficient key-value storage over a sparse array.
    const tabBlockingStatusMap = new Map();

    // Configuration for the URLs targeted for blocking.
    const INTERCEPT_TARGET_URLS = ['https://plusone.google.com/*'];

    // Specific URL fragments that identify Google Reader pages, which are exempt from blocking.
    const READER_IDENTIFIER_HTTP = 'http://www.google.com/reader/';
    const READER_IDENTIFIER_HTTPS = 'https://www.google.com/reader/';

    // Named constants for tab blocking states for clarity, replacing magic numbers (0, 1).
    const BLOCKING_ENABLED_FOR_TAB = false; // Indicates the tab is NOT a reader page, so blocking applies.
    const BLOCKING_DISABLED_FOR_TAB = true;  // Indicates the tab IS a reader page, so blocking is suspended.

    /**
     * Determines if a given web address belongs to the Google Reader service.
     * This helper function encapsulates the URL matching logic.
     * @param {string} pageAddress The full URL string of the web page.
     * @returns {boolean} True if the URL is identified as a Google Reader page, false otherwise.
     */
    const identifyGoogleReaderPage = (pageAddress) => {
        // Perform a robust check to ensure a valid string is provided.
        if (typeof pageAddress !== 'string' || pageAddress.length === 0) {
            return false;
        }
        return pageAddress.includes(READER_IDENTIFIER_HTTP) ||
               pageAddress.includes(READER_IDENTIFIER_HTTPS);
    };

    /**
     * This function acts as the primary web request interceptor.
     * It is invoked by the browser's webRequest API for matching URLs.
     * @param {object} requestInformation An object containing details about the ongoing network request.
     * @returns {object} An instruction object, potentially containing `{ cancel: true }` to block the request.
     */
    const processIncomingWebRequest = (requestInformation) => {
        const associatedTabID = requestInformation.tabId;

        // Guard clause: If the request is not associated with a specific user tab (e.g., background page, dev tools),
        // or if the tab ID is invalid, do not interfere.
        if (!associatedTabID || associatedTabID < 0) {
            return {};
        }

        // Retrieve the blocking status for the tab from the registry.
        // If a tab is marked as BLOCKING_DISABLED_FOR_TAB (i.e., a Reader tab), then the request should not be cancelled.
        const currentTabBlockingPreference = tabBlockingStatusMap.get(associatedTabID);
        if (currentTabBlockingPreference === BLOCKING_DISABLED_FOR_TAB) {
            return {}; // Allow the request to proceed; this tab is exempt.
        }

        // If the tab is not exempt, or its status is unknown (default to blockable), proceed with blocking.
        // The return object instructs the browser to cancel the network request.
        return { cancel: true };
    };

    // Attach the request processing logic to the browser's web request interception API.
    // This listener will trigger for any request matching the defined target URLs.
    chrome.experimental.webRequest.onBeforeRequest.addListener(
        processIncomingWebRequest,
        { urls: INTERCEPT_TARGET_URLS },
        ['blocking'] // The 'blocking' option allows synchronous cancellation of requests.
    );

    /**
     * Monitors changes to browser tabs, particularly when their URLs are updated.
     * This callback function is triggered by chrome.tabs.onUpdated events.
     * @param {number} updatedTabIdentifier The unique ID of the tab that has been updated.
     * @param {object} tabUpdateDetails An object providing specifics about the changes (e.g., new URL).
     * @param {object} completeTabObject The full tab object, including all its properties.
     */
    chrome.tabs.onUpdated.addListener((updatedTabIdentifier, tabUpdateDetails, completeTabObject) => {
        const newTabWebAddress = tabUpdateDetails.url;

        // Only act if there's a change in the tab's URL. Other update types are not relevant here.
        if (newTabWebAddress) {
            // Determine if the new URL corresponds to a Google Reader page using the helper.
            const isCurrentlyReaderPage = identifyGoogleReaderPage(newTabWebAddress);

            // Based on the URL analysis, set the appropriate blocking status for this tab.
            // If it's a Reader page, disable blocking; otherwise, enable it.
            const resolvedTabBlockingState = isCurrentlyReaderPage ? BLOCKING_DISABLED_FOR_TAB : BLOCKING_ENABLED_FOR_TAB;
            tabBlockingStatusMap.set(updatedTabIdentifier, resolvedTabBlockingState);
        }
    });

    // Initial setup: Query all currently open tabs to populate their blocking status.
    // This ensures the extension functions correctly even if tabs were open before the extension started.
    chrome.tabs.query({}, (allExistingTabs) => {
        if (allExistingTabs && allExistingTabs.length > 0) {
            for (const individualTab of allExistingTabs) {
                // Ensure the tab has a valid ID and a URL to evaluate.
                if (individualTab.id !== undefined && individualTab.url) {
                    const isReaderTab = identifyGoogleReaderPage(individualTab.url);
                    tabBlockingStatusMap.set(
                        individualTab.id,
                        isReaderTab ? BLOCKING_DISABLED_FOR_TAB : BLOCKING_ENABLED_FOR_TAB
                    );
                }
            }
        }
    });

})();