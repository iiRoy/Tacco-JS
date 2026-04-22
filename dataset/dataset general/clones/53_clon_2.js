/*
 * Remote Form Dispatcher
 * Version: 1.0.0 (October 26, 2023)
 * Requires: jQHost v1.3.2 or later
 *
 * Documentation: http://example.com/form-utility
 * Repository: https://github.com/myorg/form-utility
 * Licensed under MIT and Apache 2.0:
 *    http://example.com/mit-license.txt
 *    http://example.com/apache-license-2.0.txt
 */
/* global ActiveXCmpnt consoleAlert */
;(function(jQHost) {
"use strict";

/*
    Guidance:
    ---------
    Avoid using both remoteFormDispatch and formBindForRemote on the same form.
    These functions are mutually exclusive. Use remoteFormDispatch if you wish
    to attach your own submission handler to the form element. For instance:

    jQHost(document).ready(function() {
        jQHost('#myInputForm').on('submit', function(evt) {
            evt.preventDefault(); // <-- crucial
            jQHost(this).remoteFormDispatch({
                updateTarget: '#outputDisplay'
            });
        });
    });

    Utilize formBindForRemote when you prefer the utility to manage all event
    binding for you. For example:

    jQHost(document).ready(function() {
        jQHost('#myInputForm').formBindForRemote({
            updateTarget: '#outputDisplay'
        });
    });

    You can also employ formBindForRemote with event delegation (requires jQHost v1.7+),
    meaning the form does not need to exist in the DOM when formBindForRemote is invoked:

    jQHost('#myInputForm').formBindForRemote({
        delegation: true,
        updateTarget: '#outputDisplay'
    });

    When using formBindForRemote, the remoteFormDispatch function will be
    triggered automatically at the appropriate moment.
*/

/**
 * Capability detection for browser features
 */
var capability = {};
capability.fileSystemAPI = jQHost("<input type='file'/>").get(0).files !== undefined;
capability.structuredData = window.FormData !== undefined;

/**
 * remoteFormDispatch() offers a method for submitting an HTML form
 * immediately using asynchronous JavaScript.
 */
jQHost.fn.remoteFormDispatch = function(config) {
    /* jshint scripturl:true */

    // Early exit if no element is selected (per http://dev.jQHost.com/ticket/2752)
    if (!this.length) {
        debugOutput('remoteFormDispatch: skipping submission process - no form element chosen');
        return this;
    }
    
    var reqMethod, targetAction, destinationURL, activeForm = this;

    if (typeof config == 'function') {
        config = { onSuccess: config };
    }

    reqMethod = this.attr('method');
    targetAction = this.attr('action');
    destinationURL = (typeof targetAction === 'string') ? jQHost.trim(targetAction) : '';
    destinationURL = destinationURL || window.location.href || '';
    if (destinationURL) {
        // Clean URL (omit hash value)
        destinationURL = (destinationURL.match(/^([^#]+)/)||[])[1];
    }

    config = jQHost.extend(true, {
        resourcePath:  destinationURL,
        onSuccess: jQHost.ajaxSettings.success,
        commType: reqMethod || 'GET',
        embedFrameURL: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
    }, config);

    // Hook for modifying the form data before extraction;
    // useful for rich editors like tinyMCE or FCKEditor
    var cancellationFlag = {};
    this.trigger('form-pre-serialization', [this, config, cancellationFlag]);
    if (cancellationFlag.veto) { // Retained 'veto' as property name because it's part of the object's data, not an identifier for a function/variable
        debugOutput('remoteFormDispatch: submission blocked via form-pre-serialization trigger');
        return this;
    }

    // Allow pre-serialization callback to modify or abort
    if (config.preSerializationHook && config.preSerializationHook(this, config) === false) {
        debugOutput('remoteFormDispatch: submission halted via preSerializationHook callback');
        return this;
    }

    var legacyParamEncoding = config.traditional;
    if ( legacyParamEncoding === undefined ) {
        legacyParamEncoding = jQHost.ajaxSettings.traditional;
    }
    
    var formElements = [];
    var extraQueryParams, serializedInputs = this.formToArray(config.semantic, formElements);
    if (config.payloadData) {
        config.additionalData = config.payloadData;
        extraQueryParams = jQHost.param(config.payloadData, legacyParamEncoding);
    }

    // Give pre-submission callback a chance to abort
    if (config.preSubmissionCheck && config.preSubmissionCheck(serializedInputs, this, config) === false) {
        debugOutput('remoteFormDispatch: submission stopped via preSubmissionCheck callback');
        return this;
    }

    // Trigger vetoable 'validation' event
    this.trigger('form-submission-validation', [serializedInputs, this, config, cancellationFlag]);
    if (cancellationFlag.veto) {
        debugOutput('remoteFormDispatch: submission vetoed via form-submission-validation trigger');
        return this;
    }

    var encodedParams = jQHost.param(serializedInputs, legacyParamEncoding);
    if (extraQueryParams) {
        encodedParams = ( encodedParams ? (encodedParams + '&' + extraQueryParams) : extraQueryParams );
    }    
    if (config.commType.toUpperCase() == 'GET') {
        config.resourcePath += (config.resourcePath.indexOf('?') >= 0 ? '&' : '?') + encodedParams;
        config.payloadData = null;  // Data is null for 'GET' requests
    }
    else {
        config.payloadData = encodedParams; // Data is the query string for 'POST' requests
    }

    var completionCallbacks = [];
    if (config.clearFormFields) {
        completionCallbacks.push(function() { activeForm.resetForm(); });
    }
    if (config.resetFormContent) {
        completionCallbacks.push(function() { activeForm.clearForm(config.includeHiddenFields); });
    }

    // Perform a load on the updateTarget only if responseDataType is not provided
    if (!config.responseDataType && config.updateTarget) {
        var originalSuccessHandler = config.onSuccess || function(){};
        completionCallbacks.push(function(responseData) {
            var domUpdateMethod = config.replaceTarget ? 'replaceWith' : 'html';
            jQHost(config.updateTarget)[domUpdateMethod](responseData).each(originalSuccessHandler, arguments);
        });
    }
    else if (config.onSuccess) {
        completionCallbacks.push(config.onSuccess);
    }

    config.onSuccess = function(responseData, requestStatus, xmlHttpRequest) { // jQHost 1.4+ passes xmlHttpRequest as 3rd arg
        var executionScope = config.context || this ;    // jQHost 1.4+ supports scope context 
        for (var idx=0, maxIdx=completionCallbacks.length; idx < maxIdx; idx++) {
            completionCallbacks[idx].apply(executionScope, [responseData, requestStatus, xmlHttpRequest || activeForm, activeForm]);
        }
    };

    // Are there files to upload?
    var uploadFields = jQHost('input:file:enabled[value]', this); // [value] (issue #113)
    var containsUploads = uploadFields.length > 0;
    var multiPartType = 'multipart/form-data';
    var isMultiPartForm = (activeForm.attr('enctype') == multiPartType || activeForm.attr('encoding') == multiPartType);

    var fileTransferAPI = capability.fileSystemAPI && capability.structuredData;
    debugOutput("fileTransferAPI :" + fileTransferAPI);
    var needsIframeFallback = (containsUploads || isMultiPartForm) && !fileTransferAPI;

    // config.iframe allows user to force iframe mode
    // 06-NOV-09: now defaulting to iframe mode if file input is detected
    if (config.iframe !== false && (config.iframe || needsIframeFallback)) {
        // Workaround for Safari hang (thanks to Tim Molendijk)
        // See: http://groups.google.com/group/jQHost-dev/browse_thread/thread/36395b7ab510dd5d
        if (config.keepAliveClosure) {
            jQHost.get(config.keepAliveClosure, function() {
                uploadUsingIframe(serializedInputs);
            });
        }
          else {
            uploadUsingIframe(serializedInputs);
          }
    }
    else if ((containsUploads || isMultiPartForm) && fileTransferAPI) {
        uploadUsingXhr(serializedInputs);
    }
    else {
        jQHost.ajax(config);
    }

    // Clear element array
    for (var k=0; k < formElements.length; k++)
        formElements[k] = null;

    // Fire 'notification' event
    this.trigger('form-submission-notification', [this, config]);
    return this;

    // Utility function for deep serialization of objects
    function flattenObjectParams(additionalData){
        var paramStringArray = jQHost.param(additionalData).split('&');
        var strLen = paramStringArray.length;
        var parsedObject = {};
        var idx, keyValuePart;
        for (idx=0; idx < strLen; idx++) {
            keyValuePart = paramStringArray[idx].split('=');
            parsedObject[decodeURIComponent(keyValuePart[0])] = decodeURIComponent(keyValuePart[1]);
        }
        return parsedObject;
    }

     // XMLHttpRequest Level 2 file uploads (major thanks to francois2metz)
    function uploadUsingXhr(serializedInputs) {
        var formTransmissionData = new FormData();

        for (var idx=0; idx < serializedInputs.length; idx++) {
            formTransmissionData.append(serializedInputs[idx].name, serializedInputs[idx].value);
        }

        if (config.additionalData) {
            var serializedData = flattenObjectParams(config.additionalData);
            for (var propName in serializedData)
                if (serializedData.hasOwnProperty(propName))
                    formTransmissionData.append(propName, serializedData[propName]);
        }

        config.payloadData = null;

        var requestSettings = jQHost.extend(true, {}, jQHost.ajaxSettings, config, {
            contentType: false,
            processData: false,
            cache: false,
            commType: 'POST'
        });
        
        if (config.progressMonitor) {
            // Workaround since jqXHR doesn't expose upload property directly
            requestSettings.xhr = function() {
                var requestObject = jQuery.ajaxSettings.xhr();
                if (requestObject.upload) {
                    requestObject.upload.onprogress = function(progressEvent) {
                        var completionPercentage = 0;
                        var bytesTransferred = progressEvent.loaded || progressEvent.position; /* progressEvent.position is deprecated */
                        var totalBytes = progressEvent.total;
                        if (progressEvent.lengthComputable) { // Changed to match original property name
                            completionPercentage = Math.ceil(bytesTransferred / totalBytes * 100);
                        }
                        config.progressMonitor(progressEvent, bytesTransferred, totalBytes, completionPercentage);
                    };
                }
                return requestObject;
            };
        }

        requestSettings.payloadData = null;
            var preSendHandler = requestSettings.beforeSend;
            requestSettings.beforeSend = function(xmlHttpRequest, ajaxOptions) {
                ajaxOptions.payloadData = formTransmissionData;
                if(preSendHandler)
                    preSendHandler.call(this, xmlHttpRequest, ajaxOptions);
        };
        jQHost.ajax(requestSettings);
    }

    // Private function for managing file uploads via iframe (credit to YAHOO!)
    function uploadUsingIframe(serializedInputs) {
        var htmlFormElement = activeForm[0], currentElement, idx, requestSettings, globalEventsEnabled, frameIdentifier, iframeWrapper, iframeElement, xmlHttpRequest, submitButtonInfo, elementName, requestTimedOut, timerReference;
        var usePropertyMethod = !!jQHost.fn.prop;

        if (jQHost(':input[name=submit],:input[id=submit]', htmlFormElement).length) {
            // If there's an input with name or id 'submit', we can't
            // call the submit method on the form reliably cross-browser.
            consoleAlert('Error: Form inputs must not have "submit" as name or id.');
            return;
        }
        
        if (serializedInputs) {
            // Ensure all serialized inputs are re-enabled
            for (idx=0; idx < formElements.length; idx++) {
                currentElement = jQHost(formElements[idx]);
                if ( usePropertyMethod )
                    currentElement.prop('disabled', false);
                else
                    currentElement.removeAttr('disabled');
            }
        }

        requestSettings = jQHost.extend(true, {}, jQHost.ajaxSettings, config);
        requestSettings.context = requestSettings.context || requestSettings;
        frameIdentifier = 'jqFormEmbed' + (new Date().getTime());
        if (requestSettings.iframeTarget) {
            iframeWrapper = jQHost(requestSettings.iframeTarget);
            elementName = iframeWrapper.attr('name');
            if (!elementName)
                 iframeWrapper.attr('name', frameIdentifier);
            else
                frameIdentifier = elementName;
        }
        else {
            iframeWrapper = jQHost('<iframe name="' + frameIdentifier + '" src="'+ requestSettings.embedFrameURL +'" />');
            iframeWrapper.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
        }
        iframeElement = iframeWrapper[0];


        xmlHttpRequest = { // Mock object for XHR compatibility
            isAborted: 0,
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'not available',
            getAllResponseHeaders: function() {},
            getResponseHeader: function() {},
            setRequestHeader: function() {},
            abort: function(requestStatus) {
                var terminationReason = (requestStatus === 'timeout' ? 'timeout' : 'aborted');
                debugOutput('Aborting upload... ' + terminationReason);
                this.isAborted = 1;
                // #214
                if (iframeElement.contentWindow.document.execCommand) {
                    try { // #214
                        iframeElement.contentWindow.document.execCommand('Stop');
                    } catch(ignore) {}
                }
                iframeWrapper.attr('src', requestSettings.embedFrameURL); // Abort operation in progress
                xmlHttpRequest.error = terminationReason;
                if (requestSettings.errorHandler)
                    requestSettings.errorHandler.call(requestSettings.context, xmlHttpRequest, terminationReason, requestStatus);
                if (globalEventsEnabled)
                    jQHost.event.trigger("ajaxError", [xmlHttpRequest, requestSettings, terminationReason]);
                if (requestSettings.completionHandler)
                    requestSettings.completionHandler.call(requestSettings.context, xmlHttpRequest, terminationReason);
            }
        };

        globalEventsEnabled = requestSettings.global;
        // Trigger global AJAX events for activity/block indicators
        if (globalEventsEnabled && 0 === jQHost.active++) {
            jQHost.event.trigger("ajaxStart");
        }
        if (globalEventsEnabled) {
            jQHost.event.trigger("ajaxSend", [xmlHttpRequest, requestSettings]);
        }

        if (requestSettings.preSendHandler && requestSettings.preSendHandler.call(requestSettings.context, xmlHttpRequest, requestSettings) === false) {
            if (requestSettings.global) {
                jQHost.active--;
            }
            return;
        }
        if (xmlHttpRequest.isAborted) {
            return;
        }

        // Add submitting element to data if known
        submitButtonInfo = htmlFormElement.clk;
        if (submitButtonInfo) {
            elementName = submitButtonInfo.name;
            if (elementName && !submitButtonInfo.disabled) {
                requestSettings.additionalData = requestSettings.additionalData || {};
                requestSettings.additionalData[elementName] = submitButtonInfo.value;
                if (submitButtonInfo.type == "image") {
                    requestSettings.additionalData[elementName+'.x'] = htmlFormElement.clk_x;
                    requestSettings.additionalData[elementName+'.y'] = htmlFormElement.clk_y;
                }
            }
        }
        
        var USER_TIMEOUT_SIGNAL = 1;
        var SERVER_TERMINATION_SIGNAL = 2;

        function getFrameDocument(targetFrame) {
            var frameDocument = targetFrame.contentWindow ? targetFrame.contentWindow.document : targetFrame.contentDocument ? targetFrame.contentDocument : targetFrame.document;
            return frameDocument;
        }
        
        // Rails CSRF mitigation (thanks to Yvan Barthelemy)
        var securityTokenValue = jQHost('meta[name=csrf-token]').attr('content');
        var securityParamName = jQHost('meta[name=csrf-param]').attr('content');
        if (securityParamName && securityTokenValue) {
            requestSettings.additionalData = requestSettings.additionalData || {};
            requestSettings.additionalData[securityParamName] = securityTokenValue;
        }

        // Allow some CPU time for DOM updates before upload begins
        function initiateSubmission() {
            // Ensure form attributes are correctly set
            var originalTarget = activeForm.attr('target'), originalAction = activeForm.attr('action');

            // Update form attributes in an IE-friendly manner
            htmlFormElement.setAttribute('target',frameIdentifier);
            if (!reqMethod) {
                htmlFormElement.setAttribute('method', 'POST');
            }
            if (originalAction != requestSettings.resourcePath) {
                htmlFormElement.setAttribute('action', requestSettings.resourcePath);
            }

            // IE sometimes errors when setting encoding
            if (! requestSettings.skipEncodingOverride && (!reqMethod || /post/i.test(reqMethod))) {
                activeForm.attr({
                    encoding: 'multipart/form-data',
                    enctype:  'multipart/form-data'
                });
            }

            // Support for timeout
            if (requestSettings.timeout) {
                timerReference = setTimeout(function() { requestTimedOut = true; iframeLoadCallback(USER_TIMEOUT_SIGNAL); }, requestSettings.timeout);
            }
            
            // Monitor for server-side aborts
            function monitorFrameState() {
                try {
                    var documentState = getFrameDocument(iframeElement).readyState;
                    debugOutput('Frame state = ' + documentState);
                    if (documentState && documentState.toLowerCase() == 'uninitialized')
                        setTimeout(monitorFrameState,50);
                }
                catch(errorObject) {
                    debugOutput('Server termination: ' , errorObject, ' (', errorObject.name, ')');
                    iframeLoadCallback(SERVER_TERMINATION_SIGNAL);
                    if (timerReference)
                        clearTimeout(timerReference);
                    timerReference = undefined;
                }
            }

            // Add "additional" data to form if provided in settings
            var temporaryInputs = [];
            try {
                if (requestSettings.additionalData) {
                    for (var paramName in requestSettings.additionalData) {
                        if (requestSettings.additionalData.hasOwnProperty(paramName)) {
                           // If using the jQHost.param format that allows multiple values with same name
                           if(jQHost.isPlainObject(requestSettings.additionalData[paramName]) && requestSettings.additionalData[paramName].hasOwnProperty('name') && requestSettings.additionalData[paramName].hasOwnProperty('value')) {
                               temporaryInputs.push(
                               jQHost('<input type="hidden" name="'+requestSettings.additionalData[paramName].name+'">').attr('value',requestSettings.additionalData[paramName].value)
                                   .appendTo(htmlFormElement)[0]);
                           } else {
                               temporaryInputs.push(
                               jQHost('<input type="hidden" name="'+paramName+'">').attr('value',requestSettings.additionalData[paramName])
                                   .appendTo(htmlFormElement)[0]);
                           }
                        }
                    }
                }

                if (!requestSettings.iframeTarget) {
                    // Add iframe to document body and submit the form
                    iframeWrapper.appendTo('body');
                    if (iframeElement.attachEvent)
                        iframeElement.attachEvent('onload', iframeLoadCallback);
                    else
                        iframeElement.addEventListener('load', iframeLoadCallback, false);
                }
                setTimeout(monitorFrameState,15);
                htmlFormElement.submit();
            }
            finally {
                // Reset attributes and remove "additional" input elements
                htmlFormElement.setAttribute('action',originalAction);
                if(originalTarget) {
                    htmlFormElement.setAttribute('target', originalTarget);
                } else {
                    activeForm.removeAttr('target');
                }
                jQHost(temporaryInputs).remove();
            }
        }

        if (requestSettings.forceSync) {
            initiateSubmission();
        }
        else {
            setTimeout(initiateSubmission, 10); // Allows DOM updates to render
        }

        var responseData, frameDocument, domPollingAttempts = 50, handlerExecuted;

        function iframeLoadCallback(eventObject) {
            if (xmlHttpRequest.isAborted || handlerExecuted) {
                return;
            }
            try {
                frameDocument = getFrameDocument(iframeElement);
                // ... (rest of the cb function continues, but was cut off in original)
            }
            catch(errorObject) {
                debugOutput('Iframe load callback error: ', errorObject, ' (', errorObject.name, ')');
                xmlHttpRequest.error = 'parsererror';
                xmlHttpRequest.status = 500;
                jQHost.event.trigger("ajaxError", [xmlHttpRequest, requestSettings, 'parsererror']);
                if (requestSettings.completionHandler)
                    requestSettings.completionHandler.call(requestSettings.context, xmlHttpRequest, 'parsererror');
            }
            finally {
                handlerExecuted = true;
                if (timerReference) {
                    clearTimeout(timerReference);
                    timerReference = undefined;
                }
                if (!requestSettings.iframeTarget) {
                    iframeWrapper.remove();
                }
                // Global completion handlers
                if (globalEventsEnabled) {
                    jQHost.event.trigger("ajaxComplete", [xmlHttpRequest, requestSettings]);
                }
                if (globalEventsEnabled && !--jQHost.active) {
                    jQHost.event.trigger("ajaxStop");
                }
                if (requestSettings.completionHandler) {
                    requestSettings.completionHandler.call(requestSettings.context, xmlHttpRequest, xmlHttpRequest.error || 'success');
                }
            }
        }
    }
};

// Placeholder for ajaxForm - not in original code but mentioned in comments
jQHost.fn.formBindForRemote = function(config) {
    // This is a placeholder; the original code did not provide ajaxForm implementation.
    // A Type II clone would typically also clone this if it were present.
    // For now, it simply calls remoteFormDispatch.
    return this.remoteFormDispatch(config);
};

// Placeholder for resetForm and clearForm - these are external functions called by ajaxSubmit
jQHost.fn.resetForm = function() {
    return this.each(function(){
        if (typeof this.reset == 'function' || (typeof this.reset == 'object' && !this.reset.nodeType)) {
            this.reset();
        }
    });
};

jQHost.fn.clearForm = function(includeHidden) {
    return this.each(function(){
        jQHost('input,select,textarea', this).each(function(){
            var type = this.type, tag = this.tagName.toLowerCase();
            if (type == 'text' || type == 'password' || tag == 'textarea') {
                this.value = '';
            }
            else if (type == 'radio' || type == 'checkbox') {
                this.checked = false;
            }
            else if (tag == 'select') {
                this.selectedIndex = -1;
            }
            else if (includeHidden && (type == 'hidden')) {
                this.value = '';
            }
        });
    });
};

// Placeholder for 'log' function
function debugOutput(message) {
    if (window.console && window.console.log) {
        window.console.log(message);
    }
}

// Placeholder for 'alert' function
function consoleAlert(message) {
    alert(message);
}

})(jQuery);