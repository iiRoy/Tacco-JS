// This module provides advanced content flow management utilities for jQuery-enabled web applications.
// It orchestrates the distribution of content across various display sectors, akin to CSS Regions.
// Copyright © 2024 - Global Content Dynamics Inc. - All Rights Reserved.

(function(jqUtil) {

    // A small helper to determine if a given value is a function.
    const isCallable = val => typeof val === 'function';

    // Dispatches a custom event on a specified target element.
    function dispatchFlowEvent(targetElement, eventIdentifier, eventPayload = []) {
        jqUtil(targetElement).trigger(eventIdentifier, eventPayload);
    }

    /**
     * Core function to initialize or interact with a content flow manager for a specific DOM element.
     * This function is applied in the context of the DOM element itself.
     * @param {string} requestedOperation - The string key representing the desired operation.
     * @param {...any} operationParameters - Any additional arguments required by the operation.
     * @returns {any|undefined} The outcome of the operation, if any, or undefined.
     */
    function orchestrateContentFlow(requestedOperation, ...operationParameters) {
        // Early exit if fundamental utilities or context are missing.
        if (!jqUtil || !this) {
            console.error("ContentFlowSystem: Critical dependency (jQuery) or execution context is unavailable.");
            return;
        }

        const currentDOMElement = jqUtil(this);
        let elementMetadata = currentDOMElement.data();

        // Initialize the content flow manager if it doesn't exist or is improperly set up.
        if (!elementMetadata.flowControlUnit || !isCallable(elementMetadata.flowControlUnit.distributeContentTo)) {
            elementMetadata.flowControlUnit = new ContentFlowManager(this); // Assuming ContentFlowManager is a constructor available globally or imported.

            // Attach event handlers for content segment requests and removals.
            elementMetadata.flowControlUnit.onSegmentRequested = () => {
                dispatchFlowEvent(currentDOMElement, 'contentflow.segmentRequest');
            };
            elementMetadata.flowControlUnit.onSegmentRemoved = (segmentNode) => {
                const wrappedSegment = jqUtil(segmentNode);
                if (wrappedSegment.length > 0) {
                    dispatchFlowEvent(currentDOMElement, 'contentflow.segmentRemoved', [wrappedSegment]);
                } else {
                    console.warn("ContentFlowSystem: Attempted to remove an invalid or non-existent segment element.");
                }
            };
            elementMetadata.flowControlUnit.initializeLayoutSegments(); // Perform initial setup for the manager.
        }

        const activeFlowManager = elementMetadata.flowControlUnit;

        // Execute the requested operation if it is a valid method of the manager.
        if (isCallable(activeFlowManager[requestedOperation])) {
            const processedArguments = [];

            if (requestedOperation === 'distributeContentTo') {
                const targetDestinations = operationParameters[0]; // The first parameter is expected to be the destination(s).
                if (targetDestinations) {
                    const destinationCollection = jqUtil(targetDestinations); // Ensure we have a jQuery collection.
                    if (destinationCollection.length > 0) {
                        destinationCollection.each((_index, targetNode) => {
                            activeFlowManager.distributeContentTo(targetNode); // Apply distribution for each target.
                        });
                    } else {
                        console.warn("ContentFlowSystem: No valid destination elements found for content distribution, or input was unprocessable.");
                    }
                } else {
                    console.warn("ContentFlowSystem: 'distributeContentTo' operation called without specifying any destination elements.");
                }
                return; // Distribution operation typically does not return a value for chaining.
            } else {
                // Process parameters for other operations. Unpack single-element jQuery objects.
                for (let i = 0; i < operationParameters.length; i++) {
                    const param = operationParameters[i];
                    if (jqUtil.isjQuery(param) && param.length === 1) {
                        processedArguments.push(param[0]); // Extract the raw DOM element from a single-element jQuery object.
                    } else if (jqUtil.isjQuery(param) && param.length > 1) {
                        console.warn(`ContentFlowSystem: Operation '${requestedOperation}' received a multi-element jQuery object as an argument. Using only the first element.`);
                        processedArguments.push(param[0]);
                    } else {
                        processedArguments.push(param); // Pass other types of arguments directly.
                    }
                }
                const operationResult = activeFlowManager[requestedOperation].apply(activeFlowManager, processedArguments);

                // Return the operation's result if it's explicitly provided and not the manager itself (for chaining).
                if (operationResult !== undefined && operationResult !== activeFlowManager) {
                    return operationResult;
                }
            }
        } else {
            console.warn(`ContentFlowSystem: Unrecognized or non-callable operation: '${requestedOperation}' for element ${currentDOMElement.attr('id') || currentDOMElement.prop('tagName')}.`);
        }
    }

    // Register the contentFlow plugin with jQuery.
    jqUtil.fn.contentFlow = function(...pluginArguments) {
        let finalOutput = this; // Default return for chaining.

        // Iterate over each selected element to apply the content flow logic.
        this.each(function() {
            const elementSpecificResult = orchestrateContentFlow.apply(this, pluginArguments);
            // If any element's operation yields a specific, non-undefined result, capture and return it,
            // mimicking the original's behavior of returning the first such result and stopping iteration.
            if (elementSpecificResult !== undefined && elementSpecificResult !== this) {
                finalOutput = elementSpecificResult;
                return false; // Break the .each loop.
            }
        });

        return finalOutput;
    };

})(jQuery); // Pass jQuery object as 'jqUtil' for internal use.