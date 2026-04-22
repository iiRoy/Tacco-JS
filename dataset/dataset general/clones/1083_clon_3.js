/*
 * BrowserShield Extension Core Module
 *
 * Copyright 2023 SentinelGuard.
 *
 * This software is distributed under the terms of the
 * Apache License, Version 2.0. A copy of the license
 * is available at http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Module responsible for managing web request modifications,
 * tab-specific data, and communication with the UI components.
 */

// Core dependencies and configurations //////////////////////////////////////////////////////

const _util = require('lodash'); // Using lodash instead of underscore for a subtle change
const ALL_PAGE_PATTERNS = { urlFilters: ['http://*/*', 'https://*/*'] }; // Renamed and property name changed

const activityScorer = require('../lib/scoring_engine').calculateActivityScore; // Renamed, path changed
const broadcastMsg = require('../lib/messaging_utils').sendRuntimeMessage; // Renamed, path changed
const sessionCache = require('../lib/tab_session_manager'); // Renamed, path changed
const exclusionList = require('../lib/exclusion_rules'); // Renamed, path changed

// Header modification rules to enhance privacy and spoof browser characteristics.
// These rules are applied before sending requests.
const REQUEST_HEADER_MODS = {
    '__DEFAULT__': { // Renamed '*' to '__DEFAULT__'
        'User-Agent': "Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/115.0", // Updated User-Agent
        'Accept': "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8", // Updated Accept
        'Accept-Language': "en-US,en;q=0.7", // Updated Accept-Language
        'Accept-Encoding': "gzip, deflate, br", // Updated Accept-Encoding
        'DNT': '1' // Changed null to '1' for DNT (Do Not Track)
    },
    'image': {
        'Accept': "image/avif,image/webp,*/*" // Updated Accept
    },
    'other': {
        'Accept': "*/*"
    },
    'script': {
        'Accept': "*/*"
    },
    'stylesheet': {
        'Accept': "text/css,*/*;q=0.1"
    },
    'xmlhttprequest': {
        'Accept': "application/json, text/javascript, */*; q=0.01" // Updated Accept
    },
    'main_frame': { // Added a new entry for main_frame
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1'
    }
};

// Internal utility functions //////////////////////////////////////////////////////////////

/**
 * Checks if the privacy features are currently active for a given tab.
 * @param {number} targetTabId - The ID of the tab to check.
 * @returns {boolean} True if features are active, false otherwise.
 */
function isFeatureActive(targetTabId) {
    if (typeof targetTabId !== 'number' || targetTabId <= 0) {
        console.warn("Invalid tab ID provided to isFeatureActive:", targetTabId);
        return false;
    }
    const tabSession = sessionCache.retrieveSessionData(targetTabId); // Renamed function
    // Ensure we have data and it's not explicitly whitelisted
    return tabSession?.isScriptInjected === true && !exclusionList.isUrlExcluded(tabSession.currentHost); // Renamed properties/functions
}

/**
 * Updates the browser action badge text based on detected fingerprinting scripts.
 * @param {number} targetTabId - The ID of the tab whose badge should be updated.
 */
function refreshBadge(targetTabId) {
    if (typeof targetTabId !== 'number' || targetTabId <= 0) {
        console.error("refreshBadge called with an invalid tab ID:", targetTabId);
        return;
    }

    const tabSession = sessionCache.retrieveSessionData(targetTabId);
    let fingerprintCount = 0;

    if (_util.isObject(tabSession) && tabSession.trackedDomains) { // Added _util.isObject check
        // Iterate through all tracked domains to find fingerprinting scripts
        for (const hostEntry in tabSession.trackedDomains) {
            // Guard clause for own properties
            if (Object.prototype.hasOwnProperty.call(tabSession.trackedDomains, hostEntry)) {
                const scriptList = tabSession.trackedDomains[hostEntry].scripts;
                if (scriptList) {
                    for (const scriptUrl in scriptList) {
                        if (Object.prototype.hasOwnProperty.call(scriptList, scriptUrl)) {
                            // Check if the script's activity score indicates fingerprinting
                            const scriptData = scriptList[scriptUrl];
                            if (activityScorer(scriptData).isFingerprinter === true) { // Renamed property
                                fingerprintCount++;
                                // The original logic counted unique scripts across all domains.
                                // The `break` is for `url in scripts`, meaning it breaks out of the inner loop,
                                // but continues to the next domain. This is correct.
                            }
                        }
                    }
                }
            }
        }
    }

    const badgeText = fingerprintCount > 0 ? String(fingerprintCount) : ''; // Changed to empty string if 0

    // Attempt to update the badge, handling potential tab removal errors
    try {
        chrome.action.setBadgeText({ // Changed from browserAction to action (Manifest V3)
            tabId: targetTabId,
            text: badgeText
        });
    } catch (error) {
        console.warn(`Could not set badge for tab ${targetTabId}:`, error.message);
    }
}

/**
 * Updates the browser action icon based on the enabled state for the current tab.
 * This function handles both specific tab updates and general window updates.
 * @param {number|null} [targetTabId=null] - The ID of the tab to update. If null, updates the current active tab.
 */
function updateActionButton(targetTabId = null) {
    const applyIconUpdate = (tabIdentifier) => {
        if (typeof tabIdentifier !== 'number' || tabIdentifier <= 0) {
            console.error("Invalid tab ID for icon update:", tabIdentifier);
            return;
        }

        const featureActive = isFeatureActive(tabIdentifier);
        const iconSuffix = featureActive ? '' : '_disabled'; // Renamed '_off' to '_disabled'
        const iconPaths = {
            19: `icons/icon19${iconSuffix}.png`, // Renamed files
            38: `icons/icon38${iconSuffix}.png`,
            64: `icons/icon64${iconSuffix}.png` // Added new icon size
        };

        try {
            chrome.action.setIcon({ // Changed from browserAction to action
                path: iconPaths,
                tabId: tabIdentifier
            });
        } catch (error) {
            console.warn(`Failed to set icon for tab ${tabIdentifier}:`, error.message);
        }
    };

    if (targetTabId !== null) {
        // Defer the update to avoid blocking, using a simple setTimeout
        setTimeout(() => applyIconUpdate(targetTabId), 0);
    } else {
        fetchCurrentActiveTab((activeTab) => { // Renamed function
            if (activeTab && activeTab.id) {
                setTimeout(() => applyIconUpdate(activeTab.id), 0);
            }
        });
    }
}

/**
 * Retrieves the currently active tab in the focused window.
 * @param {function(chrome.tabs.Tab): void} completionHandler - Callback function to receive the active tab object.
 */
function fetchCurrentActiveTab(completionHandler) {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, (activeTabs) => {
        if (activeTabs && activeTabs.length > 0) {
            completionHandler(activeTabs[0]);
        } else {
            console.warn("No active tab found in focused window.");
            completionHandler(null); // Explicitly pass null if no tab is found
        }
    });
}

/**
 * Prepares and returns data for the extension's panel (popup UI).
 * @param {chrome.tabs.Tab} currentTab - The tab object for which to get panel data.
 * @returns {object} An object containing relevant panel data.
 */
function assemblePanelData(currentTab) {
    if (!_util.isObject(currentTab) || !currentTab.id) {
        console.error("Invalid tab object provided to assemblePanelData.");
        return { error: true, message: "Invalid tab context." };
    }

    const tabSession = sessionCache.retrieveSessionData(currentTab.id);
    const tabUrl = currentTab.url || '';
    let currentHost = '';
    try {
        currentHost = new URL(tabUrl).hostname; // Extract hostname explicitly
    } catch (e) {
        console.warn("Could not parse hostname from URL:", tabUrl, e);
        // Fallback or handle invalid URLs appropriately
    }


    const panelInfo = _util.assign({}, tabSession || {}, { // Using _util.assign for extend-like behavior
        isInvalidPage: (
            !tabUrl.startsWith('http') || // Check for http/https protocol
            tabUrl.startsWith('chrome-extension://') || // Exclude extension pages
            tabUrl.startsWith('about:') || // Exclude internal browser pages
            tabUrl.includes('chrome.google.com/webstore/') // Exclude Chrome Web Store
        ),
        isExcluded: exclusionList.isUrlExcluded(currentHost), // Renamed function
        currentHost: currentHost // Added currentHost explicitly
    });

    return panelInfo;
}

// Request modification and event handlers /////////////////////////////////////////////////

/**
 * Modifies outgoing request headers based on predefined rules.
 * This function acts as a webRequest.onBeforeSendHeaders listener.
 * @param {object} reqInfo - Details of the web request.
 * @returns {{requestHeaders: Array<object>}|undefined} An object with modified headers, or undefined if no changes.
 */
function normalizeRequestHeaders(reqInfo) {
    // Guard clause: If feature is not active for this tab, or it's not a valid request, do nothing.
    if (!reqInfo || !reqInfo.tabId || !isFeatureActive(reqInfo.tabId)) {
        return;
    }

    const specificModifications = REQUEST_HEADER_MODS[reqInfo.type] || {}; // Renamed
    const universalModifications = REQUEST_HEADER_MODS['__DEFAULT__']; // Renamed
    const initialHeaders = reqInfo.requestHeaders;
    const modifiedHeaders = [];

    // Create a temporary map for easier lookup and modification
    const headerMap = new Map();
    for (const currentHeader of initialHeaders) { // Using for...of
        headerMap.set(currentHeader.name.toLowerCase(), currentHeader); // Store lowercase name
    }

    // Apply universal modifications first
    for (const headerName in universalModifications) {
        if (Object.prototype.hasOwnProperty.call(universalModifications, headerName)) {
            const updatedValue = universalModifications[headerName];
            const lowerCaseName = headerName.toLowerCase();

            if (updatedValue === null) { // If value is null, remove the header
                headerMap.delete(lowerCaseName);
            } else if (headerMap.has(lowerCaseName)) {
                // Update existing header
                headerMap.get(lowerCaseName).value = updatedValue;
            } else {
                // Add new header
                headerMap.set(lowerCaseName, { name: headerName, value: updatedValue });
            }
        }
    }

    // Apply specific modifications, overriding universal ones if present
    for (const headerName in specificModifications) {
        if (Object.prototype.hasOwnProperty.call(specificModifications, headerName)) {
            const updatedValue = specificModifications[headerName];
            const lowerCaseName = headerName.toLowerCase();

            if (updatedValue === null) {
                headerMap.delete(lowerCaseName);
            } else if (headerMap.has(lowerCaseName)) {
                headerMap.get(lowerCaseName).value = updatedValue;
            } else {
                headerMap.set(lowerCaseName, { name: headerName, value: updatedValue });
            }
        }
    }

    // Reconstruct headers array from the map
    headerMap.forEach(headerEntry => {
        modifiedHeaders.push(headerEntry);
    });

    // Add a new header for demonstration purposes (e.g., custom tracking prevention)
    if (!headerMap.has('x-privacy-shield')) {
        modifiedHeaders.push({ name: 'X-Privacy-Shield', value: 'Enabled; Mode=Strict' });
    }

    return { requestHeaders: modifiedHeaders };
}

/**
 * Handles incoming messages from content scripts or other extension parts.
 * @param {object} incomingMsg - The message payload.
 * @param {chrome.runtime.MessageSender} messageSource - Information about the sender.
 * @param {function(*): void} respondToSender - Function to send a response back.
 * @returns {boolean|undefined} True if the response will be sent asynchronously.
 */
function handleRuntimeMessages(incomingMsg, messageSource, respondToSender) {
    if (!_util.isObject(incomingMsg) || !incomingMsg.action) { // Changed 'name' to 'action'
        console.warn("Received malformed message:", incomingMsg);
        // Respond immediately if message is malformed to avoid hanging.
        respondToSender({ error: true, message: "Malformed message received." });
        return;
    }

    const currentTabId = messageSource.tab?.id;
    if (!currentTabId) {
        console.error("Message received without a valid tab ID from sender.");
        respondToSender({ error: true, message: "Sender tab ID missing." });
        return;
    }

    let msgResponse = {};

    switch (incomingMsg.action) { // Using switch for better readability
        case 'scriptActivityReport': // Renamed 'trapped' to 'scriptActivityReport'
            // Ensure message payload is an array for batch processing
            const payloads = _util.isArray(incomingMsg.payload) ? incomingMsg.payload : [incomingMsg.payload];
            payloads.forEach((payloadItem) => {
                sessionCache.recordActivity(currentTabId, payloadItem); // Renamed function
            });
            refreshBadge(currentTabId);
            // Notify the panel if it's currently open for this tab
            fetchCurrentActiveTab((activeTab) => {
                if (activeTab && activeTab.id === currentTabId) {
                    broadcastMsg('panelUpdateData', assemblePanelData(activeTab)); // Renamed event and function
                }
            });
            break;

        case 'panelReady': // Renamed 'panelLoaded' to 'panelReady'
            fetchCurrentActiveTab((activeTab) => {
                if (activeTab) {
                    respondToSender(assemblePanelData(activeTab));
                } else {
                    respondToSender({ error: true, message: "No active tab context for panel data." });
                }
            });
            return true; // Indicates asynchronous response

        case 'toggleExclusion': // Renamed 'panelToggle' to 'toggleExclusion'
            const hostnameToToggle = incomingMsg.payload?.host; // Renamed 'message.hostname' to 'payload.host'
            if (hostnameToToggle) {
                exclusionList.toggleExclusionStatus(hostnameToToggle); // Renamed function
                updateActionButton(); // Update button state across all tabs
                refreshBadge(currentTabId); // Refresh badge for the current tab
            } else {
                console.warn("Toggle exclusion message missing hostname payload.");
                msgResponse = { error: true, message: "Hostname for exclusion toggle is missing." };
            }
            break;

        default:
            console.log("Unhandled runtime message action:", incomingMsg.action);
            msgResponse = { error: true, message: `Unhandled action: ${incomingMsg.action}` };
            break;
    }

    respondToSender(msgResponse); // Send immediate response for sync actions
}

/**
 * Handles navigation events, initializing tab data and updating UI.
 * @param {object} navigationDetails - Details of the navigation event.
 */
function onTabNavigationCommitted(navigationDetails) {
    const targetTabId = navigationDetails.tabId;
    const frameIdentifier = navigationDetails.frameId;

    // Only process top-level frame navigations and valid tab IDs
    if (frameIdentifier !== 0 || targetTabId < 1) {
        return;
    }

    // Initialize/reset session data for the navigated tab
    sessionCache.initializeTabSession(targetTabId, navigationDetails.url); // Renamed function
    updateActionButton(targetTabId);
    refreshBadge(targetTabId);
}

// Module initialization routines //////////////////////////////////////////////////////////

// Listener for the content script injection mechanism.
// This listener intercepts attempts to inject our content script.
chrome.webRequest.onBeforeRequest.addListener(
    (requestDetails) => {
        const targetTabId = requestDetails.tabId;
        if (!targetTabId || targetTabId < 1) {
            console.warn("onBeforeRequest triggered for invalid tabId:", requestDetails);
            return;
        }

        let currentHost = '';
        try {
            currentHost = new URL(requestDetails.url).hostname; // Extract hostname
        } catch (e) {
            console.warn("Failed to parse hostname for script injection check:", requestDetails.url, e);
            // If URL is invalid, assume it's not a whitelisted host for safety.
        }

        if (exclusionList.isUrlExcluded(currentHost)) { // Check if the host is explicitly excluded
            // Redirect to a blank JS to prevent our script from running without blocking the page
            return {
                redirectUrl: 'data:text/javascript;charset=utf-8, /* Shielded page: script injection prevented. */'
            };
        } else {
            // Mark the tab as having our script injected and update UI
            sessionCache.markScriptInjected(targetTabId, true); // Renamed function
            updateActionButton(targetTabId); // Update button for this specific tab
            // No need to update badge here, as no activity has been recorded yet
        }
    },
    {
        urls: [
            `chrome-extension://${chrome.runtime.id}/js/core_injected_script.min.js` // Renamed injected script file
        ],
        types: ['script'] // Explicitly specify 'script' type
    },
    ["blocking"]
);

// Listener for modifying outgoing request headers.
chrome.webRequest.onBeforeSendHeaders.addListener(
    normalizeRequestHeaders,
    ALL_PAGE_PATTERNS, // Used the renamed global variable
    ["blocking", "requestHeaders"]
);

// Register main message handler for communication with content scripts and popup.
chrome.runtime.onMessage.addListener(handleRuntimeMessages);

// Clean up tab data when a tab is closed.
chrome.tabs.onRemoved.addListener(sessionCache.clearSessionData); // Renamed function

// Handle navigation events to initialize and reset tab-specific state.
chrome.webNavigation.onCommitted.addListener(onTabNavigationCommitted);

// Periodically clean up any orphan session data every 7 minutes (420000 ms).
// Changed interval from 5 minutes to 7 minutes.
const ORPHAN_DATA_CLEANUP_INTERVAL_MS = 420000;
setInterval(sessionCache.performPeriodicCleanup, ORPHAN_DATA_CLEANUP_INTERVAL_MS); // Renamed function

// Initial setup: ensure the action button state is correct for existing tabs
// This runs once when the extension loads.
chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
        if (tab.id) {
            updateActionButton(tab.id);
            refreshBadge(tab.id); // Also refresh badges on startup
        }
    });
});