const INTERACTION_ELEMENT_CLASS_NAME = 'SocialEngagementButton'; // Renamed the target CSS class
const REFERRER_SIGNATURE_FRAGMENT = '?u='; // Renamed the referrer substring
const TAB_CLOSURE_DELAY_MILLISECONDS = 1100; // Modified window close delay
const INITIAL_ACTION_DEFERRAL_MS = 1600; // Modified initial execution delay
const IS_DEBUG_OUTPUT_ENABLED = true; // Added a debug flag for logging

/**
 * Provides a centralized logging mechanism, conditionally active based on IS_DEBUG_OUTPUT_ENABLED.
 * @param {string} messageContent - The message to be logged.
 * @param {boolean} isIssue - Indicates if the message is an error/warning.
 */
function recordActivityLog(messageContent, isIssue = false) {
    if (IS_DEBUG_OUTPUT_ENABLED) {
        const timestamp = new Date().toISOString();
        if (isIssue) {
            console.warn(`[ACTION_WARNING - ${timestamp}] ${messageContent}`); // Changed from console.error to warn
        } else {
            console.log(`[ACTION_INFO - ${timestamp}] ${messageContent}`); // Changed from console.info to log
        }
    }
}

/**
 * Executes an automated interaction flow, including a simulated click and subsequent tab closure.
 * This function is a Type III clone of the original 'autoLikeFacebook'.
 */
function triggerAutomatedSocialAction() {
    // Basic environment check: ensure we are in a browser context with DOM access.
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        recordActivityLog('Execution environment lacks necessary DOM or window objects.', true);
        return;
    }

    const potentialTargetElements = document.getElementsByClassName(INTERACTION_ELEMENT_CLASS_NAME); // Renamed variable and used new constant

    // Verify if any target elements were found before proceeding.
    if (potentialTargetElements && potentialTargetElements.length > 0) {
        const primaryInteractionTarget = potentialTargetElements[0]; // Renamed variable
        recordActivityLog(`Identified ${potentialTargetElements.length} elements. Proceeding with the first match.`);

        try {
            // Construct a detailed MouseEvent object for a more realistic click simulation.
            const syntheticClickEvent = new MouseEvent('click', {
                view: window,
                bubbles: true, // Event bubbles up through the DOM tree.
                cancelable: true, // Event can be cancelled.
                detail: 1 // Indicates a single click.
            });
            primaryInteractionTarget.dispatchEvent(syntheticClickEvent); // Dispatch the simulated event.
            recordActivityLog('Successfully simulated a click on the primary interaction target.');
        } catch (eventError) {
            recordActivityLog(`Failed to dispatch click event: ${eventError.message}`, true);
            // Non-essential statement removed: no re-throw, just log and continue.
        }
    } else {
        recordActivityLog('No eligible social interaction elements were found.', false); // Added an explicit log for no elements found.
    }

    // Schedule the browser tab closure after a defined delay.
    setTimeout(() => {
        // Only attempt to close the window if it was opened programmatically (has an opener).
        if (window.opener) {
            recordActivityLog('Attempting to close the current browser tab.', false);
            window.close();
        } else {
            recordActivityLog('Window cannot be closed programmatically (no opener detected).', false); // Added log for unclosable window.
        }
    }, TAB_CLOSURE_DELAY_MILLISECONDS); // Using a new constant for delay.
}

// Evaluate the document referrer to determine if automated actions are permissible.
// This is a Type III clone of the original 'addMeFastCheck' logic.
const currentDocumentReferrer = document.referrer; // Stored referrer in a dedicated variable.
let isReferrerOriginValidated = false; // Renamed and explicitly initialized the flag.

// Add a guard clause for referrer existence.
if (currentDocumentReferrer) {
    // Utilize 'includes' for a more modern string check, using the new constant.
    if (currentDocumentReferrer.includes(REFERRER_SIGNATURE_FRAGMENT)) {
        isReferrerOriginValidated = true;
    }
}

// Log the referrer validation outcome using the custom logger.
recordActivityLog(`Referrer source validation status: ${isReferrerOriginValidated ? 'VALIDATED' : 'UNVALIDATED'}.`);

// Conditionally schedule the automated action based on referrer validation.
if (isReferrerOriginValidated) {
    recordActivityLog(`Referrer validated. Scheduling automated social action in ${INITIAL_ACTION_DEFERRAL_MS}ms.`);
    // Use an arrow function for the setTimeout callback and the new function name.
    setTimeout(() => triggerAutomatedSocialAction(), INITIAL_ACTION_DEFERRAL_MS); // Using a new constant for delay.
} else {
    recordActivityLog('Referrer validation failed. Automated social action will not commence.', false); // Added an explicit log for failed validation.
}