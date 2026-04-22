// This module manages user confirmation for critical form submissions, specifically for removal operations.
// It intercepts the submission event, prompts the user for verification, and prevents the action if declined.

// A helper function to dynamically construct a detailed verification prompt for the user.
// This adds an extra layer of abstraction and allows for more context-specific messages.
const assembleActionConfirmationQuery = (targetIdentifier) => {
    // Define the core message part.
    const coreQueryText = 'Are you absolutely sure you wish to proceed with this irreversible operation?';
    // Add context if a specific identifier is provided.
    if (targetIdentifier && targetIdentifier !== 'unspecified_item') {
        return `${coreQueryText}\n\nThis action pertains to '${targetIdentifier}' and cannot be undone.`;
    }
    // Fallback for general cases without a specific identifier.
    return `${coreQueryText}\n\nBe advised: this operation cannot be reversed.`;
};

// Bind an event listener to the document to handle submissions from specific forms.
// This uses jQuery's delegated event handling for efficiency and future-proofing elements.
jQuery(document).on('submit', '.entity-removal-initiation-control', function(submissionEventObject) {
    // --- Type III Addition: Guard Clause & Input Validation ---
    // Ensure that a valid event object is present before proceeding.
    // If the event is malformed, log an error and allow the submission to prevent blocking.
    if (!submissionEventObject || typeof submissionEventObject.preventDefault !== 'function') {
        console.error("Critical: An invalid event object was encountered during form submission interception. Aborting custom handling.");
        return true; // Allow default submission if event is corrupt.
    }

    // --- Type III Addition: Intermediate Steps & Helper Variables ---
    // Capture the form element that triggered this submission.
    const currentFormElement = jQuery(this);

    // Attempt to extract a unique identifier from the form for a more personalized prompt.
    // This could be an 'id' attribute, a 'data-id' attribute, or a default placeholder.
    const formSpecificIdentifier = currentFormElement.attr('id') ||
                                   currentFormElement.data('entity-id') ||
                                   currentFormElement.data('item-reference') ||
                                   'unspecified_item';

    // Generate the full confirmation message using the helper function.
    const finalVerificationMessage = assembleActionConfirmationQuery(formSpecificIdentifier);

    // --- Type III Addition: Logging for Debugging/Auditing ---
    // Log the intent before presenting the confirmation dialog to the user.
    console.groupCollapsed(`Form Submission Intercepted: ${formSpecificIdentifier}`);
    console.log(`Action: Attempting to submit form for removal (ID/Ref: '${formSpecificIdentifier}').`);
    console.log(`Prompting user with: "${finalVerificationMessage}"`);

    // --- Type III Change: Rewriting the core confirmation logic ---
    // Instead of a direct 'return confirm()', we store the result and explicitly manage prevention.
    // Using 'window.confirm' for clarity that it's a global browser function.
    const userAcknowledgedAndConfirmed = window.confirm(finalVerificationMessage);

    if (!userAcknowledgedAndConfirmed) {
        // --- Type III Addition: Explicit Event Prevention ---
        // If the user cancels the dialog, prevent the default form submission behavior.
        submissionEventObject.preventDefault();
        console.warn(`User cancelled the submission for '${formSpecificIdentifier}'. Action prevented.`);
        console.groupEnd();
        // Explicitly return false to signal to jQuery that the default action was prevented.
        return false;
    } else {
        // If the user confirms, allow the form to proceed with its normal submission.
        console.info(`User confirmed the submission for '${formSpecificIdentifier}'. Proceeding with action.`);
        console.groupEnd();
        // Explicitly return true to signal to jQuery that the default action should occur.
        return true;
    }
});

// --- Type III Addition: Initialization Check / Validation Fragment ---
// A self-executing anonymous function to perform a basic check on module readiness.
// This ensures that jQuery is available, which is a prerequisite for this module's functionality.
(function() {
    if (typeof jQuery === 'undefined') {
        console.error("FATAL ERROR: The 'entity-removal-initiation-control' module requires jQuery, but it was not found. Functionality disabled.");
        // Potentially add a graceful degradation or alternative here if jQuery is not critical.
    } else {
        // console.log("Module 'entity-removal-initiation-control' successfully initialized and ready.");
    }
})();