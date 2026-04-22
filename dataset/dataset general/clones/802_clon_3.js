/*
 * Module: FileAPI Compatibility Layer for Legacy Browsers
 * Description: Provides polyfills for XMLHttpRequest and FileReader APIs,
 *              primarily targeting older environments lacking FormData support
 *              and relying on Flash-based file uploads.
 * Author: CodeCrafter <clonegen@example.com>
 * Version: 2.1.0-alpha
 */

(function initLegacyCompat() {
    // Helper to determine if the Adobe Flash plugin is present
    const checkFlashPresence = () => {
        let flashAvailable = false;
        try {
            // Attempt ActiveXObject for IE
            const flashObject = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            if (flashObject) {
                flashAvailable = true;
            }
        } catch (errorDetails) {
            // Check for plugin in other browsers
            if (navigator.mimeTypes && navigator.mimeTypes['application/x-shockwave-flash'] !== undefined) {
                flashAvailable = true;
            }
        }
        return flashAvailable;
    };

    // Utility to modify XMLHttpRequest prototype methods
    const modifyXHRMethod = (methodKey, replacementFunction) => {
        if (window.XMLHttpRequest && window.XMLHttpRequest.prototype) {
            window.XMLHttpRequest.prototype[methodKey] = replacementFunction(window.XMLHttpRequest.prototype[methodKey]);
        }
    };

    // Determine if XHR shimming is necessary
    const needsXHRShim = (window.XMLHttpRequest && !window.FormData) || (window.FileAPI && window.FileAPI.forceLoad);

    if (needsXHRShim) {
        // Prepare XHR for custom event handling
        const setupXHRUploadEvents = (xhrInstance) => {
            if (!xhrInstance._eventHandlers) {
                // Ensure upload object exists for event listeners
                if (!xhrInstance.upload) {
                    xhrInstance.upload = {};
                }
                xhrInstance._eventHandlers = {}; // Store custom event handlers
                const originalAddEventListener = xhrInstance.upload.addEventListener;

                xhrInstance.upload.addEventListener = function(eventType, handlerCallback, useCapture) {
                    // Store handler by type for later dispatch
                    if (!xhrInstance._eventHandlers[eventType]) {
                        xhrInstance._eventHandlers[eventType] = [];
                    }
                    xhrInstance._eventHandlers[eventType].push(handlerCallback);
                    // Call original method if it exists
                    if (originalAddEventListener) {
                        originalAddEventListener.apply(this, arguments);
                    }
                };
            }
        };

        // Override XHR 'open' method
        modifyXHRMethod('open', (originalOpen) => {
            return function(methodType, requestUrl, asyncFlag) {
                setupXHRUploadEvents(this); // Initialize custom event system
                this._requestTargetUrl = requestUrl; // Store the original URL

                try {
                    originalOpen.apply(this, [methodType, requestUrl, asyncFlag]);
                } catch (err) {
                    // Handle IE "Access is denied" for cross-domain requests
                    if (err.message && err.message.includes('Access is denied')) {
                        this._originalErrorCapture = err; // Save original error
                        // Use a dummy URL to bypass the immediate error, actual request handled by FileAPI
                        originalOpen.apply(this, [methodType, '_ie_crossdomain_workaround_', asyncFlag]);
                    } else {
                        throw err; // Re-throw other errors
                    }
                }
            };
        });

        // Override XHR 'getResponseHeader'
        modifyXHRMethod('getResponseHeader', (originalGetHeader) => {
            return function(headerName) {
                if (this._fileApiProxyXHR && typeof this._fileApiProxyXHR.getResponseHeader === 'function') {
                    return this._fileApiProxyXHR.getResponseHeader(headerName);
                }
                // Fallback to original method or return null if original is not defined
                return originalGetHeader ? originalGetHeader.apply(this, [headerName]) : null;
            };
        });

        // Override XHR 'getAllResponseHeaders'
        modifyXHRMethod('getAllResponseHeaders', (originalGetAllHeaders) => {
            return function() {
                if (this._fileApiProxyXHR && typeof this._fileApiProxyXHR.getAllResponseHeaders === 'function') {
                    return this._fileApiProxyXHR.getAllResponseHeaders();
                }
                // Fallback to original method or return null
                return originalGetAllHeaders ? originalGetAllHeaders.apply(this) : null;
            };
        });

        // Override XHR 'abort'
        modifyXHRMethod('abort', (originalAbort) => {
            return function() {
                if (this._fileApiProxyXHR && typeof this._fileApiProxyXHR.abort === 'function') {
                    return this._fileApiProxyXHR.abort();
                }
                // Fallback to original method or return null
                return originalAbort ? originalAbort.apply(this) : null;
            };
        });

        // Override XHR 'setRequestHeader'
        modifyXHRMethod('setRequestHeader', (originalSetHeader) => {
            return function(headerKey, headerValue) {
                // Special internal header for AngularJS file upload integration
                const CUSTOM_XHR_SETUP_KEY = '__CUSTOM_XHR_HOOK_';
                if (headerKey === CUSTOM_XHR_SETUP_KEY) {
                    setupXHRUploadEvents(this);
                    let processedValue = headerValue(this);
                    // Handle older Angular versions that might pass a function
                    if (typeof processedValue === 'function') {
                        processedValue(this);
                    }
                } else {
                    // Store headers for FileAPI.upload and call original
                    this._storedRequestHeaders = this._storedRequestHeaders || {};
                    this._storedRequestHeaders[headerKey] = headerValue;
                    originalSetHeader.apply(this, arguments);
                }
            };
        });

        // Helper to dynamically define a property on XHR
        function defineXHRProperty(xhrInstance, propertyName, getterFunction) {
            try {
                Object.defineProperty(xhrInstance, propertyName, {
                    get: getterFunction,
                    configurable: true // Allow redefinition if needed
                });
            } catch (propErr) {
                // Ignore errors in environments that don't support Object.defineProperty fully
            }
        }

        // Override XHR 'send' method
        modifyXHRMethod('send', (originalSend) => {
            return function() {
                const currentXHR = this;
                const requestPayload = arguments[0]; // The data being sent

                // Check if the payload is our custom FormData shim
                const IS_CUSTOM_FORM_DATA = '__FILEAPI_SHIM_DATA_';
                if (requestPayload && requestPayload[IS_CUSTOM_FORM_DATA]) {
                    const shimmedFormData = requestPayload;
                    const uploadConfiguration = {
                        targetUrl: currentXHR._requestTargetUrl,
                        jsonp: false, // Disable JSONP query param
                        cache: true,  // Prevent cache-busting query param
                        onComplete: function(completionError, fileApiResultXHR) {
                            currentXHR._requestCompleted = true; // Mark as finished

                            // Dispatch load events
                            if (!completionError && currentXHR._eventHandlers['load']) {
                                currentXHR._eventHandlers['load'].forEach(fn => fn({
                                    type: 'load',
                                    loaded: currentXHR._bytesLoaded,
                                    total: currentXHR._totalBytes,
                                    target: currentXHR,
                                    lengthComputable: true
                                }));
                            }
                            if (!completionError && currentXHR._eventHandlers['loadend']) {
                                currentXHR._eventHandlers['loadend'].forEach(fn => fn({
                                    type: 'loadend',
                                    loaded: currentXHR._bytesLoaded,
                                    total: currentXHR._totalBytes,
                                    target: currentXHR,
                                    lengthComputable: true
                                }));
                            }
                            // Dispatch abort event
                            if (completionError === 'abort' && currentXHR._eventHandlers['abort']) {
                                currentXHR._eventHandlers['abort'].forEach(fn => fn({
                                    type: 'abort',
                                    loaded: currentXHR._bytesLoaded,
                                    total: currentXHR._totalBytes,
                                    target: currentXHR,
                                    lengthComputable: true
                                }));
                            }

                            // Update XHR properties using the FileAPI result
                            if (fileApiResultXHR && fileApiResultXHR.status !== undefined) {
                                defineXHRProperty(currentXHR, 'status', () => {
                                    // Map FileAPI status to XHR status, handle 0 status for errors
                                    return (fileApiResultXHR.status === 0 && completionError && completionError !== 'abort') ? 500 : fileApiResultXHR.status;
                                });
                            }
                            if (fileApiResultXHR && fileApiResultXHR.statusText !== undefined) {
                                defineXHRProperty(currentXHR, 'statusText', () => fileApiResultXHR.statusText);
                            }
                            defineXHRProperty(currentXHR, 'readyState', () => 4); // Always 4 for completed
                            if (fileApiResultXHR && fileApiResultXHR.response !== undefined) {
                                defineXHRProperty(currentXHR, 'response', () => fileApiResultXHR.response);
                            }

                            // Determine responseText, handling errors
                            const responseTxt = fileApiResultXHR ? (fileApiResultXHR.responseText || (completionError && fileApiResultXHR.status === 0 && completionError !== 'abort' ? completionError : undefined)) : undefined;
                            defineXHRProperty(currentXHR, 'responseText', () => responseTxt);
                            // Also define 'response' if it's not already set
                            if (currentXHR.response === undefined) {
                                defineXHRProperty(currentXHR, 'response', () => responseTxt);
                            }
                            if (completionError) {
                                defineXHRProperty(currentXHR, 'err', () => completionError);
                            }

                            currentXHR._fileApiProxyXHR = fileApiResultXHR; // Store the actual FileAPI XHR

                            // Trigger standard XHR event handlers
                            if (currentXHR.onreadystatechange) {
                                currentXHR.onreadystatechange();
                            }
                            if (currentXHR.onload) {
                                currentXHR.onload();
                            }
                        },
                        onFileProgress: function(progressEvent) {
                            // Map FileAPI progress event to XHR's upload progress
                            progressEvent.target = currentXHR;
                            if (currentXHR._eventHandlers['progress']) {
                                currentXHR._eventHandlers['progress'].forEach(fn => fn(progressEvent));
                            }
                            currentXHR._totalBytes = progressEvent.total;
                            currentXHR._bytesLoaded = progressEvent.loaded;

                            // Flash issue workaround: if total bytes equal loaded bytes,
                            // FileAPI might not call 'complete' if no response text.
                            if (progressEvent.total === progressEvent.loaded) {
                                const selfReference = this;
                                setTimeout(() => {
                                    if (!currentXHR._requestCompleted) {
                                        // Mock empty response headers
                                        currentXHR.getAllResponseHeaders = () => '';
                                        // Manually complete with 204 No Content
                                        selfReference.onComplete(null, { status: 204, statusText: 'No Content' });
                                    }
                                }, window.FileAPI.noContentTimeout || 10000); // Default 10 seconds
                            }
                        },
                        requestHeaders: currentXHR._storedRequestHeaders
                    };

                    uploadConfiguration.data = {};
                    uploadConfiguration.files = {};

                    // Process custom FormData entries
                    for (let itemIndex = 0; itemIndex < shimmedFormData.dataEntries.length; itemIndex++) {
                        const currentItem = shimmedFormData.dataEntries[itemIndex];
                        // Check if it's a file-like object (duck typing)
                        if (currentItem.value && currentItem.value.name !== undefined && currentItem.value.size !== undefined && currentItem.value.type !== undefined) {
                            uploadConfiguration.files[currentItem.keyName] = currentItem.value;
                        } else {
                            uploadConfiguration.data[currentItem.keyName] = currentItem.value;
                        }
                    }

                    // Defer FileAPI.upload call to avoid blocking
                    setTimeout(() => {
                        if (!checkFlashPresence()) {
                            throw new Error('Adobe Flash Player is required for FileAPI shim. Use "FileAPI.hasFlash" to check availability.');
                        }
                        currentXHR._fileApiProxyXHR = window.FileAPI.upload(uploadConfiguration);
                    }, 5); // Small delay
                } else {
                    // If an original error was captured from 'open', re-throw it now
                    if (this._originalErrorCapture) {
                        throw this._originalErrorCapture;
                    }
                    originalSend.apply(currentXHR, arguments); // Call native send
                }
            };
        });
        window.XMLHttpRequest._isShimmedByFileAPI = true; // Mark XHR as shimmed

        // Helper to check if an element is an input type="file"
        const isElementFileInput = (domElement) => {
            if (!domElement || !domElement[0]) return false;
            const tagName = domElement[0].tagName.toLowerCase();
            const typeAttr = domElement.attr('type');
            return tagName === 'input' && typeAttr && typeAttr.toLowerCase() === 'file';
        };

        // Angular-specific fix for IE file inputs using Flash
        window.FileAPI.ngfPatchInput = (targetElement, inputCreatorFn, changeHandlerFn, resetModelFn) => {
            if (!checkFlashPresence()) {
                throw new Error('Flash Player is mandatory for this functionality. Verify with "FileAPI.hasFlash".');
            }

            // Function to create and position the Flash-backed input
            const setupFlashInput = (eventObj) => {
                if (targetElement.attr('disabled')) {
                    targetElement._ngf_flash_input_.removeClass('fileapi-flash-wrapper');
                } else {
                    const flashInput = targetElement._ngf_flash_input_ = inputCreatorFn();
                    flashInput.addClass('fileapi-flash-wrapper');

                    // Position the Flash input overlay for non-file inputs
                    if (!isElementFileInput(targetElement)) {
                        const parentPosition = flashInput.parent().css('position');
                        if (parentPosition === '' || parentPosition === 'static') {
                            flashInput.parent().css('position', 'relative');
                        }
                        flashInput.css({
                            position: 'absolute',
                            top: `${targetElement[0].offsetTop}px`,
                            left: `${targetElement[0].offsetLeft}px`,
                            width: `${targetElement[0].offsetWidth}px`,
                            height: `${targetElement[0].offsetHeight}px`,
                            padding: targetElement.css('padding'),
                            margin: targetElement.css('margin'),
                            filter: 'alpha(opacity=0)', // IE opacity
                            opacity: 0, // Standard opacity
                            zIndex: 1000 // Ensure it's on top
                        });
                    }
                    // Re-bind mouseenter to ensure the Flash input is always correctly positioned
                    setTimeout(() => {
                        flashInput.bind('mouseenter', setupFlashInput);
                    }, 15);
                    flashInput.unbind('change'); // Remove any previous change handlers
                    flashInput.bind('change', (changeEvt) => {
                        processFileApiChangeEvent.apply(this, [changeEvt]);
                        changeHandlerFn.apply(this, [changeEvt]); // Call original change handler
                    });
                }
            };

            targetElement.bind('mouseenter', setupFlashInput); // Initial setup

            // Processes the change event from the Flash-backed input
            const processFileApiChangeEvent = (rawEvent) => {
                const retrievedFiles = window.FileAPI.getFiles(rawEvent);
                // Ensure file properties are defined for consistency (#233)
                for (let k = 0; k < retrievedFiles.length; k++) {
                    const currentFile = retrievedFiles[k];
                    currentFile.size = currentFile.size === undefined ? 0 : currentFile.size;
                    currentFile.name = currentFile.name === undefined ? 'default_file' : currentFile.name;
                    currentFile.type = currentFile.type === undefined ? 'application/octet-stream' : currentFile.type;
                }

                // Attach files to event target, handling read-only target.files
                rawEvent.target = rawEvent.target || {};
                try {
                    // Try to assign directly
                    rawEvent.target.files = retrievedFiles;
                } catch (e) {
                    // If target.files is read-only, use a custom property
                    rawEvent._shimmedFiles_ = retrievedFiles;
                }

                // Add item method for compatibility
                const fileListSource = rawEvent._shimmedFiles_ || rawEvent.target.files;
                fileListSource.item = (idx) => fileListSource[idx] || null;
            };
        };

        // Polyfill FormData constructor
        window.FormData = function CustomFormDataShim() {
            return {
                append: function(paramKey, paramValue, fileName) {
                    // If value is a shimmed Blob, extract its data
                    const BLOB_SHIM_FLAG = '__FILEAPI_BLOB_SHIM_';
                    if (paramValue && paramValue[BLOB_SHIM_FLAG]) {
                        paramValue = paramValue.rawContent[0];
                    }
                    this.dataEntries.push({
                        keyName: paramKey,
                        value: paramValue,
                        name: fileName // Optional file name
                    });
                },
                dataEntries: [],
                __FILEAPI_SHIM_DATA_: true // Mark as custom shim
            };
        };

        // Polyfill Blob constructor
        window.Blob = function CustomBlobShim(blobParts) {
            return {
                rawContent: blobParts,
                __FILEAPI_BLOB_SHIM_: true // Mark as custom shim
            };
        };

        // Load FileAPI library dynamically
        (function loadFileAPILibrary() {
            if (!window.FileAPI) {
                window.FileAPI = {};
            }
            // If forced, ensure HTML5 mode is off
            if (window.FileAPI.forceLoad) {
                window.FileAPI.html5 = false;
            }

            // Only load if FileAPI.upload is not available
            if (!window.FileAPI.upload) {
                let scriptSourceUrl, baseLibraryPath;
                const headElement = document.getElementsByTagName('head')[0];
                const newScriptTag = document.createElement('script');
                const allPageScripts = document.getElementsByTagName('script');

                if (window.FileAPI.scriptUrl) {
                    scriptSourceUrl = window.FileAPI.scriptUrl;
                } else if (window.FileAPI.libraryPath) {
                    baseLibraryPath = window.FileAPI.libraryPath;
                } else {
                    // Attempt to infer base path from current script's URL
                    for (let scriptIdx = 0; scriptIdx < allPageScripts.length; scriptIdx++) {
                        const currentScriptSrc = allPageScripts[scriptIdx].src;
                        const matchIndex = currentScriptSrc.search(/\/angular\-file\-upload[\-a-zA-z0-9\.]*\.js/);
                        if (matchIndex > -1) {
                            baseLibraryPath = currentScriptSrc.substring(0, matchIndex + 1);
                            break;
                        }
                    }
                }

                // Set static path if not already defined
                if (window.FileAPI.staticAssetPath == null) {
                    window.FileAPI.staticAssetPath = baseLibraryPath;
                }

                newScriptTag.setAttribute('src', scriptSourceUrl || `${baseLibraryPath}FileAPI.min.js`);
                headElement.appendChild(newScriptTag);
                window.FileAPI.hasFlash = checkFlashPresence(); // Store flash status
            }
        })();

        // Utility to enable/disable FileAPI input overlay
        window.FileAPI.toggleInputWrapper = (elementRef, shouldDisable) => {
            const WRAPPER_CLASS = 'fileapi-flash-wrapper';
            if (shouldDisable) {
                elementRef.removeClass(WRAPPER_CLASS);
            } else {
                elementRef.addClass(WRAPPER_CLASS);
            }
        };
    }

    // Polyfill FileReader for browsers that lack it
    if (!window.FileReader) {
        window.FileReader = function CustomFileReaderShim() {
            const self = this;
            let fileLoadStarted = false;

            this.eventListeners = {}; // Store custom event handlers
            this.addEventListener = function(type, handler) {
                if (!self.eventListeners[type]) {
                    self.eventListeners[type] = [];
                }
                self.eventListeners[type].push(handler);
            };
            this.removeEventListener = function(type, handler) {
                if (self.eventListeners[type]) {
                    const handlerIndex = self.eventListeners[type].indexOf(handler);
                    if (handlerIndex > -1) {
                        self.eventListeners[type].splice(handlerIndex, 1);
                    }
                }
            };
            this.dispatchEvent = function(eventObject) {
                const handlers = self.eventListeners[eventObject.type];
                if (handlers) {
                    handlers.forEach(func => func.call(self, eventObject));
                }
            };

            // Standard FileReader event properties
            this.onabort = this.onerror = this.onload = this.onloadstart = this.onloadend = this.onprogress = null;

            // Helper to create a consistent event object
            const createReaderEvent = (eventType, originalEvent) => {
                const newEvent = {
                    type: eventType,
                    target: self,
                    loaded: originalEvent.loaded,
                    total: originalEvent.total,
                    error: originalEvent.error
                };
                if (originalEvent.result !== undefined) {
                    newEvent.target.result = originalEvent.result;
                }
                return newEvent;
            };

            // Unified listener for FileAPI read events
            const fileAPIEventListener = (fileApiEvent) => {
                // Trigger onloadstart once
                if (!fileLoadStarted) {
                    fileLoadStarted = true;
                    if (self.onloadstart) {
                        self.onloadstart(createReaderEvent('loadstart', fileApiEvent));
                    }
                }

                // Dispatch specific events based on FileAPI event type
                if (fileApiEvent.type === 'load') {
                    if (self.onloadend) {
                        self.onloadend(createReaderEvent('loadend', fileApiEvent));
                    }
                    const loadEvt = createReaderEvent('load', fileApiEvent);
                    if (self.onload) {
                        self.onload(loadEvt);
                    }
                    self.dispatchEvent(loadEvt);
                } else if (fileApiEvent.type === 'progress') {
                    const progressEvt = createReaderEvent('progress', fileApiEvent);
                    if (self.onprogress) {
                        self.onprogress(progressEvt);
                    }
                    self.dispatchEvent(progressEvt);
                } else if (fileApiEvent.type === 'error') {
                    const errorEvt = createReaderEvent('error', fileApiEvent);
                    if (self.onerror) {
                        self.onerror(errorEvt);
                    }
                    self.dispatchEvent(errorEvt);
                }
            };

            // FileReader methods, delegating to FileAPI
            this.readAsArrayBuffer = function(fileItem) {
                // FileAPI.readAsBinaryString is typically used for ArrayBuffer in shims
                window.FileAPI.readAsBinaryString(fileItem, fileAPIEventListener);
            };
            this.readAsBinaryString = function(fileItem) {
                window.FileAPI.readAsBinaryString(fileItem, fileAPIEventListener);
            };
            this.readAsDataURL = function(fileItem) {
                window.FileAPI.readAsDataURL(fileItem, fileAPIEventListener);
            };
            this.readAsText = function(fileItem, encoding) {
                // Add encoding parameter which FileAPI.readAsText supports
                window.FileAPI.readAsText(fileItem, fileAPIEventListener, encoding);
            };
        };
    }
})();