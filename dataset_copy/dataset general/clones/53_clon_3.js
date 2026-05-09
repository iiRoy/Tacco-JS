/*
 * Form Submission Utility
 * Version: 1.1.0 (2024-03-15)
 * Requires jqCore v1.6.0 or newer
 *
 * This module facilitates asynchronous HTML form submissions.
 * It supports both modern XMLHttpRequest Level 2 (FormData) and
 * traditional iframe-based file uploads for older browsers or specific scenarios.
 *
 * Documentation and further details are available in the project's repository.
 * Licensed under the Apache 2.0 License.
 */
/* global ActiveXObject, alert, console */
;(function(jqCore) {
"use strict";

/**
 * Internal logging utility.
 * Can be enhanced for more sophisticated debugging or error reporting.
 * @param {string} message - The message to log.
 * @param {...any} optionalParams - Additional parameters to log.
 */
const consoleLogger = (message, ...optionalParams) => {
    if (typeof console !== 'undefined' && console.log) {
        console.log(`[FormUtil] ${message}`, ...optionalParams);
    }
};

/*
    Important Usage Guidance:
    -------------------------
    Avoid using both `sendFormViaAjax` and `manageFormSubmission` on the same form element.
    These methods are designed for distinct use cases and are mutually exclusive.

    Use `sendFormViaAjax` when you intend to manage the form's submission event
    handler yourself. For example, within a document ready block:

    jqCore(document).ready(function() {
        jqCore('#mySubmissionForm').on('submit', function(evt) {
            evt.preventDefault(); // Crucial: Prevents default browser submission
            jqCore(this).sendFormViaAjax({
                targetContainer: '#outputArea'
            });
        });
    });

    Opt for `manageFormSubmission` when you prefer the plugin to handle all
    event binding and delegation automatically. For instance:

    jqCore(document).ready(function() {
        jqCore('#mySubmissionForm').manageFormSubmission({
            targetContainer: '#outputArea'
        });
    });

    For dynamic forms or components loaded asynchronously, `manageFormSubmission`
    also supports delegation (requires jqCore v1.7+):

    jqCore('#mySubmissionForm').manageFormSubmission({
        enableDelegation: true,
        targetContainer: '#outputArea'
    });

    When `manageFormSubmission` is employed, the `sendFormViaAjax` function will be
    automatically invoked by the plugin at the appropriate time during submission.
*/

/**
 * Runtime capability checks for modern browser features.
 */
const capabilityCheck = {};
capabilityCheck.supportsFileAPI = jqCore("<input type='file'/>").get(0).files !== undefined;
capabilityCheck.supportsFormData = window.FormData !== undefined;

/**
 * Initiates an asynchronous submission of an HTML form.
 * This method is added to the jqCore prototype, allowing it to be called
 * directly on a jqCore-wrapped form element.
 *
 * @param {object|function} submissionConfig - Configuration options or a success callback function.
 * @returns {jqCore} The current jqCore object for chaining.
 */
jqCore.fn.sendFormViaAjax = function(submissionConfig) {
    /* jshint scripturl:true */ // Allows 'javascript:false' in iframe src

    // Early exit if no elements are selected, preventing unnecessary processing.
    if (!this.length) {
        consoleLogger('sendFormViaAjax: Skipping submission - no form element selected.');
        return this;
    }

    let httpMethod, formAction, targetURL;
    const currentFormElement = this;

    // Normalize submissionConfig if a function is passed (assumed to be success handler).
    if (typeof submissionConfig === 'function') {
        submissionConfig = { successHandler: submissionConfig };
    }

    httpMethod = currentFormElement.attr('method');
    formAction = currentFormElement.attr('action');
    targetURL = (typeof formAction === 'string') ? jqCore.trim(formAction) : '';
    targetURL = targetURL || window.location.href || '';

    // Clean targetURL: remove hash values if present.
    if (targetURL) {
        const urlMatch = targetURL.match(/^([^#]+)/);
        if (urlMatch && urlMatch[1]) {
            targetURL = urlMatch[1];
        }
    }

    // Establish default configuration and merge with provided options.
    submissionConfig = jqCore.extend(true, {
        url:  targetURL,
        successHandler: jqCore.ajaxSettings.success,
        type: httpMethod || 'GET',
        iframeSource: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
    }, submissionConfig);

    // Allow manipulation of form data before serialization.
    // Trigger a custom event that can be vetoed.
    const abortSignal = {};
    currentFormElement.trigger('form:pre-serialize', [currentFormElement, submissionConfig, abortSignal]);
    if (abortSignal.veto) {
        consoleLogger('sendFormViaAjax: Submission vetoed by form:pre-serialize trigger.');
        return this;
    }

    // Execute `beforeSerialization` callback if provided; abort if it returns false.
    if (submissionConfig.beforeSerialization && submissionConfig.beforeSerialization(currentFormElement, submissionConfig) === false) {
        consoleLogger('sendFormViaAjax: Submission aborted by beforeSerialization callback.');
        return this;
    }

    // Determine traditional serialization mode.
    let legacySerialization = submissionConfig.traditional;
    if (legacySerialization === undefined) {
        legacySerialization = jqCore.ajaxSettings.traditional;
    }

    const formFields = []; // Stores references to form elements for potential cleanup.
    // Convert form elements to an array of name-value pairs.
    const serializedDataArray = currentFormElement.formToArray(submissionConfig.semantic, formFields);
    let extraQueryParams;

    // Handle additional data provided in options.
    if (submissionConfig.additionalData) {
        submissionConfig.extraData = submissionConfig.additionalData; // Aligning internal naming
        extraQueryParams = jqCore.param(submissionConfig.additionalData, legacySerialization);
    }

    // Execute `beforeSubmission` callback; abort if it returns false.
    if (submissionConfig.beforeSubmission && submissionConfig.beforeSubmission(serializedDataArray, currentFormElement, submissionConfig) === false) {
        consoleLogger('sendFormViaAjax: Submission aborted by beforeSubmission callback.');
        return this;
    }

    // Trigger a vetoable 'form:validate' event.
    currentFormElement.trigger('form:submit-validate', [serializedDataArray, currentFormElement, submissionConfig, abortSignal]);
    if (abortSignal.veto) {
        consoleLogger('sendFormViaAjax: Submission vetoed by form:submit-validate trigger.');
        return this;
    }

    // Construct the query string from serialized form data.
    let queryString = jqCore.param(serializedDataArray, legacySerialization);
    if (extraQueryParams) {
        queryString = queryString ? (`${queryString}&${extraQueryParams}`) : extraQueryParams;
    }

    // Adjust URL and data based on HTTP method.
    if (submissionConfig.type.toUpperCase() === 'GET') {
        submissionConfig.url += (submissionConfig.url.indexOf('?') >= 0 ? '&' : '?') + queryString;
        submissionConfig.data = null; // Data is embedded in URL for GET requests.
    } else {
        submissionConfig.data = queryString; // Data is in payload for POST requests.
    }

    const completionHandlers = [];

    // Add handlers for form reset/clear if requested.
    if (submissionConfig.resetOnSuccess) {
        completionHandlers.push(() => { currentFormElement.resetForm(); });
    }
    if (submissionConfig.clearOnSuccess) {
        completionHandlers.push(() => { currentFormElement.clearForm(submissionConfig.includeHiddenFields); });
    }

    // Handle target container updates if no specific dataType is requested.
    if (!submissionConfig.dataType && submissionConfig.targetContainer) {
        const originalSuccessHandler = submissionConfig.successHandler || function(){};
        completionHandlers.push(function(responseData) {
            const updateMethod = submissionConfig.replaceTargetContent ? 'replaceWith' : 'html';
            jqCore(submissionConfig.targetContainer)[updateMethod](responseData).each(originalSuccessHandler, arguments);
        });
    } else if (submissionConfig.successHandler) {
        completionHandlers.push(submissionConfig.successHandler);
    }

    // Wrap the success handler to execute all registered completion handlers.
    submissionConfig.success = function(data, status, xhr) {
        const executionContext = submissionConfig.context || this;
        for (let idx = 0; idx < completionHandlers.length; idx++) {
            completionHandlers[idx].apply(executionContext, [data, status, xhr || currentFormElement, currentFormElement]);
        }
    };

    // Detect file inputs and determine upload mechanism.
    const uploadableFiles = jqCore('input:file:enabled[value]', this);
    const containsFileUploads = uploadableFiles.length > 0;
    const multiPartEncoding = 'multipart/form-data';
    const isMultiPartForm = (currentFormElement.attr('enctype') === multiPartEncoding || currentFormElement.attr('encoding') === multiPartEncoding);

    const canUseModernFileAPI = capabilityCheck.supportsFileAPI && capabilityCheck.supportsFormData;
    consoleLogger(`Modern File API support: ${canUseModernFileAPI}`);

    // Determine if iframe fallback is necessary.
    const fallbackToIframe = (containsFileUploads || isMultiPartForm) && !canUseModernFileAPI;

    // Prioritize iframe mode if explicitly requested or if files are present and modern API is unavailable.
    if (submissionConfig.forceIframeUpload !== false && (submissionConfig.forceIframeUpload || fallbackToIframe)) {
        // Handle potential Safari hang (old workaround, might be less relevant now).
        if (submissionConfig.keepAliveUrl) {
            jqCore.get(submissionConfig.keepAliveUrl, () => {
                handleLegacyUpload(serializedDataArray);
            });
        } else {
            handleLegacyUpload(serializedDataArray);
        }
    } else if ((containsFileUploads || isMultiPartForm) && canUseModernFileAPI) {
        handleModernUpload(serializedDataArray);
    } else {
        // Standard AJAX submission.
        jqCore.ajax(submissionConfig);
    }

    // Clear references to form elements to prevent memory leaks.
    for (let k = 0; k < formFields.length; k++) {
        formFields[k] = null;
    }

    // Trigger a final notification event.
    currentFormElement.trigger('form:submit-notify', [this, submissionConfig]);
    return this;

    /**
     * Helper function to parse a URL-encoded string into an object.
     * This is useful for processing `extraData` that might come as a query string.
     * @param {string} paramString - The URL-encoded string.
     * @returns {object} The parsed object.
     */
    function parseParamStringToObject(paramString){
        if (!paramString || typeof paramString !== 'string') {
            return {};
        }
        const parts = paramString.split('&');
        const result = {};
        for (const part of parts) {
            const [key, value] = part.split('=').map(decodeURIComponent);
            if (key) {
                result[key] = value || '';
            }
        }
        return result;
    }

    /**
     * Handles file uploads using XMLHttpRequest Level 2 (FormData API).
     * @param {Array<object>} dataArray - Array of form field objects ({name, value}).
     */
    function handleModernUpload(dataArray) {
        const formDataPayload = new FormData();

        // Append form fields to FormData.
        for (const field of dataArray) {
            formDataPayload.append(field.name, field.value);
        }

        // Append any extra data provided in the submission config.
        if (submissionConfig.extraData) {
            const processedExtraData = typeof submissionConfig.extraData === 'string' ?
                                       parseParamStringToObject(submissionConfig.extraData) :
                                       submissionConfig.extraData;

            for (const prop in processedExtraData) {
                if (Object.prototype.hasOwnProperty.call(processedExtraData, prop)) {
                    formDataPayload.append(prop, processedExtraData[prop]);
                }
            }
        }

        // Ensure data is null for FormData uploads as it's handled by formDataPayload.
        submissionConfig.data = null;

        // Create a clone of ajax settings and merge with submissionConfig.
        const ajaxSettingsClone = jqCore.extend(true, {}, jqCore.ajaxSettings, submissionConfig, {
            contentType: false, // Important for FormData
            processData: false, // Important for FormData
            cache: false,
            type: 'POST' // FormData typically implies POST
        });
        
        // Setup upload progress monitoring if a callback is provided.
        if (submissionConfig.uploadProgress) {
            ajaxSettingsClone.xhr = function() {
                const xmlHttpRequestObject = jqCore.ajaxSettings.xhr();
                if (xmlHttpRequestObject.upload) {
                    xmlHttpRequestObject.upload.onprogress = function(event) {
                        let uploadPercentage = 0;
                        const bytesLoaded = event.loaded || event.position; // event.position is deprecated
                        const totalBytes = event.total;
                        if (event.lengthComputable) {
                            uploadPercentage = Math.ceil((bytesLoaded / totalBytes) * 100);
                        }
                        submissionConfig.uploadProgress(event, bytesLoaded, totalBytes, uploadPercentage);
                    };
                }
                return xmlHttpRequestObject;
            };
        }

        ajaxSettingsClone.data = null; // Re-emphasize data is handled by FormData.
        
        const originalBeforeSend = ajaxSettingsClone.beforeSend;
        ajaxSettingsClone.beforeSend = function(xhr, opts) {
            opts.data = formDataPayload; // Inject FormData into the AJAX options.
            if (originalBeforeSend) {
                originalBeforeSend.call(this, xhr, opts);
            }
        };
        jqCore.ajax(ajaxSettingsClone);
    }

    /**
     * Handles file uploads using a hidden iframe, providing a fallback for older browsers.
     * @param {Array<object>} dataArray - Array of form field objects ({name, value}).
     */
    function handleLegacyUpload(dataArray) {
        const nativeForm = currentFormElement[0];
        let currentField, idx, ajaxSettingsClone, isGlobalEvent, iframeIdentifier,
            iframeElementWrapper, iframeNativeElement, mockXHR, submitButtonInfo, fieldName,
            originalTarget, originalAction, timedOut, timeoutHandle;
        const usePropMethod = !!jqCore.fn.prop;

        // Safety check: Prevent issues if form elements are named 'submit'.
        if (jqCore(':input[name=submit],:input[id=submit]', nativeForm).length) {
            console.error('Form elements must not have the name or ID "submit". This causes cross-browser issues with form.submit().');
            return;
        }
        
        // Ensure that all serialized input fields are enabled before submission.
        if (dataArray) {
            for (idx = 0; idx < formFields.length; idx++) {
                currentField = jqCore(formFields[idx]);
                if (usePropMethod) {
                    currentField.prop('disabled', false);
                } else {
                    currentField.removeAttr('disabled');
                }
            }
        }

        ajaxSettingsClone = jqCore.extend(true, {}, jqCore.ajaxSettings, submissionConfig);
        ajaxSettingsClone.context = ajaxSettingsClone.context || ajaxSettingsClone; // Ensure context is set.
        iframeIdentifier = 'jqFormIO' + (new Date().getTime());

        // Create or identify the iframe for submission.
        if (ajaxSettingsClone.iframeTarget) {
            iframeElementWrapper = jqCore(ajaxSettingsClone.iframeTarget);
            fieldName = iframeElementWrapper.attr('name');
            if (!fieldName) {
                 iframeElementWrapper.attr('name', iframeIdentifier);
            } else {
                iframeIdentifier = fieldName;
            }
        } else {
            iframeElementWrapper = jqCore(`<iframe name="${iframeIdentifier}" src="${ajaxSettingsClone.iframeSource}" />`);
            iframeElementWrapper.css({ position: 'absolute', top: '-1000px', left: '-1000px', width: '1px', height: '1px' });
        }
        iframeNativeElement = iframeElementWrapper[0];

        // Create a mock XHR object to mimic standard AJAX behavior.
        mockXHR = {
            aborted: 0,
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'n/a',
            getAllResponseHeaders: () => ({}),
            getResponseHeader: () => null,
            setRequestHeader: () => {},
            abort: function(statusReason) {
                const eventType = (statusReason === 'timeout' ? 'timeout' : 'aborted');
                consoleLogger(`Aborting iframe upload: ${eventType}`);
                this.aborted = 1;
                // Attempt to stop document loading in iframe.
                if (iframeNativeElement.contentWindow && iframeNativeElement.contentWindow.document && iframeNativeElement.contentWindow.document.execCommand) {
                    try {
                        iframeNativeElement.contentWindow.document.execCommand('Stop');
                    } catch(ignore) { /* IE specific error, ignore */ }
                }
                iframeElementWrapper.attr('src', ajaxSettingsClone.iframeSource); // Reset iframe source to abort current operation.
                mockXHR.error = eventType;
                if (ajaxSettingsClone.error) {
                    ajaxSettingsClone.error.call(ajaxSettingsClone.context, mockXHR, eventType, statusReason);
                }
                if (isGlobalEvent) {
                    jqCore.event.trigger("ajaxError", [mockXHR, ajaxSettingsClone, eventType]);
                }
                if (ajaxSettingsClone.complete) {
                    ajaxSettingsClone.complete.call(ajaxSettingsClone.context, mockXHR, eventType);
                }
            }
        };

        isGlobalEvent = ajaxSettingsClone.global;
        // Trigger global AJAX events to integrate with common activity indicators.
        if (isGlobalEvent && jqCore.active++ === 0) {
            jqCore.event.trigger("ajaxStart");
        }
        if (isGlobalEvent) {
            jqCore.event.trigger("ajaxSend", [mockXHR, ajaxSettingsClone]);
        }

        // Execute beforeSend callback; abort if it returns false.
        if (ajaxSettingsClone.beforeSend && ajaxSettingsClone.beforeSend.call(ajaxSettingsClone.context, mockXHR, ajaxSettingsClone) === false) {
            if (isGlobalEvent) {
                jqCore.active--;
            }
            return;
        }
        if (mockXHR.aborted) {
            return;
        }

        // Add info about the submitting element (if it was a submit button).
        submitButtonInfo = nativeForm.clk;
        if (submitButtonInfo) {
            fieldName = submitButtonInfo.name;
            if (fieldName && !submitButtonInfo.disabled) {
                ajaxSettingsClone.extraData = ajaxSettingsClone.extraData || {};
                ajaxSettingsClone.extraData[fieldName] = submitButtonInfo.value;
                if (submitButtonInfo.type === "image") {
                    ajaxSettingsClone.extraData[`${fieldName}.x`] = nativeForm.clk_x;
                    ajaxSettingsClone.extraData[`${fieldName}.y`] = nativeForm.clk_y;
                }
            }
        }
        
        const CLIENT_TIMEOUT_ABORT = 1;
        const SERVER_ABORT = 2;

        /**
         * Retrieves the document object from an iframe.
         * @param {HTMLIFrameElement} frame - The iframe element.
         * @returns {Document} The iframe's document object.
         */
        function getIframeDocument(frame) {
            if (frame.contentWindow) {
                return frame.contentWindow.document;
            }
            if (frame.contentDocument) {
                return frame.contentDocument;
            }
            return frame.document; // Fallback for older IE.
        }
        
        // Rails CSRF hack: Inject CSRF token as extra data.
        const csrfTokenElement = jqCore('meta[name=csrf-token]');
        const csrfParamElement = jqCore('meta[name=csrf-param]');
        const csrfToken = csrfTokenElement.attr('content');
        const csrfParam = csrfParamElement.attr('content');

        if (csrfParam && csrfToken) {
            ajaxSettingsClone.extraData = ajaxSettingsClone.extraData || {};
            ajaxSettingsClone.extraData[csrfParam] = csrfToken;
        }

        // Main submission logic for iframe.
        function initiateFormSubmission() {
            originalTarget = currentFormElement.attr('target');
            originalAction = currentFormElement.attr('action');

            // Set form attributes for iframe submission.
            nativeForm.setAttribute('target', iframeIdentifier);
            if (!httpMethod) {
                nativeForm.setAttribute('method', 'POST');
            }
            if (originalAction !== ajaxSettingsClone.url) {
                nativeForm.setAttribute('action', ajaxSettingsClone.url);
            }

            // Ensure multipart encoding for file uploads.
            if (!ajaxSettingsClone.skipEncodingOverride && (!httpMethod || /post/i.test(httpMethod))) {
                currentFormElement.attr({
                    encoding: 'multipart/form-data',
                    enctype:  'multipart/form-data'
                });
            }

            // Implement client-side timeout.
            if (ajaxSettingsClone.timeout) {
                timeoutHandle = setTimeout(() => { timedOut = true; uploadCompleteCallback(CLIENT_TIMEOUT_ABORT); }, ajaxSettingsClone.timeout);
            }
            
            // Periodically check iframe state for server aborts.
            function checkIframeLoadState() {
                try {
                    const iframeDocument = getIframeDocument(iframeNativeElement);
                    const state = iframeDocument.readyState;
                    consoleLogger(`Iframe readyState: ${state}`);
                    if (state && state.toLowerCase() === 'uninitialized') {
                        setTimeout(checkIframeLoadState, 50);
                    }
                } catch(err) {
                    consoleLogger('Server abort detected in iframe: ', err.message, `(${err.name})`);
                    uploadCompleteCallback(SERVER_ABORT);
                    if (timeoutHandle) {
                        clearTimeout(timeoutHandle);
                    }
                    timeoutHandle = undefined;
                }
            }

            const temporaryHiddenInputs = [];
            try {
                // Add any extra data as hidden input fields.
                if (ajaxSettingsClone.extraData) {
                    for (const key in ajaxSettingsClone.extraData) {
                        if (Object.prototype.hasOwnProperty.call(ajaxSettingsClone.extraData, key)) {
                           // Handle complex objects if they represent a name/value pair explicitly.
                           if (jqCore.isPlainObject(ajaxSettingsClone.extraData[key]) &&
                               ajaxSettingsClone.extraData[key].hasOwnProperty('name') &&
                               ajaxSettingsClone.extraData[key].hasOwnProperty('value')) {
                                temporaryHiddenInputs.push(
                                    jqCore(`<input type="hidden" name="${ajaxSettingsClone.extraData[key].name}">`)
                                        .attr('value', ajaxSettingsClone.extraData[key].value)
                                        .appendTo(nativeForm)[0]
                                );
                           } else {
                                temporaryHiddenInputs.push(
                                    jqCore(`<input type="hidden" name="${key}">`)
                                        .attr('value', ajaxSettingsClone.extraData[key])
                                        .appendTo(nativeForm)[0]
                                );
                           }
                        }
                    }
                }

                // Append iframe to document body if not already a target.
                if (!ajaxSettingsClone.iframeTarget) {
                    iframeElementWrapper.appendTo('body');
                    // Attach load event listener to iframe.
                    if (iframeNativeElement.attachEvent) { // For IE
                        iframeNativeElement.attachEvent('onload', uploadCompleteCallback);
                    } else {
                        iframeNativeElement.addEventListener('load', uploadCompleteCallback, false);
                    }
                }
                setTimeout(checkIframeLoadState, 15); // Start checking for iframe load state.
                nativeForm.submit(); // Trigger the form submission.
            } finally {
                // Restore original form attributes and remove temporary inputs.
                nativeForm.setAttribute('action', originalAction);
                if (originalTarget) {
                    nativeForm.setAttribute('target', originalTarget);
                } else {
                    currentFormElement.removeAttr('target');
                }
                jqCore(temporaryHiddenInputs).remove();
            }
        }

        // Defer submission slightly to allow DOM updates to render.
        if (ajaxSettingsClone.forceSync) {
            initiateFormSubmission();
        } else {
            setTimeout(initiateFormSubmission, 10);
        }

        let iframeResultData, iframeDocument, remainingDomChecks = 50, completionHandled;

        /**
         * Callback function executed when the iframe content loads.
         * @param {Event|number} eventOrStatus - The load event or an abort status code.
         */
        function uploadCompleteCallback(eventOrStatus) {
            if (mockXHR.aborted || completionHandled) {
                return;
            }
            
            iframeDocument = getIframeDocument(iframeNativeElement);

            // Handle server abort or client timeout.
            if (eventOrStatus === CLIENT_TIMEOUT_ABORT || eventOrStatus === SERVER_ABORT) {
                consoleLogger(`Iframe upload ${eventOrStatus === CLIENT_TIMEOUT_ABORT ? 'timed out' : 'aborted by server'}.`);
                mockXHR.abort(eventOrStatus === CLIENT_TIMEOUT_ABORT ? 'timeout' : 'server abort');
                return;
            }

            // Ensure iframe is loaded and has content.
            if (!iframeNativeElement.contentWindow || iframeNativeElement.contentWindow.location.href === ajaxSettingsClone.iframeSource) {
                // Iframe is empty or still loading initial src.
                if (remainingDomChecks--) {
                    consoleLogger('Iframe content not yet available, retrying...');
                    setTimeout(() => uploadCompleteCallback(eventOrStatus), 100);
                    return;
                }
                consoleLogger('Iframe content never became available after multiple checks.');
                mockXHR.abort('content missing');
                return;
            }

            // Clear timeout if it was set.
            if (timeoutHandle) {
                clearTimeout(timeoutHandle);
                timeoutHandle = undefined;
            }

            completionHandled = true;
            iframeElementWrapper.off('load', uploadCompleteCallback); // Remove listener.

            // Set mockXHR status and response.
            try {
                let docBody = iframeDocument.body;
                mockXHR.responseText = docBody ? docBody.innerHTML : null;
                mockXHR.responseXML = iframeDocument.XMLDocument || iframeDocument;
                mockXHR.status = 200; // Assume success for iframe uploads unless explicitly failed.
                mockXHR.statusText = 'OK';

                // Attempt to parse JSON response.
                if (ajaxSettingsClone.dataType === 'json' || ajaxSettingsClone.dataType === 'jsonp') {
                    try {
                        iframeResultData = jqCore.parseJSON(mockXHR.responseText);
                    } catch (e) {
                        console.warn('Could not parse JSON response from iframe:', e);
                        mockXHR.status = 500;
                        mockXHR.statusText = 'parsererror';
                        mockXHR.error = 'parsererror';
                    }
                } else if (ajaxSettingsClone.dataType === 'xml') {
                    iframeResultData = mockXHR.responseXML;
                } else { // Default to text/html.
                    iframeResultData = mockXHR.responseText;
                }
            } catch (e) {
                console.error('Error processing iframe response:', e);
                mockXHR.status = 500;
                mockXHR.statusText = 'error';
                mockXHR.error = 'error';
            }

            // Trigger success/error callbacks and global events.
            if (mockXHR.status >= 200 && mockXHR.status < 300 || mockXHR.status === 304) {
                if (ajaxSettingsClone.success) {
                    ajaxSettingsClone.success.call(ajaxSettingsClone.context, iframeResultData, 'success', mockXHR);
                }
                if (isGlobalEvent) {
                    jqCore.event.trigger("ajaxSuccess", [mockXHR, ajaxSettingsClone]);
                }
            } else {
                if (ajaxSettingsClone.error) {
                    ajaxSettingsClone.error.call(ajaxSettingsClone.context, mockXHR, mockXHR.error || 'error', mockXHR.statusText);
                }
                if (isGlobalEvent) {
                    jqCore.event.trigger("ajaxError", [mockXHR, ajaxSettingsClone, mockXHR.error || 'error']);
                }
            }

            // Final completion callback and cleanup.
            if (ajaxSettingsClone.complete) {
                ajaxSettingsClone.complete.call(ajaxSettingsClone.context, mockXHR, mockXHR.statusText);
            }
            if (isGlobalEvent) {
                jqCore.event.trigger("ajaxComplete", [mockXHR, ajaxSettingsClone]);
            }
            if (isGlobalEvent && ! --jqCore.active) {
                jqCore.event.trigger("ajaxStop");
            }
            if (ajaxSettingsClone.removeIframeOnComplete && !ajaxSettingsClone.iframeTarget) {
                setTimeout(() => iframeElementWrapper.remove(), 100);
            }
            iframeNativeElement.contentWindow.location.href = ajaxSettingsClone.iframeSource; // Reset iframe src.
        }
    }
};

// --- Additional jQuery Form Plugin methods (cloned for completeness) ---

/**
 * Serializes form data into an array of objects, similar to jQuery's serializeArray,
 * but with additional control over which elements are included.
 * @param {boolean} includeSemantic - If true, only inputs with name attribute are included.
 * @param {Array<HTMLElement>} elementList - An array to populate with references to included elements.
 * @returns {Array<object>} An array of {name, value} objects.
 */
jqCore.fn.formToArray = function(includeSemantic, elementList) {
    const data = [];
    if (!this.length) {
        return data;
    }

    const form = this[0];
    const formElements = includeSemantic ? form.elements : this.find('*');

    jqCore(formElements).each(function() {
        const field = this;
        const name = field.name;
        const tagName = field.tagName.toLowerCase();

        if (elementList) {
            elementList.push(field);
        }

        // Exclude elements that are disabled, unnamed, or not meant for submission.
        if (field.disabled || !name ||
            (tagName === 'select' && field.type === 'select-multiple' && !field.options.length) ||
            (field.type === 'radio' || field.type === 'checkbox') && !field.checked) {
            return;
        }

        // Handle various input types.
        if (tagName === 'select') {
            jqCore('option:selected', field).each(function() {
                data.push({ name: name, value: jqCore(this).val() });
            });
        } else if (field.type === 'file') {
            // File inputs are handled specially by ajaxSubmit (iframe/XHR2).
            // For formToArray, we only include their name if they have a value.
            if (field.value) {
                data.push({ name: name, value: field.value });
            }
        } else if (field.type !== 'submit' && field.type !== 'button' && field.type !== 'reset' && field.type !== 'image') {
            data.push({ name: name, value: field.value });
        }
    });

    return data;
};

/**
 * Resets the form by clearing all input fields and restoring default values.
 * @returns {jqCore} The current jqCore object for chaining.
 */
jqCore.fn.resetForm = function() {
    return this.each(function() {
        if (typeof this.reset === 'function' || (typeof this.reset === 'object' && !this.reset.nodeType)) {
            this.reset();
        }
    });
};

/**
 * Clears the values of input elements within the form.
 * @param {boolean} includeHidden - If true, hidden fields are also cleared.
 * @returns {jqCore} The current jqCore object for chaining.
 */
jqCore.fn.clearForm = function(includeHidden) {
    return this.each(function() {
        jqCore('input,select,textarea', this).each(function() {
            const type = this.type;
            const tag = this.tagName.toLowerCase();
            if (includeHidden || type !== 'hidden') {
                if (type === 'text' || type === 'password' || tag === 'textarea') {
                    this.value = '';
                } else if (type === 'checkbox' || type === 'radio') {
                    this.checked = false;
                } else if (tag === 'select') {
                    this.selectedIndex = -1;
                }
            }
        });
    });
};

/**
 * Binds the form's submit event to trigger an AJAX submission.
 * This method automatically handles event delegation if specified.
 * @param {object} options - Configuration options for the AJAX submission.
 * @returns {jqCore} The current jqCore object for chaining.
 */
jqCore.fn.manageFormSubmission = function(options) {
    options = options || {};
    options.delegation = options.delegation && jqCore.isFunction(jqCore.fn.on); // Check for jQuery 1.7+ for delegation

    if (!options.delegation) {
        return this.each(function() {
            if (!this.formProcessed) { // Prevent multiple bindings
                this.formProcessed = true;
                jqCore(this).on('submit.form', function(e) {
                    e.preventDefault();
                    jqCore(this).sendFormViaAjax(options);
                });
            }
        });
    } else {
        return this.on('submit.form', function(e) {
            e.preventDefault();
            jqCore(this).sendFormViaAjax(options);
        });
    }
};

})(jQuery); // Assuming jQuery is available as 'jQuery' in the global scope.