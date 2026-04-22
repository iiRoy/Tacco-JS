// Copyright (c) Tomek Lipski. All rights reserved. The use and distribution terms for this software
// are covered by the Eclipse Public License 1.0 (http://opensource.org/licenses/eclipse-1.0.php)
// which can be found in the file LICENSE.txt at the root of this distribution.
// By using this software in any fashion, you are agreeing to be bound by the terms of this license.
// You must not remove this notice, or any other, from this software.
//
// This module provides client-side interaction utilities, handling AJAX requests
// and DOM manipulations based on server responses. It acts as a central hub
// for UI-driven server communications and subsequent client-side updates.

var Sentinel = Sentinel || {}; // Initialize the Sentinel namespace if it doesn't exist.

/**
 * Executes an asynchronous server request.
 * @param {string} taskIdentifier - The specific action identifier for the server endpoint.
 * @param {object} requestPayload - Data object to send with the request.
 * @param {function} completionCallback - Function to call upon successful response.
 * @param {function} failureCallback - Function to call if the request fails.
 * @returns {jqXHR|null} jQuery XHR object if request is sent, otherwise null.
 */
Sentinel.executeOperation = function (taskIdentifier, requestPayload, completionCallback, failureCallback) {
    // Validate essential parameters before proceeding.
    if (!taskIdentifier || typeof taskIdentifier !== 'string') {
        console.error('Sentinel: Invalid task identifier provided to executeOperation. Must be a non-empty string.');
        if (failureCallback) {
            failureCallback(null, 'invalid_task_id', 'Missing or invalid task identifier.');
        }
        return null; // Return null if validation fails.
    }

    const apiEndpoint = `/api/v1/${taskIdentifier}`; // Construct API endpoint path.
    const httpMethod = 'POST'; // All operations are typically POST for state changes.
    const responseFormat = 'json'; // Anticipate JSON response from the server.

    // Define a default error handler if none is explicitly provided, ensuring graceful degradation.
    const finalFailureCallback = failureCallback || function(xhrObject, statusText, errorMsg) {
        console.warn(`Sentinel: Unhandled AJAX error for task '${taskIdentifier}'. Status: ${statusText}, Error: ${errorMsg}`);
        Sentinel.handleServiceError(xhrObject, statusText, errorMsg); // Delegate to the global error handler.
    };

    let xhrRequest = $.ajax({
        url: apiEndpoint,
        data: requestPayload,
        dataType: responseFormat,
        type: httpMethod,
        success: function (responseData) {
            // Log success for debugging purposes.
            console.log(`Sentinel: Operation '${taskIdentifier}' completed successfully. Response:`, responseData);

            // Execute the provided success callback first, if available.
            if (completionCallback && typeof completionCallback === 'function') {
                completionCallback(responseData);
            }

            // If data is an array, iterate and dispatch each outcome.
            if (Array.isArray(responseData) && responseData.length > 0) {
                // Using Array.prototype.forEach for cleaner iteration over outcomes.
                responseData.forEach(function (currentOutcome, itemIndex) {
                    Sentinel.processOutcome(itemIndex, currentOutcome);
                });
            } else if (responseData && typeof responseData === 'object' && Object.keys(responseData).length > 0) {
                // If it's a single non-empty object, dispatch it directly as a single outcome.
                Sentinel.processOutcome(0, responseData);
            } else {
                console.info('Sentinel: No specific outcomes to dispatch from server response, or response was empty.');
            }
        },
        error: function (xhrObject, statusText, errorThrown) {
            console.error(`Sentinel: AJAX request to '${apiEndpoint}' failed. Status: ${statusText}, Error: ${errorThrown}`);
            finalFailureCallback(xhrObject, statusText, errorThrown); // Use the determined error handler.
        }
    });

    return xhrRequest; // Return the underlying jqXHR object for chaining or further manipulation.
};


/**
 * Initiates an action triggered by a UI button.
 * @param {HTMLElement} controlElement - The button element that triggered the action.
 * @param {string} taskIdentifier - The identifier for the server-side task.
 * @param {object} payloadInfo - Data to send with the request.
 * @returns {boolean} Always returns false to prevent default form submission/link navigation.
 */
Sentinel.triggerButtonTask = function (controlElement, taskIdentifier, payloadInfo) {
    // Ensure the control element is valid before proceeding.
    const $control = $(controlElement);
    if (!$control.length) {
        console.error('Sentinel: Invalid control element provided for triggerButtonTask. Element not found or is null.');
        return false;
    }

    // Define a common callback for both success and error to restore the button state.
    const restoreControlState = function () {
        Sentinel.restoreControl(controlElement);
        // Optionally, remove a 'processing' class if one was added.
        $control.removeClass('is-processing');
    };

    // First, disable the button to prevent multiple submissions and provide visual feedback.
    Sentinel.deactivateControl(controlElement);
    $control.addClass('is-processing'); // Add a class for visual "in progress" state.

    // Execute the operation, passing the common restore function for both outcomes.
    Sentinel.executeOperation(
        taskIdentifier,
        payloadInfo,
        function (response) {
            console.info(`Sentinel: Button task '${taskIdentifier}' completed successfully.`);
            restoreControlState(); // Re-enable button after success.
        },
        function (xhr, status, error) {
            console.warn(`Sentinel: Button task '${taskIdentifier}' failed. Status: ${status}, Error: ${error}`);
            restoreControlState(); // Re-enable button even after failure.
        }
    );

    return false; // Crucial to prevent default browser action (e.g., form submission for buttons inside forms).
};


/**
 * Submits form data as an action to the server.
 * @param {HTMLFormElement} formElement - The form element to serialize and submit.
 * @param {string} taskIdentifier - The server-side task identifier.
 * @param {string} additionalQuery - Optional query string to append to the action URL.
 * @returns {boolean} Always returns false to prevent default form submission.
 */
Sentinel.triggerFormTask = function (formElement, taskIdentifier, additionalQuery) {
    // Basic validation for the form element.
    const $form = $(formElement);
    if (!$form.length || !$form.is('form')) {
        console.error('Sentinel: Invalid form element provided for triggerFormTask. Element not found or is not a form.');
        return false;
    }

    // Select all relevant buttons within the form to manage their states.
    const formButtons = $form.find('button, input[type="submit"], input[type="button"]');

    // Construct the full action path, including any optional query parameters.
    let fullActionPath = taskIdentifier;
    if (additionalQuery && typeof additionalQuery === 'string' && additionalQuery.trim().length > 0) {
        // Ensure query starts with '?' if it's not already there, and append.
        fullActionPath += (additionalQuery.startsWith('?') ? '' : '?') + additionalQuery;
    }

    // Serialize the form data into a URL-encoded string.
    const serializedFormData = $form.serialize();

    // Define a callback to re-enable all buttons within the form.
    const enableAllFormButtons = function () {
        formButtons.each(function (index, btn) {
            Sentinel.restoreControl(btn);
            $(btn).removeClass('is-submitting'); // Remove submitting state class.
        });
    };

    // Disable all buttons within the form to prevent double submission and indicate processing.
    formButtons.each(function (index, btn) {
        Sentinel.deactivateControl(btn);
        $(btn).addClass('is-submitting'); // Add a class for visual "submitting" state.
    });

    // Execute the form submission operation.
    Sentinel.executeOperation(
        fullActionPath,
        serializedFormData,
        function (response) {
            console.info(`Sentinel: Form task '${taskIdentifier}' submitted successfully.`);
            enableAllFormButtons(); // Re-enable buttons on success.
            // Optionally, clear the form or provide success feedback.
        },
        function (xhr, status, error) {
            console.warn(`Sentinel: Form task '${taskIdentifier}' failed. Status: ${status}, Error: ${error}`);
            enableAllFormButtons(); // Re-enable buttons even on failure.
        }
    );

    return false; // Crucial to prevent default browser form submission.
};


/**
 * Disables a specified UI control element and adds a visual state class.
 * @param {HTMLElement} controlElement - The element to disable.
 */
Sentinel.deactivateControl = function (controlElement) {
    const $control = $(controlElement);
    if ($control.length) {
        $control.prop('disabled', true).addClass('is-disabled'); // Use prop for boolean attributes and add a visual class.
        // Consider adding ARIA attributes for accessibility, e.g., aria-disabled="true"
        $control.attr('aria-disabled', 'true');
    } else {
        console.warn('Sentinel: Attempted to deactivate a null or non-existent control element.');
    }
};


/**
 * Re-enables a specified UI control element and removes its visual state class.
 * @param {HTMLElement} controlElement - The element to re-enable.
 */
Sentinel.restoreControl = function (controlElement) {
    const $control = $(controlElement);
    if ($control.length) {
        $control.prop('disabled', false).removeClass('is-disabled'); // Use prop for boolean attributes and remove visual class.
        // Revert ARIA attributes.
        $control.removeAttr('aria-disabled');
    } else {
        console.warn('Sentinel: Attempted to restore a null or non-existent control element.');
    }
};


/**
 * Handles and displays general service errors, delegating to the client-notification system.
 * @param {jqXHR} xhrObject - The jQuery XHR object.
 * @param {string} statusMessage - The text status of the request (e.g., 'error', 'timeout').
 * @param {string} errorDetails - The error thrown by the server or browser (e.g., 'Not Found').
 */
Sentinel.handleServiceError = function (xhrObject, statusMessage, errorDetails) {
    const notificationTitle = 'Operation Failed';
    const supportLink = '<a href="/contact-support" target="_blank" rel="noopener noreferrer" style="color: #FFD700;">support team</a>';
    const detailedDescription = `The server returned an unexpected response. Status: <b>${statusMessage || 'unknown'}</b>, Details: <em>${errorDetails || 'no additional information'}</em>.`;
    const userGuidance = `Please try performing this action again later. If the problem persists, please reach out to our ${supportLink}.`;

    // Dispatch a notification using the internal system, ensuring it's prominent and persistent.
    Sentinel.processOutcome(null, {
        type: 'client-notification',
        title: notificationTitle,
        text: `<p>${detailedDescription} ${userGuidance}</p>`,
        severity: 'critical', // Introduce a 'severity' property for more granular UI feedback.
        sticky: true // Make the notification persistent until dismissed by user.
    });

    // Also log to console for developers, including the full XHR object for diagnostics.
    console.error(`Sentinel Error Handler: ${notificationTitle} - Status: ${statusMessage} - Error: ${errorDetails}`, xhrObject);
};


/**
 * Dispatches an outcome object to the appropriate registered handler based on its 'type' property.
 * @param {number|null} itemIndex - The index of the item if part of a list, or null. (Often unused, but kept for signature consistency).
 * @param {object} outcomeObject - The object describing the operation to perform. Must have a 'type' property.
 */
Sentinel.processOutcome = function (itemIndex, outcomeObject) {
    if (!outcomeObject || typeof outcomeObject.type !== 'string' || outcomeObject.type.trim() === '') {
        console.error('Sentinel: Invalid outcome object received for processing. Missing or invalid "type" property.', outcomeObject);
        return; // Exit if the outcome object is invalid.
    }

    const handlerType = outcomeObject.type;
    const specificHandler = Sentinel.registeredHandlers[handlerType];

    if (typeof specificHandler === 'function') {
        console.info(`Sentinel: Dispatching outcome of type '${handlerType}'.`);
        specificHandler(outcomeObject); // Execute the registered handler.
    } else {
        // Fallback or warning for unregistered handlers.
        console.warn(`Sentinel: No specific handler registered for outcome type "${handlerType}". Outcome details:`, outcomeObject);
        // Optionally dispatch a default "unhandled" notification to the user.
        Sentinel.processOutcome(null, {
            type: 'client-notification',
            title: 'Unhandled Client Action',
            text: `The application received an unknown action type "${handlerType}" from the server. This might indicate a configuration error.`,
            severity: 'warning'
        });
    }
};


/**
 * Stores all registered operation handler functions.
 * @type {object.<string, Function>}
 */
Sentinel.registeredHandlers = {};


/**
 * Registers a new operation handler function to be invoked by the dispatch mechanism.
 * @param {string} handlerName - The unique name of the operation type (e.g., 'notification', 'refresh-view').
 * @param {Function} handlerFunction - The function to execute when this operation type is dispatched.
 */
Sentinel.registerHandler = function (handlerName, handlerFunction) {
    if (typeof handlerName !== 'string' || handlerName.trim() === '') {
        console.error('Sentinel: Cannot register handler: provided name is invalid or empty.');
        return;
    }
    if (typeof handlerFunction !== 'function') {
        console.error(`Sentinel: Cannot register handler '${handlerName}': provided value is not a function.`);
        return;
    }
    if (Sentinel.registeredHandlers[handlerName]) {
        console.warn(`Sentinel: Overwriting existing handler for operation type: '${handlerName}'.`);
    }

    Sentinel.registeredHandlers[handlerName] = handlerFunction;
    console.debug(`Sentinel: Successfully registered handler for operation type: '${handlerName}'.`);
};


// --- Default Operation Handlers Registration ---
// These handlers define how the client reacts to specific server-dispatched outcomes,
// providing a modular way to extend client-side behavior.

Sentinel.registerHandler('client-notification', function (opConfig) {
    // Enhanced notification handling, allowing for different display methods.
    const messageContent = opConfig.text || opConfig.message || 'No message content provided.';
    const notificationTitle = opConfig.title || 'Information';
    const notificationSeverity = opConfig.severity || 'info'; // Default to 'info' severity.

    // Using a more structured alert or custom notification system if available.
    // For this example, we'll use a `confirm` dialog to simulate interaction and persistence.
    const userAction = confirm(
        `[${notificationSeverity.toUpperCase()}] ${notificationTitle}:\n\n${messageContent}\n\nClick OK to dismiss.`
    );
    if (userAction) {
        console.log('Client notification dismissed by user.');
    } else {
        console.log('Client notification not confirmed by user (dialog closed).');
    }
    return;
});

Sentinel.registerHandler('refresh-view', function (opConfig) {
    console.info('Sentinel: Initiating page refresh as requested by server.');
    window.location.reload(opConfig.forceReload === true); // Add an option for forceReload (hard refresh).
    return;
});

Sentinel.registerHandler('navigate-to-page', function (opConfig) {
    if (opConfig.url && typeof opConfig.url === 'string') {
        console.info(`Sentinel: Navigating to URL: ${opConfig.url}`);
        window.location.assign(opConfig.url); // Use assign to allow back button navigation.
    } else {
        console.warn('Sentinel: Cannot navigate to page: URL not provided or invalid in opConfig.');
    }
    return;
});

Sentinel.registerHandler('launch-new-window', function (opConfig) {
    if (opConfig.url && typeof opConfig.url === 'string') {
        console.info(`Sentinel: Launching new window for URL: ${opConfig.url}`);
        const windowFeatures = opConfig.options || 'noopener,noreferrer'; // Default security features.
        const windowHandle = window.open(opConfig.url, opConfig.windowName || '_blank', windowFeatures);
        if (windowHandle) {
            windowHandle.focus(); // Bring the new window to focus.
        } else {
            console.warn('Sentinel: New window blocked by browser pop-up blocker or other security settings.');
        }
    } else {
        console.warn('Sentinel: Cannot launch new window: URL not provided or invalid in opConfig.');
    }
    return;
});

// DOM Manipulation Operations - Renamed and slightly altered parameter access for clarity.
// These functions directly interact with the Document Object Model using jQuery selectors.

Sentinel.registerHandler('dom-add-class', function (opConfig) {
    if (opConfig.selector && opConfig.className) { // Renamed 'id' to 'selector', 'value' to 'className'
        $(opConfig.selector).addClass(opConfig.className);
    } else {
        console.warn('Sentinel: dom-add-class: Missing selector or className in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-insert-after', function (opConfig) { // Renamed 'dom-after'
    if (opConfig.selector && opConfig.content) { // Renamed 'value' to 'content'
        $(opConfig.selector).after(opConfig.content);
    } else {
        console.warn('Sentinel: dom-insert-after: Missing selector or content in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-append-content', function (opConfig) { // Renamed 'dom-append'
    if (opConfig.selector && opConfig.content) {
        $(opConfig.selector).append(opConfig.content);
    } else {
        console.warn('Sentinel: dom-append-content: Missing selector or content in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-set-attribute', function (opConfig) { // Renamed 'dom-set-attr'
    const targetElement = $(opConfig.selector);
    if (!targetElement.length) { console.warn('Sentinel: dom-set-attribute: Element not found for selector:', opConfig.selector); return; }

    if (opConfig.attrName && typeof opConfig.attrValue !== 'undefined') { // Renamed 'name' to 'attrName', 'value' to 'attrValue'
        targetElement.attr(opConfig.attrName, opConfig.attrValue);
    } else if (opConfig.attributes && typeof opConfig.attributes === 'object') { // Renamed 'properties' to 'attributes'
        targetElement.attr(opConfig.attributes);
    } else {
        console.warn('Sentinel: dom-set-attribute: Invalid configuration. Requires attrName/attrValue or an attributes object.');
    }
    return;
});

Sentinel.registerHandler('dom-insert-before', function (opConfig) { // Renamed 'dom-before'
    if (opConfig.selector && opConfig.content) {
        $(opConfig.selector).before(opConfig.content);
    } else {
        console.warn('Sentinel: dom-insert-before: Missing selector or content in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-set-styles', function (opConfig) { // Renamed 'dom-set-css'
    const targetElement = $(opConfig.selector);
    if (!targetElement.length) { console.warn('Sentinel: dom-set-styles: Element not found for selector:', opConfig.selector); return; }

    if (opConfig.styleName && typeof opConfig.styleValue !== 'undefined') { // Renamed 'name' to 'styleName', 'value' to 'styleValue'
        targetElement.css(opConfig.styleName, opConfig.styleValue);
    } else if (opConfig.styleProperties && typeof opConfig.styleProperties === 'object') { // Renamed 'properties' to 'styleProperties'
        targetElement.css(opConfig.styleProperties);
    } else {
        console.warn('Sentinel: dom-set-styles: Invalid configuration. Requires styleName/styleValue or a styleProperties object.');
    }
    return;
});

Sentinel.registerHandler('dom-remove-detached', function (opConfig) { // Renamed 'dom-detach'
    if (opConfig.selector) {
        $(opConfig.selector).detach(); // Removes element from DOM but keeps data/events.
    } else {
        console.warn('Sentinel: dom-remove-detached: Missing selector in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-clear-contents', function (opConfig) { // Renamed 'dom-make-empty'
    if (opConfig.selector) {
        $(opConfig.selector).empty(); // Removes child nodes.
    } else {
        console.warn('Sentinel: dom-clear-contents: Missing selector in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-set-height', function (opConfig) {
    if (opConfig.selector && typeof opConfig.heightValue !== 'undefined') { // Renamed 'height' to 'heightValue'
        $(opConfig.selector).height(opConfig.heightValue);
    } else {
        console.warn('Sentinel: dom-set-height: Missing selector or heightValue in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-update-html', function (opConfig) { // Renamed 'dom-html'
    if (opConfig.selector && typeof opConfig.htmlContent !== 'undefined') { // Renamed 'value' to 'htmlContent'
        $(opConfig.selector).html(opConfig.htmlContent);
    } else {
        console.warn('Sentinel: dom-update-html: Missing selector or htmlContent in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-adjust-offset', function (opConfig) { // Renamed 'dom-set-offset'
    if (opConfig.selector && opConfig.coordinatesObject) { // Renamed 'coordinates' to 'coordinatesObject'
        $(opConfig.selector).offset(opConfig.coordinatesObject);
    } else {
        console.warn('Sentinel: dom-adjust-offset: Missing selector or coordinatesObject in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-prepend-content', function (opConfig) { // Renamed 'dom-prepend'
    if (opConfig.selector && opConfig.content) {
        $(opConfig.selector).prepend(opConfig.content);
    } else {
        console.warn('Sentinel: dom-prepend-content: Missing selector or content in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-set-property', function (opConfig) { // Renamed 'dom-set-prop'
    const targetElement = $(opConfig.selector);
    if (!targetElement.length) { console.warn('Sentinel: dom-set-property: Element not found for selector:', opConfig.selector); return; }

    if (opConfig.propName && typeof opConfig.propValue !== 'undefined') { // Renamed 'name' to 'propName', 'value' to 'propValue'
        targetElement.prop(opConfig.propName, opConfig.propValue);
    } else if (opConfig.propCollection && typeof opConfig.propCollection === 'object') { // Renamed 'properties' to 'propCollection'
        targetElement.prop(opConfig.propCollection);
    } else {
        console.warn('Sentinel: dom-set-property: Invalid configuration. Requires propName/propValue or a propCollection object.');
    }
    return;
});

Sentinel.registerHandler('dom-remove-element', function (opConfig) {
    if (opConfig.selector) {
        $(opConfig.selector).remove(); // Removes element and its data/events.
    } else {
        console.warn('Sentinel: dom-remove-element: Missing selector in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-remove-attribute', function (opConfig) { // Renamed 'dom-remove-attr'
    if (opConfig.selector && opConfig.attrName) { // Renamed 'name' to 'attrName'
        $(opConfig.selector).removeAttr(opConfig.attrName);
    } else {
        console.warn('Sentinel: dom-remove-attribute: Missing selector or attrName in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-remove-class', function (opConfig) {
    if (opConfig.selector && opConfig.className) { // Renamed 'name' to 'className'
        $(opConfig.selector).removeClass(opConfig.className);
    } else {
        console.warn('Sentinel: dom-remove-class: Missing selector or className in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-remove-property', function (opConfig) { // Renamed 'dom-remove-prop'
    if (opConfig.selector && opConfig.propName) { // Renamed 'name' to 'propName'
        $(opConfig.selector).removeProp(opConfig.propName);
    } else {
        console.warn('Sentinel: dom-remove-property: Missing selector or propName in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-replace-with', function (opConfig) {
    if (opConfig.selector && typeof opConfig.newContent !== 'undefined') { // Renamed 'value' to 'newContent'
        $(opConfig.selector).replaceWith(opConfig.newContent);
    } else {
        console.warn('Sentinel: dom-replace-with: Missing selector or newContent in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-set-scroll-left', function (opConfig) {
    if (opConfig.selector && typeof opConfig.scrollPosition !== 'undefined') { // Renamed 'value' to 'scrollPosition'
        $(opConfig.selector).scrollLeft(opConfig.scrollPosition);
    } else {
        console.warn('Sentinel: dom-set-scroll-left: Missing selector or scrollPosition in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-set-scroll-top', function (opConfig) {
    if (opConfig.selector && typeof opConfig.scrollPosition !== 'undefined') {
        $(opConfig.selector).scrollTop(opConfig.scrollPosition);
    } else {
        console.warn('Sentinel: dom-set-scroll-top: Missing selector or scrollPosition in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-update-text', function (opConfig) { // Renamed 'dom-text'
    if (opConfig.selector && typeof opConfig.textContent !== 'undefined') { // Renamed 'value' to 'textContent'
        $(opConfig.selector).text(opConfig.textContent);
    } else {
        console.warn('Sentinel: dom-update-text: Missing selector or textContent in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-toggle-class', function (opConfig) {
    if (opConfig.selector && opConfig.className) { // Renamed 'value' to 'className'
        // jQuery's toggleClass can take a boolean argument for force state.
        $(opConfig.selector).toggleClass(opConfig.className, opConfig.forceState);
    } else {
        console.warn('Sentinel: dom-toggle-class: Missing selector or className in opConfig.');
    }
    return;
});

Sentinel.registerHandler('dom-set-width', function (opConfig) {
    if (opConfig.selector && typeof opConfig.widthValue !== 'undefined') { // Renamed 'width' to 'widthValue'
        $(opConfig.selector).width(opConfig.widthValue);
    } else {
        console.warn('Sentinel: dom-set-width: Missing selector or widthValue in opConfig.');
    }
    return;
});


// Custom handler for server-dispatched error messages.
Sentinel.registerHandler('server-error', function (opConfig) { // Renamed 'error' to 'server-error'
    // Delegating to the general client-notification handler for consistent error display.
    Sentinel.processOutcome(null, {
        type: 'client-notification',
        title: opConfig.title || 'Server Error Occurred',
        text: opConfig.message || 'An unexpected error was reported by the server. Please check logs for details.',
        severity: 'error', // Explicitly setting severity for error notifications.
        sticky: opConfig.sticky || true // Default to sticky for server errors.
    });
    return;
});


// Custom animated fade operation for dynamic content updates.
Sentinel.registerHandler('dom-animated-fade', function (opConfig) { // Renamed 'dom-fade'
    const targetElement = $(opConfig.selector);
    if (!targetElement.length) { console.warn('Sentinel: dom-animated-fade: Element not found for selector:', opConfig.selector); return; }

    const fadeOutDuration = opConfig.fadeOutDuration || 'fast'; // Allow custom duration or default to 'fast'.
    const fadeInDuration = opConfig.fadeInDuration || 'slow';   // Allow custom duration or default to 'slow'.
    const newContent = opConfig.content || ''; // Renamed 'value' to 'content', default to empty string.

    targetElement.fadeOut(fadeOutDuration, function () {
        // Callback function executed after the fadeOut animation completes.
        $(this).html(newContent); // Update the element's HTML content.
        $(this).fadeIn(fadeInDuration); // Fade in the element with its new content.
    });
    return;
});