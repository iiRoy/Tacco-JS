/*!
 * Enhanced AJAX Form Processor
 * version: 1.0 (2024-05-15)
 * @requires jQuery v1.5+
 *
 * This utility facilitates asynchronous form submissions, offering
 * robust handling for file uploads, progress tracking, and integration
 * with jQuery's AJAX mechanisms.
 *
 * For usage examples and detailed documentation, please refer to the
 * project repository at: https://github.com/your-repo/async-form-processor
 *
 * Licensed under the Apache 2.0 License.
 *    http://www.apache.org/licenses/LICENSE-2.0
 */
/*global ActiveXObject */
;(function(jq) {
"use strict";

// Internal debugging utility
const debugLogger = function(message, ...args) {
    if (console && console.debug) {
        console.debug('AsyncFormProcessor:', message, ...args);
    }
};

/*
    Important Usage Considerations:
    -------------------------------
    Avoid mixing `sendFormAsync` and `attachAsyncForm` on the same HTML form.
    These methods serve distinct purposes and are mutually exclusive.

    Use `sendFormAsync` when you intend to manually bind your form's
    submission event. For instance:

    jq(document).ready(function() {
        jq('#myRegistrationForm').on('submit', function(eventObj) {
            eventObj.preventDefault(); // Crucial: Prevent standard browser submission
            jq(this).sendFormAsync({
                targetContainer: '#serverResponseDisplay'
            });
        });
    });

    Employ `attachAsyncForm` when you prefer the plugin to manage
    all necessary event bindings automatically. Example:

    jq(document).ready(function() {
        jq('#myOrderForm').attachAsyncForm({
            targetContainer: '#orderConfirmation'
        });
    });

    `attachAsyncForm` also supports event delegation (requires jQuery v1.7+),
    meaning the form doesn't need to exist in the DOM at the time of invocation:

    jq('#userProfileForm').attachAsyncForm({
        delegateEvents: true,
        targetContainer: '#profileUpdateStatus'
    });

    When `attachAsyncForm` is utilized, the `sendFormAsync` method will be
    invoked internally at the appropriate moment during form submission.
*/

/**
 * Capability detection for modern browser features
 */
const browserCapabilities = {};
browserCapabilities.hasFileAPI = (jq("<input type='file'/>").get(0).files !== undefined);
browserCapabilities.hasFormData = (window.FormData !== undefined);

/**
 * `sendFormAsync()` provides a mechanism for immediately submitting
 * an HTML form using AJAX techniques.
 */
jq.fn.sendFormAsync = function(submissionConfig) {
    // If no elements are selected, gracefully exit without processing
    if (!this.length) {
        debugLogger('sendFormAsync: Skipping submission - no form element matched selector.');
        return this;
    }

    let formRequestType, formActionPath, requestTargetURL;
    const currentFormElement = this;

    // Normalize submissionConfig if a callback function is passed directly
    if (typeof submissionConfig === 'function') {
        submissionConfig = { onSuccess: submissionConfig };
    } else if (submissionConfig === undefined || submissionConfig === null) {
        submissionConfig = {}; // Ensure it's an object
    }

    formRequestType = currentFormElement.attr('method');
    formActionPath = currentFormElement.attr('action');
    requestTargetURL = (typeof formActionPath === 'string') ? jq.trim(formActionPath) : '';
    requestTargetURL = requestTargetURL || window.location.href || '';

    if (requestTargetURL) {
        // Strip hash fragment from URL if present
        requestTargetURL = (requestTargetURL.match(/^([^#]+)/)||[])[1];
    }

    // Establish default settings, merging with provided configuration
    submissionConfig = jq.extend(true, {
        url:  requestTargetURL,
        onSuccess: jq.ajaxSettings.success,
        type: formRequestType || 'GET',
        iframeSource: (/^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'),
        traditionalParams: jq.ajaxSettings.traditional // Inherit global traditional setting
    }, submissionConfig);

    // Provide a hook for external manipulation of form data before serialization
    const preSerializationVeto = { shouldCancel: false };
    currentFormElement.trigger('async-form-pre-serialize', [currentFormElement, submissionConfig, preSerializationVeto]);
    if (preSerializationVeto.shouldCancel) {
        debugLogger('sendFormAsync: Submission aborted by "async-form-pre-serialize" event.');
        return this;
    }

    // Allow callback to abort serialization
    if (submissionConfig.beforeSerialization && submissionConfig.beforeSerialization(currentFormElement, submissionConfig) === false) {
        debugLogger('sendFormAsync: Submission aborted by "beforeSerialization" callback.');
        return this;
    }

    const disabledElementsBeforeSerialization = []; // To track elements temporarily enabled for serialization
    const serializedFormFields = currentFormElement.formToArray(submissionConfig.semantic, disabledElementsBeforeSerialization);

    let additionalQueryParameters;
    if (submissionConfig.data) {
        submissionConfig.extraData = submissionConfig.data;
        additionalQueryParameters = jq.param(submissionConfig.data, submissionConfig.traditionalParams);
    }

    // Offer a pre-submission callback for final validation or modification
    if (submissionConfig.beforeSubmission && submissionConfig.beforeSubmission(serializedFormFields, currentFormElement, submissionConfig) === false) {
        debugLogger('sendFormAsync: Submission aborted by "beforeSubmission" callback.');
        return this;
    }

    // Trigger a vetoable 'validate' event
    const validationVeto = { shouldCancel: false };
    currentFormElement.trigger('async-form-validate', [serializedFormFields, currentFormElement, submissionConfig, validationVeto]);
    if (validationVeto.shouldCancel) {
        debugLogger('sendFormAsync: Submission aborted by "async-form-validate" event.');
        return this;
    }

    let finalPayloadString = jq.param(serializedFormFields, submissionConfig.traditionalParams);
    if (additionalQueryParameters) {
        finalPayloadString = ( finalPayloadString ? (finalPayloadString + '&' + additionalQueryParameters) : additionalQueryParameters );
    }

    const requestMethodUpper = submissionConfig.type.toUpperCase();
    if (requestMethodUpper === 'GET') {
        submissionConfig.url += (submissionConfig.url.indexOf('?') >= 0 ? '&' : '?') + finalPayloadString;
        submissionConfig.data = null;  // Data is embedded in URL for GET
    } else {
        submissionConfig.data = finalPayloadString; // Data is the query string for POST
    }

    const completionCallbacks = [];
    if (submissionConfig.resetFormAfter) {
        completionCallbacks.push(function() { currentFormElement.resetForm(); });
    }
    if (submissionConfig.clearFormAfter) {
        completionCallbacks.push(function() { currentFormElement.clearForm(submissionConfig.includeHiddenFields); });
    }

    // Handle target container update if no specific dataType is requested
    if (!submissionConfig.dataType && submissionConfig.targetContainer) {
        const originalSuccessHandler = submissionConfig.onSuccess || function(){};
        completionCallbacks.push(function(responseData) {
            const updateMethod = submissionConfig.replaceTargetContent ? 'replaceWith' : 'html';
            jq(submissionConfig.targetContainer)[updateMethod](responseData).each(originalSuccessHandler, arguments);
        });
    } else if (submissionConfig.onSuccess) {
        completionCallbacks.push(submissionConfig.onSuccess);
    }

    // Wrap the success handler to execute all registered completion callbacks
    submissionConfig.success = function(data, statusText, xhrObject) { // jQuery 1.4+ passes xhr as 3rd arg
        const executionContext = submissionConfig.context || this ;    // jQuery 1.4+ supports scope context
        for (let k=0, totalCallbacks=completionCallbacks.length; k < totalCallbacks; k++) {
            completionCallbacks[k].apply(executionContext, [data, statusText, xhrObject || currentFormElement, currentFormElement]);
        }
    };

    // Determine if file uploads are present and which mechanism to use
    const fileUploadElements = jq('input:file:enabled[value]', this); // [value] ensures only selected files (issue #113)
    const containsFileUploads = fileUploadElements.length > 0;
    const multiPartContentType = 'multipart/form-data';
    const isMultiPartForm = (currentFormElement.attr('enctype') === multiPartContentType || currentFormElement.attr('encoding') === multiPartContentType);

    const xhr2FileUploadCapable = browserCapabilities.hasFileAPI && browserCapabilities.hasFormData;
    debugLogger("XHR2 File Upload Capability:", xhr2FileUploadCapable);

    let needsIframeFallback = (containsFileUploads || isMultiPartForm) && !xhr2FileUploadCapable;
    let currentXHR;

    // `submissionConfig.forceIframe` allows user to override automatic detection
    // If iframe mode is explicitly requested or deemed necessary
    if (submissionConfig.forceIframe !== false && (submissionConfig.forceIframe || needsIframeFallback)) {
        // Handle Safari hang workaround
        if (submissionConfig.closeKeepAliveURL) {
            jq.get(submissionConfig.closeKeepAliveURL, function() {
                currentXHR = processIframeUpload(serializedFormFields);
            });
        } else {
            currentXHR = processIframeUpload(serializedFormFields);
        }
    }
    else if ((containsFileUploads || isMultiPartForm) && xhr2FileUploadCapable) {
        currentXHR = handleXhr2Upload(serializedFormFields);
    }
    else {
        currentXHR = jq.ajax(submissionConfig);
    }

    currentFormElement.removeData('jqxhr').data('jqxhr', currentXHR);

    // Clean up the temporarily enabled elements array
    for (let l=0; l < disabledElementsBeforeSerialization.length; l++) {
        disabledElementsBeforeSerialization[l] = null;
    }

    // Trigger a final notification event
    currentFormElement.trigger('async-form-notify', [currentFormElement, submissionConfig]);
    return this;

    // Utility function for deeply serializing an object into parameters
    function flattenObjectToParams(dataObject){
        if (!dataObject) return {};
        const paramStringParts = jq.param(dataObject).split('&');
        const result = {};
        for (let m=0, totalParts=paramStringParts.length; m < totalParts; m++) {
            const keyValuePair = paramStringParts[m].split('=');
            if (keyValuePair.length === 2) {
                result[decodeURIComponent(keyValuePair[0])] = decodeURIComponent(keyValuePair[1]);
            }
        }
        return result;
    }

     // Handles XMLHttpRequest Level 2 file uploads (FormData API)
    function handleXhr2Upload(fieldItems) {
        const formDataPayload = new FormData();
        debugLogger('Creating FormData payload...');

        for (let idx=0; idx < fieldItems.length; idx++) {
            if (fieldItems[idx] && fieldItems[idx].name) {
                formDataPayload.append(fieldItems[idx].name, fieldItems[idx].value);
            }
        }

        if (submissionConfig.extraData) {
            const processedExtraData = flattenObjectToParams(submissionConfig.extraData);
            for (const propName in processedExtraData) {
                if (Object.prototype.hasOwnProperty.call(processedExtraData, propName)) {
                    formDataPayload.append(propName, processedExtraData[propName]);
                }
            }
        }

        // Clear data property, as FormData object will be assigned in beforeSend
        submissionConfig.data = null;

        const ajaxRequestSettings = jq.extend(true, {}, jq.ajaxSettings, submissionConfig, {
            contentType: false, // Important for FormData
            processData: false, // Important for FormData
            cache: false,
            type: formRequestType || 'POST'
        });
        
        if (typeof submissionConfig.uploadProgress === 'function') {
            // Workaround: jqXHR object doesn't directly expose upload property
            ajaxRequestSettings.xhr = function() {
                const nativeXhrObject = jQuery.ajaxSettings.xhr();
                if (nativeXhrObject && nativeXhrObject.upload) {
                    nativeXhrObject.upload.onprogress = function(progressEvent) {
                        let completionPercentage = 0;
                        const bytesTransferred = progressEvent.loaded || progressEvent.position; /*event.position is deprecated*/
                        const totalBytes = progressEvent.total;
                        if (progressEvent.lengthComputable) {
                            completionPercentage = Math.ceil(bytesTransferred / totalBytes * 100);
                        }
                        submissionConfig.uploadProgress(progressEvent, bytesTransferred, totalBytes, completionPercentage);
                    };
                }
                return nativeXhrObject;
            };
        }

        const originalBeforeSend = ajaxRequestSettings.beforeSend;
        ajaxRequestSettings.beforeSend = function(xhr, currentSettings) {
            currentSettings.data = formDataPayload; // Assign FormData here
            if(originalBeforeSend) {
                originalBeforeSend.call(this, xhr, currentSettings);
            }
        };
        return jq.ajax(ajaxRequestSettings);
    }

    // Private function for handling file uploads via hidden iframe (legacy method)
    function processIframeUpload(formElementsToEnable) {
        const rawFormElement = currentFormElement[0];
        const canUsePropMethod = !!jq.fn.prop;
        const uploadDeferred = jq.Deferred();

        // Check for conflicting input names/ids
        if (jq(':input[name=submit],:input[id=submit]', rawFormElement).length) {
            console.error('AsyncFormProcessor Error: Form elements must not have name or id of "submit". This can cause cross-browser issues with form.submit().');
            uploadDeferred.reject();
            return uploadDeferred;
        }
        
        // Ensure that any elements temporarily disabled for serialization are re-enabled
        if (formElementsToEnable) {
            for (let i=0; i < disabledElementsBeforeSerialization.length; i++) {
                const el = jq(disabledElementsBeforeSerialization[i]);
                if ( canUsePropMethod ) {
                    el.prop('disabled', false);
                } else {
                    el.removeAttr('disabled');
                }
            }
        }

        const iframeSettings = jq.extend(true, {}, jq.ajaxSettings, submissionConfig);
        iframeSettings.context = iframeSettings.context || iframeSettings;

        const iframeId = 'asyncFormIO_' + (new Date().getTime());
        let $iframeElement, iframeDOMElement;

        if (iframeSettings.iframeTarget) {
            $iframeElement = jq(iframeSettings.iframeTarget);
            const existingName = $iframeElement.attr('name');
            if (!existingName) {
                 $iframeElement.attr('name', iframeId);
            } else {
                iframeId = existingName;
            }
        } else {
            $iframeElement = jq('<iframe name="' + iframeId + '" src="'+ iframeSettings.iframeSource +'" />');
            $iframeElement.css({ position: 'absolute', top: '-1000px', left: '-1000px', border: 'none', width: '0', height: '0' });
        }
        iframeDOMElement = $iframeElement[0];

        const mockXhrObject = { // Mock XMLHttpRequest object for compatibility
            aborted: 0,
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'n/a',
            getAllResponseHeaders: function() { return ''; },
            getResponseHeader: function() { return null; },
            setRequestHeader: function() {},
            abort: function(reason) {
                const abortReason = (reason === 'timeout' ? 'timeout' : 'aborted');
                debugLogger('Iframe upload aborted: ' + abortReason);
                this.aborted = 1;
                // Attempt to stop document loading in iframe
                if (iframeDOMElement.contentWindow && iframeDOMElement.contentWindow.document && iframeDOMElement.contentWindow.document.execCommand) {
                    try {
                        iframeDOMElement.contentWindow.document.execCommand('Stop');
                    } catch(ignore) { /* IE throws error if not fully loaded */ }
                }
                $iframeElement.attr('src', iframeSettings.iframeSource); // Reset iframe src to abort pending operations
                mockXhrObject.error = abortReason;
                if (iframeSettings.error) {
                    iframeSettings.error.call(iframeSettings.context, mockXhrObject, abortReason, reason);
                }
                if (isGlobalEventEnabled) {
                    jq.event.trigger("ajaxError", [mockXhrObject, iframeSettings, abortReason]);
                }
                if (iframeSettings.complete) {
                    iframeSettings.complete.call(iframeSettings.context, mockXhrObject, abortReason);
                }
                uploadDeferred.reject(mockXhrObject, abortReason, reason);
            }
        };

        const isGlobalEventEnabled = iframeSettings.global;
        // Trigger jQuery global AJAX events
        if (isGlobalEventEnabled && (jq.active === 0 || jq.active === undefined)) { // check for undefined for older jQuery
            jq.event.trigger("ajaxStart");
        }
        if (isGlobalEventEnabled) {
            jq.event.trigger("ajaxSend", [mockXhrObject, iframeSettings]);
        }

        if (iframeSettings.beforeSend && iframeSettings.beforeSend.call(iframeSettings.context, mockXhrObject, iframeSettings) === false) {
            if (isGlobalEventEnabled && jq.active > 0) {
                jq.active--;
            }
            uploadDeferred.reject();
            return uploadDeferred;
        }
        if (mockXhrObject.aborted) {
            uploadDeferred.reject();
            return uploadDeferred;
        }

        // Add information about the submitting element if available
        const submitButtonInfo = rawFormElement.clk;
        if (submitButtonInfo) {
            const currentElementName = submitButtonInfo.name;
            if (currentElementName && !submitButtonInfo.disabled) {
                iframeSettings.extraData = iframeSettings.extraData || {};
                iframeSettings.extraData[currentElementName] = submitButtonInfo.value;
                if (submitButtonInfo.type === "image") {
                    iframeSettings.extraData[currentElementName + '.x'] = rawFormElement.clk_x;
                    iframeSettings.extraData[currentElementName + '.y'] = rawFormElement.clk_y;
                }
            }
        }
        
        const CLIENT_TIMEOUT_ABORT_CODE = 1;
        const SERVER_ABORT_CODE = 2;

        function getIframeDocument(frameRef) {
            try {
                // Access contentDocument first, then contentWindow.document for IE compatibility
                return frameRef.contentDocument || frameRef.contentWindow.document;
            } catch (e) {
                console.warn('Could not access iframe document:', e);
                return null;
            }
        }
        
        // Rails CSRF token handling
        const csrf_token = jq('meta[name=csrf-token]').attr('content');
        const csrf_param = jq('meta[name=csrf-param]').attr('content');
        if (csrf_param && csrf_token) {
            iframeSettings.extraData = iframeSettings.extraData || {};
            iframeSettings.extraData[csrf_param] = csrf_token;
        }

        let requestTimedOut = false;
        let timeoutTimer;

        // Function to execute the iframe submission
        function initiateIframeSubmission() {
            // Save original form attributes
            const originalFormTarget = currentFormElement.attr('target');
            const originalFormAction = currentFormElement.attr('action');

            // Update form attributes for iframe submission
            rawFormElement.setAttribute('target', iframeId);
            if (!formRequestType) {
                rawFormElement.setAttribute('method', 'POST');
            }
            if (originalFormAction !== iframeSettings.url) {
                rawFormElement.setAttribute('action', iframeSettings.url);
            }

            // Set encoding for file uploads. IE can be finicky.
            if (!iframeSettings.skipEncodingOverride && (!formRequestType || /post/i.test(formRequestType))) {
                currentFormElement.attr({
                    encoding: 'multipart/form-data',
                    enctype:  'multipart/form-data'
                });
            }

            // Implement timeout mechanism
            if (iframeSettings.timeout) {
                timeoutTimer = setTimeout(function() {
                    requestTimedOut = true;
                    // Callback function `cb` is defined later, so we need to ensure it's available or handle directly
                    mockXhrObject.abort('timeout');
                }, iframeSettings.timeout);
            }
            
            // Periodically check iframe document state for server aborts
            function checkIframeState() {
                try {
                    const iframeDoc = getIframeDocument(iframeDOMElement);
                    if (!iframeDoc) {
                         // Document not yet accessible or error occurred
                        setTimeout(checkIframeState, 50);
                        return;
                    }
                    const state = iframeDoc.readyState;
                    debugLogger('Iframe state:', state);
                    if (state && state.toLowerCase() === 'uninitialized') {
                        setTimeout(checkIframeState, 50);
                    }
                }
                catch(e) {
                    debugLogger('Server abort detected: ', e, ' (', e.name, ')');
                    mockXhrObject.abort('server-abort');
                    if (timeoutTimer) {
                        clearTimeout(timeoutTimer);
                    }
                    timeoutTimer = undefined;
                }
            }

            const temporaryInputFields = [];
            try {
                // Add "extra" data as hidden inputs if provided
                if (iframeSettings.extraData) {
                    for (const dataKey in iframeSettings.extraData) {
                        if (Object.prototype.hasOwnProperty.call(iframeSettings.extraData, dataKey)) {
                           // Support $.param-like structure for multiple values with same name
                           if(jq.isPlainObject(iframeSettings.extraData[dataKey]) && iframeSettings.extraData[dataKey].hasOwnProperty('name') && iframeSettings.extraData[dataKey].hasOwnProperty('value')) {
                               temporaryInputFields.push(
                               jq('<input type="hidden" name="'+iframeSettings.extraData[dataKey].name+'">').attr('value',iframeSettings.extraData[dataKey].value)
                                   .appendTo(rawFormElement)[0]);
                           } else {
                               temporaryInputFields.push(
                               jq('<input type="hidden" name="'+dataKey+'">').attr('value',iframeSettings.extraData[dataKey])
                                   .appendTo(rawFormElement)[0]);
                           }
                        }
                    }
                }

                if (!iframeSettings.iframeTarget) {
                    // Add iframe to document body and attach load event listener
                    if (document.body) {
                        $iframeElement.appendTo('body');
                    } else {
                        console.error('AsyncFormProcessor: document.body not available to append iframe.');
                        uploadDeferred.reject(mockXhrObject, 'error', 'document.body_not_ready');
                        return;
                    }

                    if (iframeDOMElement.attachEvent) { // IE
                        iframeDOMElement.attachEvent('onload', iframeLoadCallback);
                    } else {
                        iframeDOMElement.addEventListener('load', iframeLoadCallback, false);
                    }
                }
                
                setTimeout(checkIframeState, 15); // Start checking state shortly after submission
                rawFormElement.submit(); // Trigger form submission
            }
            finally {
                // Restore original form attributes and remove temporary inputs
                rawFormElement.setAttribute('action', originalFormAction);
                if(originalFormTarget) {
                    rawFormElement.setAttribute('target', originalFormTarget);
                } else {
                    currentFormElement.removeAttr('target');
                }
                jq(temporaryInputFields).remove();
            }
        }

        // Delay submission to allow DOM updates to render
        if (iframeSettings.forceSynchronous) {
            initiateIframeSubmission();
        }
        else {
            setTimeout(initiateIframeSubmission, 50); // A small delay
        }

        return uploadDeferred;

        // Iframe load event handler
        function iframeLoadCallback(event) {
            // Ensure callback fires only once
            if (iframeDOMElement.attachEvent) {
                iframeDOMElement.detachEvent('onload', iframeLoadCallback);
            } else {
                iframeDOMElement.removeEventListener('load', iframeLoadCallback, false);
            }

            const iframeDoc = getIframeDocument(iframeDOMElement);
            if (!iframeDoc || iframeDoc.location.href === iframeSettings.iframeSource) {
                // This happens if the iframe was reset (e.g., due to abort) or never loaded content
                debugLogger('Iframe loaded with blank page, possibly aborted or reset.');
                return;
            }

            // Process response
            try {
                mockXhrObject.responseText = iframeDoc.body ? iframeDoc.body.innerHTML : null;
                mockXhrObject.responseXML = iframeDoc.XMLDocument || iframeDoc; // IE compatibility
                mockXhrObject.status = 200;
                mockXhrObject.statusText = 'success';

                iframeSettings.success.call(iframeSettings.context, mockXhrObject.responseText, 'success', mockXhrObject);
                uploadDeferred.resolve(mockXhrObject.responseText, 'success', mockXhrObject);

            } catch (e) {
                debugLogger('Error processing iframe response:', e);
                mockXhrObject.error = 'parsererror';
                mockXhrObject.status = 500;
                mockXhrObject.statusText = 'parsererror';

                if (iframeSettings.error) {
                    iframeSettings.error.call(iframeSettings.context, mockXhrObject, 'parsererror', 'Error parsing iframe response');
                }
                uploadDeferred.reject(mockXhrObject, 'parsererror', e);
            } finally {
                // Clean up iframe
                $iframeElement.remove();
                if (timeoutTimer) {
                    clearTimeout(timeoutTimer);
                }
                if (isGlobalEventEnabled && jq.active > 0) {
                    jq.active--;
                    if (jq.active === 0) {
                        jq.event.trigger("ajaxStop");
                    }
                }
                if (iframeSettings.complete) {
                    iframeSettings.complete.call(iframeSettings.context, mockXhrObject, mockXhrObject.statusText);
                }
            }
        }
    }
};

// Placeholder for `formToArray`. In a real plugin, this would be defined here.
// For the purpose of this clone, we assume it's provided by the base plugin.
// Example minimal stub:
if (!jq.fn.formToArray) {
    jq.fn.formToArray = function(semantic, disabledElementsTracker) {
        let arr = [];
        if (this.length === 0) {
            return arr;
        }

        const form = this[0];
        const elements = semantic ? form.elements : this.find(':input').get();

        for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const $el = jq(el);

            if (el.name && !el.disabled && el.type !== 'submit' && el.type !== 'button' && el.type !== 'reset' && el.type !== 'file') {
                if (el.type === 'radio' || el.type === 'checkbox') {
                    if (el.checked) {
                        arr.push({ name: el.name, value: el.value });
                    }
                } else if (el.type === 'select-multiple') {
                    jq('option:selected', el).each(function() {
                        arr.push({ name: el.name, value: this.value });
                    });
                } else {
                    arr.push({ name: el.name, value: el.value });
                }
            } else if (el.name && el.disabled && disabledElementsTracker) {
                // If element is disabled but has a name, temporarily enable it for serialization
                // This is a simplified version; original plugin has more robust handling
                // For Type III, we can remove this complex logic if not strictly needed
                // For this clone, we'll just track it, but not enable/disable it here
                // as the iframe handler already does it.
                disabledElementsTracker.push(el);
            }
        }
        return arr;
    };
}

// Placeholder for `resetForm` and `clearForm`.
// These would typically be part of the jQuery Form Plugin.
if (!jq.fn.resetForm) {
    jq.fn.resetForm = function() {
        return this.each(function() {
            if (typeof this.reset === 'function' || (typeof this.reset === 'object' && !this.reset.nodeType)) {
                this.reset();
            }
        });
    };
}
if (!jq.fn.clearForm) {
    jq.fn.clearForm = function(includeHidden) {
        return this.each(function() {
            jq('input,select,textarea', this).each(function() {
                const type = this.type;
                const tag = this.tagName.toLowerCase();
                if (includeHidden || (type !== 'hidden' && !jq(this).is(':hidden'))) {
                    if (type === 'text' || type === 'password' || tag === 'textarea') {
                        this.value = '';
                    } else if (type === 'radio' || type === 'checkbox') {
                        this.checked = false;
                    } else if (tag === 'select') {
                        this.selectedIndex = -1;
                    }
                }
            });
        });
    };
}


})(jQuery);