'use strict';

// Configuration constants for CSS selectors and classes, enhancing maintainability.
const PHONE_ACTIVATOR_SELECTOR = '.button-vp-phone';
const TABLET_ACTIVATOR_SELECTOR = '.button-vp-tablette';
const TARGET_MODIFIER_CLASS = 'viewport-tablette';

// A simple utility function for logging events and states.
// This can be expanded for different logging levels or environments.
function outputSystemLog(messageContent) {
    if (typeof console !== 'undefined' && console.info) {
        console.info(`[DynamicViewModule] ${messageContent}`);
    }
}

// Retrieve references to the main interactive elements and the document body.
// Using jQuery explicitly for clarity, assuming it's available in the global scope.
const mobileLayoutTrigger = jQuery(PHONE_ACTIVATOR_SELECTOR);
const tabletLayoutTrigger = jQuery(TABLET_ACTIVATOR_SELECTOR);
const primaryDocumentBody = jQuery('body'); // A more concise way to select the body.

/**
 * Handles the click event for activating the mobile view.
 * This function removes the tablet-specific class from the body.
 * @param {Event} clickEvent The native click event object.
 */
function handleMobileViewActivation(clickEvent) {
    // Prevent any default browser action that might be associated with the element.
    if (clickEvent && clickEvent.preventDefault) {
        clickEvent.preventDefault();
    }

    outputSystemLog('Attempting to switch to mobile view mode.');

    // Check if the target class is present before attempting to remove it.
    if (primaryDocumentBody.hasClass(TARGET_MODIFIER_CLASS)) {
        primaryDocumentBody.removeClass(TARGET_MODIFIER_CLASS);
        outputSystemLog(`Successfully removed class '${TARGET_MODIFIER_CLASS}' from the body.`);
    } else {
        outputSystemLog(`Class '${TARGET_MODIFIER_CLASS}' was not present; no change needed for mobile view.`);
    }
}

/**
 * Handles the click event for activating the tablet view.
 * This function adds the tablet-specific class to the body.
 * @param {Event} clickEvent The native click event object.
 */
function handleTabletViewActivation(clickEvent) {
    // Prevent any default browser action.
    if (clickEvent && clickEvent.preventDefault) {
        clickEvent.preventDefault();
    }

    outputSystemLog('Attempting to switch to tablet view mode.');

    // Check if the target class is absent before attempting to add it.
    if (!primaryDocumentBody.hasClass(TARGET_MODIFIER_CLASS)) {
        primaryDocumentBody.addClass(TARGET_MODIFIER_CLASS);
        outputSystemLog(`Successfully added class '${TARGET_MODIFIER_CLASS}' to the body.`);
    } else {
        outputSystemLog(`Class '${TARGET_MODIFIER_CLASS}' was already present; no change needed for tablet view.`);
    }
}

// Attach event listeners to the respective buttons, but only if they exist in the DOM.
// This adds a layer of robustness to prevent errors if elements are missing.
if (mobileLayoutTrigger.length > 0) {
    mobileLayoutTrigger.on('click', handleMobileViewActivation);
    outputSystemLog(`Event listener bound for phone view activator: ${PHONE_ACTIVATOR_SELECTOR}`);
} else {
    outputSystemLog(`Warning: Phone view activator element not found using selector: ${PHONE_ACTIVATOR_SELECTOR}`);
}

if (tabletLayoutTrigger.length > 0) {
    tabletLayoutTrigger.on('click', handleTabletViewActivation);
    outputSystemLog(`Event listener bound for tablet view activator: ${TABLET_ACTIVATOR_SELECTOR}`);
} else {
    outputSystemLog(`Warning: Tablet view activator element not found using selector: ${TABLET_ACTIVATOR_SELECTOR}`);
}

outputSystemLog('Dynamic View Module has completed its initialization routine.');