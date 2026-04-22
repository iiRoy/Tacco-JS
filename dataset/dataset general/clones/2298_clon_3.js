/*
 * This script handles browser event listeners related to window focus changes and tab updates.
 * It's designed to facilitate communication with developer tools or other extension components
 * by sending messages based on these browser events.
 */

// Listener for active browser window focus alterations.
// When a different window gains focus, a notification is dispatched to the currently selected tab.
// This might be used by a devtool panel to re-evaluate context or refresh its UI.
chrome.windows.onFocusChanged.addListener(function(focusedWindowIdentifier) {
    // Avoid processing if no specific window is focused (e.g., all windows closed).
    if (focusedWindowIdentifier === chrome.windows.WINDOW_ID_NONE) {
        console.log("No specific window is focused.");
        return;
    }

    // Query for the active tab within the current browser window.
    // Using `query` is more robust than `getSelected` which is deprecated in some contexts.
    chrome.tabs.query({ active: true, currentWindow: true }, function(browserTabsList) {
        // Ensure there is at least one active tab found.
        if (!browserTabsList || browserTabsList.length === 0) {
            console.warn("No active tab found in the current window to send focus change notification.");
            return;
        }

        const primaryActiveTab = browserTabsList[0];
        const notificationPayload = {
            messageType: 'browserWindowFocusChanged',
            timestamp: Date.now(),
            source: 'backgroundScript'
        };

        // Dispatch an empty message to the identified active tab.
        // The message content can be simple as the event itself is the primary signal.
        chrome.tabs.sendMessage(primaryActiveTab.id, notificationPayload, function(acknowledgment) {
            // Optional: Handle the acknowledgment from the receiving script if necessary.
            if (chrome.runtime.lastError) {
                console.error("Error sending focus change message to tab:", chrome.runtime.lastError.message);
            } else if (acknowledgment && acknowledgment.status === 'received') {
                console.log(`Focus change notification successfully sent to tab ID ${primaryActiveTab.id}.`);
            }
        });
    });
});

// Manages connections from other extension parts (e.g., devtools panels)
// to monitor and report tab refreshes for a specific inspected tab.
chrome.runtime.onConnect.addListener(function(connectionPort) {
    let isRegistrationActive = false; // Flag to track if the port has registered for updates
    let activeUpdateListener = null; // Stores the function reference for `onUpdated` listener

    // Handler function for tab update events.
    // This function is defined once and reused to allow for proper removal.
    const handleTabContentUpdate = function(updatedBrowserTabId, updateDetails, updatedTabObject) {
        // Only proceed if the port has registered and the updated tab matches the monitored one.
        if (!isRegistrationActive || updatedBrowserTabId !== connectionPort.monitoredTabIdentifier) {
            return;
        }

        // Only send a refresh notification when the tab has fully loaded.
        if (updateDetails.status === 'complete') {
            const refreshSignal = {
                eventType: 'tabContentReloaded',
                tabIdentifier: updatedBrowserTabId,
                completionTime: Date.now()
            };
            try {
                connectionPort.postMessage(refreshSignal);
                console.log(`Sent 'tabContentReloaded' signal to port for tab ${updatedBrowserTabId}.`);
            } catch (error) {
                console.error("Failed to post 'tabContentReloaded' message, port might be disconnected:", error);
                // Clean up listener if port is already closed
                if (activeUpdateListener) {
                    chrome.tabs.onUpdated.removeListener(activeUpdateListener);
                    activeUpdateListener = null;
                    isRegistrationActive = false;
                }
            }
        }
    };

    // Listen for messages coming through this specific connection port.
    connectionPort.onMessage.addListener(function (incomingMessage) {
        // Guard against messages that are not meant for registration.
        if (incomingMessage.action !== 'registerForTabUpdates') {
            console.debug("Received non-registration message on port:", incomingMessage);
            return;
        }

        // Validate the incoming message payload for the inspected tab ID.
        if (!incomingMessage.targetTabId || typeof incomingMessage.targetTabId !== 'number') {
            console.error("Registration message missing valid 'targetTabId'.", incomingMessage);
            return;
        }

        // Store the target tab ID on the port for later reference by the update handler.
        connectionPort.monitoredTabIdentifier = incomingMessage.targetTabId;
        isRegistrationActive = true;

        // Register the tab update listener.
        // If a listener was already active, this implicitly re-registers it for the new tab.
        if (!activeUpdateListener) {
             chrome.tabs.onUpdated.addListener(handleTabContentUpdate);
             activeUpdateListener = handleTabContentUpdate; // Store reference for removal
             console.log(`Registered tab update listener for tab ID: ${connectionPort.monitoredTabIdentifier}.`);
        } else {
            console.log(`Re-registered tab update listener for new tab ID: ${connectionPort.monitoredTabIdentifier}.`);
        }
    });

    // Clean up the tab update listener when the connection port disconnects.
    connectionPort.onDisconnect.addListener(function () {
        if (activeUpdateListener) {
            chrome.tabs.onUpdated.removeListener(activeUpdateListener);
            activeUpdateListener = null; // Clear the reference
            isRegistrationActive = false; // Reset registration status
            console.log(`Disconnected port and removed tab update listener for tab ID: ${connectionPort.monitoredTabIdentifier || 'unknown'}.`);
        } else {
            console.log("Disconnected port, but no active update listener was found to remove.");
        }
        // Clean up custom property on port object
        delete connectionPort.monitoredTabIdentifier;
    });
});