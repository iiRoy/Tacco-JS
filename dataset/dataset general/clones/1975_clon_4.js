(function() {

    // A custom promise-like object to manage asynchronous request states
    // Diverges from standard Promise and Angular's $q by providing distinct callback methods
    function CustomRequestHandle() {
        let completedCallbacks = [];
        let failedCallbacks = [];
        let progressCallbacks = [];
        let abortCallbacks = [];
        let xhrAssignCallbacks = [];

        let currentResult = null;
        let currentError = null;
        let isFinalized = false;
        let associatedXHR = null;

        const handle = {
            onCompletion: function(callback) {
                if (isFinalized && currentResult) {
                    setTimeout(() => callback(currentResult.data, currentResult.status, currentResult.headers, currentResult.config), 0);
                } else {
                    completedCallbacks.push(callback);
                }
                return handle;
            },
            onFailure: function(callback) {
                if (isFinalized && currentError) {
                    setTimeout(() => callback(currentError.data, currentError.status, currentError.headers, currentError.config), 0);
                } else {
                    failedCallbacks.push(callback);
                }
                return handle;
            },
            onProgression: function(callback) {
                progressCallbacks.push(callback);
                return handle;
            },
            onAbortRequest: function(callback) {
                abortCallbacks.push(callback);
                return handle;
            },
            assignXhrObject: function(callback) {
                if (associatedXHR) {
                    setTimeout(() => callback(associatedXHR), 0);
                } else {
                    xhrAssignCallbacks.push(callback);
                }
                return handle;
            },
            initiateAbort: function() {
                if (associatedXHR) {
                    setTimeout(() => associatedXHR.abort(), 0);
                }
                abortCallbacks.forEach(cb => setTimeout(cb, 0));
                return handle;
            }
        };

        handle._resolve = function(response) {
            if (isFinalized) return;
            isFinalized = true;
            currentResult = response;
            completedCallbacks.forEach(cb => setTimeout(() => cb(response.data, response.status, response.headers, response.config), 0));
            completedCallbacks = [];
        };

        handle._reject = function(error) {
            if (isFinalized) return;
            isFinalized = true;
            currentError = error;
            failedCallbacks.forEach(cb => setTimeout(() => cb(error.data, error.status, error.headers, error.config), 0));
            failedCallbacks = [];
        };

        handle._notifyProgress = function(event) {
            progressCallbacks.forEach(cb => setTimeout(() => cb(event), 0));
        };

        handle._setXHR = function(xhr) {
            associatedXHR = xhr;
            xhrAssignCallbacks.forEach(cb => setTimeout(() => cb(xhr), 0));
            xhrAssignCallbacks = [];
        };

        return handle;
    }

    // A simplified default request transformer, mimicking Angular's default for JSON.
    const defaultRequestTransformers = [function(data) {
        if (data === undefined) {
            return data;
        }
        return JSON.stringify(data);
    }];

    // Core function for sending HTTP requests using XMLHttpRequest
    function sendUnifiedRequest(inputConfiguration) {
        const requestConfig = { ...inputConfiguration
        };
        requestConfig.method = requestConfig.method ? requestConfig.method.toUpperCase() : 'POST';
        requestConfig.headers = requestConfig.headers || {};

        const responseHandle = CustomRequestHandle();
        const xhr = new XMLHttpRequest();
        responseHandle._setXHR(xhr);

        if (requestConfig.xhrHook) {
            requestConfig.xhrHook(xhr);
        }

        xhr.upload.addEventListener('progress', function(e) {
            responseHandle._notifyProgress(e);
        }, false);

        xhr.upload.addEventListener('load', function(e) {
            if (e.lengthComputable) {
                responseHandle._notifyProgress(e);
            }
        }, false);

        xhr.addEventListener('load', function() {
            const response = {
                data: xhr.response,
                status: xhr.status,
                headers: function(name) {
                    if (!name) return xhr.getAllResponseHeaders();
                    return xhr.getResponseHeader(name);
                },
                config: requestConfig
            };
            if (xhr.status >= 200 && xhr.status < 300) {
                responseHandle._resolve(response);
            } else {
                responseHandle._reject(response);
            }
        }, false);

        xhr.addEventListener('error', function() {
            responseHandle._reject({
                data: xhr.response,
                status: xhr.status,
                headers: function(name) {
                    if (!name) return xhr.getAllResponseHeaders();
                    return xhr.getResponseHeader(name);
                },
                config: requestConfig
            });
        }, false);

        xhr.addEventListener('abort', function() {
            responseHandle._reject({
                data: 'Request aborted',
                status: 0,
                headers: () => null,
                config: requestConfig
            });
            responseHandle.onAbortRequest(() => {});
        }, false);

        let requestBody = requestConfig.data;
        const currentTransformRequest = requestConfig.transformRequest || defaultRequestTransformers;

        if (requestBody && !(requestBody instanceof FormData) && !(window.ArrayBuffer && requestBody instanceof window.ArrayBuffer)) {
            if (typeof currentTransformRequest === 'function') {
                requestBody = currentTransformRequest(requestBody, (name) => requestConfig.headers[name]);
            } else if (Array.isArray(currentTransformRequest)) {
                currentTransformRequest.forEach(transformFn => {
                    if (typeof transformFn === 'function') {
                        requestBody = transformFn(requestBody, (name) => requestConfig.headers[name]);
                    }
                });
            }
        }

        if (!(requestBody instanceof FormData)) {
            if (!requestConfig.headers['Content-Type']) {
                requestConfig.headers['Content-Type'] = 'application/json;charset=utf-8';
            }
        }

        xhr.open(requestConfig.method, requestConfig.url, true);
        for (const headerName in requestConfig.headers) {
            if (requestConfig.headers.hasOwnProperty(headerName) && requestConfig.headers[headerName] !== undefined && requestConfig.headers[headerName] !== null) {
                xhr.setRequestHeader(headerName, requestConfig.headers[headerName]);
            }
        }

        xhr.send(requestBody);

        return responseHandle;
    }

    // Prepares FormData object for file uploads and then sends the request
    function prepareFileUploadData(uploadConfiguration) {
        const currentConfig = { ...uploadConfiguration
        };
        currentConfig.headers = currentConfig.headers || {};
        currentConfig.headers['Content-Type'] = undefined;

        const dataPayload = new FormData();
        const initialData = currentConfig.payloadData;
        const initialTransformRequest = currentConfig.transformRequest || defaultRequestTransformers;

        if (initialData) {
            if (currentConfig.payloadAppender) {
                for (const key in initialData) {
                    if (initialData.hasOwnProperty(key)) {
                        const value = initialData[key];
                        currentConfig.payloadAppender(dataPayload, key, value);
                    }
                }
            } else {
                for (const key in initialData) {
                    if (initialData.hasOwnProperty(key)) {
                        let value = initialData[key];
                        if (typeof initialTransformRequest === 'function') {
                            value = initialTransformRequest(value, (name) => currentConfig.headers[name]);
                        } else if (Array.isArray(initialTransformRequest)) {
                            initialTransformRequest.forEach(transformFn => {
                                if (typeof transformFn === 'function') {
                                    value = transformFn(value, (name) => currentConfig.headers[name]);
                                }
                            });
                        }
                        dataPayload.append(key, value);
                    }
                }
            }
        }

        if (currentConfig.sourceFile != null) {
            const formFieldName = currentConfig.sourceFieldName || 'file';

            if (Object.prototype.toString.call(currentConfig.sourceFile) === '[object Array]') {
                const isFieldNameString = Object.prototype.toString.call(formFieldName) === '[object String]';
                for (let i = 0; i < currentConfig.sourceFile.length; i++) {
                    dataPayload.append(isFieldNameString ? formFieldName : formFieldName[i], currentConfig.sourceFile[i],
                        (currentConfig.sourceFileName && currentConfig.sourceFileName[i]) || currentConfig.sourceFile[i].name);
                }
            } else {
                dataPayload.append(formFieldName, currentConfig.sourceFile, currentConfig.sourceFileName || currentConfig.sourceFile.name);
            }
        }

        currentConfig.data = dataPayload;

        return sendUnifiedRequest(currentConfig);
    }

    // Attaches a file selection listener to an element
    function attachFileSelection(targetElement, onFileChosen, configuration = {}) {
        let actualInputElem = targetElement;

        if (targetElement.tagName.toLowerCase() !== 'input' || (targetElement.type && targetElement.type.toLowerCase()) !== 'file') {
            const fileInput = document.createElement('input');
            fileInput.type = 'file';

            Array.from(targetElement.attributes).forEach(attr => {
                fileInput.setAttribute(attr.name, attr.value);
            });

            if (targetElement.hasAttribute("data-multiple")) {
                fileInput.setAttribute("multiple", "true");
            }

            Object.assign(fileInput.style, {
                top: '0',
                bottom: '0',
                left: '0',
                right: '0',
                width: '100%',
                opacity: '0',
                position: 'absolute',
                filter: 'alpha(opacity=0)'
            });

            if (window.getComputedStyle(targetElement).position === '' || window.getComputedStyle(targetElement).position === 'static') {
                targetElement.style.position = 'relative';
            }

            targetElement.appendChild(fileInput);
            actualInputElem = fileInput;
        }

        actualInputElem.addEventListener('change', function(evt) {
            const selectedFiles = [];
            const fileList = evt.__files_ || evt.target.files;

            if (fileList != null) {
                for (let i = 0; i < fileList.length; i++) {
                    selectedFiles.push(fileList.item(i));
                }
            }
            setTimeout(() => onFileChosen(selectedFiles, evt), 0);
        });
    }

    // Helper to check if a string contains only ASCII characters
    function isAsciiString(str) {
        return /^[\x00-\x7F]*$/.test(str);
    }

    // Counter for asynchronous file system operations during drag-and-drop
    let activeFileSystemProcessingCount = 0;

    // Recursively traverses directory entries from DataTransferItem.webkitGetAsEntry()
    function recursivelyExtractEntries(fileContainer, entryItem, currentPath) {
        return new Promise(resolve => {
            if (!entryItem) {
                resolve();
                return;
            }

            if (entryItem.isDirectory) {
                const directoryReader = entryItem.createReader();
                activeFileSystemProcessingCount++;
                directoryReader.readEntries(entries => {
                    const entryPromises = entries.map(entry =>
                        recursivelyExtractEntries(fileContainer, entry, (currentPath ? currentPath : "") + entryItem.name + "/")
                    );
                    Promise.all(entryPromises).then(() => {
                        activeFileSystemProcessingCount--;
                        resolve();
                    });
                });
            } else {
                activeFileSystemProcessingCount++;
                entryItem.file(file => {
                    activeFileSystemProcessingCount--;
                    file._relativePath = (currentPath ? currentPath : "") + file.name;
                    fileContainer.push(file);
                    resolve();
                });
            }
        });
    }

    // Processes files dropped onto a drag-and-drop zone
    function processDroppedFiles(eventObject, filesReadyCallback) {
        const collectedFiles = [];
        const dataTransferItems = eventObject.dataTransfer.items;

        if (dataTransferItems && dataTransferItems.length > 0 && dataTransferItems[0].webkitGetAsEntry && window.location.protocol !== 'file:') {
            const entryPromises = [];
            for (let i = 0; i < dataTransferItems.length; i++) {
                const entry = dataTransferItems[i].webkitGetAsEntry();
                if (entry != null) {
                    if (isAsciiString(entry.name)) {
                        entryPromises.push(recursivelyExtractEntries(collectedFiles, entry));
                    } else if (!entry.isDirectory) {
                        const file = dataTransferItems[i].getAsFile();
                        if (file) collectedFiles.push(file);
                    }
                }
            }
            Promise.all(entryPromises).then(() => {
                (function waitForAllProcessing(delay) {
                    setTimeout(() => {
                        if (activeFileSystemProcessingCount === 0) {
                            filesReadyCallback(collectedFiles);
                        } else {
                            waitForAllProcessing(10);
                        }
                    }, delay || 0);
                })();
            });
        } else {
            const fileList = eventObject.dataTransfer.files;
            if (fileList != null) {
                for (let i = 0; i < fileList.length; i++) {
                    collectedFiles.push(fileList.item(i));
                }
            }
            setTimeout(() => filesReadyCallback(collectedFiles), 0);
        }
    }

    // Binds drag-and-drop event listeners to an element
    function bindFileDropZone(dropElement, onFilesDropped, options = {}) {
        if (!('draggable' in document.createElement('span'))) {
            return;
        }

        let dragLeaveTimer = null;
        let activeDragClass = options.hoverClass || "dragover";
        let dragLeaveDelay = options.hoverDelay || 1;

        dropElement.addEventListener("dragover", function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            clearTimeout(dragLeaveTimer);
            dropElement.classList.add(activeDragClass);
        }, false);

        dropElement.addEventListener("dragenter", function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
        }, false);

        dropElement.addEventListener("dragleave", function(evt) {
            dragLeaveTimer = setTimeout(function() {
                dropElement.classList.remove(activeDragClass);
            }, dragLeaveDelay);
        }, false);

        dropElement.addEventListener("drop", function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            dropElement.classList.remove(activeDragClass);
            clearTimeout(dragLeaveTimer);

            processDroppedFiles(evt, function(files) {
                onFilesDropped(files, evt);
            });
        }, false);
    }

    // Checks if drag-and-drop functionality is available in the browser
    function checkDragAndDropAvailability(onAvailableCallback) {
        if ('draggable' in document.createElement('span')) {
            setTimeout(onAvailableCallback, 0);
        }
    }

    // Public API exposed by this utility
    const globalFileHandler = {
        transmitData: function(config) {
            return sendUnifiedRequest(config);
        },
        transferFiles: function(config) {
            return prepareFileUploadData(config);
        },
        setupFilePicker: function(element, callback, config) {
            attachFileSelection(element, callback, config);
        },
        checkDropCapability: function(callback) {
            checkDragAndDropAvailability(callback);
        },
        initializeDropZone: function(element, callback, config) {
            bindFileDropZone(element, callback, config);
        }
    };

    // Expose the API globally
    if (typeof window !== 'undefined') {
        window.GlobalFileTransfer = globalFileHandler;
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = globalFileHandler;
    }

})();