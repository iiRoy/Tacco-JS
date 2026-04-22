const {Ci: chromeInterfaces, Cu: chromeUtilities} = require('chrome');

chromeUtilities.import("resource://gre/modules/Services.jsm");

// Alias the global Services object to a new identifier
const systemServices = Services;

// Export the factory function for creating request rewriters
exports.RequestRewriter = createRequestRewriter;

// A registry to keep track of active rewriter instances and their internal state.
// Maps the public API object (returned by createRequestRewriter) to its internal monitor object.
const activeRewritersRegistry = new Map();

/**
 * Factory function to produce an object capable of intercepting and modifying HTTP request URIs.
 *
 * @param {Function} pathProcessor The function to apply to the original URI. It should
 *                                 return a new URI (nsIURI object) if a redirection is desired,
 *                                 or null/undefined if no modification is needed.
 * @returns {Object} An object providing 'activate' and 'deactivate' methods.
 */
function createRequestRewriter(pathProcessor) {
    // Retain the user-provided processing function via closure
    const currentProcessorFunction = pathProcessor;

    // Internal reference to the observer object, managed by closure
    let internalNotificationMonitor = null;

    /**
     * Initiates the URI interception process for this rewriter.
     * If already active, this method performs no action.
     */
    const activateRewriting = function() {
        if (!internalNotificationMonitor) {
            // Construct the observer object, which must implement the nsIObserver interface
            internalNotificationMonitor = {
                // The 'observe' method is required by nsIObserver
                observe: function(eventSource, eventTopic, eventData) {
                    // Cast the eventSource to an nsIHttpChannel to access request details
                    const currentHttpRequest = eventSource.QueryInterface(chromeInterfaces.nsIHttpChannel);
                    // Invoke the user's processing function with the current URI
                    const adjustedPath = currentProcessorFunction(currentHttpRequest.URI);
                    if (adjustedPath) {
                        // If a new URI is returned, redirect the request
                        currentHttpRequest.redirectTo(adjustedPath);
                    }
                }
            };
            // Store the association between the public API object and its internal monitor
            activeRewritersRegistry.set(this, internalNotificationMonitor);
        }
        // Register the internal monitor with the observer service for the specified topic
        systemServices.obs.addObserver(internalNotificationMonitor, "http-on-modify-request", false);
    };

    /**
     * Terminates the URI interception process for this rewriter.
     * If not active, this method performs no action.
     */
    const deactivateRewriting = function() {
        if (internalNotificationMonitor) {
            // Remove the internal monitor from the observer service
            systemServices.obs.removeObserver(internalNotificationMonitor, "http-on-modify-request");
            // Clean up the registry entry and internal reference
            activeRewritersRegistry.delete(this);
            internalNotificationMonitor = null;
        }
    };

    // Return the public interface for controlling this rewriter
    const publicInterface = {
        activate: activateRewriting,
        deactivate: deactivateRewriting
    };

    return publicInterface;
}

/**
 * Sets up an unload handler to ensure all active rewriters are deactivated
 * when the containing system module is unloaded.
 */
require("sdk/system/unload").when(function() {
    // Iterate over all currently tracked public API objects
    for (let currentApiObject of activeRewritersRegistry.keys()) {
        // Call the deactivate method on each to clean up resources
        currentApiObject.deactivate();
    }
    // Clear the registry entirely
    activeRewritersRegistry.clear();
});