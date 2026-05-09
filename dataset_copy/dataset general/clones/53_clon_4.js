const debugOutput = (...args) => {
    // console.log(...args); // Uncomment for debugging
};

const mergeConfiguration = (target, source) => {
    for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!target[key] || typeof target[key] !== 'object') {
                    target[key] = {};
                }
                mergeConfiguration(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
};

const encodeParameters = (dataObject, useTraditionalSerialization = false) => {
    const parts = [];

    const processValue = (key, value) => {
        if (value === null || value === undefined) {
            return;
        }
        if (Array.isArray(value)) {
            value.forEach((item, index) => {
                const newKey = useTraditionalSerialization ? key : `${key}[${typeof item === 'object' && item !== null ? '' : index}]`;
                processValue(newKey, item);
            });
        } else if (typeof value === 'object') {
            for (const subKey in value) {
                if (Object.prototype.hasOwnProperty.call(value, subKey)) {
                    processValue(useTraditionalSerialization ? `${key}.${subKey}` : `${key}[${subKey}]`, value[subKey]);
                }
            }
        } else {
            parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    };

    for (const key in dataObject) {
        if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
            processValue(key, dataObject[key]);
        }
    }
    return parts.join('&');
};

const objectToFlatArray = (complexObject) => {
    const outputList = [];
    const recurse = (current, prefix = '') => {
        for (const key in current) {
            if (Object.prototype.hasOwnProperty.call(current, key)) {
                const value = current[key];
                const newKey = prefix ? `${prefix}[${key}]` : key;
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    recurse(value, newKey);
                } else if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        recurse(item, `${newKey}[${index}]`);
                    });
                } else {
                    outputList.push({ name: newKey, value: String(value) });
                }
            }
        }
    };
    recurse(complexObject);
    return outputList;
};

const gatherFormPayload = (formElement, includeDisabled = false) => {
    const collectedFields = [];
    const elements = formElement.elements;

    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        const itemName = item.name;

        if (!itemName || (item.disabled && !includeDisabled)) {
            continue;
        }

        const tag = item.tagName.toLowerCase();
        const type = item.type;

        if (tag === 'select') {
            if (item.multiple) {
                for (let j = 0; j < item.options.length; j++) {
                    if (item.options[j].selected) {
                        collectedFields.push({ name: itemName, value: item.options[j].value });
                    }
                }
            } else if (item.selectedIndex >= 0) {
                collectedFields.push({ name: itemName, value: item.options[item.selectedIndex].value });
            }
        } else if (tag === 'input' || tag === 'textarea') {
            if (type === 'radio' || type === 'checkbox') {
                if (item.checked) {
                    collectedFields.push({ name: itemName, value: item.value });
                }
            } else if (type !== 'file') {
                collectedFields.push({ name: itemName, value: item.value });
            } else if (type === 'file' && item.files && item.files.length > 0) {
                for (let k = 0; k < item.files.length; k++) {
                    collectedFields.push({ name: itemName, value: item.files[k], type: 'file' });
                }
            }
        }
    }
    return collectedFields;
};

const restoreFormInitialState = (formElement) => {
    if (formElement && typeof formElement.reset === 'function') {
        formElement.reset();
    }
};

const eraseFormContents = (formElement, includeHiddenFields = false) => {
    const elements = formElement.elements;
    for (let i = 0; i < elements.length; i++) {
        const item = elements[i];
        const tag = item.tagName.toLowerCase();
        const type = item.type;

        if (type === 'hidden' && !includeHiddenFields) {
            continue;
        }

        if (tag === 'input' || tag === 'textarea') {
            if (type === 'radio' || type === 'checkbox') {
                item.checked = false;
            } else if (type !== 'file') {
                item.value = '';
            }
        } else if (tag === 'select') {
            item.selectedIndex = -1;
        }
    }
};

const environmentCapabilities = (() => {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    return {
        fileUploadAPI: inputElement.files !== undefined,
        structuredDataAPI: typeof window.FormData !== 'undefined'
    };
})();

const transmitFormPayload = (targetFormElement, submissionConfig = {}) => {
    if (!targetFormElement || !targetFormElement.tagName || targetFormElement.tagName.toLowerCase() !== 'form') {
        debugOutput('transmitFormPayload: Invalid form element provided.');
        return;
    }

    let currentForm = targetFormElement;

    if (typeof submissionConfig === 'function') {
        submissionConfig = { completionHandler: submissionConfig };
    }

    const commMethod = currentForm.getAttribute('method') || 'GET';
    const commEndpoint = currentForm.getAttribute('action');
    let commAddress = (typeof commEndpoint === 'string') ? commEndpoint.trim() : '';
    commAddress = commAddress || window.location.href || '';
    if (commAddress) {
        commAddress = (commAddress.match(/^([^#]+)/) || [])[1];
    }

    const defaultSettings = {
        requestURL: commAddress,
        completionHandler: () => {},
        requestType: commMethod.toUpperCase(),
        iframeSource: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
        enableReset: false,
        enableClear: false,
        replaceTargetContent: false,
        targetContainer: null,
        dataPayload: null,
        beforeSerialization: null,
        beforeTransmission: null,
        onProgress: null,
        legacyModeForced: undefined, // undefined means auto-detect
        skipEncoding: false,
        requestTimeout: 0,
        traditionalEncoding: false
    };

    let config = mergeConfiguration({}, defaultSettings);
    config = mergeConfiguration(config, submissionConfig);

    const preliminaryCheck = { blocked: false };
    if (config.beforeSerialization && config.beforeSerialization(currentForm, config, preliminaryCheck) === false) {
        debugOutput('transmitFormPayload: Transmission blocked by beforeSerialization callback.');
        return currentForm;
    }
    if (preliminaryCheck.blocked) {
        debugOutput('transmitFormPayload: Transmission blocked by preliminaryCheck.');
        return currentForm;
    }

    const processedFields = gatherFormPayload(currentForm);

    if (config.beforeTransmission && config.beforeTransmission(processedFields, currentForm, config) === false) {
        debugOutput('transmitFormPayload: Transmission aborted by beforeTransmission callback.');
        return currentForm;
    }

    let querySegment = encodeParameters(processedFields, config.traditionalEncoding);
    let additionalQuerySegment = '';

    if (config.dataPayload) {
        additionalQuerySegment = encodeParameters(config.dataPayload, config.traditionalEncoding);
    }

    let finalQuery = querySegment;
    if (additionalQuerySegment) {
        finalQuery = finalQuery ? `${finalQuery}&${additionalQuerySegment}` : additionalQuerySegment;
    }

    let requestBody = null;
    let requestURL = config.requestURL;

    if (config.requestType === 'GET') {
        requestURL += (requestURL.indexOf('?') >= 0 ? '&' : '?') + finalQuery;
    } else {
        requestBody = finalQuery;
    }

    const fileInputElements = Array.from(currentForm.querySelectorAll('input[type="file"]:enabled'));
    const hasInputDocuments = fileInputElements.some(input => input.files && input.files.length > 0);
    const isMultiPart = (currentForm.getAttribute('enctype') === 'multipart/form-data' || currentForm.getAttribute('encoding') === 'multipart/form-data');

    const canUseModernAPI = environmentCapabilities.fileUploadAPI && environmentCapabilities.structuredDataAPI;
    debugOutput(`Can use modern API: ${canUseModernAPI}`);

    const needsLegacyUpload = (hasInputDocuments || isMultiPart) && !canUseModernAPI;

    const completionRoutines = [];
    if (config.enableReset) {
        completionRoutines.push(() => restoreFormInitialState(currentForm));
    }
    if (config.enableClear) {
        completionRoutines.push(() => eraseFormContents(currentForm, config.includeHidden));
    }

    const defaultCompletion = config.completionHandler;
    if (!config.responseDataType && config.targetContainer) {
        completionRoutines.push((responseData) => {
            const container = document.querySelector(config.targetContainer);
            if (container) {
                if (config.replaceTargetContent) {
                    container.outerHTML = responseData;
                } else {
                    container.innerHTML = responseData;
                }
                defaultCompletion(responseData);
            }
        });
    } else if (defaultCompletion) {
        completionRoutines.push(defaultCompletion);
    }

    const executeCompletionHandlers = (data, status, xhrObject, formElem) => {
        const context = config.context || config;
        for (let i = 0; i < completionRoutines.length; i++) {
            completionRoutines[i].apply(context, [data, status, xhrObject, formElem]);
        }
    };

    if (config.legacyModeForced === true || (config.legacyModeForced === undefined && needsLegacyUpload)) {
        performLegacyUpload(currentForm, processedFields, config, executeCompletionHandlers);
    } else if ((hasInputDocuments || isMultiPart) && canUseModernAPI) {
        performModernUpload(currentForm, processedFields, fileInputElements, config, executeCompletionHandlers);
    } else {
        initiateFetchRequest(requestURL, requestBody, config, executeCompletionHandlers);
    }

    return currentForm;
};

const initiateFetchRequest = (url, body, config, finalCallback) => {
    const fetchConfig = {
        method: config.requestType,
        headers: {}
    };

    if (body && config.requestType !== 'GET') {
        fetchConfig.body = body;
        fetchConfig.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const mockXHR = {
        aborted: false,
        status: 0,
        statusText: 'n/a',
        response: null,
        responseText: null,
        responseXML: null,
        getAllResponseHeaders: () => '',
        getResponseHeader: () => null,
        setRequestHeader: (name, value) => { fetchConfig.headers[name] = value; },
        abort: () => { mockXHR.aborted = true; }
    };
    if (config.beforeTransmission && config.beforeTransmission.call(config.context || config, mockXHR, fetchConfig) === false) {
        debugOutput('Fetch aborted by beforeTransmission.');
        return;
    }
    if (mockXHR.aborted) {
        return;
    }

    let timeoutId;
    const controller = new AbortController();
    if (config.requestTimeout > 0) {
        timeoutId = setTimeout(() => {
            controller.abort();
            if (config.transmissionErrorHandler) {
                config.transmissionErrorHandler(mockXHR, 'timeout', 'Request timed out');
            }
            finalCallback(null, 'timeout', mockXHR, null);
        }, config.requestTimeout);
        fetchConfig.signal = controller.signal;
    }

    fetch(url, fetchConfig)
        .then(response => {
            if (timeoutId) clearTimeout(timeoutId);
            mockXHR.status = response.status;
            mockXHR.statusText = response.statusText;
            mockXHR.response = response;
            if (!response.ok) {
                throw new Error(response.statusText);
            }
            return response.text();
        })
        .then(data => {
            mockXHR.responseText = data;
            let parsedData = data;
            if (config.responseDataType === 'json') {
                try { parsedData = JSON.parse(data); } catch (e) { debugOutput('Failed to parse JSON response:', e); }
            } else if (config.responseDataType === 'xml') {
                try { parsedData = (new DOMParser()).parseFromString(data, 'text/xml'); mockXHR.responseXML = parsedData; } catch (e) { debugOutput('Failed to parse XML response:', e); }
            }
            finalCallback(parsedData, 'success', mockXHR, null);
            if (config.transmissionSuccessHandler) { config.transmissionSuccessHandler(parsedData, 'success', mockXHR); }
            if (config.transmissionCompleteHandler) { config.transmissionCompleteHandler(mockXHR, 'success'); }
        })
        .catch(error => {
            if (timeoutId) clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                debugOutput('Fetch request aborted:', error.message);
                mockXHR.statusText = 'aborted';
                mockXHR.status = 0;
            } else {
                debugOutput('Fetch error:', error);
                mockXHR.statusText = error.message;
                mockXHR.status = mockXHR.status || 500;
            }
            if (config.transmissionErrorHandler) { config.transmissionErrorHandler(mockXHR, 'error', error); }
            if (config.transmissionCompleteHandler) { config.transmissionCompleteHandler(mockXHR, 'error'); }
        });
};

const performModernUpload = (formElement, fieldArray, fileInputElements, config, finalCallback) => {
    const formDataInstance = new FormData();

    for (const field of fieldArray) {
        if (field.type !== 'file') {
            formDataInstance.append(field.name, field.value);
        }
    }

    for (const input of fileInputElements) {
        if (input.name && input.files) {
            for (let i = 0; i < input.files.length; i++) {
                formDataInstance.append(input.name, input.files[i], input.files[i].name);
            }
        }
    }

    if (config.dataPayload) {
        const flatExtraData = objectToFlatArray(config.dataPayload);
        for (const item of flatExtraData) {
            formDataInstance.append(item.name, item.value);
        }
    }

    const mockXHR = {
        aborted: false,
        status: 0,
        statusText: 'n/a',
        response: null,
        responseText: null,
        responseXML: null,
        getAllResponseHeaders: () => '',
        getResponseHeader: () => null,
        setRequestHeader: () => {},
        abort: () => { mockXHR.aborted = true; }
    };

    const requestOptions = {
        method: config.requestType || 'POST',
        body: formDataInstance
    };

    if (config.beforeTransmission && config.beforeTransmission.call(config.context || config, mockXHR, requestOptions) === false) {
        debugOutput('Modern upload aborted by beforeTransmission.');
        return;
    }
    if (mockXHR.aborted) {
        return;
    }

    if (config.onProgress) {
        const xhr = new XMLHttpRequest();
        xhr.open(requestOptions.method, config.requestURL);

        if (xhr.upload && config.onProgress) {
            xhr.upload.onprogress = (event) => {
                let percentage = 0;
                if (event.lengthComputable) {
                    percentage = Math.ceil((event.loaded / event.total) * 100);
                }
                config.onProgress(event, event.loaded, event.total, percentage);
            };
        }

        xhr.onload = () => {
            mockXHR.status = xhr.status;
            mockXHR.statusText = xhr.statusText;
            mockXHR.responseText = xhr.responseText;
            let responseData = xhr.responseText;
            if (config.responseDataType === 'json') {
                try { responseData = JSON.parse(xhr.responseText); } catch (e) { debugOutput('XHR JSON parse error:', e); }
            } else if (config.responseDataType === 'xml') {
                try { responseData = xhr.responseXML; mockXHR.responseXML = responseData; } catch (e) { debugOutput('XHR XML parse error:', e); }
            }
            finalCallback(responseData, 'success', mockXHR, formElement);
            if (config.transmissionSuccessHandler) { config.transmissionSuccessHandler(responseData, 'success', mockXHR); }
            if (config.transmissionCompleteHandler) { config.transmissionCompleteHandler(mockXHR, 'success'); }
        };

        xhr.onerror = () => {
            mockXHR.status = xhr.status;
            mockXHR.statusText = xhr.statusText || 'error';
            if (config.transmissionErrorHandler) { config.transmissionErrorHandler(mockXHR, 'error', xhr.statusText); }
            if (config.transmissionCompleteHandler) { config.transmissionCompleteHandler(mockXHR, 'error'); }
        };

        xhr.ontimeout = () => {
             mockXHR.status = 0;
             mockXHR.statusText = 'timeout';
             if (config.transmissionErrorHandler) { config.transmissionErrorHandler(mockXHR, 'timeout', 'Request timed out'); }
             if (config.transmissionCompleteHandler) { config.transmissionCompleteHandler(mockXHR, 'timeout'); }
        };

        if (config.requestTimeout > 0) {
             xhr.timeout = config.requestTimeout;
        }

        xhr.send(formDataInstance);

    } else {
        let timeoutId;
        const controller = new AbortController();
        if (config.requestTimeout > 0) {
            timeoutId = setTimeout(() => {
                controller.abort();
                if (config.transmissionErrorHandler) {
                    config.transmissionErrorHandler(mockXHR, 'timeout', 'Request timed out');
                }
                finalCallback(null, 'timeout', mockXHR, formElement);
            }, config.requestTimeout);
            requestOptions.signal = controller.signal;
        }

        fetch(config.requestURL, requestOptions)
            .then(response => {
                if (timeoutId) clearTimeout(timeoutId);
                mockXHR.status = response.status;
                mockXHR.statusText = response.statusText;
                mockXHR.response = response;
                if (!response.ok) {
                    throw new Error(response.statusText);
                }
                return response.text();
            })
            .then(data => {
                mockXHR.responseText = data;
                let parsedData = data;
                if (config.responseDataType === 'json') {
                    try { parsedData = JSON.parse(data); } catch (e) { debugOutput('Fetch JSON parse error:', e); }
                } else if (config.responseDataType === 'xml') {
                    try { parsedData = (new DOMParser()).parseFromString(data, 'text/xml'); mockXHR.responseXML = parsedData; } catch (e) { debugOutput('Fetch XML parse error:', e); }
                }
                finalCallback(parsedData, 'success', mockXHR, formElement);
                if (config.transmissionSuccessHandler) { config.transmissionSuccessHandler(parsedData, 'success', mockXHR); }
                if (config.transmissionCompleteHandler) { config.transmissionCompleteHandler(mockXHR, 'success'); }
            })
            .catch(error => {
                if (timeoutId) clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    debugOutput('Fetch request aborted:', error.message);
                    mockXHR.statusText = 'aborted';
                    mockXHR.status = 0;
                } else {
                    debugOutput('Fetch error:', error);
                    mockXHR.statusText = error.message;
                    mockXHR.status = mockXHR.status || 500;
                }
                if (config.transmissionErrorHandler) { config.transmissionErrorHandler(mockXHR, 'error', error); }
                if (config.transmissionCompleteHandler) { config.transmissionCompleteHandler(mockXHR, 'error'); }
            });
    }
};

const performLegacyUpload = (formElement, fieldArray, config, finalCallback) => {
    const originalFormTarget = formElement.getAttribute('target');
    const originalFormAction = formElement.getAttribute('action');
    const originalFormMethod = formElement.getAttribute('method');
    const originalFormEnctype = formElement.getAttribute('enctype');
    const uniqueFrameId = `formUploadFrame_${new Date().getTime()}`;

    let frameElement;
    let frameName;

    if (config.targetContainer && document.querySelector(config.targetContainer)) {
        frameElement = document.querySelector(config.targetContainer);
        frameName = frameElement.getAttribute('name');
        if (!frameName) {
            frameElement.setAttribute('name', uniqueFrameId);
            frameName = uniqueFrameId;
        }
    } else {
        frameElement = document.createElement('iframe');
        frameElement.setAttribute('name', uniqueFrameId);
        frameElement.setAttribute('src', config.iframeSource);
        frameElement.style.position = 'absolute';
        frameElement.style.top = '-1000px';
        frameElement.style.left = '-1000px';
        document.body.appendChild(frameElement);
        frameName = uniqueFrameId;
    }

    const mockXHR = {
        aborted: false,
        responseText: null,
        responseXML: null,
        status: 0,
        statusText: 'n/a',
        getAllResponseHeaders: () => '',
        getResponseHeader: () => '',
        setRequestHeader: () => {},
        abort: (status = 'aborted') => {
            debugOutput(`Aborting iframe upload: ${status}`);
            if (mockXHR.aborted) return;
            mockXHR.aborted = true;
            try {
                if (frameElement.contentWindow && frameElement.contentWindow.document && typeof frameElement.contentWindow.document.execCommand === 'function') {
                    frameElement.contentWindow.document.execCommand('Stop');
                }
            } catch (e) { debugOutput('Error stopping iframe document:', e); }
            frameElement.setAttribute('src', config.iframeSource);
            if (config.transmissionErrorHandler) {
                config.transmissionErrorHandler(mockXHR, status, status);
            }
            if (config.transmissionCompleteHandler) {
                config.transmissionCompleteHandler(mockXHR, status);
            }
            cleanupFrame();
        }
    };

    const requestOptions = {
        method: formElement.getAttribute('method') || 'POST',
        url: config.requestURL
    };
    if (config.beforeTransmission && config.beforeTransmission.call(config.context || config, mockXHR, requestOptions) === false) {
        debugOutput('Legacy upload aborted by beforeTransmission.');
        cleanupFrame();
        return;
    }
    if (mockXHR.aborted) {
        cleanupFrame();
        return;
    }

    let timeoutHandle;
    let isCallbackProcessed = false;

    const getFrameDocument = (frame) => {
        try {
            return frame.contentWindow ? frame.contentWindow.document : frame.contentDocument ? frame.contentDocument : frame.document;
        } catch (e) {
            debugOutput('Error accessing iframe document:', e);
            return null;
        }
    };

    const cleanupFrame = () => {
        if (timeoutHandle) {
            clearTimeout(timeoutHandle);
            timeoutHandle = null;
        }
        if (frameElement && frameElement.parentNode) {
            if (frameElement.removeEventListener) {
                frameElement.removeEventListener('load', frameLoadHandler, false);
            } else if (frameElement.detachEvent) {
                frameElement.detachEvent('onload', frameLoadHandler);
            }
            if (!config.targetContainer) {
                frameElement.parentNode.removeChild(frameElement);
            }
        }
        formElement.setAttribute('target', originalFormTarget || '');
        if (originalFormAction) { formElement.setAttribute('action', originalFormAction); } else { formElement.removeAttribute('action'); }
        if (originalFormMethod) { formElement.setAttribute('method', originalFormMethod); } else { formElement.removeAttribute('method'); }
        if (originalFormEnctype) { formElement.setAttribute('enctype', originalFormEnctype); } else { formElement.removeAttribute('enctype'); }

        document.querySelectorAll(`[data-temp-form-field="${uniqueFrameId}"]`).forEach(el => el.remove());
    };

    const frameLoadHandler = () => {
        if (mockXHR.aborted || isCallbackProcessed) {
            debugOutput('Iframe load handler: Callback already processed or aborted.');
            return;
        }
        isCallbackProcessed = true;

        let responseData = null;
        let responseStatus = 'success';

        try {
            const doc = getFrameDocument(frameElement);
            if (!doc || doc.location.href === config.iframeSource) {
                return;
            }

            const responseContentType = doc.contentType || '';
            let responseText = '';
            if (doc.body) {
                responseText = doc.body.innerHTML;
            } else if (doc.documentElement) {
                responseText = doc.documentElement.innerHTML;
            }

            mockXHR.responseText = responseText;
            mockXHR.status = 200;

            if (config.responseDataType === 'json' || responseContentType.includes('json')) {
                try { responseData = JSON.parse(responseText); } catch (e) { debugOutput('Iframe JSON parse error:', e); responseStatus = 'parsererror'; mockXHR.status = 500; }
            } else if (config.responseDataType === 'xml' || responseContentType.includes('xml')) {
                try { responseData = (new DOMParser()).parseFromString(responseText, 'text/xml'); mockXHR.responseXML = responseData; } catch (e) { debugOutput('Iframe XML parse error:', e); responseStatus = 'parsererror'; mockXHR.status = 500; }
            } else {
                responseData = responseText;
            }

        } catch (e) {
            debugOutput('Error processing iframe response:', e);
            responseStatus = 'error';
            mockXHR.status = 500;
            mockXHR.statusText = e.message;
        } finally {
            if (timeoutHandle) clearTimeout(timeoutHandle);
            cleanupFrame();

            if (responseStatus === 'success') {
                finalCallback(responseData, responseStatus, mockXHR, formElement);
                if (config.transmissionSuccessHandler) { config.transmissionSuccessHandler(responseData, responseStatus, mockXHR); }
            } else {
                if (config.transmissionErrorHandler) { config.transmissionErrorHandler(mockXHR, responseStatus, mockXHR.statusText); }
            }
            if (config.transmissionCompleteHandler) { config.transmissionCompleteHandler(mockXHR, responseStatus); }
        }
    };

    if (frameElement.addEventListener) {
        frameElement.addEventListener('load', frameLoadHandler, false);
    } else if (frameElement.attachEvent) {
        frameElement.attachEvent('onload', frameLoadHandler);
    }

    formElement.setAttribute('target', frameName);
    formElement.setAttribute('method', 'POST');
    if (!config.skipEncoding) {
        formElement.setAttribute('enctype', 'multipart/form-data');
    }
    formElement.setAttribute('action', config.requestURL);

    const temporaryInputs = [];
    if (config.dataPayload) {
        const flatExtraData = objectToFlatArray(config.dataPayload);
        for (const item of flatExtraData) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = item.name;
            input.value = item.value;
            input.setAttribute('data-temp-form-field', uniqueFrameId);
            formElement.appendChild(input);
            temporaryInputs.push(input);
        }
    }

    const csrfTokenMeta = document.querySelector('meta[name="csrf-token"]');
    const csrfParamMeta = document.querySelector('meta[name="csrf-param"]');
    if (csrfTokenMeta && csrfParamMeta) {
        const csrfToken = csrfTokenMeta.getAttribute('content');
        const csrfParam = csrfParamMeta.getAttribute('content');
        if (csrfToken && csrfParam) {
            const csrfInput = document.createElement('input');
            csrfInput.type = 'hidden';
            csrfInput.name = csrfParam;
            csrfInput.value = csrfToken;
            csrfInput.setAttribute('data-temp-form-field', uniqueFrameId);
            formElement.appendChild(csrfInput);
            temporaryInputs.push(csrfInput);
        }
    }

    if (config.requestTimeout > 0) {
        timeoutHandle = setTimeout(() => {
            debugOutput('Iframe upload timed out.');
            if (!isCallbackProcessed) {
                mockXHR.abort('timeout');
            }
        }, config.requestTimeout);
    }

    setTimeout(() => {
        debugOutput('Submitting form to iframe...');
        formElement.submit();
    }, 10);
};