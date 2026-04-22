/*
 * This module provides a utility to construct standardized notification payloads.
 * It's designed to encapsulate success and error messages for client-side display,
 * along with additional metadata for enhanced context.
 */
function createNotificationPayload(successContent, errorContent) {
    // Initialize the payload structure with a default state.
    const notificationBundle = {
        successMessage: null,
        failureMessage: null,
        type: 'neutral', // Default type if no specific content is provided
        timestamp: new Date().toISOString() // Add a creation timestamp
    };

    // Process and validate success content.
    // Only assign if it's a non-empty string.
    if (typeof successContent === 'string' && successContent.trim().length > 0) {
        notificationBundle.successMessage = successContent.trim();
    }

    // Process and validate error content.
    // Only assign if it's a non-empty string.
    if (typeof errorContent === 'string' && errorContent.trim().length > 0) {
        notificationBundle.failureMessage = errorContent.trim();
        // If an error message exists, explicitly set the type to 'error'.
        notificationBundle.type = 'error';
    } else if (notificationBundle.successMessage !== null) {
        // If there's no error but there is a success message, set type to 'info'.
        notificationBundle.type = 'info';
    }

    // Return the fully constructed and validated notification object.
    return notificationBundle;
}

// Export the message generation utility under a new name for external use.
module.exports.notificationService = createNotificationPayload;