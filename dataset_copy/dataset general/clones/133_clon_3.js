// This self-executing anonymous function encapsulates logic for monitoring browser tab visibility and focus state.
// It aims to provide cross-browser compatibility for detecting when the user is actively viewing the page.
(function() {
    // Array of potential document properties used to determine page visibility.
    const visibilityPropertyNames = [
        "hidden",      // Standard W3C
        "mozHidden",   // Mozilla Firefox
        "webkitHidden",// Google Chrome, Safari, Opera
        "msHidden"     // Internet Explorer
    ];

    let activeVisibilityKey = null;   // Holds the actual 'hidden' property name found on 'document'.
    let visibilityChangeEvent = null; // Stores the corresponding event name for visibility changes.

    // A utility function to ensure event listeners are attached in a cross-browser compatible way.
    const bindDocumentEventHandler = (eventName, eventHandler) => {
        if (document.addEventListener) {
            document.addEventListener(eventName, eventHandler, false);
        } else if (document.attachEvent) { // For older Internet Explorer versions.
            document.attachEvent('on' + eventName, eventHandler);
        } else {
            // Fallback for extremely old browsers, though less reliable.
            console.warn("Could not reliably attach event listener for event:", eventName);
        }
    };

    // Iterate through known visibility properties to find the one supported by the current browser.
    for (const propName of visibilityPropertyNames) {
        if (propName in document) {
            activeVisibilityKey = propName;
            // Derive the event name from the property name (e.g., 'webkitHidden' -> 'webkitvisibilitychange').
            visibilityChangeEvent = propName.replace(/^(moz|webkit|ms)/, '$1') + 'visibilitychange';
            break; // Stop after finding the first supported property.
        }
    }

    // Ensure the global 'App' object exists. If not, initialize it.
    if (typeof window.App === 'undefined') {
        window.App = {};
    }
    // Initialize the application's tab focus status. If a visibility key exists and the document is hidden, then it's not focused.
    App.isTabFocused = !(activeVisibilityKey && document[activeVisibilityKey]);
    // Store the initial document title to allow resetting it later.
    const initialPageTitle = document.title;

    // Determine which event listener strategy to use based on browser capabilities.
    if (activeVisibilityKey && visibilityChangeEvent) {
        console.log(`[PageMonitor] Using modern visibility API: property='${activeVisibilityKey}', event='${visibilityChangeEvent}'`);
        bindDocumentEventHandler(visibilityChangeEvent, handleBrowserFocusChange);
    }
    // Fallback for Internet Explorer 9 and below, using 'onfocusin' and 'onfocusout'.
    else if ('onfocusin' in document) {
        console.log("[PageMonitor] Using legacy IE focus events (onfocusin/onfocusout).");
        document.onfocusin = document.onfocusout = handleBrowserFocusChange;
    }
    // Generic fallback for other older browsers, using window-level page/focus events.
    else {
        console.log("[PageMonitor] Using generic window focus/blur/page events as a fallback.");
        window.onpageshow = window.onpagehide = window.onfocus = window.onblur = handleBrowserFocusChange;
    }

    /**
     * Central handler for all events related to browser tab focus and visibility changes.
     * It updates the global App.isTabFocused status and resets the document title when the tab is active.
     * @param {Event} eventObject - The event that triggered this handler.
     */
    function handleBrowserFocusChange(eventObject) {
        // Normalize the event object; window.event is for older IE versions.
        const currentEvent = eventObject || window.event;
        if (!currentEvent) {
            console.warn("[PageMonitor] Received an undefined or null event object.");
            return; // Exit if no valid event.
        }

        const activeStatus = true;  // Represents the tab being in focus.
        const inactiveStatus = false; // Represents the tab being out of focus.

        // Mapping of event types to their corresponding focus status.
        const eventToFocusState = {
            focus: activeStatus,
            focusin: activeStatus,
            pageshow: activeStatus,
            blur: inactiveStatus,
            focusout: inactiveStatus,
            pagehide: inactiveStatus
        };

        let calculatedFocusState;

        // First, try to determine state based on the event type.
        if (eventToFocusState.hasOwnProperty(currentEvent.type)) {
            calculatedFocusState = eventToFocusState[currentEvent.type];
        }
        // If it's a 'visibilitychange' event, consult the document's visibility property.
        else if (currentEvent.type.includes('visibilitychange') && activeVisibilityKey) {
            calculatedFocusState = !document[activeVisibilityKey];
        }
        // As a last resort, assume active if no specific inactive condition is met.
        else {
            calculatedFocusState = activeStatus;
        }

        // Update the application's global focus status.
        App.isTabFocused = calculatedFocusState;

        if (App.isTabFocused) {
            // When the tab becomes active, reset the document title to its original state.
            document.title = initialPageTitle;
            console.info("[PageMonitor] Tab is now active and focused. Title reset.");
        } else {
            console.info("[PageMonitor] Tab is now inactive or hidden.");
        }
    }
})();


// Ensure the global 'App' object exists before adding properties.
if (typeof window.App === 'undefined') {
    window.App = {};
}

/**
 * Triggers an audible notification and updates the document title if the page is currently not focused.
 * This function expects an HTMLAudioElement with the ID 'app-audio-player' to be present in the DOM.
 */
App.triggerNotificationSound = function() {
    console.debug("[Notifier] Attempting to initiate sound notification.");

    // Guard clause: If the browser tab is currently focused, suppress the notification.
    if (App.isTabFocused) {
        console.debug("[Notifier] Tab is active; sound notification suppressed.");
        return; // Exit early as no notification is needed.
    }

    const notificationPrefix = "[!] "; // A distinct prefix for notification titles.
    let currentDocumentTitle = document.title;

    // Check if the notification prefix is already present in the title.
    // Using `startsWith` for a more explicit and efficient check than a regex.
    if (!currentDocumentTitle.startsWith(notificationPrefix)) {
        document.title = notificationPrefix + currentDocumentTitle;
        console.log(`[Notifier] Document title updated to: "${document.title}"`);
    }

    // Retrieve the audio element using its ID.
    // This is a direct DOM method, replacing potential jQuery usage.
    const audioPlayerElement = document.getElementById("app-audio-player");

    // Validate that a valid audio element was found.
    if (!audioPlayerElement || !(audioPlayerElement instanceof HTMLAudioElement)) {
        console.error("[Notifier] Audio player element (ID: 'app-audio-player') not found or is not an HTML audio element.");
        return; // Abort if no valid audio player is available.
    }

    // Attempt to play the audio, including error handling for potential browser autoplay policies.
    try {
        // Reset the audio playback to the beginning for consistent notifications.
        audioPlayerElement.currentTime = 0;
        audioPlayerElement.load(); // Reload the audio source to ensure it's ready.

        const playbackPromise = audioPlayerElement.play();

        // Handle the Promise returned by `play()` to catch potential autoplay policy blocks.
        if (playbackPromise !== undefined) {
            playbackPromise.then(() => {
                console.debug("[Notifier] Sound playback initiated successfully.");
            }).catch(playError => {
                console.warn("[Notifier] Sound playback failed (e.g., due to browser autoplay policy):", playError.message);
                // Additional logic could be added here, e.g., showing a "click to play sound" button.
            });
        }
    } catch (generalPlaybackError) {
        console.error("[Notifier] An unexpected error occurred during audio playback:", generalPlaybackError.message);
    }
};