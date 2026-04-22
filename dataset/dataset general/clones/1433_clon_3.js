let dimensionResetTimerId, // Holds the ID for the timeout that clears the dimension display
    inspectorModeActive = false, // Configuration flag: true if display should only show when Web Inspector is open
    monitoringActive = false; // Internal state flag: true if the window resize listener is currently active


/**
 * Retrieves an HTML element by its ID.
 * @param {string} targetElementId - The ID of the element to find.
 * @returns {HTMLElement | null} The found element, or null if not present.
 */
const fetchDomElement = (targetElementId) => document.getElementById(targetElementId);


/**
 * Manages the display of current browser viewport dimensions.
 * Creates a new overlay element if one doesn't exist, or updates an existing one.
 * The overlay is set to automatically fade out and be removed after a short duration.
 */
const presentDimensionDisplay = () => {
    // Look for an existing display element on the page
    let currentDisplayNode = fetchDomElement('browserViewportOverlay');

    // If there's an active timer to hide the display, cancel it so the display remains visible
    if (dimensionResetTimerId) {
        clearTimeout(dimensionResetTimerId);
        dimensionResetTimerId = null; // Clear the timer reference
    }

    if (currentDisplayNode) {
        // If the display element already exists, simply update its text content
        currentDisplayNode.textContent = `${window.innerWidth} x ${window.innerHeight}`;

        // Re-establish the timer to remove the element after a period of user inactivity
        dimensionResetTimerId = setTimeout(() => {
            // Safely remove the element from its parent
            currentDisplayNode.parentNode?.removeChild(currentDisplayNode);
            // A brief delay before nullifying the timer ID to prevent potential race conditions
            setTimeout(() => dimensionResetTimerId = null, 75);
        }, 2800); // Slightly adjusted timeout duration

    } else {
        // No existing display element found, so create a new one
        const newDisplayContainer = document.createElement('div');
        newDisplayContainer.id = 'browserViewportOverlay'; // Unique ID for the new element
        newDisplayContainer.style.cssText = `
            position: fixed;
            bottom: 8px; /* Adjusted position */
            right: 8px;  /* Adjusted position */
            z-index: 2147483647; /* Maximum z-index to ensure visibility */
            background-color: hsla(0, 0%, 5%, 0.9); /* Darker, semi-transparent background */
            color: #F0F0F0; /* Lighter text color */
            font-family: 'SFMono-Regular', 'Menlo', monospace; /* Modern monospace font stack */
            font-size: 13px; /* Slightly larger font size */
            line-height: 24px;
            padding: 3px 10px; /* Increased padding */
            border-radius: 4px; /* More rounded corners */
            min-width: 95px; /* Minimum width for stable display */
            text-align: center;
            box-shadow: 0 3px 7px rgba(0,0,0,0.6); /* Enhanced shadow effect */
            transition: opacity 0.4s ease-in-out; /* Smoother transition */
        `;
        newDisplayContainer.textContent = `${window.innerWidth} x ${window.innerHeight}`;

        // Before appending, ensure the document body is available
        if (document.body) {
            document.body.appendChild(newDisplayContainer);
            // newDisplayContainer.style.opacity = '1'; // Can be used if initial opacity is set to 0 in CSS
        } else {
            console.error("DOM body not found. Cannot attach viewport overlay.");
            return; // Exit if the body isn't ready
        }

        // Set the removal timer for this newly created element
        dimensionResetTimerId = setTimeout(() => {
            newDisplayContainer.parentNode?.removeChild(newDisplayContainer);
            setTimeout(() => dimensionResetTimerId = null, 75);
        }, 2800);
    }
};


/**
 * Determines if the Safari Web Inspector is likely active and visible.
 * This is inferred by comparing the inner and outer dimensions of the window.
 * @returns {boolean} True if Web Inspector is detected, false otherwise.
 */
const assessInspectorStatus = () => {
    // Define the minimum expected dimension differences when the inspector is open
    const minimumInspectorWidth = 650; // Horizontal space consumed by inspector
    const minimumInspectorHeight = 280; // Vertical space consumed by inspector

    // Calculate the actual differences
    const widthDifferential = window.outerWidth - window.innerWidth;
    const heightDifferential = window.outerHeight - window.innerHeight;

    // The inspector is considered active if either the width or height difference
    // exceeds its respective threshold.
    return (widthDifferential >= minimumInspectorWidth || heightDifferential >= minimumInspectorHeight);
};


/**
 * Orchestrates the display of viewport dimensions based on current settings and conditions.
 * This function is typically called on window resize events.
 */
const initiateDimensionMonitoring = () => {
    let shouldRenderDisplay = true; // Default assumption: display the dimensions

    // If the 'inspectorModeActive' setting is enabled, we must first check for inspector presence
    if (inspectorModeActive) {
        shouldRenderDisplay = assessInspectorStatus(); // Override based on inspector detection
        console.debug(`Inspector-only display mode: ${inspectorModeActive}. Inspector detected: ${shouldRenderDisplay}.`);
    }

    // Only proceed to display metrics if the conditions allow it
    if (shouldRenderDisplay) {
        presentDimensionDisplay();
    } else {
        // If the display should NOT be rendered, and there's a pending timer or visible element,
        // clear the timer and remove the element immediately.
        if (dimensionResetTimerId) {
            clearTimeout(dimensionResetTimerId);
            dimensionResetTimerId = null;
        }
        const existingOverlay = fetchDomElement('browserViewportOverlay');
        if (existingOverlay) {
            existingOverlay.parentNode?.removeChild(existingOverlay);
        }
    }
};


/**
 * Callback function to process messages received from the Safari extension's global script.
 * Primarily used for updating configuration settings.
 * @param {MessageEvent} receivedMessage - The event object containing message details.
 */
safari.self.addEventListener('message', (receivedMessage) => {
    // Basic validation for the incoming message structure
    if (!receivedMessage || typeof receivedMessage.name !== 'string' || !receivedMessage.message) {
        console.warn("Received an invalid or malformed message from the global script.");
        return;
    }

    // Handle messages specifically related to settings updates
    if (receivedMessage.name === 'configurationUpdate') { // Renamed message identifier
        const newConfiguration = receivedMessage.message;

        // Ensure the essential 'webinspectorOnly' property exists in the received settings
        if (typeof newConfiguration.webinspectorOnly !== 'boolean') {
            console.error("Critical 'webinspectorOnly' setting missing or invalid in configuration update.");
            return;
        }

        // Apply the new setting to our global flag
        inspectorModeActive = newConfiguration.webinspectorOnly;
        console.log(`Updated configuration: inspectorModeActive set to ${inspectorModeActive}.`);

        // Manage the window resize event listener to prevent duplicates and ensure correct state
        if (monitoringActive) {
            window.removeEventListener('resize', initiateDimensionMonitoring);
            monitoringActive = false; // Mark listener as inactive
            console.info("Existing resize listener unregistered.");
        }

        // Always re-add the listener after a settings change to ensure it's active with new config.
        // The 'initiateDimensionMonitoring' function itself will decide if the display is shown.
        window.addEventListener('resize', initiateDimensionMonitoring, { passive: true }); // Using passive for performance
        monitoringActive = true; // Mark listener as active
        console.info("New resize listener registered.");

        // Immediately trigger a monitoring check with the updated settings
        initiateDimensionMonitoring();

    } else if (receivedMessage.name === 'diagnosticInfo') { // Added a new message type for diagnostics
        console.debug("Received diagnostic message:", receivedMessage.message);
    }
}, { passive: true }); // Using passive listener for the message event itself where applicable


// On initial load, request the current settings from the global script.
// A small delay helps ensure the message listener is fully established.
setTimeout(() => {
    safari.self.tab.dispatchMessage('requestCurrentSettings'); // Renamed message
    safari.self.tab.dispatchMessage('subscribeForConfigurationChanges'); // Renamed message
}, 150); // Slightly increased delay

// Also perform an initial check once the DOM content is fully loaded,
// in case settings are default or cached before the first message arrives.
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM content fully loaded. Performing initial display check.");
    initiateDimensionMonitoring();
});