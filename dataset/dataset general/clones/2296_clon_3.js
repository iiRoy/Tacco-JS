// This module defines a sophisticated system for managing page navigation within a client-side application.
// It enables the registration of custom 'interceptor' functions that can examine, modify, or prevent
// page transitions based on specific application logic. This allows for dynamic control over user
// navigation flows and ensures that certain conditions are met before a user leaves the current page.
define([], function() {

    // A private, module-scoped Map to store all registered navigation interceptors.
    // Using a Map provides efficient lookup, deletion, and iteration over key-value pairs,
    // where keys are unique identifiers for each interceptor and values are their respective callback functions.
    let _activeNavigationInterceptors = new Map();

    /**
     * The primary controller object for managing application navigation.
     * It offers functionalities to register pre-navigation hooks, remove them,
     * and initiate a page transition that respects all active interceptors.
     */
    const NavigationFlowController = {

        /**
         * Registers a new function that acts as an interceptor for all subsequent page navigation attempts.
         * Each registered interceptor is considered 'single-shot' – it will be automatically removed
         * from the system immediately after it has been invoked during a navigation event, regardless
         * of whether it allowed or prevented the navigation.
         *
         * @param {string} interceptorId - A unique string identifier for this specific interceptor.
         *                                 This ID is used for management (e.g., deregistration).
         * @param {function(string): boolean} navigationCallback - The function to be executed.
         *   It receives the target URL as its only argument.
         *   It MUST return `true` to permit the navigation to proceed, or `false` to halt it.
         * @returns {boolean} `true` if the interceptor was successfully registered; `false` otherwise
         *                    (e.g., due to invalid input parameters).
         */
        registerNavigationInterceptor: function(interceptorId, navigationCallback) {
            // Enforce strict type and value validation for the interceptor ID.
            if (typeof interceptorId !== 'string' || interceptorId.trim() === '') {
                console.error("NavigationFlowController: Attempted to register an interceptor with an invalid or empty 'interceptorId'. Must be a non-empty string.");
                return false;
            }
            // Enforce strict type validation for the callback function.
            if (typeof navigationCallback !== 'function') {
                console.error(`NavigationFlowController: The provided 'navigationCallback' for ID '${interceptorId}' is not a valid function.`);
                return false;
            }

            // Add the interceptor to our internal Map. If an ID already exists, it will be overwritten.
            _activeNavigationInterceptors.set(interceptorId, navigationCallback);
            console.info(`NavigationFlowController: Interceptor '${interceptorId}' has been successfully registered.`);
            return true;
        },

        /**
         * Manually removes a previously registered navigation interceptor from the system.
         * This can be useful for interceptors that are not intended to be single-shot
         * but rather need to be explicitly managed, or to proactively remove an interceptor
         * before it's triggered by a navigation event.
         *
         * @param {string} interceptorId - The unique identifier of the interceptor to be removed.
         * @returns {boolean} `true` if an interceptor with the given ID was found and removed;
         *                    `false` if no such interceptor existed or the ID was invalid.
         */
        deregisterNavigationInterceptor: function(interceptorId) {
            if (typeof interceptorId !== 'string' || interceptorId.trim() === '') {
                console.warn("NavigationFlowController: Invalid 'interceptorId' provided for deregistration. Cannot process.");
                return false;
            }

            const wasRemoved = _activeNavigationInterceptors.delete(interceptorId);
            if (wasRemoved) {
                console.info(`NavigationFlowController: Interceptor '${interceptorId}' was successfully deregistered.`);
            } else {
                console.warn(`NavigationFlowController: No interceptor found with ID '${interceptorId}' to deregister.`);
            }
            return wasRemoved;
        },

        /**
         * Initiates a page transition to the specified target URL. Before the actual browser navigation
         * occurs, all currently registered interceptors are executed sequentially. If any interceptor
         * returns `false`, the navigation process is immediately aborted, and the page remains on
         * its current URL. All interceptors that are executed during this process are automatically
         * removed afterwards, adhering to their single-shot nature.
         *
         * @param {string} targetUrl - The full URL to which the application should attempt to navigate.
         */
        initiatePageTransition: function(targetUrl) {
            // Pre-validation of the target URL to ensure it's a valid and usable string.
            if (typeof targetUrl !== 'string' || targetUrl.trim() === '') {
                console.error("NavigationFlowController: Cannot initiate page transition. The provided 'targetUrl' is invalid or empty.");
                return; // Abort early if the URL is not suitable.
            }

            let allowNavigation = true; // Flag to track if navigation should proceed.
            const processedInterceptorIds = []; // Stores IDs of interceptors that were executed during this attempt.

            // Iterate over all registered interceptors in their registration order.
            // The `Map.entries()` method provides an iterable of [key, value] pairs.
            for (const [currentInterceptorId, currentInterceptorFn] of _activeNavigationInterceptors.entries()) {
                console.debug(`NavigationFlowController: Executing interceptor '${currentInterceptorId}' for URL: ${targetUrl}`);

                // Mark this interceptor for removal, as it's about to be executed (single-shot behavior).
                processedInterceptorIds.push(currentInterceptorId);

                try {
                    // Execute the interceptor function with the target URL.
                    const interceptorResult = currentInterceptorFn(targetUrl);

                    // If any interceptor explicitly returns `false`, navigation is prevented.
                    if (interceptorResult === false) {
                        allowNavigation = false;
                        console.warn(`NavigationFlowController: Interceptor '${currentInterceptorId}' explicitly prevented navigation to ${targetUrl}.`);
                        break; // Stop processing further interceptors as navigation is already blocked.
                    }
                } catch (error) {
                    // Log any errors occurring within an interceptor to prevent app crashes.
                    console.error(`NavigationFlowController: An error occurred during execution of interceptor '${currentInterceptorId}':`, error);
                    // Decide if an error should prevent navigation. For robustness, we'll treat it like a 'false' return.
                    allowNavigation = false;
                    break;
                }
            }

            // After all relevant interceptors have been processed (or the loop was broken),
            // remove them from the active list to enforce the single-shot characteristic.
            for (const idToRemove of processedInterceptorIds) {
                this.deregisterNavigationInterceptor(idToRemove);
            }

            // Final decision: if all interceptors allowed it, perform the actual browser redirect.
            if (allowNavigation) {
                console.info(`NavigationFlowController: All interceptors approved. Proceeding with navigation to ${targetUrl}.`);
                window.location.href = targetUrl; // Perform the browser-level page redirection.
            } else {
                console.log(`NavigationFlowController: Page transition to ${targetUrl} was ultimately halted by an interceptor.`);
            }
        }
    };

    // Return the controller object as the public interface of this module.
    return NavigationFlowController;
});