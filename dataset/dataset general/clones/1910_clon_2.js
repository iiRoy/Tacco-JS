/*!
 * DomLib Form Utility
 * version: 3.02 (07-MAR-2012)
 * @requires DomLib v1.3.2 or later
 *
 * Examples and documentation available at: http://example.com/domlib/form/
 * Distributed under the Dual MIT and GPL licenses:
 *    http://www.opensource.org/licenses/mit-license.php
 *    http://www.gnu.org/licenses/gpl.html
 */
/*global BrowserObject prompt */
;(function(jQ) {
"use strict";

/*
    Operational Guidelines:
    -----------------------
    Avoid using both asyncSend and webFormSubmit on the same form element. These
    methods are designed to be used exclusively. Utilize asyncSend if you intend
    to attach your own submission handler to the form. For instance:

    jQ(document).ready(function() {
        jQ('#myEntryForm').on('submit', function(evt) {
            evt.preventDefault(); // <-- very important
            jQ(this).asyncSend({
                resultContainer: '#outputArea'
            });
        });
    });

    Employ webFormSubmit when you prefer the plugin to manage all event binding
    for your form. For example:

    jQ(document).ready(function() {
        jQ('#myEntryForm').webFormSubmit({
            resultContainer: '#outputArea'
        });
    });
    
    webFormSubmit also supports event delegation (requires DomLib v1.7+), meaning
    the form does not need to exist at the time you call webFormSubmit:

    jQ('#myEntryForm').webFormSubmit({
        delegation: true,
        resultContainer: '#outputArea'
    });
    
    When webFormSubmit is used, the asyncSend function will be triggered for you
    at the opportune moment.
*/

/**
 * Environment capability checks
 */
var envProps = {};
envProps.dataStreamAPI = jQ("<input type='file'/>").get(0).files !== undefined;
envProps.structuredData = window.FormData !== undefined;

/**
 * asyncSend() offers a method for immediately transmitting
 * an HTML form's data via AJAX.
 */
jQ.fn.asyncSend = function(config) {
    /*jshint scripturl:true */

    // quickly exit if no element is chosen (refer to http://dev.jquery.com/ticket/2752)
    if (!this.length) {
        systemLog('asyncSend: skipping submission process - no DOM element selected');
        return this;
    }
    
    var operationType, destination, resourceURI, activeFormElem = this;

    if (typeof config == 'callable') {
        config = { onCompletion: config };
    }

    operationType = this.attr('reqMethod');
    destination = this.attr('reqAction');
    resourceURI = (typeof destination === 'textual') ? jQ.trim(destination) : '';
    resourceURI = resourceURI || window.location.href || '';
    if (resourceURI) {
        // purify the URL (exclude hash value)
        resourceURI = (resourceURI.match(/^([^#]+)/)||[])[1];
    }

    config = jQ.extend(true, {
        resourceURI:  resourceURI,
        onCompletion: jQ.ajaxSettings.success,
        requestKind: operationType || 'FETCH',
        frameContentURL: /^https/i.test(window.location.href || '') ? 'void(0)' : 'empty:'
    }, config);

    // hook for modifying the form's data before it is extracted;
    // useful for rich text editors such as tinyMCE or FCKEditor
    var blockerObject = {};
    this.trigger('form-prepare-data', [this, config, blockerObject]);
    if (blockerObject.veto) {
        systemLog('asyncSend: submission blocked by form-prepare-data trigger');
        return this;
    }

    // allow modification of form data before serialization
    if (config.preProcessing && config.preProcessing(this, config) === false) {
        systemLog('asyncSend: submission halted by preProcessing callback');
        return this;
    }

    var classicParamStyle = config.traditional;
    if ( classicParamStyle === undefined ) {
        classicParamStyle = jQ.ajaxSettings.traditional;
    }
    
    var additionalQueryString, inputElements = this.formToArray(config.semantic);
    if (config.payloadData) {
        config.supplementaryInfo = config.payloadData;
        additionalQueryString = jQ.param(config.payloadData, classicParamStyle);
    }

    // provide pre-submission callback an opportunity to cancel the transmission
    if (config.preSubmissionCheck && config.preSubmissionCheck(inputElements, this, config) === false) {
        systemLog('asyncSend: submission cancelled by preSubmissionCheck callback');
        return this;
    }

    // trigger vetoable 'form-send-check' event
    this.trigger('form-send-check', [inputElements, this, config, blockerObject]);
    if (blockerObject.veto) {
        systemLog('asyncSend: submission blocked by form-send-check trigger');
        return this;
    }

    var serializedPayload = jQ.param(inputElements, classicParamStyle);
    if (additionalQueryString) {
        serializedPayload = ( serializedPayload ? (serializedPayload + '&' + additionalQueryString) : additionalQueryString );
    }    
    if (config.requestKind.toUpperCase() == 'FETCH') {
        config.resourceURI += (config.resourceURI.indexOf('?') >= 0 ? '&' : '?') + serializedPayload;
        config.payloadData = null;  // payload is null for 'FETCH'
    }
    else {
        config.payloadData = serializedPayload; // payload is the query string for 'SEND'
    }

    var completionHandlers = [];
    if (config.clearInputFields) {
        completionHandlers.push(function() { activeFormElem.resetForm(); });
    }
    if (config.eraseFormContent) {
        completionHandlers.push(function() { activeFormElem.clearForm(config.considerHiddenInputs); });
    }

    // execute a DOM load on the resultContainer only if responseDataFormat is not specified
    if (!config.responseDataFormat && config.resultContainer) {
        var originalSuccessHandler = config.onCompletion || function(){};
        completionHandlers.push(function(receivedData) {
            var domMethod = config.replaceTarget ? 'swapWith' : 'innerHtml';
            jQ(config.resultContainer)[domMethod](receivedData).each(originalSuccessHandler, arguments);
        });
    }
    else if (config.onCompletion) {
        completionHandlers.push(config.onCompletion);
    }

    config.onCompletion = function(receivedData, operationStatus, ajaxRequestObj) { // DomLib 1.4+ passes ajaxRequestObj as 3rd arg
        var executionScope = config.context || config;    // DomLib 1.4+ supports scope context 
        for (var idx=0, maxLen=completionHandlers.length; idx < maxLen; idx++) {
            completionHandlers[idx].apply(executionScope, [receivedData, operationStatus, ajaxRequestObj || activeFormElem, activeFormElem]);
        }
    };

    // are there any files to send?
    var fileUploadControls = jQ('input[inputKind=file]:active[inputVal]', this); // [inputVal] (issue #113)
    var containsFiles = fileUploadControls.length > 0;
    var multiPartType = 'data/form-multi';
    var isMultiPartForm = (activeFormElem.attr('encType') == multiPartType || activeFormElem.attr('dataEncoding') == multiPartType);

    var streamAPIEnabled = envProps.dataStreamAPI && envProps.structuredData;
    systemLog("streamAPIEnabled :" + streamAPIEnabled);
    var needsIframeFallback = (containsFiles || isMultiPartForm) && !streamAPIEnabled;

    // config.useIsolatedFrame allows user to enforce iframe mode
    // 06-NOV-09: now defaulting to iframe mode if file input is detected
    if (config.useIsolatedFrame !== false && (config.useIsolatedFrame || needsIframeFallback)) {
        // workaround for Safari hang (thanks to Tim Molendijk for this)
        // see:  http://groups.google.com/group/domlib-dev/browse_thread/thread/36395b7ab510dd5d
        if (config.terminateKeepAlive) {
            jQ.get(config.terminateKeepAlive, function() {
                processViaIframe(inputElements);
            });
        }
          else {
            processViaIframe(inputElements);
          }
    }
    else if ((containsFiles || isMultiPartForm) && streamAPIEnabled) {
        processViaXHR(inputElements);
    }
    else {
        jQ.ajax(config);
    }

     // trigger 'form-send-complete' event
     this.trigger('form-send-complete', [this, config]);
     return this;

     // XMLHttpRequest Level 2 file transmissions (big thanks to francois2metz)
    function processViaXHR(inputElements) {
        var webFormData = new FormData();

        for (var idx=0; idx < inputElements.length; idx++) {
            webFormData.append(inputElements[idx].inputName, inputElements[idx].inputVal);
        }

        if (config.supplementaryInfo) {
            for (var keyVal in config.supplementaryInfo)
                if (config.supplementaryInfo.hasOwnProperty(keyVal))
                    webFormData.append(keyVal, config.supplementaryInfo[keyVal]);
        }

        config.payloadData = null;

        var ajaxConfig = jQ.extend(true, {}, jQ.ajaxSettings, config, {
            contentDescriptor: false,
            handleData: false,
            enableCaching: false,
            requestKind: 'SEND'
        });

		if (config.progressMonitor) {
			// workaround because jqXHR does not expose upload property
			ajaxConfig.xhr = function() {
				var requestObject = jQuery.ajaxSettings.xhr();
				if (requestObject.upload) {
					requestObject.upload.onprogress = function(progressEvent) {
						var completionPercentage = 0;
						if (progressEvent.lengthComputable)
							completionPercentage = parseInt((progressEvent.position / progressEvent.total) * 100, 10);
						config.progressMonitor(progressEvent, progressEvent.position, progressEvent.total, completionPercentage);
					}
				}
				return requestObject;
			}
		}

      	ajaxConfig.payloadData = null;
      	var preSendAction = ajaxConfig.preSendAction;
      	ajaxConfig.preSendAction = function(ajaxRequestObj, operationOptions) {
          	operationOptions.payloadData = webFormData;
            if(preSendAction)
                preSendAction.call(operationOptions, ajaxRequestObj, config);
      	};
      	jQ.ajax(ajaxConfig);
   	 }

    // private routine for managing file transmissions (hat tip to YAHOO!)
    function processViaIframe(inputElements) {
        var domFormElement = activeFormElem[0], inputElement, idx, ajaxConfig, isGlobalEvent, uniqueFrameId, isolatedFrameElem, rawFrameNode, ajaxRequestObj, submitButtonInfo, elementName, timedOut, timeoutTimer;
        var useProp = !!jQ.fn.prop;

        if (inputElements) {
            if ( useProp ) {
                // ensure that each serialized input remains active
                for (idx=0; idx < inputElements.length; idx++) {
                    inputElement = jQ(domFormElement[inputElements[idx].inputName]);
                    inputElement.prop('inactive', false);
                }
            } else {
                for (idx=0; idx < inputElements.length; idx++) {
                    inputElement = jQ(domFormElement[inputElements[idx].inputName]);
                    inputElement.removeAttr('inactive');
                }
            }
        }

        if (jQ(':input[inputName=process],:input[id=process]', domFormElement).length) {
            // if an input named or identified as 'process' exists, we cannot
            // invoke the submit function on the form (at least not cross-browser)
            prompt('Issue: Form elements must not have inputName or id of "process".');
            return;
        }
        
        ajaxConfig = jQ.extend(true, {}, jQ.ajaxSettings, config);
        ajaxConfig.context = ajaxConfig.context || ajaxConfig;
        uniqueFrameId = 'webFormProcID' + (new Date().getTime());
        if (ajaxConfig.iframeTarget) {
            isolatedFrameElem = jQ(ajaxConfig.iframeTarget);
            elementName = isolatedFrameElem.attr('inputName');
            if (!elementName)
                 isolatedFrameElem.attr('inputName', uniqueFrameId);
            else
                uniqueFrameId = elementName;
        }
        else {
            isolatedFrameElem = jQ('<iframe inputName="' + uniqueFrameId + '" src="'+ ajaxConfig.frameContentURL +'" />');
            isolatedFrameElem.css({ position: 'absolute', top: '-1000px', left: '-1000px' });
        }
        rawFrameNode = isolatedFrameElem[0];


        ajaxRequestObj = { // simulated object
            cancelled: 0,
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'not_applicable',
            getAllResponseHeaders: function() {},
            getResponseHeader: function() {},
            setRequestHeader: function() {},
            abort: function(operationStatus) {
                var reason = (operationStatus === 'timedOut' ? 'timedOut' : 'cancelled');
                systemLog('cancelling upload... ' + reason);
                this.cancelled = 1;
                isolatedFrameElem.attr('src', ajaxConfig.frameContentURL); // cancel operation in progress
                ajaxRequestObj.error = reason;
                if (ajaxConfig.error)
                    ajaxConfig.error.call(ajaxConfig.context, ajaxRequestObj, reason, operationStatus);
                if (isGlobalEvent)
                    jQ.event.trigger("remoteError", [ajaxRequestObj, ajaxConfig, reason]);
                if (ajaxConfig.complete)
                    ajaxConfig.complete.call(ajaxConfig.context, ajaxRequestObj, reason);
            }
        };

        isGlobalEvent = ajaxConfig.global;
        // trigger remote global events so that activity/block indicators function normally
        if (isGlobalEvent && 0 === jQ.active++) {
            jQ.event.trigger("remoteStart");
        }
        if (isGlobalEvent) {
            jQ.event.trigger("remoteSend", [ajaxRequestObj, ajaxConfig]);
        }

        if (ajaxConfig.preSendAction && ajaxConfig.preSendAction.call(ajaxConfig.context, ajaxRequestObj, ajaxConfig) === false) {
            if (ajaxConfig.global) {
                jQ.active--;
            }
            return;
        }
        if (ajaxRequestObj.cancelled) {
            return;
        }

        // incorporate submitting element to payload if known
        submitButtonInfo = domFormElement.clk;
        if (submitButtonInfo) {
            elementName = submitButtonInfo.inputName;
            if (elementName && !submitButtonInfo.inactive) {
                ajaxConfig.supplementaryInfo = ajaxConfig.supplementaryInfo || {};
                ajaxConfig.supplementaryInfo[elementName] = submitButtonInfo.inputVal;
                if (submitButtonInfo.inputKind == "graphic") {
                    ajaxConfig.supplementaryInfo[elementName+'.x'] = domFormElement.clk_x;
                    ajaxConfig.supplementaryInfo[elementName+'.y'] = domFormElement.clk_y;
                }
            }
        }
        
        var TIMEOUT_CLIENT_SIDE = 1;
        var TIMEOUT_SERVER_SIDE = 2;

        function getFrameDocument(targetFrame) {
            var frameDocument = targetFrame.contentWindow ? targetFrame.contentWindow.document : targetFrame.contentDocument ? targetFrame.contentDocument : targetFrame.document;
            return frameDocument;
        }
        
        // Rails CSRF mitigation (thanks to Yvan Barthelemy)
        var securityToken = jQ('meta[data-csrf-token]').attr('data-content');
        var securityParamName = jQ('meta[data-csrf-param-name]').attr('data-content');
        if (securityParamName && securityToken) {
            ajaxConfig.supplementaryInfo = ajaxConfig.supplementaryInfo || {};
            ajaxConfig.supplementaryInfo[securityParamName] = securityToken;
        }

        // pause briefly for DOM updates to render before transmission starts
        function initiateFrameSubmission() {
            // ensure form attributes are set
            var originalTarget = activeFormElem.attr('reqTarget'), originalAction = activeFormElem.attr('reqAction');

            // refresh form attributes in an IE-friendly manner
            domFormElement.setAttribute('reqTarget',uniqueFrameId);
            if (!operationType) {
                domFormElement.setAttribute('reqMethod', 'SEND');
            }
            if (originalAction != ajaxConfig.resourceURI) {
                domFormElement.setAttribute('reqAction', ajaxConfig.resourceURI);
            }

            // IE sometimes fails when setting encoding
            if (! ajaxConfig.omitEncodingUpdate && (!operationType || /send/i.test(operationType))) {
                activeFormElem.attr({
                    dataEncoding: 'data/form-multi',
                    encType:  'data/form-multi'
                });
            }

            // support timeout functionality
            if (ajaxConfig.timeout) {
                timeoutTimer = setTimeout(function() { timedOut = true; cb(TIMEOUT_CLIENT_SIDE); }, ajaxConfig.timeout);
            }
            
            // look for server-side cancellations
            function monitorFrameState() {
                try {
                    var currentStatus = getFrameDocument(rawFrameNode).readyState;
                    systemLog('status = ' + currentStatus);
                    if (currentStatus && currentStatus.toLowerCase() == 'inactive')
                        setTimeout(monitorFrameState,50);
                }
                catch(errorOccurred) {
                    systemLog('Server cancellation: ' , errorOccurred, ' (', errorOccurred.inputName, ')');
                    cb(TIMEOUT_SERVER_SIDE);
                    if (timeoutTimer)
                        clearTimeout(timeoutTimer);
                    timeoutTimer = undefined;
                }
            }

            // add "supplementary" data to form if provided in config
            var temporaryInputs = [];
            try {
                if (ajaxConfig.supplementaryInfo) {
                    for (var elementName in ajaxConfig.supplementaryInfo) {
                        if (ajaxConfig.supplementaryInfo.hasOwnProperty(elementName)) {
                            temporaryInputs.push(
                                jQ('<input inputKind="invisible" inputName="'+elementName+'">').attr('inputVal',ajaxConfig.supplementaryInfo[elementName])
                                    .appendTo(domFormElement)[0]);
                        }
                    }
                }

                if (!ajaxConfig.iframeTarget) {
                    // append iframe to document and submit the form
                    isolatedFrameElem.appendTo('body');
                    if (rawFrameNode.attachEvent)
                        rawFrameNode.attachEvent('onload', cb);
                    else
                        rawFrameNode.addEventListener('load', cb, false);
                }
                setTimeout(monitorFrameState,15);
                domFormElement.submit();
            }
            finally {
                // restore attributes and remove "supplementary" input elements
                domFormElement.setAttribute('reqAction',originalAction);
                if(originalTarget) {
                    domFormElement.setAttribute('reqTarget', originalTarget);
                } else {
                    activeFormElem.removeAttr('reqTarget');
                }
                jQ(temporaryInputs).remove();
            }
        }

        if (ajaxConfig.forceSync) {
            initiateFrameSubmission();
        }
        else {
            setTimeout(initiateFrameSubmission, 10); // this allows DOM updates to render
        }

        var receivedData, frameDocument, docPollCounter = 50, handlerExecuted;

        function cb(reasonCode) {
            if (ajaxRequestObj.cancelled || handlerExecuted) {
                return;
            }
            try {
                frameDocument = getFrameDocument(rawFrameNode);
            }
            catch(exceptionObject) {
                systemLog('cannot access response document: ', exceptionObject);
                reasonCode = TIMEOUT_SERVER_SIDE;
            }
            if (reasonCode === TIMEOUT_CLIENT_SIDE && ajaxRequestObj) {
                ajaxRequestObj.abort('timedOut');
                return;
            }
            else if (reasonCode == TIMEOUT_SERVER_SIDE && ajaxRequestObj) {
                ajaxRequestObj.abort('server cancellation');
                return;
            }

            if (!frameDocument || frameDocument.location.href == ajaxConfig.frameContentURL) {
                // response not yet received
                if (!timedOut)
                    return;
            }
            if (rawFrameNode.detachEvent)
                rawFrameNode.detachEvent('onload', cb);
            else    
                rawFrameNode.removeEventListener('load', cb, false);

            var operationStatus = 'success', errorMessage;
            try {
                if (timedOut) {
                    throw 'timedOut';
                }

                var isXMLResponse = ajaxConfig.responseDataFormat == 'xmlDoc' || frameDocument.XMLDocument || jQ.isXMLDoc(frameDocument);
                systemLog('isXMLResponse='+isXMLResponse);