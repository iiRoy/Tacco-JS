/*
 * This module orchestrates the initial setup and execution of core
 * application routines once the entire Document Object Model (DOM)
 * has been fully loaded and parsed by the browser.
 *
 * It serves as a robust replacement for jQuery's `$(function(){...})`
 * or `$(document).ready(...)` constructs, ensuring cross-browser
 * compatibility for modern environments.
 */
(function() {
    // Define a constant for the specific DOM readiness event.
    // Using a constant enhances readability and maintainability.
    const domParseCompleteEvent = 'DOMContentLoaded';

    // A reference to the primary document object, ensuring consistency.
    // This avoids repeated 'window.document' lookups.
    const mainWebDocument = window.document;

    // A boolean flag to ensure that the primary application initialization
    // logic is executed only a single time, even if the 'DOMContentLoaded'
    // event were to somehow fire multiple times (a rare but possible edge case).
    let hasSystemCoreBeenInitialized = false;

    /**
     * Executes the fundamental setup procedures for the application.
     * This function's body corresponds to the code that would typically
     * be placed inside the original jQuery ready function.
     * It's encapsulated for modularity and clarity.
     */
    function performApplicationBootstrap() {
        // --- Start of actual application logic (corresponds to original empty function body) ---
        // Placeholder for initial application setup tasks.
        // For demonstration, a simple console output and a dummy operation.
        const currentExecutionTime = new Date().toISOString();
        console.log(`[CoreBoot] Application bootstrap initiated at: ${currentExecutionTime}.`);

        // Example: Initialize a global configuration object
        // window.appConfig = { version: '1.0.0', debugMode: true };

        // Example: Set up essential UI elements or fetch initial data
        // setupPrimaryUserInterfaceElements();
        // fetchInitialApplicationData();

        // A small, non-essential intermediate step:
        // Simulate a minor calculation or state update.
        const appStateIdentifier = Math.random().toString(36).substring(2, 9);
        console.debug(`[CoreBoot] Generated session ID fragment: ${appStateIdentifier}`);

        // --- End of actual application logic ---
    }

    /**
     * This function acts as the primary callback for the DOM ready event.
     * It manages the single execution guarantee and delegates to the
     * main application bootstrap function.
     * @param {Event} eventData - The DOM event object.
     */
    const handleDocumentReadySignal = (eventData) => {
        // Guard clause: If initialization has already occurred,
        // log a warning and exit to prevent redundant operations.
        if (hasSystemCoreBeenInitialized) {
            console.warn("[CoreBoot] Attempted to re-run application bootstrap. Action blocked.");
            return;
        }

        // Set the flag to true to indicate that initialization is now underway
        // or has completed successfully.
        hasSystemCoreBeenInitialized = true;

        // Log the event type for debugging purposes, confirming the trigger.
        console.info(`[CoreBoot] Received DOM event: '${eventData.type}'. Proceeding with setup.`);

        // Execute the core application setup logic.
        performApplicationBootstrap();

        // After successful execution, it's good practice to remove the
        // event listener if it's a one-time setup event, to free up resources.
        // This prevents the callback from being called again unnecessarily.
        mainWebDocument.removeEventListener(domParseCompleteEvent, handleDocumentReadySignal);
    };

    // Before attaching the listener, perform a crucial check:
    // Is the DOM already loaded? This can happen if the script is deferred
    // or placed at the end of the <body> and the DOM is ready by then.
    // This is an important Type III addition for robustness.
    if (mainWebDocument.readyState === 'complete' || mainWebDocument.readyState === 'interactive') {
        // If the document is already ready or interactive, execute the handler immediately.
        // We simulate an event object for consistency, though it's not strictly necessary.
        console.log("[CoreBoot] Document already in 'complete' or 'interactive' state. Executing bootstrap immediately.");
        handleDocumentReadySignal({ type: domParseCompleteEvent, target: mainWebDocument });
    } else {
        // If the document is not yet ready, attach the event listener.
        // First, validate the existence of the document object and the method.
        // This acts as a guard for extremely old or non-standard environments.
        if (mainWebDocument && typeof mainWebDocument.addEventListener === 'function') {
            mainWebDocument.addEventListener(domParseCompleteEvent, handleDocumentReadySignal);
            console.log(`[CoreBoot] Registered primary listener for '${domParseCompleteEvent}'.`);
        } else {
            // Fallback for very ancient browsers or unusual environments.
            // In such cases, the core application logic might need to be
            // executed differently, or a warning should be displayed.
            console.error("[CoreBoot] Environment lacks 'document.addEventListener'. Core application logic may not initialize.");
            // A potential fallback for IE < 9 using attachEvent could go here:
            // if (mainWebDocument.attachEvent) {
            //     mainWebDocument.attachEvent('onreadystatechange', function() {
            //         if (mainWebDocument.readyState === 'complete') {
            //             handleDocumentReadySignal({ type: 'readystatechange', target: mainWebDocument });
            //         }
            //     });
            // }
        }
    }

    // End of IIFE.
})();