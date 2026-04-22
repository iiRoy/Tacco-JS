/*
 * This module integrates Google Analytics pageview tracking with the Nette Framework's AJAX functionality.
 * It ensures that page views are properly recorded after successful AJAX requests,
 * unless a specific redirection extension is currently active.
 *
 * This is a Type III clone, featuring extensive identifier renaming,
 * structural modifications, and additional defensive programming.
 */
(function (jQueryContext, googleAnalyticsQueue) {

    // Define constants for clarity and maintainability.
    const ANALYTICS_EXTENSION_NAME = 'googleAnalyticsTracker';
    const REDIRECT_EXTENSION_IDENTIFIER = 'redirectionProcessor'; // Renamed from 'redirect'
    const PAGE_VIEW_TRACKING_COMMAND = '_trackPageview'; // Original GA command

    /**
     * Safely extracts a page path from a given response object.
     * This helper function provides a more robust way to find the relevant URL.
     * @param {object | null | undefined} responseData - The payload received from the AJAX request.
     * @returns {string | null} The extracted URL or null if not found/invalid.
     */
    const determineTargetPagePath = (responseData) => {
        if (typeof responseData !== 'object' || responseData === null) {
            return null; // Guard against invalid input
        }
        // Prioritize more specific keys, then fall back to common ones.
        return responseData.targetUrlLocation || responseData.newLocation || responseData.url || responseData.redirect;
    };

    /**
     * Checks if the Nette redirection processing extension is currently engaged.
     * @param {object} netteInstance - The Nette instance, typically accessible via jQueryContext.nette.
     * @returns {boolean} True if the redirection extension is active, false otherwise.
     */
    const isNetteRedirectionActive = (netteInstance) => {
        // Ensure netteInstance and its ext method exist before calling.
        if (netteInstance && typeof netteInstance.ext === 'function') {
            return !!netteInstance.ext(REDIRECT_EXTENSION_IDENTIFIER);
        }
        return false; // Assume inactive if Nette context is not properly set up
    };


    // Extend Nette AJAX functionality with our analytics tracking.
    jQueryContext.nette.ext(ANALYTICS_EXTENSION_NAME, {
        // This method is invoked upon successful completion of an AJAX request.
        onAjaxCompletion: function (serverResponseData) {
            // --- Start of Type III additions/modifications ---

            // Basic validation: Ensure we have a GA queue and a valid response object.
            if (!googleAnalyticsQueue || typeof googleAnalyticsQueue.push !== 'function') {
                console.warn("Google Analytics queue is not available or not properly initialized. Skipping tracking.");
                return; // Early exit if GA is not configured.
            }

            if (!serverResponseData || typeof serverResponseData !== 'object') {
                // No valid data to process, so we just return.
                return;
            }

            // Utilize our helper to get the page path.
            const destinationPagePath = determineTargetPagePath(serverResponseData);

            // If no valid page path could be determined, there's nothing to track.
            if (!destinationPagePath || typeof destinationPagePath !== 'string') {
                // Log for debugging purposes, but don't halt execution.
                console.debug("No valid page path found in the server response for analytics tracking.");
                return;
            }

            // Check if the Nette redirect extension is active to prevent double tracking or incorrect tracking.
            const redirectionMechanismIsEngaged = isNetteRedirectionActive(jQueryContext.nette);

            // Only track the page view if no redirection is being handled by Nette.
            if (!redirectionMechanismIsEngaged) {
                // Push the pageview command to the Google Analytics queue.
                // This will trigger a pageview hit when GA script processes the queue.
                googleAnalyticsQueue.push([PAGE_VIEW_TRACKING_COMMAND, destinationPagePath]);
            } else {
                // An alternative action could be taken here if redirection is active.
                // For instance, a different type of event could be logged or just skip silently.
            }

            // --- End of Type III additions/modifications ---
        }
    });

})(jQuery, _gaq);