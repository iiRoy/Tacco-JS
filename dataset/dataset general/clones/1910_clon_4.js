(function() {
"use strict";

// Internal facility for logging debug messages.
// Replaces the 'log' function from the original.
function provideDebugOutput(messageLine) {
    if (typeof console !== 'undefined' && console.log) {
        console.log('[SubmissionUtility] ' + messageLine);
    }
}

// Core DOM manipulation and event dispatching functionalities.
// Replaces jQuery's '$' selector and manipulation methods.
const domOperations = {
    // Finds the first element matching a CSS selector.
    locateElement: function(cssSelector, parentContext = document) {
        return parentContext.querySelector(cssSelector);
    },
    // Finds all elements matching a CSS selector.
    locateAllElements: function(cssSelector, parentContext = document) {
        return Array.from(parentContext.querySelectorAll(cssSelector));
    },
    // Constructs a new DOM element.
    buildElement: function(tagName, elementAttributes = {}) {
        const newElement = document.createElement(tagName);
        for (const attributeKey in elementAttributes) {
            if (elementAttributes.hasOwnProperty(attributeKey)) {
                newElement.setAttribute(attributeKey, elementAttributes[attributeKey]);
            }
        }
        return newElement;
    },
    // Assigns an attribute to a DOM element.
    setElementAttribute: function(targetElement, attributeName, attributeValue) {
        if (targetElement) targetElement.setAttribute(attributeName, attributeValue);
    },
    // Retrieves an attribute from a DOM element.
    getElementAttribute: function(targetElement, attributeName) {
        return targetElement ? targetElement.getAttribute(attributeName) : null;
    },
    // Removes an attribute from a DOM element.
    removeElementAttribute: function(targetElement, attributeName) {
        if (targetElement) targetElement.removeAttribute(attributeName);
    },
    // Attaches a child element to a parent.
    attachChild: function(parentElement, childElement) {
        if (parentElement && childElement) parentElement.appendChild(childElement);
    },
    // Detaches an element from the DOM.
    detachElement: function(targetElement) {
        if (targetElement && targetElement.parentNode) targetElement.parentNode.removeChild(targetElement);
    },
    // Updates the inner HTML content of an element.
    updateElementHtml: function(targetElement, htmlContent) {
        if (targetElement) targetElement.innerHTML = htmlContent;
    },
    // Replaces an element with new content.
    substituteElement: function(targetElement, newContent) {
        if (targetElement && targetElement.parentNode) {
            if (typeof newContent === 'string') {
                targetElement.outerHTML = newContent;
            } else {
                targetElement.parentNode.replaceChild(newContent, targetElement);
            }
        }
    },
    // Registers an event listener on an element.
    registerEventListener: function(targetElement, eventIdentifier, eventHandler) {
        if (targetElement) targetElement.addEventListener(eventIdentifier, eventHandler);
    },
    // Unregisters an event listener from an element.
    unregisterEventListener: function(targetElement, eventIdentifier, eventHandler) {
        if (targetElement) targetElement.removeEventListener(eventIdentifier, eventHandler);
    },
    // Fires a custom event on an element.
    dispatchCustomHook: function(targetElement, hookName, hookDetails = {}) {
        if (targetElement) {
            targetElement.dispatchEvent(new CustomEvent(hookName, {
                detail: hookDetails,
                bubbles: true,
                cancelable: true
            }));
        }
    }
};

// Detects browser capabilities for file handling.
// Replaces the 'feature' object from the original.
const runtimeCapabilities = {
    fileAPISupported: (function() {
        try {
            return typeof FileList !== 'undefined' && new FileList().files !== undefined;
        } catch (e) {
            return false;
        }
    })(),
    formDataSupported: typeof FormData !== 'undefined'
};

// Standard configuration options for form processing.
// Replaces jQuery's $.ajaxSettings and the plugin's default options.
const defaultProcessorSettings = {
    destinationUrl: null, // Replaces 'url'
    onOperationComplete: null, // Replaces 'success'
    submissionMethod: 'GET', // Replaces 'type'
    iframeFallbackSource: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
    shouldResetForm: false, // Replaces 'resetForm'
    shouldClearFields: false, // Replaces 'clearForm'
    includeHiddenDuringClear: false, // For 'clearForm'
    contentTargetSelector: null, // Replaces 'target'
    replaceContentTarget: false, // Replaces 'replaceTarget'
    preDataCollectionHook: null, // Replaces 'beforeSerialize'
    preTransmissionHook: null, // Replaces 'beforeSubmit'
    additionalRequestPayload: null, // Replaces 'data' / 'extraData'
    useTraditionalDataEncoding: false, // Replaces 'traditional'
    forceIframeMode: false, // Replaces 'iframe' option
    preventEncodingAttributeOverride: false, // Replaces 'skipEncodingOverride'
    requestTimeoutDuration: 0, // Replaces 'timeout'
    executionScope: null, // Replaces 'context'
    uploadProgressHandler: null, // Replaces 'uploadProgress'
    onOperationError: null // Custom error handler
};

/**
 * Extracts data from form input elements.
 * Replaces `$.fn.formToArray`.
 * @param {HTMLFormElement} formSource - The form element.
 * @param {boolean} includeSemanticOnly - If true, filters out non-data-contributing elements like buttons.
 * @returns {Array<Object>} An array of objects, each with 'name' and 'value'.
 */
function extractFormDataItems(formSource, includeSemanticOnly) {
    const dataRecords = [];
    const formControls = formSource.elements;

    for (let currentIdx = 0; currentIdx < formControls.length; currentIdx++) {
        const control = formControls[currentIdx];
        const controlName = domOperations.getElementAttribute(control, 'name');

        if (!controlName || control.disabled) {
            continue;
        }

        const controlType = control.type;
        const controlTag = control.tagName.toLowerCase();

        if (includeSemanticOnly && (controlTag === 'button' || (controlTag === 'input' && (controlType === 'submit' || controlType === 'reset' || controlType === 'button')))) {
            continue;
        }

        if (controlType === 'radio' || controlType === 'checkbox') {
            if (!control.checked) {
                continue;
            }
        } else if (controlTag === 'select') {
            if (control.multiple) {
                for (let optIdx = 0; optIdx < control.options.length; optIdx++) {
                    if (control.options[optIdx].selected) {
                        dataRecords.push({ name: controlName, value: control.options[optIdx].value });
                    }
                }
                continue;
            }
        }
        
        dataRecords.push({ name: controlName, value: control.value });
    }
    return dataRecords;
}

/**
 * Converts an array of name-value objects into a URL-encoded string.
 * Replaces `$.param`.
 * @param {Array<Object>} dataItems - Array of {name: string, value: string} objects.
 * @param {boolean} isTraditionalEncoding - Whether to use traditional serialization.
 * @returns {string} The URL-encoded string.
 */
function constructUrlEncodedString(dataItems, isTraditionalEncoding) {
    const segments = [];
    
    for (let i = 0; i < dataItems.length; i++) {
        const item = dataItems[i];
        const encodedName = encodeURIComponent(item.name);

        if (Array.isArray(item.value)) {
            for (let j = 0; j < item.value.length; j++) {
                segments.push(encodedName + (isTraditionalEncoding ? '' : '[]') + '=' + encodeURIComponent(item.value[j]));
            }
        } else {
            segments.push(encodedName + '=' + encodeURIComponent(item.value));
        }
    }
    return segments.join('&');
}

/**
 * Resets a form to its initial state.
 * Replaces `$.fn.resetForm`.
 * @param {HTMLFormElement} targetForm - The form element.
 */
function restoreFormInitialState(targetForm) {
    if (targetForm && typeof targetForm.reset === 'function') {
        targetForm.reset();
        provideDebugOutput('Form state restored.');
    }
}

/**
 * Clears the values of form input fields.
 * Replaces `$.fn.clearForm`.
 * @param {HTMLFormElement} targetForm - The form element.
 * @param {boolean} includeHiddenFields - Whether to clear hidden inputs.
 */
function emptyFormInputValues(targetForm, includeHiddenFields) {
    if (!targetForm) return;

    for (let i = 0; i < targetForm.elements.length; i++) {
        const inputField = targetForm.elements[i];
        const fieldType = inputField.type;
        const fieldTag = inputField.tagName.toLowerCase();

        if (inputField.disabled || (!includeHiddenFields && fieldType === 'hidden')) {
            continue;
        }

        if (fieldType === 'text' || fieldType === 'password' || fieldType === 'email' || fieldType === 'url' || fieldTag === 'textarea') {
            inputField.value = '';
        } else if (fieldType === 'checkbox' || fieldType === 'radio') {
            inputField.checked = false;
        } else if (fieldTag === 'select') {
            inputField.selectedIndex = -1;
            for (let j = 0; j < inputField.options.length; j++) {
                inputField.options[j].selected = false;
            }
        }
    }
    provideDebugOutput('Form input values emptied.');
}

/**
 * Manages standard XMLHttpRequest submission (no file uploads).
 * @param {HTMLFormElement} formReference - The form element.
 * @param {string} dataPayloadString - The URL-encoded data.
 * @param {Object} currentConfiguration - Processed submission settings.
 * @returns {Promise<any>} A promise resolving with response data or rejecting with an error.
 */
function dispatchStandardXhrRequest(formReference, dataPayloadString, currentConfiguration) {
    return new Promise((completion, failure) => {
        const requestClient = new XMLHttpRequest();
        let requestDestination = currentConfiguration.destinationUrl;
        let httpMethod = currentConfiguration.submissionMethod.toUpperCase();
        let requestBody = null;

        if (httpMethod === 'GET') {
            requestDestination += (requestDestination.indexOf('?') >= 0 ? '&' : '?') + dataPayloadString;
        } else {
            requestBody = dataPayloadString;
        }

        requestClient.open(httpMethod, requestDestination, true);
        requestClient.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

        requestClient.onload = function() {
            if (requestClient.status >= 200 && requestClient.status < 300) {
                completion(requestClient.responseText);
            } else {
                failure(new Error(`HTTP request failed! Status: ${requestClient.status}`));
            }
        };

        requestClient.onerror = function() {
            failure(new Error('Network connectivity or Cross-Origin Request blocked.'));
        };

        requestClient.ontimeout = function() {
            failure(new Error('Request execution timed out.'));
        };

        if (currentConfiguration.requestTimeoutDuration > 0) {
            requestClient.timeout = currentConfiguration.requestTimeoutDuration;
        }

        requestClient.send(requestBody);
        provideDebugOutput(`Standard XHR dispatched to ${requestDestination} using method ${httpMethod}.`);
    });
}

/**
 * Manages XMLHttpRequest submission with file uploads using FormData.
 * @param {HTMLFormElement} formReference - The form element.
 * @param {Array<Object>} gatheredFieldData - Array of form field data.
 * @param {Object} currentConfiguration - Processed submission settings.
 * @returns {Promise<any>} A promise resolving with response data or rejecting with an error.
 */
function dispatchFormDataXhrRequest(formReference, gatheredFieldData, currentConfiguration) {
    return new Promise((completion, failure) => {
        const requestClient = new XMLHttpRequest();
        const dataEnvelope = new FormData();

        // Incorporate regular form fields
        gatheredFieldData.forEach(item => {
            dataEnvelope.append(item.name, item.value);
        });

        // Incorporate file inputs
        domOperations.locateAllElements('input[type="file"]', formReference).forEach(fileInputField => {
            if (fileInputField.name && fileInputField.files && fileInputField.files.length > 0) {
                for (let i = 0; i < fileInputField.files.length; i++) {
                    dataEnvelope.append(fileInputField.name, fileInputField.files[i]);
                }
            }
        });

        // Incorporate additional request payload
        if (currentConfiguration.additionalRequestPayload) {
            for (const key in currentConfiguration.additionalRequestPayload) {
                if (currentConfiguration.additionalRequestPayload.hasOwnProperty(key)) {
                    dataEnvelope.append(key, currentConfiguration.additionalRequestPayload[key]);
                }
            }
        }

        requestClient.open('POST', currentConfiguration.destinationUrl, true);

        if (currentConfiguration.uploadProgressHandler && requestClient.upload) {
            requestClient.upload.onprogress = function(event) {
                let percentage = 0;
                if (event.lengthComputable) {
                    percentage = Math.floor((event.loaded / event.total) * 100);
                }
                currentConfiguration.uploadProgressHandler(event, event.loaded, event.total, percentage);
            };
        }

        requestClient.onload = function() {
            if (requestClient.status >= 200 && requestClient.status < 300) {
                completion(requestClient.responseText);
            } else {
                failure(new Error(`HTTP request failed! Status: ${requestClient.status}`));
            }
        };

        requestClient.onerror = function() {
            failure(new Error('Network connectivity or Cross-Origin Request blocked.'));
        };

        requestClient.ontimeout = function() {
            failure(new Error('Request execution timed out.'));
        };

        if (currentConfiguration.requestTimeoutDuration > 0) {
            requestClient.timeout = currentConfiguration.requestTimeoutDuration;
        }

        requestClient.send(dataEnvelope);
        provideDebugOutput(`FormData XHR dispatched to ${currentConfiguration.destinationUrl}.`);
    });
}

/**
 * Manages form submission using a hidden iframe for file uploads.
 * @param {HTMLFormElement} formReference - The form element.
 * @param {Array<Object>} gatheredFieldData - Array of form field data (used for extra data, not direct serialization).
 * @param {Object} currentConfiguration - Processed submission settings.
 * @returns {Promise<any>} A promise resolving with response data or rejecting with an error.
 */
function dispatchIframeSubmission(formReference, gatheredFieldData, currentConfiguration) {
    return new Promise((completion, failure) => {
        const frameIdentifier = 'uploadFrame' + new Date().getTime();
        let iframeDomElement;
        let originalFormTarget = domOperations.getElementAttribute(formReference, 'target');
        let originalFormAction = domOperations.getElementAttribute(formReference, 'action');
        let originalFormMethod = domOperations.getElementAttribute(formReference, 'method');
        let originalFormEnctype = domOperations.getElementAttribute(formReference, 'enctype');
        let temporaryHiddenInputs = [];
        let timeoutTimerHandle;
        let responseProcessed = false;

        // Mock XHR-like object for compatibility with some callback signatures.
        const simulatedXHR = {
            isAborted: 0,
            responseDataText: null,
            responseDataXml: null,
            statusCode: 0,
            statusDescription: 'pending',
            retrieveAllHeaders: () => ({}),
            retrieveHeader: () => null,
            setHeader: () => {},
            initiateAbort: (reason = 'user_aborted') => {
                provideDebugOutput(`Iframe upload cancellation initiated: ${reason}`);
                simulatedXHR.isAborted = 1;
                responseProcessed = true;
                if (iframeDomElement) {
                    domOperations.setElementAttribute(iframeDomElement, 'src', currentConfiguration.iframeFallbackSource);
                }
                clearTimeout(timeoutTimerHandle);
                failure(new Error(`Iframe submission terminated: ${reason}`));
                performCleanup();
            }
        };

        // Reuse an existing iframe or create a new one.
        if (currentConfiguration.iframeTargetSelector) {
            iframeDomElement = domOperations.locateElement(currentConfiguration.iframeTargetSelector);
            if (!iframeDomElement) {
                return failure(new Error('Iframe target selector specified but no element found.'));
            }
            if (!domOperations.getElementAttribute(iframeDomElement, 'name')) {
                domOperations.setElementAttribute(iframeDomElement, 'name', frameIdentifier);
            } else {
                frameIdentifier = domOperations.getElementAttribute(iframeDomElement, 'name');
            }
        } else {
            iframeDomElement = domOperations.buildElement('iframe', {
                name: frameIdentifier,
                src: currentConfiguration.iframeFallbackSource,
                style: 'position:absolute;top:-1000px;left:-1000px;width:1px;height:1px;'
            });
            domOperations.attachChild(document.body, iframeDomElement);
        }

        const frameLoadCallback = function() {
            if (responseProcessed || simulatedXHR.isAborted) {
                provideDebugOutput('Iframe load event triggered but response already handled or aborted.');
                return;
            }

            responseProcessed = true;
            clearTimeout(timeoutTimerHandle);
            
            let frameDocument;
            try {
                frameDocument = iframeDomElement.contentWindow ? iframeDomElement.contentWindow.document :
                                (iframeDomElement.contentDocument ? iframeDomElement.contentDocument : iframeDomElement.document);
            } catch (e) {
                provideDebugOutput('Failed to access iframe document (potential cross-origin issue): ' + e.message);
                simulatedXHR.statusCode = 500;
                simulatedXHR.statusDescription = 'Iframe access error';
                failure(new Error('Iframe cross-domain access or internal problem.'));
                performCleanup();
                return;
            }

            if (!frameDocument || frameDocument.location.href === currentConfiguration.iframeFallbackSource) {
                if (!simulatedXHR.isAborted) {
                    provideDebugOutput('Iframe loaded, but document is blank or still at initial source. Assuming empty success.');
                    simulatedXHR.statusCode = 200;
                    simulatedXHR.responseDataText = '';
                    completion('');
                }
                performCleanup();
                return;
            }

            try {
                let responseContent = frameDocument.body ? frameDocument.body.innerText : null;
                let responseXml = null;

                if (!responseContent && frameDocument.body && frameDocument.body.innerHTML) {
                    responseContent = frameDocument.body.innerHTML;
                }

                if (frameDocument.XMLDocument || (frameDocument.contentType && (frameDocument.contentType.includes('xml') || frameDocument.contentType.includes('svg')))) {
                    responseXml = frameDocument;
                    responseContent = (new XMLSerializer()).serializeToString(frameDocument);
                }
                
                simulatedXHR.responseDataText = responseContent;
                simulatedXHR.responseDataXml = responseXml;
                simulatedXHR.statusCode = 200;
                simulatedXHR.statusDescription = 'OK';

                provideDebugOutput('Iframe response acquired. Status: ' + simulatedXHR.statusCode);
                completion(responseContent);

            } catch (e) {
                provideDebugOutput('Error during iframe response processing: ' + e.message);
                simulatedXHR.statusCode = 500;
                simulatedXHR.statusDescription = 'Response processing issue';
                failure(new Error('Error processing iframe response content.'));
            } finally {
                performCleanup();
            }
        };
        
        domOperations.registerEventListener(iframeDomElement, 'load', frameLoadCallback);

        // Adjust form attributes for iframe submission
        domOperations.setElementAttribute(formReference, 'target', frameIdentifier);
        domOperations.setElementAttribute(formReference, 'action', currentConfiguration.destinationUrl);
        domOperations.setElementAttribute(formReference, 'method', 'POST');

        if (!currentConfiguration.preventEncodingAttributeOverride) {
            domOperations.setElementAttribute(formReference, 'enctype', 'multipart/form-data');
            domOperations.setElementAttribute(formReference, 'encoding', 'multipart/form-data');
        }

        // Inject additional data as hidden inputs
        const combinedSupplementaryData = { ...currentConfiguration.additionalRequestPayload };

        const csrfTokenMeta = domOperations.locateElement('meta[name="csrf-token"]');
        const csrfParamMeta = domOperations.locateElement('meta[name="csrf-param"]');
        if (csrfParamMeta && csrfTokenMeta) {
            combinedSupplementaryData[domOperations.getElementAttribute(csrfParamMeta, 'content')] = domOperations.getElementAttribute(csrfTokenMeta, 'content');
        }

        for (const key in combinedSupplementaryData) {
            if (combinedSupplementaryData.hasOwnProperty(key)) {
                const hiddenField = domOperations.buildElement('input', {
                    type: 'hidden',
                    name: key,
                    value: combinedSupplementaryData[key]
                });
                domOperations.attachChild(formReference, hiddenField);
                temporaryHiddenInputs.push(hiddenField);
            }
        }

        // Implement submission timeout
        if (currentConfiguration.requestTimeoutDuration > 0) {
            timeoutTimerHandle = setTimeout(() => {
                if (!responseProcessed) {
                    provideDebugOutput('Iframe submission timeout reached.');
                    simulatedXHR.initiateAbort('timeout_limit');
                }
            }, currentConfiguration.requestTimeoutDuration);
        }

        // Trigger the form submission
        provideDebugOutput(`Iframe submission initiated to ${currentConfiguration.destinationUrl}.`);
        formReference.submit();

        function performCleanup() {
            domOperations.unregisterEventListener(iframeDomElement, 'load', frameLoadCallback);
            // Revert form attributes to original state
            if (originalFormTarget) {
                domOperations.setElementAttribute(formReference, 'target', originalFormTarget);
            } else {
                domOperations.removeElementAttribute(formReference, 'target');
            }
            if (originalFormAction) {
                domOperations.setElementAttribute(formReference, 'action', originalFormAction);
            } else {
                domOperations.removeElementAttribute(formReference, 'action');
            }
            if (originalFormMethod) {
                domOperations.setElementAttribute(formReference, 'method', originalFormMethod);
            } else {
                domOperations.removeElementAttribute(formReference, 'method');
            }
            if (originalFormEnctype) {
                domOperations.setElementAttribute(formReference, 'enctype', originalFormEnctype);
                domOperations.setElementAttribute(formReference, 'encoding', originalFormEnctype);
            } else {
                domOperations.removeElementAttribute(formReference, 'enctype');
                domOperations.removeElementAttribute(formReference, 'encoding');
            }
            // Remove any temporary hidden inputs
            temporaryHiddenInputs.forEach(input => domOperations.detachElement(input));
            // Remove iframe if it was programmatically created
            if (!currentConfiguration.iframeTargetSelector && iframeDomElement) {
                domOperations.detachElement(iframeDomElement);
            }
        }
    });
}

/**
 * Primary function for processing form submissions.
 * This acts as the entry point, replacing `$.fn.ajaxSubmit`.
 * @param {HTMLFormElement} formElementToProcess - The DOM form element to be submitted.
 * @param {Object} [configurationOptions={}] - Settings for the submission.
 * @returns {Promise<any>} A Promise that resolves with the response data or rejects with an error.
 */
function handleFormSubmission(formElementToProcess, configurationOptions = {}) {
    if (!formElementToProcess || formElementToProcess.tagName.toLowerCase() !== 'form') {
        provideDebugOutput('Invalid form element provided; must be an HTMLFormElement.');
        return Promise.reject(new Error('Invalid form element.'));
    }

    // Merge provided options with defaults.
    const currentSettings = { ...defaultProcessorSettings, ...configurationOptions };

    // Allow passing a function directly as the success callback.
    if (typeof configurationOptions === 'function') {
        currentSettings.onOperationComplete = configurationOptions;
    }

    // Determine target URL and HTTP method.
    let formActionAttribute = domOperations.getElementAttribute(formElementToProcess, 'action');
    let formMethodAttribute = domOperations.getElementAttribute(formElementToProcess, 'method');
    currentSettings.destinationUrl = currentSettings.destinationUrl || (formActionAttribute ? formActionAttribute.trim() : '');
    currentSettings.destinationUrl = currentSettings.destinationUrl || window.location.href || '';
    if (currentSettings.destinationUrl) {
        currentSettings.destinationUrl = (currentSettings.destinationUrl.match(/^([^#]+)/) || [])[1] || currentSettings.destinationUrl;
    }
    currentSettings.submissionMethod = currentSettings.submissionMethod || formMethodAttribute || 'GET';

    // Dispatch 'form-initialization' hook (replaces 'form-pre-serialize').
    const initializationVeto = { wasVetoed: false };
    domOperations.dispatchCustomHook(formElementToProcess, 'form-initialization', {
        sourceForm: formElementToProcess,
        submissionSettings: currentSettings,
        vetoStatus: initializationVeto
    });
    if (initializationVeto.wasVetoed) {
        provideDebugOutput('Submission aborted by form-initialization event.');
        return Promise.reject(new Error('Submission vetoed by initialization hook.'));
    }

    // Execute 'preDataCollectionHook' (replaces 'beforeSerialize').
    if (currentSettings.preDataCollectionHook && currentSettings.preDataCollectionHook.call(currentSettings.executionScope || currentSettings, formElementToProcess, currentSettings) === false) {
        provideDebugOutput('Submission aborted by preDataCollectionHook callback.');
        return Promise.reject(new Error('Submission aborted by preDataCollectionHook.'));
    }

    // Collect form data.
    const collectedFieldData = extractFormDataItems(formElementToProcess, true);

    // Execute 'preTransmissionHook' (replaces 'beforeSubmit').
    if (currentSettings.preTransmissionHook && currentSettings.preTransmissionHook.call(currentSettings.executionScope || currentSettings, collectedFieldData, formElementToProcess, currentSettings) === false) {
        provideDebugOutput('Submission aborted by preTransmissionHook callback.');
        return Promise.reject(new Error('Submission aborted by preTransmissionHook.'));
    }

    // Dispatch 'form-validation-check' hook (replaces 'form-submit-validate').
    const validationVeto = { wasVetoed: false };
    domOperations.dispatchCustomHook(formElementToProcess, 'form-validation-check', {
        dataItems: collectedFieldData,
        sourceForm: formElementToProcess,
        submissionSettings: currentSettings,
        vetoStatus: validationVeto
    });
    if (validationVeto.wasVetoed) {
        provideDebugOutput('Submission aborted by form-validation-check event.');
        return Promise.reject(new Error('Submission vetoed by validation hook.'));
    }

    // Determine the appropriate submission mechanism.
    const containsFileInputs = domOperations.locateAllElements('input[type="file"]:enabled', formElementToProcess).some(input => input.files && input.files.length > 0);
    const isMultipartForm = (domOperations.getElementAttribute(formElementToProcess, 'enctype') === 'multipart/form-data' || domOperations.getElementAttribute(formElementToProcess, 'encoding') === 'multipart/form-data');

    const utilizeFormData = (containsFileInputs || isMultipartForm) && runtimeCapabilities.formDataSupported;
    const utilizeIframe = currentSettings.forceIframeMode || ((containsFileInputs || isMultipartForm) && !utilizeFormData);

    let finalSubmissionPromise;

    if (utilizeIframe) {
        finalSubmissionPromise = dispatchIframeSubmission(formElementToProcess, collectedFieldData, currentSettings);
    } else if (utilizeFormData) {
        finalSubmissionPromise = dispatchFormDataXhrRequest(formElementToProcess, collectedFieldData, currentSettings);
    } else {
        const queryStringForPayload = constructUrlEncodedString(collectedFieldData, currentSettings.useTraditionalDataEncoding);
        let completeQueryString = queryStringForPayload;

        if (currentSettings.additionalRequestPayload) {
            const extraQueryString = constructUrlEncodedString(
                Object.keys(currentSettings.additionalRequestPayload).map(key => ({ name: key, value: currentSettings.additionalRequestPayload[key] })),
                currentSettings.useTraditionalDataEncoding
            );
            completeQueryString = completeQueryString ? `${completeQueryString}&${extraQueryString}` : extraQueryString;
        }

        finalSubmissionPromise = dispatchStandardXhrRequest(formElementToProcess, completeQueryString, currentSettings);
    }

    // Chain post-submission actions and callbacks.
    finalSubmissionPromise = finalSubmissionPromise.then(responsePayload => {
        const completionContext = currentSettings.executionScope || currentSettings;

        // Update target element with response content.
        if (currentSettings.contentTargetSelector && responsePayload !== undefined) {
            const targetDomElement = domOperations.locateElement(currentSettings.contentTargetSelector);
            if (targetDomElement) {
                if (currentSettings.replaceContentTarget) {
                    domOperations.substituteElement(targetDomElement, responsePayload);
                } else {
                    domOperations.updateElementHtml(targetDomElement, responsePayload);
                }
                provideDebugOutput(`Response content applied to target: ${currentSettings.contentTargetSelector}`);
            }
        }

        // Invoke the user-defined completion handler.
        if (currentSettings.onOperationComplete) {
            // Mimic jQuery's success callback signature: data, statusText, jqXHR, form
            currentSettings.onOperationComplete.call(completionContext, responsePayload, 'success', null, formElementToProcess);
        }

        // Perform form reset or field clearing if configured.
        if (currentSettings.shouldResetForm) {
            restoreFormInitialState(formElementToProcess);
        }
        if (currentSettings.shouldClearFields) {
            emptyFormInputValues(formElementToProcess, currentSettings.includeHiddenDuringClear);
        }

        return responsePayload; // Pass through the response.
    }).catch(operationError => {
        provideDebugOutput('Form submission encountered an error: ' + operationError.message);
        // Invoke user-defined error handler.
        if (currentSettings.onOperationError) {
            currentSettings.onOperationError.call(currentSettings.executionScope || currentSettings, operationError, 'error', operationError.message, formElementToProcess);
        }
        throw operationError; // Re-throw to propagate rejection.
    }).finally(() => {
        // Dispatch 'form-final-notification' hook (replaces 'form-submit-notify').
        domOperations.dispatchCustomHook(formElementToProcess, 'form-final-notification', {
            sourceForm: formElementToProcess,
            submissionSettings: currentSettings
        });
    });

    return finalSubmissionPromise;
}

// Expose the utility function globally under a unique namespace.
// Replaces the jQuery plugin pattern `$.fn.ajaxSubmit`.
window.FormSubmissionUtility = window.FormSubmissionUtility || {};
window.FormSubmissionUtility.initiateFormRequest = handleFormSubmission;

})();