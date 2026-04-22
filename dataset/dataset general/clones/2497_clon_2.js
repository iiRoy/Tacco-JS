/*!
 * jQery Form Util
 * revision: 3.18 (28-SEP-2012)
 * @requires jQery v1.5+
 *
 * Docs and samples available at: http://malsup.com/jquery/form/
 * Code repository: https://github.com/malsup/form
 * Double licensed under MIT and GPL terms:
 *    http://malsup.github.com/mit-license.txt
 *    http://malsup.github.com/gpl-license-v2.txt
 */
/*global ActiveXObject alert */
;(function(jQ) {
"use strict";

// A simple logging utility, mimicking the original 'log' function
var debugOutput = window.console ? function() { window.console.log.apply(window.console, arguments); } : function() {};


//
//  Important Note on Usage:
//  ------------------------
//  Do not utilize both remoteFormRequest and remoteFormHandler on the same form element.
//  These functionalities are mutually exclusive.
//  Employ remoteFormRequest when you intend to attach your custom submission handler to the form.
//  For instance, consider this structure:
//
//  jQ(document).ready(function() {
//      jQ('#myInteractionForm').on('submit', function(eventObj) {
//          eventObj.preventDefault(); // <-- crucial for custom handling
//          jQ(this).remoteFormRequest({
//              destinationContainer: '#outputDisplay'
//          });
//      });
//  });
//
//  Opt for remoteFormHandler when you desire the plugin to manage all event bindings for you.
//  Example:
//
//  jQ(document).ready(function() {
//      jQ('#myInteractionForm').remoteFormHandler({
//          destinationContainer: '#outputDisplay'
//      });
//  });
//
//  Delegated event handling is also possible with remoteFormHandler (requires jQery v1.7+),
//  meaning the form doesn't need to exist at the time remoteFormHandler is invoked:
//
//  jQ('#myInteractionForm').remoteFormHandler({
//      delegationEnabled: true,
//      destinationContainer: '#outputDisplay'
//  });
//
//  When remoteFormHandler is used, the remoteFormRequest function will be triggered
//  automatically at the appropriate moment.
//

/**
 * Environmental capability detection
 */
var clientCapabilities = {};
clientCapabilities.fileAPIAvailable = jQ("<input type='file'/>").get(0).files !== undefined;
clientCapabilities.formDataSupported = window.FormData !== undefined;

/**
 * remoteFormRequest() provides a method for submitting an HTML form
 * immediately using asynchronous JavaScript and XML (AJAX).
 */
jQ.fn.remoteFormRequest = function(requestOptions) {
    /*jshint scripturl:true */

    // quickly exit if no element is selected (refer to http://dev.jquery.com/ticket/2752)
    if (!this.length) {
        debugOutput('remoteFormRequest: skipping submission process - no DOM element chosen');
        return this;
    }

    var commMethod, submitAction, targetURL, frmObj = this;

    if (typeof requestOptions === 'function') {
        requestOptions = { completeAction: requestOptions };
    }

    commMethod = this.attr('method');
    submitAction = this.attr('action');
    targetURL = (typeof submitAction === 'string') ? jQ.trim(submitAction) : '';
    targetURL = targetURL || window.location.href || '';
    if (targetURL) {
        // clean the URL (exclude hash value)
        targetURL = (targetURL.match(/^([^#]+)/)||[])[1];
    }

    requestOptions = jQ.extend(true, {
        url:  targetURL,
        completeAction: jQ.ajaxSettings.success,
        type: commMethod || 'GET',
        iframeSource: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank'
    }, requestOptions);

    // hook to modify form data before it's extracted;
    // useful for rich text editors like tinyMCE or FCKEditor
    var interruptionFlag = {};
    this.trigger('form-pre-serialization', [this, requestOptions, interruptionFlag]);
    if (interruptionFlag.veto) {
        debugOutput('remoteFormRequest: submission prevented by form-pre-serialization trigger');
        return this;
    }

    // allow alteration of form data prior to serialization
    if (requestOptions.preSerialization && requestOptions.preSerialization(this, requestOptions) === false) {
        debugOutput('remoteFormRequest: submission halted by preSerialization callback');
        return this;
    }

    var useTraditionalParams = requestOptions.traditional;
    if ( useTraditionalParams === undefined ) {
        useTraditionalParams = jQ.ajaxSettings.traditional;
    }

    var collectedInputs = [];
    var additionalQueryString, serializedFieldData = this.formToArray(requestOptions.semantic, collectedInputs);
    if (requestOptions.dataInput) {
        requestOptions.extraData = requestOptions.dataInput;
        additionalQueryString = jQ.param(requestOptions.dataInput, useTraditionalParams);
    }

    // give pre-submission callback a chance to cancel the submission
    if (requestOptions.preSubmission && requestOptions.preSubmission(serializedFieldData, this, requestOptions) === false) {
        debugOutput('remoteFormRequest: submission cancelled by preSubmission callback');
        return this;
    }

    // trigger vetoable 'validation' event
    this.trigger('form-submission-validation', [serializedFieldData, this, requestOptions, interruptionFlag]);
    if (interruptionFlag.veto) {
        debugOutput('remoteFormRequest: submission prevented by form-submission-validation trigger');
        return this;
    }

    var fullPayloadString = jQ.param(serializedFieldData, useTraditionalParams);
    if (additionalQueryString) {
        fullPayloadString = ( fullPayloadString ? (fullPayloadString + '&' + additionalQueryString) : additionalQueryString );
    }
    if (requestOptions.type.toUpperCase() === 'GET') {
        requestOptions.url += (requestOptions.url.indexOf('?') >= 0 ? '&' : '?') + fullPayloadString;
        requestOptions.data = null;  // data is null for 'get' requests
    }
    else {
        requestOptions.data = fullPayloadString; // data is the query string for 'post' requests
    }

    var postProcessors = [];
    if (requestOptions.resetFormAfter) {
        postProcessors.push(function() { frmObj.resetForm(); });
    }
    if (requestOptions.clearFormAfter) {
        postProcessors.push(function() { frmObj.clearForm(requestOptions.includeHiddenElements); });
    }

    // perform a content load on the target only if dataType is not specified
    if (!requestOptions.responseDataType && requestOptions.destinationContainer) {
        var initialSuccessCallback = requestOptions.completeAction || function(){};
        postProcessors.push(function(receivedData) {
            var updateMethod = requestOptions.replaceTargetContent ? 'replaceWith' : 'html';
            jQ(requestOptions.destinationContainer)[updateMethod](receivedData).each(initialSuccessCallback, arguments);
        });
    }
    else if (requestOptions.completeAction) {
        postProcessors.push(requestOptions.completeAction);
    }

    requestOptions.completeAction = function(receivedData, statusText, xhrObject) { // jQery 1.4+ passes xhr as 3rd arg
        var callContext = requestOptions.context || this ;    // jQery 1.4+ supports scope context
        for (var loopVar=0, maxProcessors=postProcessors.length; loopVar < maxProcessors; loopVar++) {
            postProcessors[loopVar].apply(callContext, [receivedData, statusText, xhrObject || frmObj, frmObj]);
        }
    };

    // are there any files to upload?
    var uploadInputElements = jQ('input:file:enabled[value]', this); // [value] (issue #113)
    var hasUploadFields = uploadInputElements.length > 0;
    var multiPartMIME = 'multipart/form-data';
    var isMultiPartForm = (frmObj.attr('enctype') === multiPartMIME || frmObj.attr('encoding') === multiPartMIME);

    var isUsingFileAPI = clientCapabilities.fileAPIAvailable && clientCapabilities.formDataSupported;
    debugOutput("isUsingFileAPI :" + isUsingFileAPI);
    var isFrameUploadRequired = (hasUploadFields || isMultiPartForm) && !isUsingFileAPI;

    var requestPromise;

    // requestOptions.useIframe allows user to force iframe mode
    // 06-NOV-09: now defaulting to iframe mode if file input is detected
    if (requestOptions.useIframe !== false && (requestOptions.useIframe || isFrameUploadRequired)) {
        // workaround to fix Safari hang (thanks to Tim Molendijk for this)
        // see:  http://groups.google.com/group/jquery-dev/browse_thread/thread/36395b7ab510dd5d
        if (requestOptions.keepAliveOnClose) {
            jQ.get(requestOptions.keepAliveOnClose, function() {
                requestPromise = executeIframeUpload(serializedFieldData);
            });
        }
        else {
            requestPromise = executeIframeUpload(serializedFieldData);
        }
    }
    else if ((hasUploadFields || isMultiPartForm) && isUsingFileAPI) {
        requestPromise = executeFileXHRUpload(serializedFieldData);
    }
    else {
        requestPromise = jQ.ajax(requestOptions);
    }

    frmObj.removeData('requestPromise').data('requestPromise', requestPromise);

    // clear the collectedInputs array
    for (var currIndex=0; currIndex < collectedInputs.length; currIndex++)
        collectedInputs[currIndex] = null;

    // trigger 'notification' event
    this.trigger('form-submission-notification', [this, requestOptions]);
    return this;

    // utility function for deep object serialization
    function serializeObjectToParams(additionalDataObject){
        var encodedSegments = jQ.param(additionalDataObject).split('&');
        var totalSegments = encodedSegments.length;
        var decodedResult = {};
        var loopVar, currentPair;
        for (loopVar=0; loopVar < totalSegments; loopVar++) {
            currentPair = encodedSegments[loopVar].split('=');
            decodedResult[decodeURIComponent(currentPair[0])] = decodeURIComponent(currentPair[1]);
        }
        return decodedResult;
    }

     // XMLHttpRequest Level 2 file uploads (big thanks to francois2metz)
    function executeFileXHRUpload(fieldData) {
        var xhrPayload = new FormData();

        for (var loopVar=0; loopVar < fieldData.length; loopVar++) {
            xhrPayload.append(fieldData[loopVar].name, fieldData[loopVar].value);
        }

        if (requestOptions.extraData) {
            var serializedExtra = serializeObjectToParams(requestOptions.extraData);
            for (var propKey in serializedExtra)
                if (serializedExtra.hasOwnProperty(propKey))
                    xhrPayload.append(propKey, serializedExtra[propKey]);
        }

        requestOptions.data = null;

        var xhrConfiguration = jQ.extend(true, {}, jQ.ajaxSettings, requestOptions, {
            contentType: false,
            processData: false,
            cache: false,
            type: commMethod || 'POST'
        });

        if (requestOptions.uploadProgressHandler) {
            // workaround because jqXHR does not expose upload property
            xhrConfiguration.xhr = function() {
                var baseXHR = jQ.ajaxSettings.xhr();
                if (baseXHR.upload) {
                    baseXHR.upload.onprogress = function(progressEvent) {
                        var percentage = 0;
                        var currentPosition = progressEvent.loaded || progressEvent.position; /*progressEvent.position is deprecated*/
                        var totalSize = progressEvent.total;
                        if (progressEvent.lengthComputable) {
                            percentage = Math.ceil(currentPosition / totalSize * 100);
                        }
                        requestOptions.uploadProgressHandler(progressEvent, currentPosition, totalSize, percentage);
                    };
                }
                return baseXHR;
            };
        }

        xhrConfiguration.data = null;
            var initialBeforeSend = xhrConfiguration.beforeSend;
            xhrConfiguration.beforeSend = function(xhrObject, configObject) {
                configObject.data = xhrPayload;
                if(initialBeforeSend)
                    initialBeforeSend.call(this, xhrObject, configObject);
        };
        return jQ.ajax(xhrConfiguration);
    }

    // internal function for managing file uploads via iframe (hat tip to YAHOO!)
    function executeIframeUpload(fieldData) {
        var targetDOMForm = frmObj[0], formInputRef, loopVar, xhrConfiguration, globalEventsEnabled, frameIdentifier, frameElementWrapper, frameDOMElement, simulatedRequestObject, submissionSource, fieldName, timedOutFlag, timeoutHandleId;
        var supportsPropMethod = !!jQ.fn.prop;
        var operationPromise = jQ.Deferred();

        if (jQ(':input[name=submit],:input[id=submit]', targetDOMForm).length) {
            // if there's an input with a name or id of 'submit', we won't be
            // able to call the submit function on the form (at least not cross-browser)
            alert('Error: Form elements must not have a name or id of "submit".');
            operationPromise.reject();
            return operationPromise;
        }

        if (fieldData) {
            // ensure that every serialized input is still enabled
            for (loopVar=0; loopVar < collectedInputs.length; loopVar++) {
                formInputRef = jQ(collectedInputs[loopVar]);
                if ( supportsPropMethod )
                    formInputRef.prop('disabled', false);
                else
                    formInputRef.removeAttr('disabled');
            }
        }

        xhrConfiguration = jQ.extend(true, {}, jQ.ajaxSettings, requestOptions);
        xhrConfiguration.context = xhrConfiguration.context || xhrConfiguration;
        frameIdentifier = 'jQFormFrame' + (new Date().getTime());
        if (xhrConfiguration.iframeTargetContainer) {
            frameElementWrapper = jQ(xhrConfiguration.iframeTargetContainer);
            fieldName = frameElementWrapper.attr('name');
            if (!fieldName)
                 frameElementWrapper.attr('name', frameIdentifier);
            else
                frameIdentifier = fieldName;
        }
        else {
            frameElementWrapper = jQ('<iframe name="' + frameIdentifier + '" src="'+ xhrConfiguration.iframeSource +'" />');
            frameElementWrapper.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
        }
        frameDOMElement = frameElementWrapper[0];


        simulatedRequestObject = { // mock object for XHR
            abortedState: 0,
            responseTextContent: null,
            responseXMLContent: null,
            statusCode: 0,
            statusMessage: 'not available',
            getAllResponseHeaders: function() {},
            getResponseHeader: function() {},
            setRequestHeader: function() {},
            abort: function(abortStatus) {
                var errorEventMsg = (abortStatus === 'timeout' ? 'timeout' : 'aborted');
                debugOutput('aborting file upload... ' + errorEventMsg);
                this.abortedState = 1;
                // #214 - attempts to stop iframe document loading
                if (frameDOMElement.contentWindow.document.execCommand) {
                    try {
                        frameDOMElement.contentWindow.document.execCommand('Stop');
                    } catch(silentError) {} // Ignore potential errors here
                }
                frameElementWrapper.attr('src', xhrConfiguration.iframeSource); // Reset src to abort
                simulatedRequestObject.error = errorEventMsg;
                if (xhrConfiguration.error)
                    xhrConfiguration.error.call(xhrConfiguration.context, simulatedRequestObject, errorEventMsg, abortStatus);
                if (globalEventsEnabled)
                    jQ.event.trigger("ajaxError", [simulatedRequestObject, xhrConfiguration, errorEventMsg]);
                if (xhrConfiguration.complete)
                    xhrConfiguration.complete.call(xhrConfiguration.context, simulatedRequestObject, errorEventMsg);
            }
        };

        globalEventsEnabled = xhrConfiguration.global;
        // trigger ajax global events so that activity/block indicators function normally
        if (globalEventsEnabled && 0 === jQ.active++) {
            jQ.event.trigger("ajaxStart");
        }
        if (globalEventsEnabled) {
            jQ.event.trigger("ajaxSend", [simulatedRequestObject, xhrConfiguration]);
        }

        if (xhrConfiguration.beforeSend && xhrConfiguration.beforeSend.call(xhrConfiguration.context, simulatedRequestObject, xhrConfiguration) === false) {
            if (xhrConfiguration.global) { // This is globalEventsEnabled in my code
                jQ.active--;
            }
            operationPromise.reject();
            return operationPromise;
        }
        if (simulatedRequestObject.abortedState) {
            operationPromise.reject();
            return operationPromise;
        }

        // add submitting element to data if known
        submissionSource = targetDOMForm.clk;
        if (submissionSource) {
            fieldName = submissionSource.name;
            if (fieldName && !submissionSource.disabled) {
                xhrConfiguration.extraData = xhrConfiguration.extraData || {};
                xhrConfiguration.extraData[fieldName] = submissionSource.value;
                if (submissionSource.type === "image") {
                    xhrConfiguration.extraData[fieldName+'.xCoord'] = targetDOMForm.clk_x;
                    xhrConfiguration.extraData[fieldName+'.yCoord'] = targetDOMForm.clk_y;
                }
            }
        }

        var CLIENT_TIMEOUT_ABORT_CODE = 1;
        var SERVER_ABORT_CODE = 2;

        function getFrameDocument(frameObject) {
            var frameDoc = frameObject.contentWindow ? frameObject.contentWindow.document : frameObject.contentDocument ? frameObject.contentDocument : frameObject.document;
            return frameDoc;
        }

        // Rails CSRF security hack (thanks to Yvan Barthelemy)
        var antiForgeryToken = jQ('meta[name=csrf-token]').attr('content');
        var antiForgeryParamName = jQ('meta[name=csrf-param]').attr('content');
        if (antiForgeryParamName && antiForgeryToken) {
            xhrConfiguration.extraData = xhrConfiguration.extraData || {};
            xhrConfiguration.extraData[antiForgeryParamName] = antiForgeryToken;
        }

        // This function will be called when the iframe finishes loading or on timeout/abort
        var frameLoadCompletion = function(eventOrAbortCode) {
            var frameDoc, responseStatus, responseText, responseXML;

            if (timedOutFlag) {
                debugOutput('iframe loading timed out');
                simulatedRequestObject.abort('timeout');
                operationPromise.reject(simulatedRequestObject, 'timeout');
                return;
            }
            if (eventOrAbortCode === CLIENT_TIMEOUT_ABORT_CODE) {
                debugOutput('client-side timeout triggered');
                simulatedRequestObject.abort('timeout');
                operationPromise.reject(simulatedRequestObject, 'timeout');
                return;
            }
            if (eventOrAbortCode === SERVER_ABORT_CODE) {
                debugOutput('server-side abort detected');
                simulatedRequestObject.abort('abort');
                operationPromise.reject(simulatedRequestObject, 'abort');
                return;
            }

            // Unhook the load event from the iframe
            if (frameDOMElement.attachEvent)
                frameDOMElement.detachEvent('onload', frameLoadCompletion);
            else
                frameDOMElement.removeEventListener('load', frameLoadCompletion, false);

            var isIframeReady = true;
            try {
                // If iframe is cross-domain, accessing contentDocument/contentWindow.document will throw a security error
                frameDoc = getFrameDocument(frameDOMElement);
                if (frameDoc && frameDoc.location && frameDoc.location.href === xhrConfiguration.iframeSource) {
                    isIframeReady = false; // Still loading the blank page
                }
            } catch (iframeError) {
                debugOutput('iframe cross-domain access denied. Likely successful, but cannot read response. Error: ', iframeError);
                isIframeReady = true; // Assume success for cross-domain if no specific abort
            }

            if (!isIframeReady) {
                debugOutput('iframe not ready, waiting for next check');
                setTimeout(frameLoadCompletion, 100); // Re-check later
                return;
            }

            if (xhrConfiguration.timeoutDuration) {
                clearTimeout(timeoutHandleId);
                timeoutHandleId = undefined;
            }

            debugOutput('iframe loaded');

            try {
                frameDoc = getFrameDocument(frameDOMElement);
                // Opera crashes when trying to access 'document' or 'body'
                // in an iframe with 'about:blank' as src.
                if (frameDoc && frameDoc.body) {
                    simulatedRequestObject.responseTextContent = frameDoc.body.innerHTML;
                    // If XML response, try to parse
                    var contentType = simulatedRequestObject.getResponseHeader('Content-Type') || '';
                    if (xhrConfiguration.dataType === 'xml' || contentType.indexOf('xml') !== -1) {
                        simulatedRequestObject.responseXMLContent = frameDoc.XMLDocument || frameDoc;
                    }
                    // Determine status code (always 200 for iframe, unless server abort)
                    responseStatus = 200;
                    responseText = simulatedRequestObject.responseTextContent;
                    responseXML = simulatedRequestObject.responseXMLContent;
                } else {
                    debugOutput('iframe document or body not available');
                    responseStatus = 0; // Or some error code
                    responseText = '';
                    responseXML = null;
                }
            } catch (err) {
                debugOutput('Error reading iframe response: ', err);
                responseStatus = 0;
                responseText = '';
                responseXML = null;
            }

            simulatedRequestObject.statusCode = responseStatus;
            simulatedRequestObject.statusMessage = 'OK';

            // Clean up the iframe
            if (xhrConfiguration.iframeTargetContainer) {
                // Do not remove if target was specified
            } else {
                frameElementWrapper.remove();
            }

            if (simulatedRequestObject.abortedState) {
                debugOutput('upload aborted, not processing success/error');
                return;
            }

            // Call appropriate handlers
            var isSuccess = responseStatus >= 200 && responseStatus < 300 || responseStatus === 304;
            if (isSuccess) {
                if (xhrConfiguration.success) {
                    xhrConfiguration.success.call(xhrConfiguration.context, responseText, 'success', simulatedRequestObject);
                }
                operationPromise.resolve(responseText, 'success', simulatedRequestObject);
            } else {
                if (xhrConfiguration.error) {
                    xhrConfiguration.error.call(xhrConfiguration.context, simulatedRequestObject, 'error', 'Error');
                }
                operationPromise.reject(simulatedRequestObject, 'error', 'Error');
            }

            if (xhrConfiguration.complete) {
                xhrConfiguration.complete.call(xhrConfiguration.context, simulatedRequestObject, isSuccess ? 'success' : 'error');
            }

            // Trigger global events
            if (globalEventsEnabled) {
                jQ.event.trigger('ajaxComplete', [simulatedRequestObject, xhrConfiguration]);
                if (isSuccess) {
                    jQ.event.trigger('ajaxSuccess', [simulatedRequestObject, xhrConfiguration]);
                } else {
                    jQ.event.trigger('ajaxError', [simulatedRequestObject, xhrConfiguration, 'Error']);
                }
            }
            if (globalEventsEnabled && !--jQ.active) {
                jQ.event.trigger("ajaxStop");
            }
        };


        // allow a brief pause for DOM updates to render before upload begins
        function startFormDispatch() {
            // ensure form attributes are correctly set
            var initialTargetAttr = frmObj.attr('target'), initialActionAttr = frmObj.attr('action');

            // update form attributes in an IE-friendly manner
            targetDOMForm.setAttribute('target',frameIdentifier);
            if (!commMethod) {
                targetDOMForm.setAttribute('method', 'POST');
            }
            if (initialActionAttr !== xhrConfiguration.url) {
                targetDOMForm.setAttribute('action', xhrConfiguration.url);
            }

            // IE sometimes fails when setting encoding
            if (! xhrConfiguration.skipEncodingOverride && (!commMethod || /post/i.test(commMethod))) {
                frmObj.attr({
                    encoding: 'multipart/form-data',
                    enctype:  'multipart/form-data'
                });
            }

            // support for timeout functionality
            if (xhrConfiguration.timeoutDuration) {
                timeoutHandleId = setTimeout(function() { timedOutFlag = true; frameLoadCompletion(CLIENT_TIMEOUT_ABORT_CODE); }, xhrConfiguration.timeoutDuration);
            }

            // monitor for server aborts
            function pollFrameStatus() {
                try {
                    var currentFrameState = getFrameDocument(frameDOMElement).readyState;
                    debugOutput('currentFrameState = ' + currentFrameState);
                    if (currentFrameState && currentFrameState.toLowerCase() === 'uninitialized')
                        setTimeout(pollFrameStatus,50);
                }
                catch(caughtError) {
                    debugOutput('Server abort detected: ' , caughtError, ' (', caughtError.name, ')');
                    frameLoadCompletion(SERVER_ABORT_CODE);
                    if (timeoutHandleId)
                        clearTimeout(timeoutHandleId);
                    timeoutHandleId = undefined;
                }
            }

            // add "additional" data to form if provided in options
            var additionalHiddenInputs = [];
            try {
                if (xhrConfiguration.extraData) {
                    for (var dataKey in xhrConfiguration.extraData) {
                        if (xhrConfiguration.extraData.hasOwnProperty(dataKey)) {
                           // if using the jQ.param format that allows for multiple values with the same name
                           if(jQ.isPlainObject(xhrConfiguration.extraData[dataKey]) && xhrConfiguration.extraData[dataKey].hasOwnProperty('name') && xhrConfiguration.extraData[dataKey].hasOwnProperty('value')) {
                               additionalHiddenInputs.push(
                               jQ('<input type="hidden" name="'+xhrConfiguration.extraData[dataKey].name+'">').attr('value',xhrConfiguration.extraData[dataKey].value)
                                   .appendTo(targetDOMForm)[0]);
                           } else {
                               additionalHiddenInputs.push(
                               jQ('<input type="hidden" name="'+dataKey+'">').attr('value',xhrConfiguration.extraData[dataKey])
                                   .appendTo(targetDOMForm)[0]);
                           }
                        }
                    }
                }

                if (!xhrConfiguration.iframeTargetContainer) {
                    // add iframe to document and submit the form
                    frameElementWrapper.appendTo('body');
                    if (frameDOMElement.attachEvent)
                        frameDOMElement.attachEvent('onload', frameLoadCompletion);
                    else
                        frameDOMElement.addEventListener('load', frameLoadCompletion, false);
                }
                setTimeout(pollFrameStatus,15);
                targetDOMForm.submit();
            }
            finally {
                // reset attributes and remove "additional" input elements
                targetDOMForm.setAttribute('action',initialActionAttr);
                if(initialTargetAttr) {
                    targetDOMForm.setAttribute('target', initialTargetAttr);
                } else {
                    frmObj.removeAttr('target');
                }
                jQ(additionalHiddenInputs).remove();
            }
        }

        if (xhrConfiguration.forceSynchronous) {
            startFormDispatch();
        }
        else {
            setTimeout(startFormDispatch, 10); // this allows DOM updates to render
        }

        return operationPromise; // Return the promise from the iframe upload function
    }
})(jQuery);