function submitFormAsynchronously(inputFormElement, userConfiguration) {
    let currentFormInstance = inputFormElement;

    if (!currentFormInstance || currentFormInstance.nodeType !== 1 || currentFormInstance.tagName.toLowerCase() !== 'form') {
        return Promise.reject(new Error('Invalid form element provided.'));
    }

    let finalProcessSettings = Object.assign({
        outputContainerSelector: null,
        onSuccessCompletion: null,
        onFailureHandler: null,
        beforeFormSerialization: null,
        beforeDataTransformation: null,
        beforeRequestDispatch: null,
        validateSubmission: null,
        resetFormOnSuccess: false,
        clearFieldsOnSuccess: false,
        includeHiddenFieldsInClear: false,
        additionalDataPayload: null,
        requestMethodType: currentFormInstance.getAttribute('method') || 'GET',
        submissionActionURL: currentFormInstance.getAttribute('action') || window.location.href,
        forceIframeUpload: false,
        iframeFallbackSource: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
        requestTimeoutDuration: 0,
        serializeArraysAsTraditional: false,
        expectedResponseDataType: null,
        replaceOutputContainer: false,
        requestHeaders: {}
    }, typeof userConfiguration === 'function' ? { onSuccessCompletion: userConfiguration } : userConfiguration);

    if (finalProcessSettings.submissionActionURL) {
        finalProcessSettings.submissionActionURL = (finalProcessSettings.submissionActionURL.match(/^([^#]+)/) || [])[1] || '';
    }
    finalProcessSettings.submissionActionURL = finalProcessSettings.submissionActionURL || window.location.href;

    let vetoAction = { preventOperation: false };
    if (finalProcessSettings.beforeFormSerialization && finalProcessSettings.beforeFormSerialization(currentFormInstance, finalProcessSettings, vetoAction) === false || vetoAction.preventOperation) {
        return Promise.reject(new Error('Submission aborted by pre-serialization hook.'));
    }

    let collectedFormData = extractAllFormFields(currentFormInstance);

    if (finalProcessSettings.beforeDataTransformation && finalProcessSettings.beforeDataTransformation(currentFormInstance, finalProcessSettings) === false) {
        return Promise.reject(new Error('Submission aborted by data transformation callback.'));
    }

    let additionalQueryParameters = '';
    if (finalProcessSettings.additionalDataPayload) {
        finalProcessSettings.internalExtraData = finalProcessSettings.additionalDataPayload;
        additionalQueryParameters = constructQueryStringFromObject(finalProcessSettings.additionalDataPayload, finalProcessSettings.serializeArraysAsTraditional);
    }

    if (finalProcessSettings.beforeRequestDispatch && finalProcessSettings.beforeRequestDispatch(collectedFormData, currentFormInstance, finalProcessSettings) === false) {
        return Promise.reject(new Error('Submission aborted by request dispatch callback.'));
    }

    vetoAction = { preventOperation: false };
    if (finalProcessSettings.validateSubmission && finalProcessSettings.validateSubmission(collectedFormData, currentFormInstance, finalProcessSettings, vetoAction) === false || vetoAction.preventOperation) {
        return Promise.reject(new Error('Submission aborted by validation hook.'));
    }

    let primaryQueryString = constructQueryStringFromFields(collectedFormData, finalProcessSettings.serializeArraysAsTraditional);
    if (additionalQueryParameters) {
        primaryQueryString = (primaryQueryString ? (primaryQueryString + '&' + additionalQueryParameters) : additionalQueryParameters);
    }

    if (finalProcessSettings.requestMethodType.toUpperCase() === 'GET') {
        finalProcessSettings.submissionActionURL += (finalProcessSettings.submissionActionURL.indexOf('?') >= 0 ? '&' : '?') + primaryQueryString;
        finalProcessSettings.requestBodyContent = null;
    } else {
        finalProcessSettings.requestBodyContent = primaryQueryString;
    }

    let postSubmissionSteps = [];
    if (finalProcessSettings.resetFormOnSuccess) {
        postSubmissionSteps.push(() => resetAllFormElements(currentFormInstance));
    }
    if (finalProcessSettings.clearFieldsOnSuccess) {
        postSubmissionSteps.push(() => clearAllFormElements(currentFormInstance, finalProcessSettings.includeHiddenFieldsInClear));
    }

    if (!finalProcessSettings.expectedResponseDataType && finalProcessSettings.outputContainerSelector) {
        let originalSuccessCallback = finalProcessSettings.onSuccessCompletion || (() => {});
        postSubmissionSteps.push((responsePayload, statusCodeText, requestObject, formReference) => {
            let containerElement = document.querySelector(finalProcessSettings.outputContainerSelector);
            if (containerElement) {
                if (finalProcessSettings.replaceOutputContainer) {
                    let tempWrapper = document.createElement('div');
                    tempWrapper.innerHTML = responsePayload;
                    while (tempWrapper.firstChild) {
                        containerElement.parentNode.insertBefore(tempWrapper.firstChild, containerElement);
                    }
                    containerElement.parentNode.removeChild(containerElement);
                } else {
                    containerElement.innerHTML = responsePayload;
                }
            }
            originalSuccessCallback.apply(finalProcessSettings.context || formReference, [responsePayload, statusCodeText, requestObject, formReference]);
        });
    } else if (finalProcessSettings.onSuccessCompletion) {
        postSubmissionSteps.push(finalProcessSettings.onSuccessCompletion);
    }

    finalProcessSettings.unifiedSuccessHandler = (responsePayload, statusCodeText, requestObject) => {
        let executionContext = finalProcessSettings.context || currentFormInstance;
        for (let step of postSubmissionSteps) {
            step.apply(executionContext, [responsePayload, statusCodeText, requestObject, currentFormInstance]);
        }
    };

    let hasFileInputs = checkIfFormHasFileInputs(currentFormInstance);
    let isMultiPartEncoded = currentFormInstance.getAttribute('enctype') === 'multipart/form-data' || currentFormInstance.getAttribute('encoding') === 'multipart/form-data';
    let supportsFormDataAPI = window.FormData !== undefined;
    let supportsFileObjects = (function(){ try { return document.createElement('input').files !== undefined; } catch(e) { return false; } })();

    let shouldUseIframeMode = (hasFileInputs || isMultiPartEncoded) && !(supportsFormDataAPI && supportsFileObjects);
    if (finalProcessSettings.forceIframeUpload !== false && (finalProcessSettings.forceIframeUpload || shouldUseIframeMode)) {
        return initiateIframeBasedUpload(currentFormInstance, collectedFormData, finalProcessSettings);
    } else if ((hasFileInputs || isMultiPartEncoded) && supportsFormDataAPI && supportsFileObjects) {
        return initiateXHRFormDataUpload(currentFormInstance, collectedFormData, finalProcessSettings);
    } else {
        return initiateStandardFetchRequest(currentFormInstance, finalProcessSettings);
    }
}

function checkIfFormHasFileInputs(domElement) {
    return domElement.querySelector('input[type="file"]:not([disabled])[value]') !== null;
}

function extractAllFormFields(formElement) {
    let extractedFieldObjects = [];
    let allFormElements = formElement.elements;

    for (let i = 0; i < allFormElements.length; i++) {
        let element = allFormElements[i];
        let tagLower = element.tagName.toLowerCase();
        let fieldName = element.name;

        if (!fieldName || element.disabled) {
            continue;
        }

        if (tagLower === 'input') {
            let fieldType = element.type.toLowerCase();
            if (fieldType === 'radio' || fieldType === 'checkbox') {
                if (element.checked) {
                    extractedFieldObjects.push({ elementKey: fieldName, elementValue: element.value });
                }
            } else if (fieldType !== 'file') {
                extractedFieldObjects.push({ elementKey: fieldName, elementValue: element.value });
            }
        } else if (tagLower === 'select') {
            if (element.multiple) {
                for (let j = 0; j < element.options.length; j++) {
                    if (element.options[j].selected) {
                        extractedFieldObjects.push({ elementKey: fieldName, elementValue: element.options[j].value });
                    }
                }
            } else if (element.selectedIndex !== -1) {
                extractedFieldObjects.push({ elementKey: fieldName, elementValue: element.options[element.selectedIndex].value });
            }
        } else if (tagLower === 'textarea') {
            extractedFieldObjects.push({ elementKey: fieldName, elementValue: element.value });
        }
    }
    return extractedFieldObjects;
}

function constructQueryStringFromFields(fieldObjects) {
    let queryParts = [];
    for (let field of fieldObjects) {
        queryParts.push(`${encodeURIComponent(field.elementKey)}=${encodeURIComponent(field.elementValue)}`);
    }
    return queryParts.join('&');
}

function constructQueryStringFromObject(dataObject, useTraditionalArraySerialization) {
    let queryParts = [];
    for (let key in dataObject) {
        if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
            let value = dataObject[key];
            if (Array.isArray(value)) {
                if (useTraditionalArraySerialization) {
                    for (let item of value) {
                        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
                    }
                } else {
                    for (let item of value) {
                        queryParts.push(`${encodeURIComponent(key + '[]')}=${encodeURIComponent(item)}`);
                    }
                }
            } else if (typeof value === 'object' && value !== null) {
                 for (let nestedKey in value) {
                     if (Object.prototype.hasOwnProperty.call(value, nestedKey)) {
                         queryParts.push(`${encodeURIComponent(`${key}[${nestedKey}]`)}=${encodeURIComponent(value[nestedKey])}`);
                     }
                 }
            }
            else {
                queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
            }
        }
    }
    return queryParts.join('&');
}

function resetAllFormElements(formElement) {
    formElement.reset();
}

function clearAllFormElements(formElement, includeHiddenFields) {
    for (let element of formElement.elements) {
        let tagLower = element.tagName.toLowerCase();
        let fieldType = element.type ? element.type.toLowerCase() : '';

        if (element.disabled) continue;

        if (tagLower === 'input') {
            if (fieldType === 'text' || fieldType === 'password' || fieldType === 'email' || fieldType === 'url' || fieldType === 'search' || fieldType === 'tel' || fieldType === 'number') {
                element.value = '';
            } else if (fieldType === 'checkbox' || fieldType === 'radio') {
                element.checked = false;
            } else if (fieldType === 'file') {
                element.value = '';
            } else if (fieldType === 'hidden' && includeHiddenFields) {
                element.value = '';
            }
        } else if (tagLower === 'textarea') {
            element.value = '';
        } else if (tagLower === 'select') {
            element.selectedIndex = -1;
            if (element.multiple) {
                for (let option of element.options) {
                    option.selected = false;
                }
            }
        }
    }
}

function retrieveMetaContent(metaAttributeName) {
    let metaElement = document.querySelector(`meta[name="${metaAttributeName}"]`);
    return metaElement ? metaElement.getAttribute('content') : null;
}

function initiateXHRFormDataUpload(currentForm, fieldData, settings) {
    return new Promise((resolve, reject) => {
        let httpRequest = new XMLHttpRequest();
        let requestPayload = new FormData(currentForm);

        if (settings.internalExtraData) {
            let serializedAdditional = new URLSearchParams(constructQueryStringFromObject(settings.internalExtraData, settings.serializeArraysAsTraditional));
            for (let [key, value] of serializedAdditional.entries()) {
                requestPayload.append(key, value);
            }
        }

        httpRequest.open(settings.requestMethodType, settings.submissionActionURL);

        if (settings.requestHeaders) {
            for (let headerName in settings.requestHeaders) {
                if (Object.prototype.hasOwnProperty.call(settings.requestHeaders, headerName)) {
                    httpRequest.setRequestHeader(headerName, settings.requestHeaders[headerName]);
                }
            }
        }

        let tokenForCSRF = retrieveMetaContent('csrf-token');
        let paramForCSRF = retrieveMetaContent('csrf-param');
        if (paramForCSRF && tokenForCSRF) {
            requestPayload.append(paramForCSRF, tokenForCSRF);
        }

        if (settings.onUploadProgress && httpRequest.upload) {
            httpRequest.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    let percentCalculated = Math.ceil((event.loaded / event.total) * 100);
                    settings.onUploadProgress(event, event.loaded, event.total, percentCalculated);
                }
            };
        }

        httpRequest.onreadystatechange = () => {
            if (httpRequest.readyState === 4) {
                let parsedResponse;
                let statusTextInfo = httpRequest.statusText;
                let httpStatus = httpRequest.status;

                let contentTypeHeader = httpRequest.getResponseHeader('Content-Type');
                if (settings.expectedResponseDataType === 'json' || (contentTypeHeader && contentTypeHeader.includes('application/json'))) {
                    try { parsedResponse = JSON.parse(httpRequest.responseText); } catch(e) { parsedResponse = httpRequest.responseText; }
                } else if (settings.expectedResponseDataType === 'xml' || (contentTypeHeader && contentTypeHeader.includes('text/xml'))) {
                    parsedResponse = httpRequest.responseXML;
                } else {
                    parsedResponse = httpRequest.responseText;
                }

                if (httpStatus >= 200 && httpStatus < 300 || httpStatus === 304) {
                    settings.unifiedSuccessHandler(parsedResponse, statusTextInfo, httpRequest);
                    resolve({ responseData: parsedResponse, httpStatus: httpStatus, rawRequest: httpRequest });
                } else {
                    if (settings.onFailureHandler) {
                        settings.onFailureHandler.apply(settings.context || currentForm, [httpRequest, statusTextInfo, new Error(statusTextInfo)]);
                    }
                    reject({ rawRequest: httpRequest, httpStatus: httpStatus, error: new Error(statusTextInfo) });
                }
            }
        };

        httpRequest.onerror = (e) => {
            if (settings.onFailureHandler) {
                settings.onFailureHandler.apply(settings.context || currentForm, [httpRequest, 'network error', e]);
            }
            reject({ rawRequest: httpRequest, httpStatus: 0, error: e });
        };

        if (settings.requestTimeoutDuration > 0) {
            httpRequest.timeout = settings.requestTimeoutDuration;
            httpRequest.ontimeout = () => {
                if (settings.onFailureHandler) {
                    settings.onFailureHandler.apply(settings.context || currentForm, [httpRequest, 'timeout', new Error('Request timed out')]);
                }
                reject({ rawRequest: httpRequest, httpStatus: 0, error: new Error('Request timed out') });
            };
        }

        httpRequest.send(requestPayload);
    });
}

function initiateIframeBasedUpload(currentForm, fieldData, settings) {
    return new Promise((resolve, reject) => {
        let originalFormTarget = currentForm.getAttribute('target');
        let originalFormAction = currentForm.getAttribute('action');
        let originalFormMethod = currentForm.getAttribute('method');
        let originalFormEnctype = currentForm.getAttribute('enctype');
        let originalFormEncoding = currentForm.getAttribute('encoding');

        let frameIdentification = 'submissionFrame' + (new Date().getTime());
        let frameElement;

        if (settings.outputContainerSelector) {
            frameElement = document.querySelector(settings.outputContainerSelector);
            if (!frameElement || frameElement.tagName.toLowerCase() !== 'iframe') {
                frameElement = document.createElement('iframe');
                frameElement.name = frameIdentification;
                frameElement.id = frameIdentification;
                document.body.appendChild(frameElement);
            } else {
                frameIdentification = frameElement.name || frameElement.id || frameIdentification;
                frameElement.name = frameIdentification;
                frameElement.id = frameIdentification;
            }
        } else {
            frameElement = document.createElement('iframe');
            frameElement.name = frameIdentification;
            frameElement.id = frameIdentification;
            frameElement.style.position = 'absolute';
            frameElement.style.top = '-1000px';
            frameElement.style.left = '-1000px';
            frameElement.src = settings.iframeFallbackSource;
            document.body.appendChild(frameElement);
        }

        let timeoutHandle;
        let operationAborted = false;
        let mockRequestObject = {
            aborted: 0,
            responseText: null,
            responseXML: null,
            status: 0,
            statusText: 'n/a',
            getAllResponseHeaders: () => {},
            getResponseHeader: () => {},
            setRequestHeader: () => {},
            abort: (reason) => {
                operationAborted = true;
                mockRequestObject.aborted = 1;
                try {
                    if (frameElement.contentWindow.document.execCommand) {
                        frameElement.contentWindow.document.execCommand('Stop');
                    }
                } catch(ignore) {}
                frameElement.src = settings.iframeFallbackSource;
                if (settings.onFailureHandler) {
                    settings.onFailureHandler.apply(settings.context || currentForm, [mockRequestObject, reason, new Error(reason)]);
                }
                reject({ rawRequest: mockRequestObject, httpStatus: 0, error: new Error(reason) });
                clearTimeout(timeoutHandle);
                performCleanup();
            }
        };

        let temporaryAddedInputs = [];
        if (settings.internalExtraData) {
            let serializedAdditional = new URLSearchParams(constructQueryStringFromObject(settings.internalExtraData, settings.serializeArraysAsTraditional));
            for (let [key, value] of serializedAdditional.entries()) {
                let hiddenInput = document.createElement('input');
                hiddenInput.type = 'hidden';
                hiddenInput.name = key;
                hiddenInput.value = value;
                currentForm.appendChild(hiddenInput);
                temporaryAddedInputs.push(hiddenInput);
            }
        }

        let tokenForCSRF = retrieveMetaContent('csrf-token');
        let paramForCSRF = retrieveMetaContent('csrf-param');
        if (paramForCSRF && tokenForCSRF) {
            let hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = paramForCSRF;
            hiddenInput.value = tokenForCSRF;
            currentForm.appendChild(hiddenInput);
            temporaryAddedInputs.push(hiddenInput);
        }

        let clickedSubmitElement = currentForm.clk;
        if (clickedSubmitElement && clickedSubmitElement.name && !clickedSubmitElement.disabled) {
            let submitElementName = clickedSubmitElement.name;
            let submitElementValue = clickedSubmitElement.value;
            let hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = submitElementName;
            hiddenInput.value = submitElementValue;
            currentForm.appendChild(hiddenInput);
            temporaryAddedInputs.push(hiddenInput);
            if (clickedSubmitElement.type === 'image') {
                let xCoordinateInput = document.createElement('input');
                xCoordinateInput.type = 'hidden'; xCoordinateInput.name = submitElementName + '.x'; xCoordinateInput.value = currentForm.clk_x;
                currentForm.appendChild(xCoordinateInput); temporaryAddedInputs.push(xCoordinateInput);
                let yCoordinateInput = document.createElement('input');
                yCoordinateInput.type = 'hidden'; yCoordinateInput.name = submitElementName + '.y'; yCoordinateInput.value = currentForm.clk_y;
                currentForm.appendChild(yCoordinateInput); temporaryAddedInputs.push(yCoordinateInput);
            }
        }

        currentForm.setAttribute('target', frameIdentification);
        if (!originalFormMethod) {
            currentForm.setAttribute('method', 'POST');
        }
        if (currentForm.getAttribute('action') !== settings.submissionActionURL) {
            currentForm.setAttribute('action', settings.submissionActionURL);
        }

        if (!settings.skipEncodingOverride) {
            currentForm.setAttribute('enctype', 'multipart/form-data');
            currentForm.setAttribute('encoding', 'multipart/form-data');
        }

        if (settings.requestTimeoutDuration > 0) {
            timeoutHandle = setTimeout(() => {
                operationAborted = true;
                mockRequestObject.abort('timeout');
            }, settings.requestTimeoutDuration);
        }

        let frameLoadHandler = () => {
            if (operationAborted) {
                return;
            }
            try {
                let frameDocument = frameElement.contentWindow ? frameElement.contentWindow.document : frameElement.contentDocument;
                if (!frameDocument || frameDocument.body === null) {
                    setTimeout(frameLoadHandler, 100);
                    return;
                }

                let responseDataCollected;
                let statusInfo = 'success';
                let statusCode = 200;

                let rawResponseText = frameDocument.body.innerText || frameDocument.body.textContent || '';
                if (rawResponseText === '') {
                    rawResponseText = frameDocument.body.innerHTML;
                }
                
                let preTag = frameDocument.getElementsByTagName('pre')[0];
                if (preTag) {
                    rawResponseText = preTag.innerText || preTag.textContent;
                }

                if (settings.expectedResponseDataType === 'json' || (rawResponseText.startsWith('{') && rawResponseText.endsWith('}')) || (rawResponseText.startsWith('[') && rawResponseText.endsWith(']'))) {
                    try { responseDataCollected = JSON.parse(rawResponseText); } catch(e) { responseDataCollected = rawResponseText; }
                } else if (settings.expectedResponseDataType === 'xml' || (rawResponseText.startsWith('<') && rawResponseText.endsWith('>'))) {
                    responseDataCollected = frameDocument.responseXML || (new DOMParser()).parseFromString(rawResponseText, 'text/xml');
                } else {
                    responseDataCollected = rawResponseText;
                }

                mockRequestObject.responseText = rawResponseText;
                mockRequestObject.responseXML = frameDocument.responseXML;
                mockRequestObject.status = statusCode;
                mockRequestObject.statusText = statusInfo;

                clearTimeout(timeoutHandle);
                settings.unifiedSuccessHandler(responseDataCollected, statusInfo, mockRequestObject);
                resolve({ responseData: responseDataCollected, httpStatus: statusCode, rawRequest: mockRequestObject });
            } catch (e) {
                clearTimeout(timeoutHandle);
                if (settings.onFailureHandler) {
                    settings.onFailureHandler.apply(settings.context || currentForm, [mockRequestObject, 'parsing error', e]);
                }
                reject({ rawRequest: mockRequestObject, httpStatus: 0, error: e });
            } finally {
                performCleanup();
            }
        };

        if (frameElement.attachEvent) {
            frameElement.attachEvent('onload', frameLoadHandler);
        } else {
            frameElement.addEventListener('load', frameLoadHandler, false);
        }

        setTimeout(() => {
            if (!operationAborted) {
                currentForm.submit();
            }
        }, 10);

        function performCleanup() {
            if (originalFormTarget) { currentForm.setAttribute('target', originalFormTarget); } else { currentForm.removeAttribute('target'); }
            if (originalFormAction) { currentForm.setAttribute('action', originalFormAction); } else { currentForm.removeAttribute('action'); }
            if (originalFormMethod) { currentForm.setAttribute('method', originalFormMethod); } else { currentForm.removeAttribute('method'); }
            if (originalFormEnctype) { currentForm.setAttribute('enctype', originalFormEnctype); } else { currentForm.removeAttribute('enctype'); }
            if (originalFormEncoding) { currentForm.setAttribute('encoding', originalFormEncoding); } else { currentForm.removeAttribute('encoding'); }

            for (let input of temporaryAddedInputs) {
                if (input.parentNode) {
                    input.parentNode.removeChild(input);
                }
            }

            if (!settings.outputContainerSelector && frameElement.parentNode) {
                frameElement.parentNode.removeChild(frameElement);
            }
        }
    });
}

function initiateStandardFetchRequest(currentForm, settings) {
    return new Promise((resolve, reject) => {
        let fetchConfiguration = {
            method: settings.requestMethodType,
            headers: settings.requestHeaders,
            body: null
        };

        if (settings.requestMethodType.toUpperCase() !== 'GET' && settings.requestBodyContent) {
            fetchConfiguration.body = settings.requestBodyContent;
            if (!fetchConfiguration.headers['Content-Type']) {
                fetchConfiguration.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
            }
        }

        let abortController;
        if (settings.requestTimeoutDuration > 0) {
            abortController = new AbortController();
            fetchConfiguration.signal = abortController.signal;
            setTimeout(() => abortController.abort(), settings.requestTimeoutDuration);
        }

        fetch(settings.submissionActionURL, fetchConfiguration)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP status error: ${response.status}`);
                }
                let responseDataPromise;
                let contentTypeHeader = response.headers.get('Content-Type');
                if (settings.expectedResponseDataType === 'json' || (contentTypeHeader && contentTypeHeader.includes('application/json'))) {
                    responseDataPromise = response.json();
                } else if (settings.expectedResponseDataType === 'xml' || (contentTypeHeader && contentTypeHeader.includes('text/xml'))) {
                    responseDataPromise = response.text().then(text => (new DOMParser()).parseFromString(text, 'text/xml'));
                } else {
                    responseDataPromise = response.text();
                }
                return responseDataPromise.then(data => ({ data, httpStatus: response.status, rawResponse: response }));
            })
            .then(({ data, httpStatus, rawResponse }) => {
                settings.unifiedSuccessHandler(data, rawResponse.statusText, rawResponse);
                resolve({ responseData: data, httpStatus: httpStatus, rawResponse: rawResponse });
            })
            .catch(error => {
                if (error.name === 'AbortError') {
                    error.message = 'Request timed out or was intentionally cancelled.';
                }
                if (settings.onFailureHandler) {
                    settings.onFailureHandler.apply(settings.context || currentForm, [null, 'fetch error', error]);
                }
                reject({ error: error, httpStatus: 0, rawResponse: null });
            });
    });
}