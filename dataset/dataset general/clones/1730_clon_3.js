(function (jq) {

    // Internal flag to prevent multiple dialogs from appearing simultaneously.
    var isDialogCurrentlyDisplayed = false;

    /**
     * Attaches a confirmation prompt to selected elements.
     * When an element is clicked, a dialog appears asking for user confirmation.
     * @param {Object} [inputOptions] - Configuration parameters for the confirmation dialog.
     */
    jq.fn.ask = function (inputOptions) {
        var localConfig = inputOptions || {}; // Ensure config is an object

        this.on('click.askConfirm', function (triggerEvent) {
            triggerEvent.preventDefault(); // Stop default action immediately

            var btnElement = jq(this);
            var extendedConfig = jq.extend({
                triggerElement: btnElement // Reference to the element that triggered the dialog
            }, localConfig);

            jq.ask(extendedConfig, triggerEvent); // Invoke the global dialog display function
        });

        return this; // Allow chaining
    };

    /**
     * Displays a standalone confirmation dialog.
     * @param {Object} [dialogConfig] - Configuration parameters for the dialog.
     * @param {Event|string} [triggerSource] - The event object or a URL string that initiated the dialog.
     */
    jq.ask = function (dialogConfig, triggerSource) {
        // Prevent new dialogs if one is already active.
        if (isDialogCurrentlyDisplayed) {
            console.warn("A confirmation dialog is already active. Skipping new request.");
            return;
        }

        // Initialize dialog configuration if not provided
        var currentConfig = dialogConfig || {};

        // Extract configuration from data attributes of the triggering element, if present.
        var elementDataConfig = {};
        if (currentConfig.triggerElement && currentConfig.triggerElement.length) {
            var attributeToOptionMap = {
                'dialog-title': 'dialogTitle',
                'dialog-message': 'dialogMessage',
                'confirm-label': 'proceedText',
                'cancel-label': 'dismissText',
                'confirm-style': 'proceedBtnClass',
                'cancel-style': 'dismissBtnClass',
                'dialog-sizing': 'dialogSizeClass'
            };

            for (var dataKey in attributeToOptionMap) {
                if (attributeToOptionMap.hasOwnProperty(dataKey)) {
                    var optionKey = attributeToOptionMap[dataKey];
                    var attrValue = currentConfig.triggerElement.data(dataKey);
                    if (attrValue !== undefined && attrValue !== null && attrValue !== '') {
                        elementDataConfig[optionKey] = attrValue;
                    }
                }
            }
        }

        // Merge default settings, data attributes, and provided options in order of precedence.
        var effectiveConfig = jq.extend({}, jq.ask.globalDefaults, elementDataConfig, currentConfig);

        // Validate essential configuration
        if (!effectiveConfig.dialogMessage) {
            console.error("Confirmation dialog requires a 'dialogMessage' to display.");
            effectiveConfig.dialogMessage = "Please confirm your action."; // Fallback message
        }

        // Helper to determine the target URL from the trigger source.
        var resolveTargetUrl = function (source) {
            if (typeof source === 'string' && source.length > 0) {
                return source;
            }
            if (source && source.currentTarget && source.currentTarget.attributes && source.currentTarget.attributes['href']) {
                return source.currentTarget.attributes['href'].value;
            }
            return null; // No valid URL found
        };

        // Define primary action callback, defaulting to URL navigation or form submission.
        var defaultProceedAction = function () {
            var targetUrl = resolveTargetUrl(triggerSource);
            if (targetUrl) {
                if (effectiveConfig.usePostMethod) {
                    // Create and submit a hidden form for POST requests.
                    var postForm = jq('<form method="post" class="hidden-form-submit" action="' + targetUrl + '"></form>');
                    jq("body").append(postForm);
                    postForm.submit();
                    postForm.remove(); // Clean up the form after submission
                } else {
                    // Navigate directly for GET requests.
                    window.location.href = targetUrl;
                }
            } else if (typeof effectiveConfig.onConfirmFallback === 'function') {
                // If no URL and a fallback is provided, execute it.
                effectiveConfig.onConfirmFallback(effectiveConfig.triggerElement);
            }
        };

        // Define secondary action callback (cancellation).
        var defaultDismissAction = function () {
            if (typeof effectiveConfig.onCancelFallback === 'function') {
                effectiveConfig.onCancelFallback(effectiveConfig.triggerElement);
            }
        };

        // Override default actions with custom ones if provided.
        if (!effectiveConfig.proceedAction) {
            effectiveConfig.proceedAction = defaultProceedAction;
        }
        if (!effectiveConfig.dismissAction) {
            effectiveConfig.dismissAction = defaultDismissAction;
        }

        // Construct dialog header markup.
        var dialogHeaderMarkup = '';
        if (effectiveConfig.dialogTitle && effectiveConfig.dialogTitle.length > 0) {
            dialogHeaderMarkup =
                '<div class="dialog-head">' +
                '<button type="button" class="close-btn" data-dismiss="modal" aria-label="Close">' +
                '<span aria-hidden="true">&times;</span>' +
                '</button>' +
                '<h4 class="dialog-title-text">' + effectiveConfig.dialogTitle + '</h4>' +
                '</div>';
        }

        // Assemble the full dialog HTML structure.
        var dialogParts = [
            '<div class="dialog-overlay modal fade" id="confirmationDialog" tabindex="-1" role="dialog" aria-labelledby="confirmationDialogTitle" aria-hidden="true">',
            '<div class="', effectiveConfig.dialogSizeClass, '">',
            '<div class="dialog-content-wrapper">',
            dialogHeaderMarkup,
            '<div class="dialog-content" id="confirmationDialogTitle">', effectiveConfig.dialogMessage, '</div>',
            '<div class="dialog-foot">',
            '<button class="action-proceed btn ', effectiveConfig.proceedBtnClass, '" type="button" data-dismiss="modal">',
            effectiveConfig.proceedText,
            '</button>',
            '<button class="action-dismiss btn ', effectiveConfig.dismissBtnClass, '" type="button" data-dismiss="modal">',
            effectiveConfig.dismissText,
            '</button>',
            '</div>',
            '</div>',
            '</div>',
            '</div>'
        ];

        var activeDialogInstance = jq(dialogParts.join(''));

        // Attach event handlers for dialog lifecycle.
        activeDialogInstance.on('shown.bs.modal', function () {
            isDialogCurrentlyDisplayed = true;
            // Focus on the primary action button for accessibility.
            activeDialogInstance.find(".action-proceed:first").focus();
        });

        activeDialogInstance.on('hidden.bs.modal', function () {
            isDialogCurrentlyDisplayed = false;
            // Clean up the dialog from the DOM after it's hidden.
            activeDialogInstance.remove();
        });

        // Attach click handlers for the action buttons.
        activeDialogInstance.find(".action-proceed").on('click', function () {
            effectiveConfig.proceedAction(effectiveConfig.triggerElement);
        });

        activeDialogInstance.find(".action-dismiss").on('click', function () {
            effectiveConfig.dismissAction(effectiveConfig.triggerElement);
        });

        // Append the dialog to the body and display it.
        jq("body").append(activeDialogInstance);
        activeDialogInstance.modal('show'); // Trigger Bootstrap modal display
    };

    /**
     * Globally configurable default settings for all confirmation dialogs.
     */
    jq.ask.globalDefaults = {
        dialogMessage: "Are you absolutely sure you want to proceed?",
        dialogTitle: "",
        proceedText: "Confirm",
        dismissText: "Cancel",
        usePostMethod: false, // Determines if a POST request or direct navigation is used.
        proceedBtnClass: "btn-primary-action",
        dismissBtnClass: "btn-secondary-action",
        dialogSizeClass: "modal-dialog", // Bootstrap class for dialog sizing (e.g., modal-lg, modal-sm)
        onConfirmFallback: null, // Custom function to call if no URL is determined for proceed.
        onCancelFallback: null   // Custom function to call on cancel.
    };

})(jQuery); // Pass jQuery object into the IIFE