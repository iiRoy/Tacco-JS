let activeAcquisitions = new Set(); // A collection to keep track of resources that have been initiated for acquisition.
                                   // This helps in preventing redundant processing of the same resource.

/**
 * Configuration settings for the extension.
 * Centralizes magic strings and numbers for easier maintenance and modification.
 */
const APP_SETTINGS = {
    MP3_RESOURCE_PATH_FRAGMENT: "cloudfront.net/mp3/",
    LISTENER_REENABLE_DELAY_MS: 600, // Slightly increased delay from original 500ms for stability.
    WEB_REQUEST_FILTER_URLS: ["*://*.cloudfront.net/mp3/*"], // URLs to monitor for specific assets.
    WEB_REQUEST_OPTIONS: ['blocking'], // Web request options, 'blocking' allows synchronous modification.
    LOGGING_ENABLED: true, // Master switch for console logging.
};

/**
 * A helper function for conditional logging, controlled by APP_SETTINGS.LOGGING_ENABLED.
 * This prevents log messages from appearing in production builds if disabled.
 */
const console = (function(oldCons) {
    return {
        log: function(message) {
            APP_SETTINGS.LOGGING_ENABLED && oldCons.log(`[AssetAcq] ${message}`);
        },
        warn: function(message) {
            APP_SETTINGS.LOGGING_ENABLED && oldCons.warn(`[AssetAcq WARN] ${message}`);
        },
        debug: function(message) {
            APP_SETTINGS.LOGGING_ENABLED && oldCons.debug(`[AssetAcq DEBUG] ${message}`);
        }
    };
}(window.console));


/**
 * Initiates the process of acquiring a specific resource from a given URL
 * within the context of a browser tab. This function is responsible for
 * sending a message to the content script and managing the web request listener state.
 *
 * @param {string} resourceUri - The Uniform Resource Identifier of the resource to acquire.
 * @param {number} targetTabId - The unique identifier of the browser tab associated with this acquisition.
 * @returns {void}
 */
const initiateResourceAcquisition = (resourceUri, targetTabId) => {
    // Basic validation for input parameters to ensure robustness.
    if (!resourceUri || typeof resourceUri !== 'string' || resourceUri.trim() === '') {
        console.warn('Acquisition attempt failed: Invalid resource URI provided. Skipping.');
        return;
    }
    if (typeof targetTabId !== 'number' || targetTabId <= 0) {
        console.warn(`Acquisition attempt failed for ${resourceUri}: Invalid target tab ID provided. Skipping.`);
        return;
    }

    // Before sending the message, temporarily disable the web request observer.
    // This prevents potential re-triggering of the same acquisition during a brief window
    // and ensures that the current operation proceeds without immediate re-interception.
    if (chrome.webRequest.onBeforeRequest.hasListener(mediaAssetObserver)) {
        chrome.webRequest.onBeforeRequest.removeListener(mediaAssetObserver);
        console.debug(`Temporarily removed webRequest listener to process ${resourceUri}.`);
    }

    // Dispatch a message to the specified tab's content script to signal the start of the acquisition.
    // The "obtainAsset" action is a custom instruction for the content script to handle.
    chrome.tabs.sendMessage(targetTabId, { operation: "obtainAsset", sourceLink: resourceUri });

    // Mark this resource as actively being processed.
    // This helps `mediaAssetObserver` to avoid redundant processing if the same URL is encountered again quickly.
    activeAcquisitions.add(resourceUri);
    console.log(`Initiated acquisition for: ${resourceUri} in tab: ${targetTabId}.`);

    // Re-enable the web request observer after a short, configurable delay.
    // The delay allows the content script to receive and begin processing the message
    // before the network listener resumes monitoring.
    setTimeout(() => {
        setupWebRequestObserver();
        console.debug('Re-enabled webRequest listener after acquisition initiation delay.');
    }, APP_SETTINGS.LISTENER_REENABLE_DELAY_MS);
};

/**
 * Observes incoming web requests and filters for specific media assets (e.g., MP3s)
 * based on predefined URL patterns. If a matching resource is detected and it's not
 * already being acquired, it triggers the acquisition process.
 *
 * @param {object} requestDetails - An object containing details of the intercepted web request.
 * @returns {void}
 */
const mediaAssetObserver = (requestDetails) => {
    // Check if the request URL contains the specific MP3 path fragment defined in settings.
    const isTargetMp3Resource = requestDetails.url.includes(APP_SETTINGS.MP3_RESOURCE_PATH_FRAGMENT);

    // This conditional statement implements the core filtering logic:
    // 1. If it's not the target MP3 resource (e.g., a different file type or domain),
    //    then we should ignore this request.
    // 2. If the resource's URL is already present in `activeAcquisitions`,
    //    it means we have already initiated its acquisition, so we ignore it to prevent duplicates.
    if (!isTargetMp3Resource || activeAcquisitions.has(requestDetails.url)) {
        console.debug(`Skipping non-target or already-tracked resource: ${requestDetails.url}`);
        return; // Exit early if the resource doesn't meet criteria or is already handled.
    }

    // If the request passes the filters, trigger the acquisition process for this detected MP3 resource.
    initiateResourceAcquisition(requestDetails.url, requestDetails.tabId);
};

/**
 * Configures and activates the web request listener to monitor network traffic for specific patterns.
 * This function is designed to be idempotent; calling it multiple times will not add duplicate listeners,
 * ensuring that only one instance of the observer is active at any given time.
 *
 * @returns {void}
 */
const setupWebRequestObserver = () => {
    // Guard clause: Prevent adding multiple listeners if one is already active.
    if (chrome.webRequest.onBeforeRequest.hasListener(mediaAssetObserver)) {
        console.debug('Web request observer is already active. Skipping re-setup to maintain single listener.');
        return;
    }

    // Add the listener with the specified filter URLs and options.
    chrome.webRequest.onBeforeRequest.addListener(
        mediaAssetObserver,
        { urls: APP_SETTINGS.WEB_REQUEST_FILTER_URLS },
        APP_SETTINGS.WEB_REQUEST_OPTIONS
    );
    console.log('Web request observer activated, monitoring for specified media assets.');
};

// Initial activation of the web request observer when the script loads.
// This ensures that the extension starts monitoring network requests immediately upon startup.
setupWebRequestObserver();