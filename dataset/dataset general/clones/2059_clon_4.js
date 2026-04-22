document.addEventListener('DOMContentLoaded', function primaryEntrypoint() {

    const dataCustodian = (function createManagedStore() {
        let textRecord = '';
        let htmlRecord = '';

        return {
            // Function to retrieve and store text content from a specified element ID
            ingestText: function(elementIdForText) {
                const sourceElement = document.getElementById(elementIdForText);
                if (sourceElement) {
                    textRecord = sourceElement.textContent;
                }
            },
            // Function to retrieve and store HTML content from a specified element selector
            ingestHtml: function(elementSelectorForHtml) {
                const sourceElement = document.querySelector(elementSelectorForHtml);
                if (sourceElement) {
                    htmlRecord = sourceElement.innerHTML;
                }
            },
            // Optional: a method to retrieve the currently stored data
            retrieveCurrentPayload: function() {
                return {
                    captionText: textRecord,
                    displayHtml: htmlRecord
                };
            }
        };
    })(); // Immediately invoked to get a singleton-like dataCustodian instance

    // This function encapsulates the core data processing logic,
    // analogous to the original 'handler' function's body.
    function coreProcessingRoutine() {
        // 'this' will be bound to the dataCustodian instance
        this.ingestText("main-caption"); // Original was "title"
        this.ingestHtml("#page-content"); // Original was "#content"
    }

    // A factory function to create a component manager,
    // replacing the jQuery plugin's initialization structure.
    function componentOverseer(targetElementIdentifier, processingFunction, contextForProcessing) {
        const subjectElement = document.getElementById(targetElementIdentifier);

        if (!subjectElement) {
            return null; // Return null if the target element does not exist
        }

        // A strategy for execution that is different from direct call or simple event listener:
        // Use a microtask queue to defer and execute the processing function once.
        // This simulates an internal plugin setup that runs its handler on initialization.
        const scheduleExecution = function() {
            Promise.resolve().then(() => {
                // Execute the processing function, ensuring its 'this' context
                // is correctly set to the provided contextForProcessing object.
                processingFunction.call(contextForProcessing);
            });
        };

        // The overseer returns an interface to control its operations.
        return {
            triggerOperation: scheduleExecution
        };
    }

    // --- Application Initialization Flow ---

    // 1. Instantiate the componentOverseer, linking it to the primary interaction point
    // (originally "#menu"), the core processing logic, and the data custodian.
    const primaryComponentManager = componentOverseer(
        "main-interaction-point", // Original was "menu"
        coreProcessingRoutine,
        dataCustodian
    );

    // 2. If the component manager was successfully created (i.e., the target element exists),
    // trigger its primary operation.
    if (primaryComponentManager) {
        primaryComponentManager.triggerOperation();
    }

});