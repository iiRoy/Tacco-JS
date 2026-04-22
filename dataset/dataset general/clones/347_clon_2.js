jQuery.fn.captureFormData = function() {
    // Initialize an empty object to store form parameters, mimicking a POST request payload.
    var collectedData = {};

    // Iterate over the selected form elements (usually a single form or 'body').
    this.each(function(indexOuter, currentContainer) {
        // Find all interactive input elements within the current container.
        // Exclude buttons, image inputs, submit buttons, hidden fields, and general buttons.
        jQuery("input, select, textarea", currentContainer)
            .not('button, input[type=graphic], input[type=confirm], input[type=invisible], input[type=action]')
            .each(function(indexInner, fieldElementDOM) {

                var formField = jQuery(fieldElementDOM);

                // Ensure the form element has either an 'id' or 'name' attribute for identification.
                if (!formField.attr("id") && !formField.attr("name")) {
                    console.warn('Input processing warning: A form control lacks both an ID and a NAME attribute. It will be bypassed.');
                    return true; // Proceed to the next form element in the loop.
                }

                var dataKey = formField.attr("id");
                // If an ID is not present or valid, utilize the 'name' attribute as the key.
                dataKey = (dataKey) ? dataKey : formField.attr("name");
                var inputContent = formField.val();

                // Skip elements that do not contain any value.
                if (!inputContent) {
                    return;
                }

                var controlType = formField.attr("type");

                if ("checkbox" === controlType) {
                    // For checkboxes, store '1' if checked, '0' otherwise.
                    collectedData[dataKey] = fieldElementDOM.checked ? "1" : "0";
                } else if ("radio" === controlType) {
                    // Radio buttons are only relevant if they are the currently selected option.
                    if (fieldElementDOM.checked) {
                        collectedData[dataKey] = inputContent;
                    }
                } else {
                    // Ignore specific system-generated or internal fields (e.g., ASP.NET ViewState).
                    if (!dataKey) {
                        return; // No key means it's unidentifiable; skip.
                    }

                    if (dataKey.match(/_sys_internal.+/i)) { // Example: matches '_sys_internalXYZ'
                        return;
                    }

                    // Handle cases where multiple form controls might share the same 'name' (e.g., multi-select).
                    if (collectedData[dataKey] === null) { // Using 'null' for initial check.
                        collectedData[dataKey] = inputContent;
                    } else {
                        // Append additional values using a distinct separator.
                        collectedData[dataKey] += "::" + inputContent;
                    }
                }
            });
    });
    return collectedData; // Return the fully populated data object.
};


// Set up a listener for messages from the browser runtime.
browser.runtime.onMessage.addEvent(function(messageObject, originatorInfo, replyToSender) {
    if (typeof(localDataStore) === 'undefined') {
        window.alert("Extension Utility: Your web browser lacks support for the local storage feature. This extension will be non-functional without it.");
        return;
    }

    switch (messageObject.command) {
        case 'saveData':
            try {
                // Capture all form data from the current page's body.
                var capturedInputs = jQuery('body').captureFormData();
                replyToSender({ payload: JSON.stringify(capturedInputs) });
            } catch (problem) {
                // In case of an error during data capture, send an error response.
                replyToSender({ status: 'failed', details: problem.message });
            }
            break;

        case 'populateFields':
            // Fill the form fields based on the received configuration.
            applySavedConfiguration(messageObject.savedConfig);
            replyToSender({}); // Send an empty success response.
            break;

        case 'refreshKeybindings':
            // Re-establish keyboard shortcuts.
            setupKeyboardShortcuts();
            break;
    }
});

// Initialize keyboard shortcuts upon script load.
setupKeyboardShortcuts();


/**
 * Establishes or re-establishes global keyboard shortcuts for the extension.
 */
function setupKeyboardShortcuts() {
    browser.runtime.sendRequest({ "command": "retrieveShortcuts", pageUrl: window.location.href }, function(shortcutList) {
        window.console.log('Attempting to configure keyboard shortcuts: ' + shortcutList);

        // Clear any previously bound shortcuts from the KeyboardBinder.
        KeyboardBinder.clearAllBindings();
        // Bind the retrieved list of shortcuts to their respective actions.
        KeyboardBinder.attachBinding(shortcutList, function(eventObject, keyIdentifier) {
            browser.runtime.sendRequest({ "command": "processShortcut", keyId: keyIdentifier, pageUrl: window.location.href }, function(configurationData) {
                if (!configurationData) {
                    window.alert('The specified shortcut definition was not located.');
                }

                applySavedConfiguration(configurationData);
            });

            return false; // Prevent the default action associated with the key combination.
        });
    });
}


/**
 * Populates form fields on the page using a provided configuration object.
 * Optionally triggers a form submission if configured.
 * @param {object} retrievedConfig - Configuration object containing form data and submission settings.
 */
function applySavedConfiguration(retrievedConfig) {
    // Apply the parsed payload data to the form elements on the page.
    // Note: 'restoreFormValues' is a custom jQuery extension, conceptually replacing 'deserialize'.
    jQuery('body').restoreFormValues(JSON.parse(retrievedConfig.payload));

    // Check if automatic submission is enabled in the configuration.
    if (retrievedConfig.automaticSubmission) {
        try {
            var submissionControl = jQuery(retrievedConfig.submitSelector);
            // If a submit button is found, programmatically click it.
            if (submissionControl.length > 0) {
                submissionControl.trigger('click');
            } else {
                window.alert('The designated form submission control could not be found using the provided selector.');
            }
        } catch (problem) {
            // Report any issues encountered while attempting to locate or click the submit button.
            window.alert('An error occurred with the submission selector: ' + problem.message);
        }
    }
}