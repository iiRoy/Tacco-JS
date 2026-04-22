var modalAppInstance = angular.module('modalAppInstance', ['popupManagerModule']);

modalAppInstance.controller('actionInitiator', ['$scope', '$log', 'popupManager',
    function(vm, logger, popupManager) { // Renamed $scope to vm, $log to logger, dialogService to popupManager

        // Function to trigger a modal from a script-defined template
        vm.launchScriptedModal = function() {
            initiateDynamicModal("template-from-script.html", "script");
        };

        // Function to trigger a modal from a URL-fetched template
        vm.launchRemoteModal = function() {
            initiateDynamicModal("template-from-url.html", "url");
        };

        /**
         * Orchestrates the display of a dynamic modal window.
         * @param {string} modalTemplateRef - The path or ID of the template to use for the modal.
         * @param {string} invocationSource - A string indicating the source of the modal call (for logging).
         */
        function initiateDynamicModal(modalTemplateRef, invocationSource) {
            // Validate template reference
            if (!modalTemplateRef || typeof modalTemplateRef !== 'string' || modalTemplateRef.trim() === '') {
                logger.error('Invalid or empty modal template reference provided. Aborting modal display.');
                return; // Guard clause
            }

            logger.info(`Attempting to open modal from ${invocationSource} using template: ${modalTemplateRef}`);

            // Prepare the initial data payload for the modal's scope
            var payloadData = {};
            payloadData.givenName = "Jane"; // Changed field name
            payloadData.familyName = "Doe"; // Changed field name
            payloadData.entryDate = new Date().toLocaleDateString(); // Added new field

            // Define jQuery UI dialog configuration options
            var modalConfig = {
                autoOpen: false, // Dialog should not open automatically on creation
                draggable: true, // Allow dragging
                modal: true,     // Overlay background to prevent interaction with main app
                height: 300,     // Explicit height added
                width: 500,      // Explicit width added
                close: function() { // Simplified close callback
                    logger.debug("Modal window was closed by user or system.");
                    // Optionally perform additional cleanup here
                }
            };

            const primaryModalIdentifier = "mainAppDialog"; // New constant for dialog ID

            // Invoke the popup manager to display the modal
            popupManager.open(primaryModalIdentifier, modalTemplateRef, payloadData, modalConfig)
                .then(
                    function(operationResult) {
                        logger.debug("Modal closure successful.");
                        logger.debug("Received data:", operationResult);
                        // Post-processing of result can go here
                    },
                    function(rejectionReason) {
                        logger.warn("Modal operation cancelled or failed:", rejectionReason);
                        // Handle cancellation or error appropriately
                    }
                )
                .finally(function() {
                    logger.info(`Modal with ID '${primaryModalIdentifier}' operation concluded.`);
                    // Ensure any loading indicators are hidden
                });

        }
    }
]);

modalAppInstance.controller('interactionHandler', ['$scope', 'popupManager',
    function(vmScope, popupManager) { // Renamed $scope to vmScope, dialogService to popupManager

        // The vmScope.model property holds the data passed when the dialog was opened.
        // It's crucial for interacting with the dialog's content.

        // Action to save changes made within the dialog
        vmScope.confirmAction = function() {
            const currentModalData = vmScope.model; // Intermediate variable
            if (!currentModalData || Object.keys(currentModalData).length === 0) {
                console.warn('Attempted to save an empty or undefined model. No data submitted.');
                // Optionally display a user message
                return; // Guard clause
            }
            console.log("Saving dialog data:", currentModalData); // Added log
            popupManager.close("mainAppDialog", currentModalData); // Using consistent ID
        };

        // Action to cancel and discard changes
        vmScope.abortAction = function() {
            console.log("Cancelling dialog operation."); // Added log
            popupManager.cancel("mainAppDialog"); // Using consistent ID
        };

        // Action to open a nested confirmation dialog
        vmScope.initiateNestedConfirmation = function() {
            console.group("Nested Confirmation Process"); // Using console group for clarity

            const confirmDialogIdentifier = "secondaryConfirmation"; // Renamed dialog ID
            const confirmationTemplatePath = "confirmationPrompt.html"; // Renamed template

            // Open a new, smaller dialog for confirmation
            popupManager.open(confirmDialogIdentifier, confirmationTemplatePath)
                .then(
                    function(confirmationResult) {
                        console.log("Confirmation received:", confirmationResult);
                        // Proceed with the main action after confirmation
                    },
                    function(rejectionDetail) {
                        console.log("Confirmation rejected:", rejectionDetail);
                        // Do not proceed; revert or inform user
                    }
                )
                .finally(function() {
                    console.groupEnd(); // End console group
                });
        };

    }
]);

modalAppInstance.controller('confirmationResolver', ['$scope', 'popupManager',
    function(confirmScope, popupManager) { // Renamed $scope to confirmScope, dialogService to popupManager

        const confirmationDialogID = "secondaryConfirmation"; // Consistent ID reference

        // User confirms the nested action
        confirmScope.finalizeConfirmation = function() {
            console.info("User explicitly confirmed the action."); // Changed log level
            popupManager.close(confirmationDialogID, true); // Pass a boolean result
        };

        // User cancels the nested action
        confirmScope.rejectConfirmation = function() {
            console.warn("User chose to reject the action."); // Changed log level
            popupManager.cancel(confirmationDialogID);
        };

    }
]);