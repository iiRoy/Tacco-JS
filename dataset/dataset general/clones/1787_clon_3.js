// Verify essential libraries are loaded before attempting to execute.
(function($) { // Encapsulate to avoid global variable pollution and ensure jQuery context.
    if (!$) {
        console.error('Core JavaScript library (jQuery) not detected. Contact form enhancement aborted.');
        return;
    }

    // Centralized configuration for form elements, messages, and API endpoints.
    const formSettings = {
        notificationPanelID: '#status-feedback-display', // Element to show user messages.
        targetFormID: '#inquiry-submission-form', // The primary form to intercept.
        submitControlSelector: '#inquiry-submission-form button[type="submit"]', // Selector for the form's submit button.
        apiEndpointURL: '/server-side-processor', // The URL for AJAX submission.
        requestType: 'POST', // HTTP method for the AJAX request.
        expectedResponseType: 'html', // Anticipated data type from the server.
        initialSubmitButtonText: 'Send Message',
        processingSubmitButtonText: 'Dispatching...',
        genericFailureMessage: 'Regrettably, an unforeseen system error prevented your message from sending. Please try again or reach us via phone.',
        emailRequiredMessage: 'A valid email address is indispensable for a reply. Kindly provide one.',
        contentRequiredMessage: 'Your message body appears to be empty. Please articulate your thoughts.',
        successfulTransmissionMessage: 'Your message has been successfully transmitted! We appreciate your patience.',
        htmlErrorTitlePattern: /<title>\s*Error\s*Page\s*<\/title>/i, // Regex to detect server-generated error pages.
        emailValidationFailureText: 'A valid sender email is required', // Specific text from server HTML for email error.
        messageValidationFailureText: 'Email Message is Required' // Specific text from server HTML for message error.
    };

    /**
     * Manages the display and eventual hiding of user notifications.
     * @param {string} contentHtml - The message string or HTML to display.
     * @param {number} [visibilityDuration=7000] - How long the message should be visible in milliseconds. Use 0 for indefinite.
     */
    const presentUserAlert = (contentHtml, visibilityDuration = 7000) => {
        const $alertContainer = $(formSettings.notificationPanelID);
        // If the designated container isn't found, log a warning and exit.
        if ($alertContainer.length === 0) {
            console.warn(`Notification container not found: ${formSettings.notificationPanelID}. Message not displayed.`);
            return;
        }

        // Stop any active animations, clear previous content, and prepare for new message.
        $alertContainer
            .stop(true, true) // Stop current animation, jump to end, clear queue.
            .html(`<span>${contentHtml}</span>`)
            .css({ opacity: 0, display: 'block' }) // Set initial state for fade-in.
            .animate({ opacity: 1 }, 600, function() { // Fade in animation.
                // If duration is specified, set a timeout to fade out.
                if (visibilityDuration > 0) {
                    setTimeout(() => {
                        $alertContainer.animate({ opacity: 0 }, 1000, function() {
                            $(this).empty().hide(); // Clear and hide after fade out.
                        });
                    }, visibilityDuration);
                }
            });
    };

    // Locate the primary form element on the page.
    const $targetForm = $(formSettings.targetFormID);

    // Defensive check: if the form is absent, prevent further execution of the handler.
    if ($targetForm.length === 0) {
        console.info(`The designated contact form (${formSettings.targetFormID}) is not present on this page. AJAX submission handler will not activate.`);
        return;
    }

    // Attach an event listener to capture the form's submission.
    $targetForm.on('submit', function(submissionEvent) {
        // Override the browser's default form submission behavior.
        submissionEvent.preventDefault();

        const $currentFormInstance = $(this);
        const $submitButton = $currentFormInstance.find(formSettings.submitControlSelector);

        // Indicate to the user that the submission is in progress.
        $submitButton.prop('disabled', true).text(formSettings.processingSubmitButtonText);
        presentUserAlert(formSettings.processingSubmitButtonText, 0); // Display indefinitely until status changes.

        // Serialize the form data into a URL-encoded string for transmission.
        const serializedFormData = $currentFormInstance.serialize();

        // Initiate an asynchronous HTTP request.
        $.ajax({
            url: formSettings.apiEndpointURL,
            type: formSettings.requestType,
            dataType: formSettings.expectedResponseType,
            data: serializedFormData,

            // Handler for issues during the AJAX request (e.g., network error, server 5xx).
            error: function(xhrObj, reqStatus, thrownExcep) {
                console.error('AJAX submission encountered an error:', reqStatus, thrownExcep, xhrObj);
                presentUserAlert(formSettings.genericFailureMessage);
            },

            // Handler for successful server responses, regardless of application-level success.
            success: function(serverResponsePayload, reqStatus, xhrObj) {
                // Check if the server's response indicates a structured error page.
                if (serverResponsePayload.match(formSettings.htmlErrorTitlePattern)) {
                    // Parse the returned HTML to extract specific validation messages.
                    const $parsedResponse = $(serverResponsePayload);
                    const firstErrorText = $parsedResponse.find('ul li').first().text().trim(); // Get first list item's text.

                    // Map generic server errors to user-friendly messages.
                    if (firstErrorText.includes(formSettings.emailValidationFailureText)) {
                        presentUserAlert(formSettings.emailRequiredMessage);
                    } else if (firstErrorText.includes(formSettings.messageValidationFailureText)) {
                        presentUserAlert(formSettings.contentRequiredMessage);
                    } else {
                        // Fallback for any other unrecognized validation issues.
                        presentUserAlert(`Validation issue detected: ${firstErrorText || formSettings.genericFailureMessage}`);
                    }
                } else {
                    // If no error page detected, assume successful processing.
                    presentUserAlert(formSettings.successfulTransmissionMessage);
                    // Optionally, clear the form fields after successful submission.
                    // $currentFormInstance[0].reset();
                }
            },

            // This callback is executed after the request completes, whether successful or erroneous.
            complete: function() {
                // Re-enable the submit button and reset its text to the original state.
                $submitButton.prop('disabled', false).text(formSettings.initialSubmitButtonText);
            }
        });
    });

})(jQuery); // Pass jQuery into the immediately invoked function expression.