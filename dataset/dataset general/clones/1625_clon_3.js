(function ($pageContext) {
    // This script augments jQuery functionality to handle various UI interactions
    // related to AJAX, form submissions, and user confirmations.

    // Retrieve security tokens from meta tags for Cross-Site Request Forgery (CSRF) protection.
    // These are essential for non-GET requests to ensure application integrity.
    const securityToken = $pageContext('meta[name="security-token-value"]').attr('content');
    const securityParamIdentifier = $pageContext('meta[name="security-token-name"]').attr('content');

    // Extend the jQuery prototype to include new methods for event management and server communication.
    $pageContext.fn.extend({
        /**
         * Dispatches a custom event on the current element and checks if its default action
         * was prevented by any listener. This is a robust way to allow event-driven
         * cancellation or modification of operations.
         *
         * @param {string} customEventName - The specific name of the event to trigger (e.g., 'ajax:initiate').
         * @param {any} associatedData - Any additional data to pass along with the event object.
         * @returns {boolean} `true` if the event's default outcome was not explicitly prevented, `false` otherwise.
         */
        dispatchCustomEventWithResult: function (customEventName, associatedData) {
            if (!customEventName || typeof customEventName !== 'string') {
                console.error("Invalid event name provided for dispatchCustomEventWithResult:", customEventName);
                return false;
            }

            const generatedEvent = $pageContext.Event(customEventName);
            this.trigger(generatedEvent, associatedData);

            const eventDefaultPrevented = (generatedEvent.result === false);
            return !eventDefaultPrevented; // Return true if not prevented, false if prevented
        },

        /**
         * Initiates an asynchronous request to the server based on the attributes
         * of the calling element (e.g., a form or a link). It manages various stages
         * of the AJAX lifecycle by dispatching dedicated events.
         */
        initiateServerRequest: function () {
            const triggeringElement = this;
            let httpRequestVerb = triggeringElement.attr('method') || triggeringElement.attr('data-http-method') || 'GET';
            const requestTargetUrl = triggeringElement.attr('action') || triggeringElement.attr('href');
            let expectedResponseFormat = triggeringElement.attr('data-response-type') || 'script';

            // Basic validation for the request URL.
            if (!requestTargetUrl) {
                console.error("No valid URL found for asynchronous request. 'action' or 'href' attribute is mandatory.");
                throw new Error("Missing URL for AJAX operation.");
            }

            // Allow external handlers to intercept and potentially cancel the request before it begins.
            if (triggeringElement.dispatchCustomEventWithResult('ajax:commence')) {
                let requestPayload = {}; // Data to be sent with the request.

                // Determine the payload based on the element type.
                if (triggeringElement.is('form')) {
                    requestPayload = triggeringElement.serializeArray();
                } else {
                    // For non-form elements, payload might be empty or custom.
                    // Example: requestPayload = { id: triggeringElement.attr('id') };
                }

                // Append CSRF tokens for non-GET requests if available.
                const uppercaseVerb = httpRequestVerb.toUpperCase();
                if (uppercaseVerb !== 'GET' && securityParamIdentifier && securityToken) {
                    if (Array.isArray(requestPayload)) {
                        requestPayload.push({ name: securityParamIdentifier, value: securityToken });
                    } else if (typeof requestPayload === 'object') {
                        requestPayload[securityParamIdentifier] = securityToken;
                    }
                }

                $pageContext.ajax({
                    url: requestTargetUrl,
                    data: requestPayload,
                    dataType: expectedResponseFormat,
                    type: uppercaseVerb,
                    timeout: 20000, // Enforce a 20-second timeout for all AJAX requests.
                    beforeSend: function (xhrRequest, ajaxSettings) {
                        triggeringElement.trigger('ajax:request-started', [xhrRequest, ajaxSettings]);
                        // Returning false here would cancel the AJAX request.
                    },
                    success: function (receivedData, textStatus, xhrRequest) {
                        triggeringElement.trigger('ajax:request-success', [receivedData, textStatus, xhrRequest]);
                    },
                    error: function (xhrRequest, errorCategory, errorDescription) {
                        triggeringElement.trigger('ajax:request-failure', [xhrRequest, errorCategory, errorDescription]);
                    },
                    complete: function (xhrRequest, textStatus) {
                        triggeringElement.trigger('ajax:request-finished', [xhrRequest, textStatus]);
                    }
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    console.warn("AJAX operation failed for URL:", requestTargetUrl, "Status:", textStatus, "Error:", errorThrown);
                })
                .always(function() {
                    // This block executes regardless of success or failure.
                    triggeringElement.trigger('ajax:operation-concluded');
                });
            } else {
                console.info("Asynchronous request prevented by 'ajax:commence' event handler for element:", triggeringElement);
            }

            // Fire an event indicating the request initiation process has completed.
            triggeringElement.trigger('ajax:post-initiation');
        }
    });

    // --- Global Event Delegation Setup ---
    // Utilizing $pageContext(document).on() for efficient event handling on dynamically
    // added elements, replacing the deprecated .live() method.

    /**
     * Listener for clicks on elements requiring user confirmation (e.g., delete actions).
     * The `data-verify-action` attribute holds the confirmation message.
     */
    $pageContext(document).on('click', 'a[data-verify-action], input[data-verify-action]', function (interactionEvent) {
        const actingElement = $pageContext(this);
        const confirmationMessage = actingElement.attr('data-verify-action') || 'Please confirm this action.';

        // Allow other event handlers to run before displaying the native confirmation dialog.
        if (actingElement.dispatchCustomEventWithResult('action:confirm-prompt')) {
            if (!window.confirm(confirmationMessage)) {
                interactionEvent.preventDefault(); // Stop default browser behavior (e.g., navigation).
                interactionEvent.stopImmediatePropagation(); // Prevent other handlers on this element or its parents from running.
                return false;
            }
        } else {
            // If 'action:confirm-prompt' event was cancelled, stop the action.
            interactionEvent.preventDefault();
            interactionEvent.stopImmediatePropagation();
            return false;
        }
    });

    /**
     * Handles form submissions that are designated for asynchronous processing.
     * Prevents the standard browser form submission and initiates an AJAX request.
     */
    $pageContext(document).on('submit', 'form[data-async-form]', function (formSubmissionEvent) {
        const submittedFormElement = $pageContext(this);
        // Dispatch an event allowing listeners to customize or cancel the async form submission.
        if (submittedFormElement.dispatchCustomEventWithResult('form:async-submit-init')) {
            submittedFormElement.initiateServerRequest();
        }
        formSubmissionEvent.preventDefault(); // Always prevent the default form submission.
    });

    /**
     * Handles clicks on links or inputs that are designated for asynchronous operations.
     * Prevents default navigation/action and triggers an AJAX request.
     */
    $pageContext(document).on('click', 'a[data-async-link], input[data-async-link]', function (linkClickEvent) {
        const clickedActionElement = $pageContext(this);
        // Dispatch an event for async link/input clicks.
        if (clickedActionElement.dispatchCustomEventWithResult('link:async-click-init')) {
            clickedActionElement.initiateServerRequest();
        }
        linkClickEvent.preventDefault(); // Always prevent default link/input behavior.
    });

    /**
     * Manages clicks on links that specify an HTTP method other than GET (e.g., POST, PUT, DELETE),
     * but are not handled asynchronously. It dynamically creates and submits a hidden form.
     */
    $pageContext(document).on('click', 'a[data-http-method]:not([data-async-link])', function (methodLinkClickEvent) {
        const actionTriggerLink = $pageContext(this);
        const destinationPath = actionTriggerLink.attr('href');
        const requestedHttpMethod = actionTriggerLink.attr('data-http-method');

        // Ensure both URL and method are present.
        if (!destinationPath || !requestedHttpMethod) {
            console.warn("Link requires 'href' and 'data-http-method' attributes for method simulation:", actionTriggerLink);
            return;
        }

        // Construct a temporary, hidden form to simulate the desired HTTP method.
        const dynamicSubmissionForm = $pageContext('<form>', {
            'method': 'POST', // Forms can only be GET or POST. We use POST for method override.
            'action': destinationPath,
            'style': 'display: none !important; visibility: hidden;', // Hide the form completely.
            'target': '_self' // Ensure submission happens in the current browsing context.
        });

        // Add a hidden input to override the HTTP method (e.g., for PUT/DELETE).
        dynamicSubmissionForm.append($pageContext('<input>', {
            'type': 'hidden',
            'name': '_method',
            'value': requestedHttpMethod
        }));

        // Include CSRF protection tokens if they are configured.
        if (securityParamIdentifier && securityToken) {
            dynamicSubmissionForm.append($pageContext('<input>', {
                'type': 'hidden',
                'name': securityParamIdentifier,
                'value': securityToken
            }));
        }

        dynamicSubmissionForm.appendTo('body'); // Attach the form to the document body.

        methodLinkClickEvent.preventDefault(); // Stop the default link navigation.
        dynamicSubmissionForm.submit(); // Programmatically submit the form.
        // The form can be removed after submission if desired, though the browser typically handles cleanup.
        // dynamicSubmissionForm.remove();
    });

    // --- UI Element Disabling During AJAX Operations ---
    // Handlers to temporarily disable input elements within forms that perform AJAX requests,
    // providing visual feedback to the user.

    const ajaxDisableInputSelector = 'input[data-disable-on-ajax]';
    const ajaxFormWithDisabledsSelector = `form[data-async-form]:has(${ajaxDisableInputSelector})`;

    /**
     * When an AJAX request starts for a form containing 'data-disable-on-ajax' inputs,
     * disable these inputs and update their display text.
     */
    $pageContext(document).on('ajax:request-started', ajaxFormWithDisabledsSelector, function () {
        const currentOperatingForm = $pageContext(this);
        currentOperatingForm.find(ajaxDisableInputSelector).each(function () {
            const targetInput = $pageContext(this);
            const initialValue = targetInput.val();
            const disabledStateText = targetInput.attr('data-disable-on-ajax');

            if (disabledStateText) { // Only modify if the attribute is present.
                targetInput.data('original-input-value', initialValue); // Store original value in jQuery's data cache.
                targetInput.val(disabledStateText); // Change displayed text.
                targetInput.prop('disabled', true); // Disable the input.
                targetInput.addClass('state-disabled-ajax'); // Add a CSS class for styling.
            }
        });
    });

    /**
     * Upon completion of an AJAX request for a form, re-enable the disabled inputs
     * and restore their original display text.
     */
    $pageContext(document).on('ajax:operation-concluded', ajaxFormWithDisabledsSelector, function () {
        const currentOperatingForm = $pageContext(this);
        currentOperatingForm.find(ajaxDisableInputSelector).each(function () {
            const targetInput = $pageContext(this);
            const storedOriginalValue = targetInput.data('original-input-value');

            targetInput.prop('disabled', false); // Re-enable the input.
            targetInput.val(storedOriginalValue); // Restore original text.
            targetInput.removeClass('state-disabled-ajax'); // Remove styling class.
            targetInput.removeData('original-input-value'); // Clean up stored data.
        });
    });

})(jQuery); // Pass the global jQuery object into the IIFE as $pageContext.