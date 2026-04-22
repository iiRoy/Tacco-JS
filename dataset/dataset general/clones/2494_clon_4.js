const AppTools = {};

AppTools.mergeProperties = (targetObject, sourceObject) => {
    return Object.assign(targetObject, sourceObject);
};

AppTools.findElementIndex = (collection, item, start = 0) => {
    return collection.findIndex((element, index) => index >= start && element === item);
};

AppTools.generateIdentifier = (() => {
    let currentId = 0;
    return () => currentId++;
})();

const listenerRegistry = new WeakMap();

AppTools.eventManager = {
    connect: (targetNode, eventType, callbackFn, useCapture = false) => {
        targetNode.addEventListener(eventType, callbackFn, useCapture);
        if (!listenerRegistry.has(targetNode)) {
            listenerRegistry.set(targetNode, new Map());
        }
        const elementListeners = listenerRegistry.get(targetNode);
        if (!elementListeners.has(eventType)) {
            elementListeners.set(eventType, new Set());
        }
        elementListeners.get(eventType).add(callbackFn);
    },
    disconnect: (targetNode, eventType, callbackFn, useCapture = false) => {
        targetNode.removeEventListener(eventType, callbackFn, useCapture);
        const elementListeners = listenerRegistry.get(targetNode);
        if (elementListeners && elementListeners.has(eventType)) {
            elementListeners.get(eventType).delete(callbackFn);
            if (elementListeners.get(eventType).size === 0) {
                elementListeners.delete(eventType);
            }
            if (elementListeners.size === 0) {
                listenerRegistry.delete(targetNode);
            }
        }
    }
};

AppTools.haltEvent = (evt) => {
    evt.preventDefault();
};

AppTools.placeBefore = (newChild, referenceChild) => {
    referenceChild.parentNode.insertBefore(newChild, referenceChild);
};
AppTools.obliterate = (targetNode) => {
    targetNode.parentNode.removeChild(targetNode);
};

AppTools.includesDescendant = (ancestor, descendant) => {
    if (ancestor === descendant) return true;
    return ancestor.contains(descendant);
};

AppTools.convertHtmlToNode = (() => {
    const tempRange = document.createRange();
    tempRange.selectNode(document.body);
    return (htmlString) => {
        const fragment = tempRange.createContextualFragment(htmlString);
        return fragment.firstElementChild;
    };
})();

AppTools.applyStyles = (targetNode, styleMap) => {
    Object.assign(targetNode.style, styleMap);
};
AppTools.checkClass = (targetNode, className) => {
    return targetNode.classList.contains(className);
};
AppTools.appendClass = (targetNode, className) => {
    targetNode.classList.add(className);
};
AppTools.stripClass = (targetNode, className) => {
    targetNode.classList.remove(className);
};
AppTools.updateNodeText = (targetNode, content) => {
    targetNode.textContent = content;
};

AppTools.immediateChildren = (parentElement) => {
    return Array.from(parentElement.children);
};
AppTools.findNodesByClass = (rootElement, className) => {
    return Array.from(rootElement.querySelectorAll(`.${className}`));
};

AppTools.serializeDataToQuery = (dataObject, initialUrl = '', isNested = false) => {
    const parameterSegments = [];

    const encodeValue = (val) => {
        if (typeof val === 'function') {
            return encodeURIComponent(val());
        }
        return encodeURIComponent(val);
    };

    const processEntry = (key, value, currentPrefix) => {
        const fullKey = currentPrefix ? `${currentPrefix}[${key}]` : key;

        if (value === null || typeof value === 'undefined') {
            // Skip null/undefined
        } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
                processEntry(index.toString(), item, `${fullKey}[]`);
            });
        } else if (typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]') {
            Object.keys(value).forEach(nestedKey => {
                processEntry(nestedKey, value[nestedKey], fullKey);
            });
        } else {
            parameterSegments.push(`${encodeURIComponent(fullKey)}=${encodeValue(value)}`);
        }
    };

    if (!isNested && initialUrl) {
        const [baseUrl, existingQuery] = initialUrl.split('?', 2);
        let currentQuery = '';
        if (existingQuery) {
            currentQuery = existingQuery;
        }

        Object.keys(dataObject).forEach(key => {
            processEntry(key, dataObject[key], '');
        });

        const newQueryParams = parameterSegments.join('&');
        const finalQuery = [currentQuery, newQueryParams].filter(Boolean).join('&');

        return baseUrl + (finalQuery ? `?${finalQuery}` : '');

    } else {
        Object.keys(dataObject).forEach(key => {
            processEntry(key, dataObject[key], '');
        });
        return parameterSegments.join('&').replace(/%20/g, '+');
    }
};

class HttpTransferProcessor {
    static isSupported() { return typeof XMLHttpRequest !== 'undefined' && (new XMLHttpRequest()).upload; }
    constructor(config) {
        this.config = config;
        this.activeRequests = {};
        this.connectionCount = 0;
    }
    add(fileInputOrFile) {
        const uniqueId = AppTools.generateIdentifier();
        this.activeRequests[uniqueId] = {
            file: fileInputOrFile.files ? fileInputOrFile.files[0] : fileInputOrFile,
            name: fileInputOrFile.value ? fileInputOrFile.value.replace(/.*(\/|\\)/, "") : (fileInputOrFile.fileName || fileInputOrFile.name)
        };
        return uniqueId;
    }
    getName(id) {
        return this.activeRequests[id] ? this.activeRequests[id].name : undefined;
    }
    upload(id, parameters) {
        const item = this.activeRequests[id];
        if (!item) return;

        this.connectionCount++;
        const xhr = new XMLHttpRequest();
        item.xhr = xhr;

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                this.config.onProgress(id, item.name, e.loaded, e.total);
            }
        });

        xhr.addEventListener('load', () => {
            this.connectionCount--;
            const result = JSON.parse(xhr.responseText);
            this.config.onComplete(id, item.name, result);
            delete this.activeRequests[id];
        });

        xhr.addEventListener('error', () => {
            this.connectionCount--;
            this.config.onComplete(id, item.name, { error: 'Network error' });
            delete this.activeRequests[id];
        });

        xhr.addEventListener('abort', () => {
            this.connectionCount--;
            this.config.onCancel(id, item.name);
            delete this.activeRequests[id];
        });

        const formData = new FormData();
        formData.append(this.config.inputName || 'qqfile', item.file, item.name);
        for (const key in parameters) {
            formData.append(key, parameters[key]);
        }

        xhr.open('POST', this.config.action, true);
        xhr.send(formData);
    }
    cancel(id) {
        if (this.activeRequests[id] && this.activeRequests[id].xhr) {
            this.activeRequests[id].xhr.abort();
        }
    }
}

class FormTransferProcessor {
    static isSupported() { return true; } // Always supported as fallback
    constructor(config) {
        this.config = config;
        this.activeRequests = {};
    }
    add(fileInput) {
        const uniqueId = AppTools.generateIdentifier();
        const filename = fileInput.value.replace(/.*(\/|\\)/, "");
        this.activeRequests[uniqueId] = {
            input: fileInput,
            name: filename
        };
        return uniqueId;
    }
    getName(id) {
        return this.activeRequests[id] ? this.activeRequests[id].name : undefined;
    }
    upload(id, parameters) {
        const item = this.activeRequests[id];
        if (!item) return;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        const form = document.createElement('form');
        form.style.display = 'none';
        form.action = this.config.action;
        form.method = 'POST';
        form.enctype = 'multipart/form-data';
        form.target = iframe.name = `upload_iframe_${id}`;
        document.body.appendChild(form);

        for (const key in parameters) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = parameters[key];
            form.appendChild(input);
        }

        const oldInput = item.input;
        const newInput = document.createElement('input');
        newInput.type = 'file';
        newInput.name = oldInput.name; // Preserve original input name
        oldInput.parentNode.insertBefore(newInput, oldInput); // Replace the input field
        form.appendChild(oldInput); // Move the file input into the form

        AppTools.eventManager.connect(iframe, 'load', () => {
            let result = {};
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if (doc.body.innerHTML) {
                    result = JSON.parse(doc.body.innerHTML);
                }
            } catch (e) {
                // If not JSON, assume error
                result = { error: 'Server response invalid or empty.' };
            }
            this.config.onComplete(id, item.name, result);
            AppTools.obliterate(iframe);
            AppTools.obliterate(form);
            delete this.activeRequests[id];
        });

        form.submit();
    }
    cancel(id) {
        // Form-based upload cannot be reliably cancelled after submission.
        // It might be possible to remove the iframe, but the server request might still complete.
        // For Type IV, we'll simulate cancellation like the original might have implicitly.
        if (this.activeRequests[id]) {
            this.config.onCancel(id, this.activeRequests[id].name);
            delete this.activeRequests[id];
        }
    }
}

class InputActivationButton {
    constructor(config) {
        this.config = config;
        this.inputElement = document.createElement('input');
        this.inputElement.type = 'file';
        this.inputElement.style.position = 'absolute';
        this.inputElement.style.right = '0';
        this.inputElement.style.top = '0';
        this.inputElement.style.fontFamily = 'Arial';
        this.inputElement.style.fontSize = '118px';
        this.inputElement.style.margin = '0';
        this.inputElement.style.padding = '0';
        this.inputElement.style.cursor = 'pointer';
        this.inputElement.style.opacity = '0';
        this.inputElement.style.zIndex = '2147483583';

        AppTools.applyStyles(this.config.element, {
            position: 'relative',
            overflow: 'hidden',
            direction: 'ltr'
        });
        this.config.element.appendChild(this.inputElement);

        AppTools.eventManager.connect(this.inputElement, 'change', () => {
            if (this.inputElement.files && this.inputElement.files.length > 0 || this.inputElement.value) {
                this.config.onChange(this.inputElement);
            }
        });

        if (this.config.multiple) {
            this.inputElement.setAttribute('multiple', 'multiple');
        }
    }

    reset() {
        // Create a new input element to clear the selection
        const newInputElement = this.inputElement.cloneNode(true);
        this.inputElement.parentNode.replaceChild(newInputElement, this.inputElement);
        this.inputElement = newInputElement;
        
        AppTools.eventManager.connect(this.inputElement, 'change', () => {
            if (this.inputElement.files && this.inputElement.files.length > 0 || this.inputElement.value) {
                this.config.onChange(this.inputElement);
            }
        });
    }
}

class DocumentUploadManager {
    #configuration;
    #activeTransfers;
    #transferProcessor;
    #uploadInitiator;

    constructor(settings) {
        this.#configuration = AppTools.mergeProperties({
            debugMode: false,
            targetEndpoint: '/server/upload',
            additionalParameters: {},
            triggerElement: null,
            allowMultiple: true,
            concurrentUploads: 3,
            permittedExtensions: [],
            maxFileSize: 0,
            minFileSize: 0,
            onSubmission: (fileId, filename) => {},
            onProgressUpdate: (fileId, filename, uploaded, total) => {},
            onCompletion: (fileId, filename, serverResponse) => {},
            onCancellation: (fileId, filename) => {},
            userMessages: {
                invalidType: "{file} has an invalid extension. Only {extensions} are allowed.",
                exceedsSize: "{file} is too large; maximum size is {maxFileSize}.",
                belowMinSize: "{file} is too small; minimum size is {minFileSize}.",
                emptyFile: "{file} is empty. Please re-select files.",
                leavingPage: "Uploads are in progress. Navigating away will cancel them."
            },
            displayMessage: (msg) => alert(msg)
        }, settings);

        this.#activeTransfers = 0;
        this.#transferProcessor = this.#initializeTransferMechanism();

        if (this.#configuration.triggerElement) {
            this.#uploadInitiator = this.#createUploadActivator(this.#configuration.triggerElement);
        }

        this.#preventPageExitDuringUpload();
    }

    setExtraParameters(newParams) {
        this.#configuration.additionalParameters = newParams;
    }

    getOngoingUploadCount() {
        return this.#activeTransfers;
    }

    #createUploadActivator(elementNode) {
        const managerInstance = this;

        return new InputActivationButton({
            element: elementNode,
            multiple: this.#configuration.allowMultiple && HttpTransferProcessor.isSupported(),
            onChange: (fileInputEl) => {
                managerInstance.#handleFileInputChange(fileInputEl);
            }
        });
    }

    #initializeTransferMechanism() {
        const managerInstance = this;
        const ProcessorClass = HttpTransferProcessor.isSupported() ? HttpTransferProcessor : FormTransferProcessor;

        return new ProcessorClass({
            debug: this.#configuration.debugMode,
            action: this.#configuration.targetEndpoint,
            maxConnections: this.#configuration.concurrentUploads,
            onProgress: (fileId, filename, loadedBytes, totalBytes) => {
                managerInstance.#processProgress(fileId, filename, loadedBytes, totalBytes);
                managerInstance.#configuration.onProgressUpdate(fileId, filename, loadedBytes, totalBytes);
            },
            onComplete: (fileId, filename, serverResponse) => {
                managerInstance.#processCompletion(fileId, filename, serverResponse);
                managerInstance.#configuration.onCompletion(fileId, filename, serverResponse);
            },
            onCancel: (fileId, filename) => {
                managerInstance.#processCancellation(fileId, filename);
                managerInstance.#configuration.onCancellation(fileId, filename);
            }
        });
    }

    #preventPageExitDuringUpload() {
        AppTools.eventManager.connect(window, 'beforeunload', (event) => {
            if (this.#activeTransfers === 0) {
                return;
            }
            const message = this.#configuration.userMessages.leavingPage;
            AppTools.haltEvent(event);
            event.returnValue = message;
            return message;
        });
    }

    #signalSubmission(fileId, filename) {
        this.#activeTransfers++;
    }

    #processProgress(fileId, filename, loaded, total) {
        // Internal progress handling
    }

    #processCompletion(fileId, filename, serverResponse) {
        this.#activeTransfers--;
        if (serverResponse && serverResponse.error) {
            this.#configuration.displayMessage(serverResponse.error);
        }
    }

    #processCancellation(fileId, filename) {
        this.#activeTransfers--;
    }

    #handleFileInputChange(fileInput) {
        if (this.#transferProcessor instanceof HttpTransferProcessor) {
            this.#initiateFileListUpload(Array.from(fileInput.files));
        } else {
            if (this.#validateIndividualFile(fileInput)) {
                this.#initiateFileUpload(fileInput);
            }
        }
        this.#uploadInitiator.reset();
    }

    #initiateFileListUpload(fileList) {
        const validFiles = fileList.filter(file => this.#validateIndividualFile(file));
        validFiles.forEach(file => this.#initiateFileUpload(file));
    }

    #initiateFileUpload(fileSource) {
        const uniqueUploadId = this.#transferProcessor.add(fileSource);
        const sourceFilename = this.#transferProcessor.getName(uniqueUploadId);

        if (this.#configuration.onSubmission(uniqueUploadId, sourceFilename) !== false) {
            this.#signalSubmission(uniqueUploadId, sourceFilename);
            this.#transferProcessor.upload(uniqueUploadId, this.#configuration.additionalParameters);
        }
    }

    #validateIndividualFile(fileObject) {
        const filename = fileObject.value ? fileObject.value.replace(/.*(\/|\\)/, "") : (fileObject.fileName || fileObject.name);
        const fileSize = fileObject.fileSize || fileObject.size;

        const validationRules = [
            {
                check: () => !this.#isExtensionPermitted(filename),
                errorMessageKey: 'invalidType'
            },
            {
                check: () => fileSize === 0,
                errorMessageKey: 'emptyFile'
            },
            {
                check: () => this.#configuration.maxFileSize && fileSize > this.#configuration.maxFileSize,
                errorMessageKey: 'exceedsSize'
            },
            {
                check: () => this.#configuration.minFileSize && fileSize < this.#configuration.minFileSize,
                errorMessageKey: 'belowMinSize'
            }
        ];

        for (const rule of validationRules) {
            if (rule.check()) {
                this.#reportValidationError(rule.errorMessageKey, filename, this.#configuration.permittedExtensions, this.#configuration.maxFileSize, this.#configuration.minFileSize);
                return false;
            }
        }
        return true;
    }

    #reportValidationError(errorKey, filename, allowedExtensions, maxSize, minSize) {
        let messageTemplate = this.#configuration.userMessages[errorKey];

        const replacePlaceholder = (template, placeholder, value) => template.replace(new RegExp(`{${placeholder}}`, 'g'), value);

        messageTemplate = replacePlaceholder(messageTemplate, 'file', this.#formatDisplayFilename(filename));
        messageTemplate = replacePlaceholder(messageTemplate, 'extensions', allowedExtensions.join(', '));
        messageTemplate = replacePlaceholder(messageTemplate, 'maxFileSize', this.#formatDataSize(maxSize));
        messageTemplate = replacePlaceholder(messageTemplate, 'minFileSize', this.#formatDataSize(minSize));

        this.#configuration.displayMessage(messageTemplate);
    }

    #formatDisplayFilename(fullFilename) {
        const MAX_LEN = 33;
        const START_LEN = 19;
        const END_LEN = 13;

        return fullFilename.length > MAX_LEN
            ? `${fullFilename.slice(0, START_LEN)}...${fullFilename.slice(-END_LEN)}`
            : fullFilename;
    }

    #isExtensionPermitted(filename) {
        const fileExtension = filename.includes('.') ? filename.split('.').pop().toLowerCase() : '';
        const allowed = this.#configuration.permittedExtensions;

        if (allowed.length === 0) {
            return true;
        }

        return allowed.some(ext => ext.toLowerCase() === fileExtension);
    }

    #formatDataSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const units = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
    }
}

class EnhancedDocumentUploadManager extends DocumentUploadManager {
    constructor(settings) {
        super(AppTools.mergeProperties(settings, {
            elementContainer: null,
            listingArea: null,
            primaryLayout: '<section class="transfer-widget">' +
                '<div class="drop-target"><span>Drop files here</span></div>' +
                '<button class="initiate-transfer">Upload Document</button>' +
                '<ul class="transfer-list"></ul>' +
                '</section>',
            itemLayout: '<li>' +
                '<span class="document-name"></span>' +
                '<span class="status-indicator"></span>' +
                '<span class="document-size"></span>' +
                '<a class="cancel-transfer" href="#">Discard</a>' +
                '<span class="failure-message">Failed</span>' +
                '</li>'
        }));
    }
}