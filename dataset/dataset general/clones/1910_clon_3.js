(function(jq) {
"use strict";

// This module assists in asynchronous form submissions.
// It supports traditional AJAX, FormData-based XHR2 uploads, and iframe-based file uploads.
// Version: 1.0.0 (October 2023)
// Licensed under the MIT and GPL licenses.
// For more details, refer to project documentation.

// Ensure jQuery is available
if (typeof jq === 'undefined') {
    console.error("Dependency Error: jQuery (or compatible library) not found.");
    return;
}

// Global browser capability flags
const featureDetection = {};
featureDetection.supportsFileAPI = (function() {
    try {
        return jq("<input type='file'/>").get(0).files !== undefined;
    } catch (e) {
        return false;
    }
})();
featureDetection.supportsFormData = typeof window.FormData !== 'undefined';

/**
 * Initiates an AJAX submission for the selected form element(s).
 *
 * @param {object|function} submitConfiguration - Configuration object or a success callback function.
 * @returns {jQuery} The jQuery object for chaining.
 */
jq.fn.sendFormAsync = function(submitConfiguration) {

    // Abort early if no elements are selected to prevent errors.
    if (!this.length) {
        console.warn('sendFormAsync: No form element(s) selected; process skipped.');
        return this;
    }

    let currentForm = this;
    let requestMethod, formActionURL, targetURL;

    // Normalize input: if a function is passed, assume it's the success callback.
    if (typeof submitConfiguration === 'function') {
        submitConfiguration = { successCallback: submitConfiguration };
    } else if (typeof submitConfiguration !== 'object') {
        submitConfiguration = {}; // Default to empty object if invalid
    }

    // Retrieve form attributes.
    requestMethod = currentForm.attr('method');
    formActionURL = currentForm.attr('action');
    targetURL = (typeof formActionURL === 'string') ? jq.trim(formActionURL) : '';
    targetURL = targetURL || window.location.href || '';

    // Clean up URL: remove hash fragment if present.
    if (targetURL) {
        let urlParts = targetURL.match(/^([^#]+)/);
        if (urlParts && urlParts.length > 1) {
            targetURL = urlParts[1];
        }
    }

    // Establish default submission options and merge with provided configuration.
    let mergedOptions = jq.extend(true, {
        remoteURL:  targetURL,
        onSuccess: jq.ajaxSettings.success,
        requestType: requestMethod || 'GET',
        iframeSource: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
        // Default error handler
        onError: function(xhr, status, error) {
            console.error("AJAX submission failed:", status, error, xhr);
        }
    }, submitConfiguration);

    // Allow external manipulation of form data before serialization.
    let preSerializationVeto = { preventSubmission: false };
    currentForm.trigger('form:pre-serialize-hook', [currentForm, mergedOptions, preSerializationVeto]);
    if (preSerializationVeto.preventSubmission) {
        console.info('sendFormAsync: Submission prevented by form:pre-serialize-hook.');
        return this;
    }

    // Provide an opportunity to modify or abort before data serialization.
    if (typeof mergedOptions.beforeSerialization === 'function' &&
        mergedOptions.beforeSerialization(currentForm, mergedOptions) === false) {
        console.info('sendFormAsync: Submission aborted by beforeSerialization callback.');
        return this;
    }

    let useTraditionalSerialization = mergedOptions.useTraditional || jq.ajaxSettings.traditional;
    
    let serializedElements, additionalQueryParams;
    serializedElements = currentForm.extractFormElements(mergedOptions.useSemanticNames);

    if (mergedOptions.extraPayload) {
        mergedOptions.additionalData = mergedOptions.extraPayload;
        additionalQueryParams = jq.param(mergedOptions.extraPayload, useTraditionalSerialization);
    }

    // Allow pre-submission check and potential abortion.
    if (typeof mergedOptions.beforeSubmission === 'function' &&
        mergedOptions.beforeSubmission(serializedElements, currentForm, mergedOptions) === false) {
        console.info('sendFormAsync: Submission aborted by beforeSubmission callback.');
        return this;
    }

    // Trigger a validation hook.
    let validationVeto = { preventSubmission: false };
    currentForm.trigger('form:submit-validation', [serializedElements, currentForm, mergedOptions, validationVeto]);
    if (validationVeto.preventSubmission) {
        console.info('sendFormAsync: Submission vetoed by form:submit-validation trigger.');
        return this;
    }

    let primaryQueryParams = jq.param(serializedElements, useTraditionalSerialization);
    if (additionalQueryParams) {
        primaryQueryParams = (primaryQueryParams ? (primaryQueryParams + '&' + additionalQueryParams) : additionalQueryParams);
    }

    // Adjust URL and data based on request type.
    if (mergedOptions.requestType.toUpperCase() === 'GET') {
        mergedOptions.remoteURL += (mergedOptions.remoteURL.indexOf('?') >= 0 ? '&' : '?') + primaryQueryParams;
        mergedOptions.data = null; // GET requests carry data in URL.
    } else {
        mergedOptions.data = primaryQueryParams; // POST requests carry data in body.
    }

    // Prepare a queue of post-submission actions.
    let completionActions = [];
    if (mergedOptions.shouldResetForm) {
        completionActions.push(function() { currentForm.resetForm(); });
    }
    if (mergedOptions.shouldClearForm) {
        completionActions.push(function() { currentForm.clearForm(mergedOptions.includeHiddenFields); });
    }

    // Handle target element update if specified and no specific data type.
    if (!mergedOptions.responseDataType && mergedOptions.updateTarget) {
        let originalSuccessHandler = mergedOptions.onSuccess || function(){};
        completionActions.push(function(responseData) {
            let updateMethod = mergedOptions.replaceTargetContent ? 'replaceWith' : 'html';
            jq(mergedOptions.updateTarget)[updateMethod](responseData).each(originalSuccessHandler, arguments);
        });
    } else if (mergedOptions.onSuccess) {
        completionActions.push(mergedOptions.onSuccess);
    }

    // Override the success handler to manage post-submission actions.
    mergedOptions.onSuccess = function(data, statusText, xhrObject) { // xhrObject is 3rd arg in jQuery 1.4+
        let executionContext = mergedOptions.context || mergedOptions;
        for (let idx=0, maxActions=completionActions.length; idx < maxActions; idx++) {
            completionActions[idx].apply(executionContext, [data, statusText, xhrObject || currentForm, currentForm]);
        }
    };

    // Detect file inputs for upload mechanism decision.
    let detectedFileInputs = jq('input:file:enabled[value]', this);
    let hasFilesToUpload = detectedFileInputs.length > 0;
    let formEncType = currentForm.attr('enctype') || currentForm.attr('encoding');
    const MULTIPART_TYPE = 'multipart/form-data';
    let isMultipartForm = (formEncType === MULTIPART_TYPE);

    let canUseModernUpload = featureDetection.supportsFileAPI && featureDetection.supportsFormData;
    console.debug("Modern file upload API available:", canUseModernUpload);
    let forceIframeUpload = (mergedOptions.forceIframeMode !== false && (mergedOptions.forceIframeMode || ((hasFilesToUpload || isMultipartForm) && !canUseModernUpload)));

    // Execute the appropriate submission method.
    if (forceIframeUpload) {
        // Use iframe for older browsers or specific requirements.
        submitViaIframe(serializedElements);
    } else if ((hasFilesToUpload || isMultipartForm) && canUseModernUpload) {
        // Use XMLHttpRequest Level 2 for modern browsers.
        submitViaXhr2(serializedElements);
    } else {
        // Standard AJAX request for non-file submissions.
        jq.ajax(mergedOptions);
    }

    // Notify of submission completion.
    currentForm.trigger('form:submission-notification', [currentForm, mergedOptions]);
    return this;

    /**
     * Handles file uploads using XMLHttpRequest Level 2 (FormData).
     * @param {Array<object>} formElementData - Array of form element name/value pairs.
     */
    function submitViaXhr2(formElementData) {
        let formDataObject = new FormData();

        // Append standard form fields.
        for (let k = 0; k < formElementData.length; k++) {
            formDataObject.append(formElementData[k].name, formElementData[k].value);
        }

        // Append any additional data.
        if (mergedOptions.additionalData) {
            Object.keys(mergedOptions.additionalData).forEach(function(key) {
                formDataObject.append(key, mergedOptions.additionalData[key]);
            });
        }

        // Clear data from mergedOptions as it's now in FormData.
        mergedOptions.data = null;

        // Create a new AJAX settings object for this specific request.
        let xhr2Settings = jq.extend(true, {}, jq.ajaxSettings, mergedOptions, {
            contentType: false, // Prevents jQuery from setting 'Content-Type' header.
            processData: false, // Prevents jQuery from processing the data.
            cache: false,
            type: 'POST' // Always POST for FormData.
        });

        // Implement upload progress tracking if a callback is provided.
        if (mergedOptions.onUploadProgress) {
            xhr2Settings.xhr = function() {
                let xhrInstance = jQuery.ajaxSettings.xhr();
                if (xhrInstance.upload) {
                    xhrInstance.upload.onprogress = function(progressEvent) {
                        let percentCompleted = 0;
                        if (progressEvent.lengthComputable) {
                            percentCompleted = Math.floor((progressEvent.loaded / progressEvent.total) * 100);
                        }
                        mergedOptions.onUploadProgress(progressEvent, progressEvent.loaded, progressEvent.total, percentCompleted);
                    };
                }
                return xhrInstance;
            };
        }

        // Ensure FormData is set in beforeSend, allowing other beforeSend logic to run.
        let originalBeforeSend = xhr2Settings.beforeSend;
        xhr2Settings.beforeSend = function(actualXHR, ajaxOptions) {
            ajaxOptions.data = formDataObject;
            if (originalBeforeSend) {
                originalBeforeSend.call(ajaxOptions, actualXHR, mergedOptions);
            }
        };

        jq.ajax(xhr2Settings);
    }

    /**
     * Handles file uploads using a hidden iframe.
     * @param {Array<object>} formElementData - Array of form element name/value pairs.
     */
    function submitViaIframe(formElementData) {
        let domForm = currentForm[0];
        let elementRef, idx;
        let supportsProp = !!jq.fn.prop;

        // Ensure all serialized inputs are enabled before submission.
        if (formElementData) {
            for (idx = 0; idx < formElementData.length; idx++) {
                elementRef = jq(domForm[formElementData[idx].name]);
                if (supportsProp) {
                    elementRef.prop('disabled', false);
                } else {
                    elementRef.removeAttr('disabled');
                }
            }
        }

        // Critical validation: prevent conflicts with 'submit' named elements.
        if (jq(':input[name=submit],:input[id=submit]', domForm).length) {
            alert('Form processing error: Elements must not be named or IDed "submit".');
            return;
        }
        
        let iframeSettings = jq.extend(true, {}, jq.ajaxSettings, mergedOptions);
        iframeSettings.context = iframeSettings.context || iframeSettings;
        let iframeId = 'formHelperFrame' + (new Date().getTime());
        let iframeElement, iframeDom;

        if (iframeSettings.iframeTarget) {
            iframeElement = jq(iframeSettings.iframeTarget);
            let existingName = iframeElement.attr('name');
            if (!existingName) {
                 iframeElement.attr('name', iframeId);
            } else {
                iframeId = existingName;
            }
        } else {
            iframeElement = jq('<iframe name="' + iframeId + '" src="'+ iframeSettings.iframeSource +'" />');
            iframeElement.css({ position: 'absolute', top: '-1000px', left: '-1000px', width: '0', height: '0' });
        }
        iframeDom = iframeElement[0];

        let mockXHR = { // A mock XHR object for consistency with $.ajax callbacks.
            isAborted: false,
            responseText: null,
            responseXML: null,
            statusCode: 0,
            statusText: 'n/a',
            getAllResponseHeaders: function() { return ''; }, // Dummy method
            getResponseHeader: function(header) { return null; }, // Dummy method
            setRequestHeader: function(header, value) {}, // Dummy method
            abortRequest: function(terminationStatus) {
                let abortReason = (terminationStatus === 'timeout' ? 'timeout' : 'aborted');
                console.warn('Aborting iframe upload: ' + abortReason);
                this.isAborted = true;
                iframeElement.attr('src', iframeSettings.iframeSource); // Reset iframe to stop current operation
                mockXHR.error = abortReason;
                if (iframeSettings.onError) {
                    iframeSettings.onError.call(iframeSettings.context, mockXHR, abortReason, terminationStatus);
                }
                if (globalEventsEnabled) {
                    jq.event.trigger("ajaxError", [mockXHR, iframeSettings, abortReason]);
                }
                if (iframeSettings.onComplete) {
                    iframeSettings.onComplete.call(iframeSettings.context, mockXHR, abortReason);
                }
            }
        };

        let globalEventsEnabled = iframeSettings.global;
        // Trigger global AJAX events.
        if (globalEventsEnabled && 0 === jq.active++) {
            jq.event.trigger("ajaxStart");
        }
        if (globalEventsEnabled) {
            jq.event.trigger("ajaxSend", [mockXHR, iframeSettings]);
        }

        // Execute beforeSend callback.
        if (typeof iframeSettings.beforeSend === 'function' &&
            iframeSettings.beforeSend.call(iframeSettings.context, mockXHR, iframeSettings) === false) {
            if (globalEventsEnabled) {
                jq.active--; // Decrement active count if aborted.
            }
            return;
        }
        if (mockXHR.isAborted) {
            return;
        }

        // Add data from the submitting element, if any (e.g., button clicked).
        let submittingElement = domForm.clk; // 'clk' is a non-standard property set by the plugin
        if (submittingElement) {
            let elementName = submittingElement.name;
            if (elementName && !submittingElement.disabled) {
                iframeSettings.additionalData = iframeSettings.additionalData || {};
                iframeSettings.additionalData[elementName] = submittingElement.value;
                if (submittingElement.type === "image") {
                    iframeSettings.additionalData[elementName+'.x'] = domForm.clk_x;
                    iframeSettings.additionalData[elementName+'.y'] = domForm.clk_y;
                }
            }
        }
        
        const TIMEOUT_CLIENT_ABORT = 1;
        const TIMEOUT_SERVER_ABORT = 2;

        /**
         * Safely retrieves the document object from an iframe.
         * @param {HTMLIFrameElement} frame - The iframe element.
         * @returns {Document} The iframe's document object.
         */
        function retrieveIframeDocument(frame) {
            return frame.contentWindow ? frame.contentWindow.document : frame.contentDocument ? frame.contentDocument : frame.document;
        }
        
        // Handle CSRF tokens for Rails compatibility.
        let csrfToken = jq('meta[name=csrf-token]').attr('content');
        let csrfParam = jq('meta[name=csrf-param]').attr('content');
        if (csrfParam && csrfToken) {
            iframeSettings.additionalData = iframeSettings.additionalData || {};
            iframeSettings.additionalData[csrfParam] = csrfToken;
        }

        let timeoutTimerHandle;
        let isTimedOut = false;

        // Defer form submission to allow DOM updates to render.
        function executeFormSubmission() {
            let originalTarget = currentForm.attr('target');
            let originalAction = currentForm.attr('action');

            // Update form attributes for iframe submission.
            domForm.setAttribute('target', iframeId);
            if (!requestMethod) {
                domForm.setAttribute('method', 'POST'); // Default to POST for iframe uploads.
            }
            if (originalAction !== iframeSettings.remoteURL) {
                domForm.setAttribute('action', iframeSettings.remoteURL);
            }

            // Set encoding type for file uploads, unless explicitly skipped.
            if (!iframeSettings.skipEncodingOverride && (!requestMethod || /post/i.test(requestMethod))) {
                currentForm.attr({
                    encoding: MULTIPART_TYPE,
                    enctype:  MULTIPART_TYPE
                });
            }

            // Set up submission timeout.
            if (iframeSettings.timeout) {
                timeoutTimerHandle = setTimeout(function() {
                    isTimedOut = true;
                    iframeCallbackHandler(TIMEOUT_CLIENT_ABORT);
                }, iframeSettings.timeout);
            }
            
            // Periodically check iframe document state for server-side aborts.
            function monitorIframeState() {
                try {
                    let docState = retrieveIframeDocument(iframeDom).readyState;
                    console.debug('Iframe state = ' + docState);
                    if (docState && docState.toLowerCase() === 'uninitialized') {
                        setTimeout(monitorIframeState, 50);
                    }
                } catch(e) {
                    console.error('Server connection error (iframe): ', e, ' (', e.name, ')');
                    iframeCallbackHandler(TIMEOUT_SERVER_ABORT);
                    if (timeoutTimerHandle) {
                        clearTimeout(timeoutTimerHandle);
                        timeoutTimerHandle = undefined;
                    }
                }
            }

            // Add any extra data as hidden inputs before submission.
            let temporaryInputs = [];
            try {
                if (iframeSettings.additionalData) {
                    Object.keys(iframeSettings.additionalData).forEach(function(key) {
                        temporaryInputs.push(
                            jq('<input type="hidden" name="'+key+'">').attr('value', iframeSettings.additionalData[key])
                                .appendTo(domForm)[0]
                        );
                    });
                }

                if (!iframeSettings.iframeTarget) {
                    // Append iframe to document and attach load listener.
                    iframeElement.appendTo('body');
                    if (iframeDom.attachEvent) { // IE
                        iframeDom.attachEvent('onload', iframeCallbackHandler);
                    } else { // W3C
                        iframeDom.addEventListener('load', iframeCallbackHandler, false);
                    }
                }
                setTimeout(monitorIframeState, 15); // Start monitoring
                domForm.submit(); // Trigger the form submission.
            } finally {
                // Restore original form attributes and remove temporary inputs.
                domForm.setAttribute('action', originalAction);
                if(originalTarget) {
                    domForm.setAttribute('target', originalTarget);
                } else {
                    currentForm.removeAttr('target');
                }
                jq(temporaryInputs).remove();
            }
        }

        // Allow browser to render updates before submission starts.
        if (iframeSettings.forceSynchronous) {
            executeFormSubmission();
        } else {
            setTimeout(executeFormSubmission, 10);
        }

        let iframeResponseDoc, hasCallbackBeenProcessed;

        /**
         * Handles the iframe load event and processes the response.
         * @param {Event|number} eventOrStatus - The load event or a custom status code (e.g., timeout).
         */
        function iframeCallbackHandler(eventOrStatus) {
            if (mockXHR.isAborted || hasCallbackBeenProcessed) {
                return;
            }
            try {
                iframeResponseDoc = retrieveIframeDocument(iframeDom);
            } catch(iframeDocError) {
                console.error('Failed to access iframe response document: ', iframeDocError);
                eventOrStatus = TIMEOUT_SERVER_ABORT; // Treat as server abort.
            }

            if (eventOrStatus === TIMEOUT_CLIENT_ABORT && mockXHR) {
                mockXHR.abortRequest('timeout');
                return;
            } else if (eventOrStatus === TIMEOUT_SERVER_ABORT && mockXHR) {
                mockXHR.abortRequest('server abort');
                return;
            }

            // If response not yet received or iframe reset.
            if (!iframeResponseDoc || iframeResponseDoc.location.href === iframeSettings.iframeSource) {
                if (!isTimedOut) {
                    return; // Wait for actual response.
                }
            }
            hasCallbackBeenProcessed = true;

            // Clean up event listeners.
            if (iframeDom.detachEvent) {
                iframeDom.detachEvent('onload', iframeCallbackHandler);
            } else {    
                iframeDom.removeEventListener('load', iframeCallbackHandler, false);
            }

            let responseStatus = 'success', errorMessage;
            try {
                if (isTimedOut) {
                    throw 'timeout';
                }

                let isResponseXML = iframeSettings.responseDataType === 'xml' || iframeResponseDoc.XMLDocument || jq.isXMLDoc(iframeResponseDoc);
                console.debug('Is iframe response XML? ' + isResponseXML);

                // ... (Original code truncated here. Assuming the rest of the iframe response parsing and callback execution logic.)
                // To complete this part:
                // 1. Extract response data (text/XML) from iframeResponseDoc.
                // 2. Set mockXHR.responseText and mockXHR.responseXML.
                // 3. Determine success/error based on response content and options.
                // 4. Call iframeSettings.onSuccess or iframeSettings.onError.
                // 5. Trigger global ajaxComplete/ajaxStop events.
                // 6. Finally, remove the iframe element.

                // For the purpose of Type III cloning, I will provide a simplified completion here
                // as the original code was cut off.
                let responseContent;
                if (isResponseXML) {
                    responseContent = iframeResponseDoc.XMLDocument || iframeResponseDoc;
                } else {
                    responseContent = iframeResponseDoc.body ? iframeResponseDoc.body.innerText : iframeResponseDoc.documentElement.innerText;
                }

                mockXHR.responseText = responseContent;
                mockXHR.responseXML = isResponseXML ? responseContent : null;
                mockXHR.statusCode = 200; // Assume success for now without actual status parsing from iframe

                iframeSettings.onSuccess.call(iframeSettings.context, responseContent, responseStatus, mockXHR);

            } catch (responseProcessingError) {
                responseStatus = 'error';
                errorMessage = responseProcessingError;
                console.error('Error processing iframe response:', errorMessage);
                mockXHR.statusCode = 500; // Indicate an error
                mockXHR.error = errorMessage;
                iframeSettings.onError.call(iframeSettings.context, mockXHR, responseStatus, errorMessage);
            } finally {
                // Final global event triggers
                if (globalEventsEnabled) {
                    jq.event.trigger("ajaxComplete", [mockXHR, iframeSettings]);
                }
                if (globalEventsEnabled && !(--jq.active)) {
                    jq.event.trigger("ajaxStop");
                }
                if (iframeSettings.onComplete) {
                    iframeSettings.onComplete.call(iframeSettings.context, mockXHR, responseStatus);
                }
                // Clean up iframe
                iframeElement.remove();
                clearTimeout(timeoutTimerHandle);
            }
        }
    }
};

// Helper function to extract form elements.
// This is derived from the original formToArray logic.
jq.fn.extractFormElements = function(useSemanticNames) {
    let elements = this.serializeArray();
    if (useSemanticNames) {
        // Semantic mode might involve more complex logic,
        // but for a Type III clone, we can represent it simply as an alternative path.
        // In reality, this would involve processing elements differently,
        // e.g., handling specific input types or structures.
        console.warn("Semantic name extraction mode is not fully implemented in this clone; using standard serialization.");
    }
    // Add any disabled elements that need to be included.
    jq('input:disabled[data-include="true"]', this).each(function() {
        elements.push({ name: this.name, value: jq(this).val() });
    });
    return elements;
};

// Helper function to reset a form.
// Derived from original resetForm.
jq.fn.resetForm = function() {
    return this.each(function() {
        if (typeof this.reset === 'function' || (typeof this.reset === 'object' && !this.reset.nodeType)) {
            this.reset();
        }
    });
};

// Helper function to clear form input values.
// Derived from original clearForm.
jq.fn.clearForm = function(includeHidden) {
    return this.each(function() {
        jq('input,select,textarea', this).each(function() {
            let elementType = this.type, tagName = this.tagName.toLowerCase();
            if (elementType === 'text' || elementType === 'password' || tagName === 'textarea') {
                this.value = '';
            } else if (elementType === 'checkbox' || elementType === 'radio') {
                this.checked = false;
            } else if (tagName === 'select') {
                this.selectedIndex = -1;
            } else if (includeHidden && elementType === 'hidden') {
                this.value = '';
            }
        });
    });
};

})(jQuery);