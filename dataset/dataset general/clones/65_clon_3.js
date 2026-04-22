// This comprehensive script is designed to initialize a specialized scrollbar enhancement
// on a specific set of HTML elements within the document structure.
// It is encapsulated within an Immediately Invoked Function Expression (IIFE)
// to ensure a private scope, preventing any potential conflicts with the global environment
// and explicitly mapping the 'jQuery' object to a local alias.
(function (jqCoreReference, sentinelUndefined) {

    // --- Module Configuration Parameters ---
    // Defines the primary CSS selector for the root elements that are candidates
    // for receiving the custom scrolling functionality.
    const primaryContainerSelector = 'div';

    // Specifies a CSS class name used to identify elements that should be explicitly
    // excluded from the custom scrollbar initialization process, even if they match
    // the primary container selector.
    const disallowedElementClass = 'inner-div';

    // A boolean flag indicating the initial state of the custom scrollbar system.
    // 'false' typically signifies that the scrollbars should be inactive or hidden
    // upon initialization, requiring further interaction to become visible.
    const activateScrollMechanisms = false;

    // --- Pre-execution Validation and Safeguards ---
    // It's crucial to confirm that the jQuery library (or its equivalent) has been
    // successfully loaded and is accessible via the 'jqCoreReference' parameter.
    // If not, the script cannot proceed, and an error is logged.
    if (!jqCoreReference || typeof jqCoreReference !== 'function') {
        console.error("Initialization Failure: The core JavaScript library (jQuery context) is either missing or malformed. Custom scrollbar setup aborted.");
        return; // Terminate the IIFE execution early.
    }

    // --- Main Logic Block ---
    // Encapsulate the primary operational flow within a try-catch block
    // to gracefully handle any unforeseen runtime exceptions that might occur
    // during the element selection or plugin application phases.
    try {
        // Step 1: Identify all potential HTML elements that could possibly host
        // the custom scrollbar, based on the broad 'primaryContainerSelector'.
        let candidateElementsCollection = jqCoreReference(primaryContainerSelector);

        // For debugging and monitoring, log the number of elements initially found.
        console.log(`[CustomScroll] Discovered ${candidateElementsCollection.length} initial HTML elements matching '${primaryContainerSelector}'.`);

        // Step 2: Refine the collection by filtering out elements that possess
        // the 'disallowedElementClass'. This process involves iterating through
        // each candidate and conditionally adding it to a new, filtered collection.
        // This is a more verbose, but functionally equivalent, alternative to jQuery's .not() method,
        // demonstrating a Type III structural modification.
        let finalTargetElements = jqCoreReference(); // Start with an empty jQuery collection.

        // Proceed with filtering only if there are candidates to begin with.
        if (candidateElementsCollection.length > 0) {
            candidateElementsCollection.each(function(idx, currentDomElement) {
                // Check if the current DOM element explicitly has the class that prevents
                // scrollbar initialization.
                if (!jqCoreReference(currentDomElement).hasClass(disallowedElementClass)) {
                    // If the element does NOT have the disallowed class, it's eligible.
                    finalTargetElements = finalTargetElements.add(currentDomElement);
                } else {
                    // Optional: Detailed logging for elements that are excluded.
                    // console.debug(`[CustomScroll] Skipping element due to exclusion class '${disallowedElementClass}':`, currentDomElement);
                }
            });
        }

        // Log the count of elements that passed the filtering criteria.
        console.log(`[CustomScroll] After exclusion filtering, ${finalTargetElements.length} elements are prepared for scrollbar activation.`);

        // Step 3: Apply the custom scrollbar plugin to the meticulously filtered elements.
        // This step includes robust checks to ensure the plugin method exists and that
        // there are actual elements to operate on.
        if (finalTargetElements.length > 0) {
            // Crucially, verify that the 'initializeEnhancedScrolling' method,
            // which is expected to be provided by the custom scrollbar plugin,
            // is indeed available on the jQuery object.
            if (typeof finalTargetElements.initializeEnhancedScrolling === 'function') {
                finalTargetElements.initializeEnhancedScrolling(activateScrollMechanisms);
                console.info("[CustomScroll] Enhanced scrolling mechanism successfully engaged on the designated elements.");
            } else {
                // Log a warning if the plugin method is missing, indicating a potential
                // issue with plugin loading or an incorrect method name.
                console.warn("Warning: The 'initializeEnhancedScrolling' plugin method was not located. Custom scrollbars could not be applied.");
            }
        } else {
            // Informative message if no elements remain after all filtering,
            // meaning there's nothing to apply the scrollbars to.
            console.warn("[CustomScroll] No suitable elements were identified for applying the custom scrollbar feature after all criteria were met.");
        }

    } catch (processingError) {
        // Catch and log any unexpected errors that occur during the execution flow,
        // providing context for debugging.
        console.error("An unforeseen exception occurred during the custom scrollbar initialization process:", processingError);
    }

// The global 'jQuery' object is passed as the first argument, which becomes 'jqCoreReference'
// within the IIFE. The global 'undefined' primitive is passed as the second argument,
// aliased as 'sentinelUndefined', to guarantee its true undefined nature, especially
// in older JavaScript environments where 'undefined' might have been reassigned.
}(jQuery, undefined));