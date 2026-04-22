(function() {

    const checkFlashExistence = () => {
        try {
            const flashObject = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (flashObject) return true;
        } catch(e) {
            if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] !== undefined) return true;
        }
        return false;
    };

    const applyDynamicProperty = (targetObject, propertyKey, getterFunction) => {
        try {
            Object.defineProperty(targetObject, propertyKey, { get: getterFunction, configurable: true });
        } catch (e) { /* silent ignore */ }
    };

    if ((window.XMLHttpRequest && !window.FormData) || (window.FileAPI && FileAPI.forceLoad)) {
        const OriginalXHR = window.XMLHttpRequest;
        const INTERNAL_CONFIG_ACTION_SYMBOL = Symbol('configureXHR');
        const CUSTOM_PAYLOAD_FLAG = Symbol('isCustomPayload');
        const CUSTOM_BINARY_FLAG = Symbol('isBinaryContent');

        class PayloadAssembler {
            constructor() {
                this._collectedSegments = [];
                this[CUSTOM_PAYLOAD_FLAG] = true;
            }

            addPart(identifier, valueObject, optionalName) {
                if (valueObject && valueObject[CUSTOM_BINARY_FLAG]) {
                    valueObject = valueObject._actualBinaryData[0];
                }
                this._collectedSegments.push({
                    partIdentifier: identifier,
                    partValue: valueObject,
                    partName: optionalName
                });
            }
        }

        class BinaryContent {
            constructor(dataArray) {
                this._actualBinaryData = dataArray;
                this[CUSTOM_BINARY_FLAG] = true;
            }
        }

        class CommunicationUnit {
            constructor() {
                this._internalXHR = new OriginalXHR();
                this._uploadObservers = new Map();
                this._requestHeadersCache = {};
                this._targetURI = null;
                this._initialSecurityError = null;
                this._uploadOperationCompleted = false;
                this._bytesSent = 0;
                this._totalBytesExpected = 0;
                this._fileApiProxy = null;

                this.upload = {};
                const originalUploadAddEvent = this._internalXHR.upload ? this._internalXHR.upload.addEventListener : null;
                this.upload.addEventListener = (evtType, handlerFunc, useCapture) => {
                    this._uploadObservers.set(evtType, handlerFunc);
                    originalUploadAddEvent && originalUploadAddEvent.call(this._internalXHR.upload, evtType, handlerFunc, useCapture);
                };

                applyDynamicProperty(this, 'status', () => {
                    if (this._fileApiProxy) {
                        return (this._fileApiProxy.status === 0 && this._fileApiProxy.issue && this._fileApiProxy.issue !== 'abort') ? 500 : this._fileApiProxy.status;
                    }
                    return this._internalXHR.status;
                });
                applyDynamicProperty(this, 'statusText', () => this._fileApiProxy ? this._fileApiProxy.statusText : this._internalXHR.statusText);
                applyDynamicProperty(this, 'readyState', () => this._fileApiProxy ? 4 : this._internalXHR.readyState);
                applyDynamicProperty(this, 'response', () => {
                    if (this._fileApiProxy) {
                        return this._fileApiProxy.response !== undefined ? this._fileApiProxy.response : this.responseContent;
                    }
                    return this._internalXHR.response;
                });
                applyDynamicProperty(this, 'responseContent', () => {
                    if (this._fileApiProxy) {
                        return this._fileApiProxy.responseText || (this._fileApiProxy.issue && this._fileApiProxy.status === 0 && this._fileApiProxy.issue !== 'abort' ? this._fileApiProxy.issue : undefined);
                    }
                    return this._internalXHR.responseText;
                });
                applyDynamicProperty(this, 'issueReport', () => this._fileApiProxy ? this._fileApiProxy.issue : undefined);

                this.onreadystatechange = null;
                this.onload = null;
                this.onerror = null;
                this.onabort = null;
                this.onloadend = null;
                this.onloadstart = null;
                this.onprogress = null;
            }

            initiate(methodVerb, endpointPath, asyncMode) {
                this._targetURI = endpointPath;
                try {
                    this._internalXHR.open(methodVerb, endpointPath, asyncMode);
                } catch (err) {
                    if (err.message && err.message.includes('Access is denied')) {
                        this._initialSecurityError = err;
                        this._internalXHR.open(methodVerb, '_cross_domain_fix_for_legacy_ie_', asyncMode);
                    }
                }
            }

            retrieveHeaderField(fieldName) {
                return this._fileApiProxy && this._fileApiProxy.getResponseHeader ? this._fileApiProxy.getResponseHeader(fieldName) : this._internalXHR.getResponseHeader(fieldName);
            }

            retrieveAllHeaderFields() {
                return this._fileApiProxy && this._fileApiProxy.getAllResponseHeaders ? this._fileApiProxy.getAllResponseHeaders() : this._internalXHR.getAllResponseHeaders();
            }

            haltTransfer() {
                return this._fileApiProxy && this._fileApiProxy.abort ? this._fileApiProxy.abort() : this._internalXHR.abort();
            }

            assignRequestHeader(headerLabel, headerData) {
                if (headerLabel === INTERNAL_CONFIG_ACTION_SYMBOL) {
                    const configFunction = headerData(this);
                    if (typeof configFunction === 'function') {
                        configFunction(this);
                    }
                } else {
                    this._requestHeadersCache[headerLabel] = headerData;
                    this._internalXHR.setRequestHeader(headerLabel, headerData);
                }
            }

            sendRequest(payloadData) {
                if (payloadData && payloadData[CUSTOM_PAYLOAD_FLAG]) {
                    const uploadOptions = {
                        url: this._targetURI,
                        jsonp: false,
                        cache: true,
                        completionHandler: (issueFlag, apiResponseObject) => {
                            this._uploadOperationCompleted = true;
                            if (!issueFlag && this._uploadObservers.has('load')) {
                                this._uploadObservers.get('load')({ type: 'load', loaded: this._bytesSent, total: this._totalBytesExpected, target: this, lengthComputable: true });
                            }
                            if (!issueFlag && this._uploadObservers.has('loadend')) {
                                this._uploadObservers.get('loadend')({ type: 'loadend', loaded: this._bytesSent, total: this._totalBytesExpected, target: this, lengthComputable: true });
                            }
                            if (issueFlag === 'abort' && this._uploadObservers.has('abort')) {
                                this._uploadObservers.get('abort')({ type: 'abort', loaded: this._bytesSent, total: this._totalBytesExpected, target: this, lengthComputable: true });
                            }

                            this._fileApiProxy = apiResponseObject;
                            if (issueFlag) this._fileApiProxy.issue = issueFlag;

                            if (this.onreadystatechange) this.onreadystatechange();
                            if (this.onload) this.onload();
                        },
                        progressMonitor: (progressInfo) => {
                            progressInfo.target = this;
                            this._uploadObservers.has('progress') && this._uploadObservers.get('progress')(progressInfo);
                            this._totalBytesExpected = progressInfo.total;
                            this._bytesSent = progressInfo.loaded;

                            if (progressInfo.total === progressInfo.loaded) {
                                const currentInstanceRef = this;
                                setTimeout(() => {
                                    if (!currentInstanceRef._uploadOperationCompleted) {
                                        currentInstanceRef.retrieveAllHeaderFields = () => '';
                                        uploadOptions.completionHandler(null, { status: 204, statusText: 'No Content' });
                                    }
                                }, window.FileAPI.noContentTimeout || 10000);
                            }
                        },
                        requestHeaders: this._requestHeadersCache
                    };

                    uploadOptions.data = {};
                    uploadOptions.files = {};
                    for (const segment of payloadData._collectedSegments) {
                        if (segment.partValue != null && segment.partValue.name != null && segment.partValue.size != null && segment.partValue.type != null) {
                            uploadOptions.files[segment.partIdentifier] = segment.partValue;
                        } else {
                            uploadOptions.data[segment.partIdentifier] = segment.partValue;
                        }
                    }

                    Promise.resolve().then(() => {
                        if (!checkFlashExistence()) {
                            throw 'Adobe Flash Player must be installed. Use "FileAPI.flashEnabled" to verify.';
                        }
                        this._fileApiProxy = window.FileAPI.upload(uploadOptions);
                    });
                } else {
                    if (this._initialSecurityError) {
                        throw this._initialSecurityError;
                    }
                    this._internalXHR.send(payloadData);
                }
            }
        }

        window.XMLHttpRequest = CommunicationUnit;
        window.XMLHttpRequest.isCustomizedShim = true;

        window.FormData = PayloadAssembler;
        window.Blob = BinaryContent;

        // FileAPI initialization and loading block
        (function () {
            if (!window.FileAPI) {
                window.FileAPI = {};
            }
            if (window.FileAPI.forceLoad) {
                window.FileAPI.html5 = false;
            }

            if (!window.FileAPI.upload) {
                let scriptSourceURL, directoryRoot, dynamicScriptElement = document.createElement('script');
                const allDocumentScripts = document.getElementsByTagName('script');
                let scriptIterator, detectionIndex, currentScriptSrc;

                if (window.FileAPI.scriptLocation) {
                    scriptSourceURL = window.FileAPI.scriptLocation;
                } else if (window.FileAPI.resourcePath) {
                    directoryRoot = window.FileAPI.resourcePath;
                } else {
                    for (scriptIterator = 0; scriptIterator < allDocumentScripts.length; scriptIterator++) {
                        currentScriptSrc = allDocumentScripts[scriptIterator].src;
                        detectionIndex = currentScriptSrc.search(/\/file\-transfer\-utility[\-a-zA-z0-9\.]*\.js/);
                        if (detectionIndex > -1) {
                            directoryRoot = currentScriptSrc.substring(0, detectionIndex + 1);
                            break;
                        }
                    }
                }

                if (window.FileAPI.fixedResourcePath == null) window.FileAPI.fixedResourcePath = directoryRoot;
                dynamicScriptElement.setAttribute('src', scriptSourceURL || (directoryRoot + 'FileAPI.min.js'));
                document.head.appendChild(dynamicScriptElement);
                window.FileAPI.flashEnabled = checkFlashExistence();
            }
        })();

        window.FileAPI.enhanceLegacyInput = (domElement, createInputFunction, changeCallback, resetDataModel) => {
            if (!checkFlashExistence()) {
                throw 'Adobe Flash Player must be installed. Use "FileAPI.flashEnabled" to verify.';
            }
            const createFlashInputWrapper = (eventTrigger) => {
                if (domElement.attr('disabled')) {
                    domElement._elementReference.removeClass('js-fileapi-wrapper');
                } else {
                    const fileInputElement = domElement._elementReference = createInputFunction();
                    fileInputElement.addClass('js-fileapi-wrapper');
                    if (!(domElement[0].tagName.toLowerCase() === 'input' && domElement.attr('type') && domElement.attr('type').toLowerCase() === 'file')) {
                        if (fileInputElement.parent().css('position') === '' || fileInputElement.parent().css('position') === 'static') {
                            fileInputElement.parent().css('position', 'relative');
                        }
                        fileInputElement.css('position', 'absolute').css('top', domElement[0].offsetTop + 'px')
                            .css('left', domElement[0].offsetLeft + 'px')
                            .css('width', domElement[0].offsetWidth + 'px')
                            .css('height', domElement[0].offsetHeight + 'px')
                            .css('padding', domElement.css('padding')).css('margin', domElement.css('margin'))
                            .css('filter', 'alpha(opacity=0)');
                        fileInputElement.css('z-index', '1000');
                    }
                    Promise.resolve().then(() => {
                        fileInputElement.bind('mouseenter', createFlashInputWrapper);
                    });
                    fileInputElement.unbind('change');
                    fileInputElement.bind('change', function(evt) {
                        processFileApiChangeEvent.apply(this, [evt]);
                        changeCallback.apply(this, [evt]);
                    });
                }
            };

            domElement.bind('mouseenter', createFlashInputWrapper);

            const processFileApiChangeEvent = (eventObject) => {
                const filesCollection = window.FileAPI.getFiles(eventObject);
                for (let k = 0; k < filesCollection.length; k++) {
                    if (filesCollection[k].size === undefined) filesCollection[k].size = 0;
                    if (filesCollection[k].name === undefined) filesCollection[k].name = 'file';
                    if (filesCollection[k].type === undefined) filesCollection[k].type = 'undefined';
                }
                if (!eventObject.target) {
                    eventObject.target = {};
                }
                eventObject.target.files = filesCollection;
                if (eventObject.target.files !== filesCollection) {
                    eventObject._supplementaryFiles_ = filesCollection;
                }
                (eventObject._supplementaryFiles_ || eventObject.target.files).accessItem = (idx) => {
                    return (eventObject._supplementaryFiles_ || eventObject.target.files)[idx] || null;
                };
            };
        };

        window.FileAPI.modifyInputAppearance = (elementInstance, shouldDisable) => {
            if (shouldDisable) {
                elementInstance.removeClass('js-fileapi-wrapper');
            } else {
                elementInstance.addClass('js-fileapi-wrapper');
            }
        };
    }

    if (!window.FileReader) {
        class ContentReader {
            constructor() {
                this._eventRegister = new Map();
                this._readInitiated = false;

                this.onTermination = null;
                this.onErrorEncountered = null;
                this.onDataLoaded = null;
                this.onReadStart = null;
                this.onReadComplete = null;
                this.onProgressUpdate = null;
                this.result = null;
            }

            registerListener(evtType, handler) {
                let handlers = this._eventRegister.get(evtType);
                if (!handlers) {
                    handlers = [];
                    this._eventRegister.set(evtType, handlers);
                }
                handlers.push(handler);
            }

            unregisterListener(evtType, handler) {
                const handlers = this._eventRegister.get(evtType);
                if (handlers) {
                    const index = handlers.indexOf(handler);
                    if (index > -1) {
                        handlers.splice(index, 1);
                    }
                }
            }

            dispatchCustomEvent(eventObject) {
                const handlers = this._eventRegister.get(eventObject.type);
                if (handlers) {
                    for (const handler of handlers) {
                        handler.call(this, eventObject);
                    }
                }
            }

            _composeEventData(eventName, sourceEvent) {
                const eventPayload = {
                    type: eventName,
                    target: this,
                    loaded: sourceEvent.loaded,
                    total: sourceEvent.total,
                    error: sourceEvent.error
                };
                if (sourceEvent.result != null) eventPayload.target.result = sourceEvent.result;
                return eventPayload;
            }

            _handleFileAPIResponse(apiEvent) {
                if (!this._readInitiated) {
                    this._readInitiated = true;
                    this.onReadStart && this.onReadStart(this._composeEventData('loadstart', apiEvent));
                }
                if (apiEvent.type === 'load') {
                    this.onReadComplete && this.onReadComplete(this._composeEventData('loadend', apiEvent));
                    const loadedEvent = this._composeEventData('load', apiEvent);
                    this.onDataLoaded && this.onDataLoaded(loadedEvent);
                    this.dispatchCustomEvent(loadedEvent);
                } else if (apiEvent.type === 'progress') {
                    const progressEvent = this._composeEventData('progress', apiEvent);
                    this.onProgressUpdate && this.onProgressUpdate(progressEvent);
                    this.dispatchCustomEvent(progressEvent);
                } else {
                    const errorEvent = this._composeEventData('error', apiEvent);
                    this.onErrorEncountered && this.onErrorEncountered(errorEvent);
                    this.dispatchCustomEvent(errorEvent);
                }
            }

            readAsBufferContent(fileObject) {
                window.FileAPI.readAsBinaryString(fileObject, (evt) => this._handleFileAPIResponse(evt));
            }

            readAsBinaryStringContent(fileObject) {
                window.FileAPI.readAsBinaryString(fileObject, (evt) => this._handleFileAPIResponse(evt));
            }

            readAsDataURLContent(fileObject) {
                window.FileAPI.readAsDataURL(fileObject, (evt) => this._handleFileAPIResponse(evt));
            }

            readAsTextContent(fileObject) {
                window.FileAPI.readAsText(fileObject, (evt) => this._handleFileAPIResponse(evt));
            }
        }
        window.FileReader = ContentReader;
    }
})();