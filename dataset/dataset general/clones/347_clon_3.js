jQuery.fn.extractFormValues = function () {
    // This custom utility function gathers data from various input elements within the selected DOM context.
    // It constructs a JavaScript object, mapping field identifiers to their respective values.
    // This object is designed to be directly compatible with standard AJAX submission methods.

    if (this.length === 0) {
        // If the jQuery selection is empty, there's nothing to process. Return an empty object immediately.
        return {};
    }

    const collectedPayload = {}; // Initialize the object that will hold all the extracted form data.

    // Iterate through each top-level element (e.g., form or body) in the current jQuery selection.
    this.each(function () {
        const currentContainerElement = this; // Reference to the native DOM element being processed.

        // Locate all interactive form elements, excluding those typically used for actions rather than data.
        jQuery(":input", currentContainerElement)
            .not('button, input[type="image"], input[type="submit"], input[type="hidden"], input[type="button"]')
            .each(function () {
                const activeField = jQuery(this); // Wrap the current input element in a jQuery object.

                // Determine the primary key for this field, preferring 'id' over 'name'.
                let fieldKeyIdentifier = activeField.attr("id");
                if (!fieldKeyIdentifier) {
                    fieldKeyIdentifier = activeField.attr("name");
                }

                // If a field lacks both an 'id' and 'name', it cannot be uniquely identified for storage.
                if (!fieldKeyIdentifier) {
                    console.warn('Form Data Extraction: Input element found without "id" or "name" attribute. Skipping this field.');
                    return true; // Continue to the next element in the loop.
                }

                const fieldContent = activeField.val(); // Retrieve the current value of the input field.
                const inputType = activeField.attr("type"); // Get the HTML 'type' attribute of the input.

                // Process field content based on its type.
                switch (inputType) {
                    case "checkbox":
                        // For checkboxes, store their checked status as a boolean string.
                        collectedPayload[fieldKeyIdentifier] = String(this.checked);
                        break;
                    case "radio":
                        // For radio buttons, only the value of the selected (checked) option is relevant.
                        if (this.checked) {
                            collectedPayload[fieldKeyIdentifier] = fieldContent;
                        }
                        break;
                    default:
                        // For other input types (text, number, select, etc.).
                        // Skip fields that appear to be ASP.NET view state or generated fields.
                        if (fieldKeyIdentifier.startsWith('__')) {
                            // console.debug('Skipping ASP.NET-like field:', fieldKeyIdentifier);
                            return; // Do not process this field.
                        }

                        // If a value for this key already exists (e.g., multiple selects or checkboxes with same name),
                        // append the new value, typically separated by a comma.
                        if (Object.prototype.hasOwnProperty.call(collectedPayload, fieldKeyIdentifier)) {
                            collectedPayload[fieldKeyIdentifier] = [collectedPayload[fieldKeyIdentifier], fieldContent].join(',');
                        } else {
                            // Otherwise, assign the value directly to the payload.
                            collectedPayload[fieldKeyIdentifier] = fieldContent;
                        }
                        break;
                }
            });
    });
    return collectedPayload; // Return the final object containing all collected data.
};

// Establish a listener for messages originating from the Chrome extension's background script or other content scripts.
chrome.runtime.onMessage.addListener(function (messagePacket, messageOrigin, replyFunction) {
    // Crucially, verify that the browser supports HTML5 Local Storage, as it's a core dependency.
    if (!window.localStorage) {
        alert("WebFormAssistant: Your browser does not support the HTML5 local storage feature. This extension cannot function without it.");
        // Optionally, send a failure response here.
        return;
    }

    // Validate the incoming message packet to ensure it contains an actionable command.
    if (!messagePacket || typeof messagePacket.messageAction !== 'string') {
        console.warn("Received an invalid or malformed message packet:", messagePacket);
        replyFunction({ status: 'error', details: 'Malformed message format' });
        return;
    }

    // Process the message based on its designated action.
    switch (messagePacket.messageAction) {
        case 'persist_data':
            try {
                // Trigger the form data extraction on the current page's body.
                const pageDataSnapshot = jQuery('body').extractFormValues();
                // Respond with the extracted data, serialized as a JSON string.
                replyFunction({ status: 'success', dataPayload: JSON.stringify(pageDataSnapshot) });
            } catch (processingIssue) {
                // Catch and report any errors during the data extraction process.
                replyFunction({ status: 'error', hasFailed: true, errorDescription: processingIssue.message });
            }
            break;

        case 'inject_form_values':
            // If the message requests form population, pass the configuration data to the dedicated function.
            if (messagePacket.configSet) {
                applyConfigurationToForm(messagePacket.configSet);
                replyFunction({ status: 'acknowledged' }); // Confirm receipt and initiation.
            } else {
                console.warn("Received 'inject_form_values' without a configuration set.");
                replyFunction({ status: 'error', details: 'Missing configuration payload' });
            }
            break;

        case 'refresh_shortcuts':
            // Reinitialize keyboard shortcut bindings when requested.
            setupKeyboardHotkeys();
            replyFunction({ status: 'completed' });
            break;

        default:
            // Log and respond to any unrecognized message actions.
            console.warn("Unrecognized message action received:", messagePacket.messageAction);
            replyFunction({ status: 'error', details: 'Unsupported action type' });
            break;
    }
});

// Execute the hotkey setup immediately when the content script is loaded.
setupKeyboardHotkeys();

// Function responsible for setting up or refreshing global keyboard shortcuts.
function setupKeyboardHotkeys() {
    // Ensure the Mousetrap library is available before attempting any key bindings.
    if (typeof Mousetrap === 'undefined') {
        console.error('Hotkey Setup Error: Mousetrap JavaScript library is not detected. Cannot bind keyboard shortcuts.');
        return;
    }

    // Request the relevant keyboard shortcuts from the background script, specific to the current page's URL.
    chrome.runtime.sendMessage({ "command": "get_active_shortcuts", pageIdentifier: window.location.href }, function (availableShortcuts) {
        console.info('Hotkey Manager: Requesting shortcuts for:', window.location.href, '. Received:', availableShortcuts);

        // If no shortcuts are returned or the list is empty, clear existing bindings and exit.
        if (!availableShortcuts || availableShortcuts.length === 0) {
            console.info('Hotkey Manager: No specific shortcuts configured for this page. Clearing any existing bindings.');
            Mousetrap.reset(); // Remove any previously set Mousetrap bindings.
            return;
        }

        Mousetrap.reset(); // Clear all previous bindings to ensure a clean slate and avoid duplicate triggers.

        // Bind the retrieved shortcuts using Mousetrap.
        Mousetrap.bind(availableShortcuts, function (keyboardEvent, triggeredKeyCombo) {
            // Upon a hotkey trigger, notify the background script.
            chrome.runtime.sendMessage({ "command": "hotkey_activated", hotkeyCombo: triggeredKeyCombo, currentDocumentURL: window.location.href }, function (retrievedConfig) {
                if (!retrievedConfig) {
                    alert('Hotkey Activated: No associated configuration found for this shortcut. Please check your extension settings.');
                    // Consider a less intrusive notification for the user.
                    return;
                }

                // If a configuration is successfully retrieved, use it to populate the form.
                applyConfigurationToForm(retrievedConfig);
            });

            // Prevent the browser's default action for the triggered key combination.
            return false;
        });
    });
}

// Function to populate form fields based on a provided configuration object.
function applyConfigurationToForm(formConfigData) {
    // Validate the input configuration to ensure it contains necessary data.
    if (!formConfigData || typeof formConfigData.storedContent !== 'string') {
        console.warn('Form Population: Received invalid or incomplete configuration data.', formConfigData);
        alert('Form Population Warning: The configuration data provided is invalid or missing content.');
        return;
    }

    let parsedFormData = {};
    try {
        // Attempt to parse the JSON string containing the form data.
        parsedFormData = JSON.parse(formConfigData.storedContent);
        console.log('Form Population: Successfully parsed form data from configuration.');
    } catch (parsingError) {
        console.error('Form Population Error: Failed to parse the stored content JSON. Error:', parsingError.message);
        alert('Form Population Error: The data stored for this configuration is corrupted or malformed.');
        return;
    }

    // Utilize the jQuery deserialize plugin to automatically fill the form fields.
    jQuery('body').deserialize(parsedFormData);
    console.info('Form Population: All eligible fields have been populated with the provided data.');

    // Check if automatic form submission is enabled in the configuration.
    if (formConfigData.autoSubmitEnabled) {
        console.log('Form Population: Automatic submission is enabled. Preparing to trigger form submission...');
        try {
            const submitButtonQuery = formConfigData.submitButtonSelector;
            if (!submitButtonQuery) {
                console.warn('Form Population: Auto-submission enabled, but no submit button selector was provided.');
                alert('Auto-Submission Warning: No submit button selector specified in the configuration for automatic submission.');
                return;
            }

            const identifiedSubmitElement = jQuery(submitButtonQuery);

            if (identifiedSubmitElement.length) {
                // Introduce a brief delay before clicking to simulate user interaction or allow DOM updates.
                setTimeout(() => {
                    console.log('Form Population: Triggering form submission using selector:', submitButtonQuery);
                    identifiedSubmitElement.trigger('click'); // Programmatically trigger the click event.
                }, 200); // A 200ms delay.
            } else {
                console.warn('Form Population: The specified submit button selector did not find any elements:', submitButtonQuery);
                alert('Auto-Submission Alert: The submit button specified in the configuration could not be found on this page.');
            }
        } catch (submissionIssue) {
            console.error('Form Population Error: An error occurred during automatic form submission:', submissionIssue.message);
            alert('Auto-Submission Error: An unexpected issue prevented the form from being submitted: ' + submissionIssue.message);
        }
    }
}