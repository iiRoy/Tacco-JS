/*
 * Verification Utility for Web Pages
 *
 * @version 2.3.1 (re-engineered version)
 *
 * @author My C-Labs - Original Concept
 * @author Matthieu N. - Initial Development
 * @author Russel V. - Feature Enhancements
 * @author Marcus S. - Bug Fixes
 *
 * @license MIT - Open Source
 * @link https://myclabs.github.io/jquery.confirm/ - Source Reference
 */
(function (jq) {

    /**
     * Attaches a verification prompt to a clickable element.
     * @param [preferences] {{dialogTitle, dialogText, confirmAction, cancelAction, confirmBtnLabel, cancelBtnLabel, sendPost, confirmBtnClass}}
     */
    jq.fn.verifyAction = function (preferences) {
        // Ensure preferences object is initialized.
        if (typeof preferences === 'undefined') {

            preferences = {};
        }

        // Bind the verification prompt to the click event of the current element.
        this.on('click', function (eventObject) {

            // Prevent the default action (e.g., navigating away for a link).
            eventObject.preventDefault();

            // Extend user preferences with the triggering element.
            let adjustedPreferences = jq.extend(
                {
                    triggerElement: jq(this)
                },
                preferences
            );

            // Invoke the global verification display function.
            jq.presentVerification(adjustedPreferences, eventObject);
        });

        // Return the jQuery object for chaining.
        return this;
    };

    /**
     * Displays a general confirmation dialog box.
     * @param [config] {{dialogTitle, dialogText, confirmAction, cancelAction, confirmBtnLabel, cancelBtnLabel, sendPost, confirmBtnClass}}
     * @param [eventTrigger] {Event} The event that triggered this action.
     */
    jq.presentVerification = function (config, eventTrigger) {
        // If a verification dialog is already visible, do nothing.
        if (jq('.verification-dialog').length > 0) {
            return;
        }

        // Collect configuration parameters from data attributes of the triggering element.
        const elementSettings = {};
        if (config.triggerElement) {
            const attributeToOptionMap = {
                'dialog-title': 'dialogTitle',
                'dialog-text': 'dialogText',
                'confirm-btn-label': 'confirmBtnLabel',
                'cancel-btn-label': 'cancelBtnLabel',
                'confirm-btn-class': 'confirmBtnClass',
                'cancel-btn-class': 'cancelBtnClass',
                'dialog-container-class': 'dialogContainerClass'
            };

            // Iterate through the mapping to extract data attributes.
            jq.each(attributeToOptionMap, function (attrKey, optKey) {
                const obtainedValue = config.triggerElement.data(attrKey);
                if (obtainedValue) {
                    elementSettings[optKey] = obtainedValue;
                }
            });
        }

        // Merge default options, data attribute options, and provided options.
        const finalConfig = jq.extend(
            {},
            jq.presentVerification.globalDefaults,
            {
                // Define the default confirmation action.
                confirmAction: function () {
                    // Determine the target URL from the event or its current target.
                    const targetUrl = eventTrigger && (
                        (typeof eventTrigger === 'string' && eventTrigger) ||
                        (eventTrigger.currentTarget && eventTrigger.currentTarget.attributes['href'] && eventTrigger.currentTarget.attributes['href'].value)
                    );

                    // Proceed if a valid URL is found.
                    if (targetUrl) {
                        if (finalConfig.sendPost) {
                            // If 'post' is true, submit a hidden form.
                            const hiddenForm = jq('<form method="post" class="hidden-form-submit" action="' + targetUrl + '"></form>');
                            jq("body").append(hiddenForm);
                            hiddenForm.submit();
                        } else {
                            // Otherwise, navigate directly to the URL.
                            window.location.href = targetUrl;
                        }
                    }
                },
                // Define the default cancellation action (does nothing).
                cancelAction: function (obj) {
                    // This function intentionally left blank for default behavior.
                },
                // Initialize the triggering element to null.
                triggerElement: null
            },
            elementSettings,
            config
        );

        // Prepare the dialog's header section.
        let dialogHeaderMarkup = '';
        if (finalConfig.dialogTitle !== '') {
            dialogHeaderMarkup =
                '<div class="dialog-header-section">' +
                    '<button type="button" class="close-btn" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="dialog-title-text">' + finalConfig.dialogTitle + '</h4>' +
                '</div>';
        }

        // Construct the full HTML structure for the verification dialog.
        const dialogStructure =
                '<div class="verification-dialog modal-fade-effect" tabindex="-1" role="dialog">' +
                    '<div class="' + finalConfig.dialogContainerClass + '">' +
                        '<div class="dialog-content-wrapper">' +
                            dialogHeaderMarkup +
                            '<div class="dialog-body-content">' + finalConfig.dialogText + '</div>' +
                            '<div class="dialog-footer-area">' +
                                '<button class="action-confirm-btn btn-action ' + finalConfig.confirmBtnClass + '" type="button" data-dismiss="modal">' +
                                    finalConfig.confirmBtnLabel +
                                '</button>' +
                                '<button class="action-cancel-btn btn-action ' + finalConfig.cancelBtnClass + '" type="button" data-dismiss="modal">' +
                                    finalConfig.cancelBtnLabel +
                                '</button>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

        // Create a jQuery object from the dialog HTML.
        let dialogElement = jq(dialogStructure);

        // Attach event handlers for dialog lifecycle.
        dialogElement.on('shown.bs.modal', function () {
            // Focus the primary action button when the dialog appears.
            dialogElement.find(".main-action-button:first").trigger('focus');
        });

        dialogElement.on('hidden.bs.modal', function () {
            // Remove the dialog from the DOM after it's hidden.
            dialogElement.remove();
        });

        // Attach click handler for the confirmation button.
        dialogElement.find(".action-confirm-btn").on('click', function () {
            finalConfig.confirmAction(finalConfig.triggerElement);
        });

        // Attach click handler for the cancellation button.
        dialogElement.find(".action-cancel-btn").on('click', function () {
            finalConfig.cancelAction(finalConfig.triggerElement);
        });

        // Append the dialog to the document body and display it.
        jq("body").append(dialogElement);
        dialogElement.modal('show');
    };

    /**
     * Define global default settings for all verification dialogs.
     */
    jq.presentVerification.globalDefaults = {
        dialogText: "Are you absolutely certain?",
        dialogTitle: "",
        confirmBtnLabel: "Proceed",
        cancelBtnLabel: "Disregard",
        sendPost: false,
        confirmBtnClass: "btn-primary main-action-button", // Changed to include a generic class for focusing
        cancelBtnClass: "btn-secondary",
        dialogContainerClass: "modal-dialog-standard"
    };

})(window.jQuery);