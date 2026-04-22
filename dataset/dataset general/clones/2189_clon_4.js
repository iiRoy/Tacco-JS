const AssetConvey = AssetConvey || {};

AssetConvey.incorporate = (targetObj, sourceObj) => Object.assign(targetObj, sourceObj);

AssetConvey.locateInArray = (searchArray, itemToFind, startFrom = 0) => {
    if (searchArray.findIndex) {
        return searchArray.findIndex((element, index) => index >= startFrom && element === itemToFind);
    }

    let currentPosition = startFrom;
    if (currentPosition < 0) {
        currentPosition += searchArray.length;
    }

    for (; currentPosition < searchArray.length; currentPosition++) {
        if (currentPosition in searchArray && searchArray[currentPosition] === itemToFind) {
            return currentPosition;
        }
    }
    return -1;
};

AssetConvey.KeyGen = (function() {
    let currentKey = 0;
    return {
        produce: () => currentKey++
    };
})();

AssetConvey.registerEvent = (targetElement, eventKind, actionFunction) => {
    if (targetElement.addEventListener) {
        targetElement.addEventListener(eventKind, actionFunction, false);
    } else if (targetElement.attachEvent) {
        targetElement.attachEvent('on' + eventKind, actionFunction);
    }
};

AssetConvey.deregisterEvent = (targetElement, eventKind, actionFunction) => {
    if (targetElement.removeEventListener) {
        targetElement.removeEventListener(eventKind, actionFunction, false);
    } else if (targetElement.attachEvent) {
        targetElement.detachEvent('on' + eventKind, actionFunction);
    }
};

AssetConvey.haltEvent = (eventObject) => {
    if (eventObject.preventDefault) {
        eventObject.preventDefault();
    } else {
        eventObject.returnValue = false;
    }
};

AssetConvey.insertPlacement = (newElement, referenceElement) => {
    referenceElement.parentNode.insertBefore(newElement, referenceElement);
};

AssetConvey.removeNode = (targetElement) => {
    targetElement.parentNode.removeChild(targetElement);
};

AssetConvey.isDescendantOf = (ancestor, descendant) => {
    if (ancestor === descendant) return true;
    if (ancestor.contains) {
        return ancestor.contains(descendant);
    } else {
        return !!(descendant.compareDocumentPosition(ancestor) & 8);
    }
};

AssetConvey.constructElement = (htmlString) => {
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlString;
    const constructed = tempContainer.firstElementChild;
    return constructed;
};

AssetConvey.applyStyles = (targetElement, styleProperties) => {
    if (styleProperties.opacity != null) {
        if (typeof targetElement.style.opacity !== 'string' && typeof(targetElement.filters) !== 'undefined') {
            styleProperties.filter = 'alpha(opacity=' + Math.round(100 * styleProperties.opacity) + ')';
        }
    }
    AssetConvey.incorporate(targetElement.style, styleProperties);
};

AssetConvey.checkClass = (targetElement, className) => {
    if (targetElement.classList) {
        return targetElement.classList.contains(className);
    }
    const classRegex = new RegExp('(^| )' + className + '( |$)');
    return classRegex.test(targetElement.className);
};

AssetConvey.assignClass = (targetElement, className) => {
    if (targetElement.classList) {
        targetElement.classList.add(className);
    } else if (!AssetConvey.checkClass(targetElement, className)) {
        targetElement.className += ' ' + className;
    }
};

AssetConvey.removeClass = (targetElement, className) => {
    if (targetElement.classList) {
        targetElement.classList.remove(className);
    } else {
        const classRegex = new RegExp('(^| )' + className + '( |$)');
        targetElement.className = targetElement.className.replace(classRegex, ' ').replace(/^\s+|\s+$/g, "");
    }
};

AssetConvey.updateTextContent = (targetElement, displayText) => {
    targetElement.textContent = displayText;
    if (!targetElement.textContent && targetElement.innerText) {
        targetElement.innerText = displayText;
    }
};

AssetConvey.getNodeChildren = (parentElement) => {
    return Array.from(parentElement.childNodes).filter(node => node.nodeType === Node.ELEMENT_NODE);
};

AssetConvey.findElementsByClass = (contextElement, targetClassName) => {
    if (contextElement.querySelectorAll) {
        return Array.from(contextElement.querySelectorAll('.' + targetClassName));
    }

    const foundElements = [];
    const potentialCandidates = contextElement.getElementsByTagName("*");
    for (let i = 0; i < potentialCandidates.length; i++) {
        if (AssetConvey.checkClass(potentialCandidates[i], targetClassName)) {
            foundElements.push(potentialCandidates[i]);
        }
    }
    return foundElements;
};

AssetConvey.serializeObjectToQuery = (dataObject, baseString = '', isRecursiveCall = false) => {
    const segments = [];
    const appendSegment = (key, value) => {
        if (value instanceof Function) {
            segments.push(`${encodeURIComponent(key)}=${encodeURIComponent(value())}`);
        } else if (value && typeof value === 'object' && value !== null) {
            segments.push(AssetConvey.serializeObjectToQuery(value, key, true));
        } else {
            segments.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
        }
    };

    if (!isRecursiveCall && baseString) {
        const separator = baseString.includes('?') ? (baseString.endsWith('?') ? '' : '&') : '?';
        segments.push(baseString);
        segments.push(AssetConvey.serializeObjectToQuery(dataObject));
    } else if (Array.isArray(dataObject)) {
        dataObject.forEach((item, index) => {
            const currentKey = baseString ? `${baseString}[${index}]` : index.toString();
            appendSegment(currentKey, item);
        });
    } else if (typeof dataObject === 'object' && dataObject !== null) {
        for (const key in dataObject) {
            if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
                const currentKey = baseString ? `${baseString}[${key}]` : key;
                appendSegment(currentKey, dataObject[key]);
            }
        }
    } else if (baseString) {
        appendSegment(baseString, dataObject);
    }

    return segments.join('&')
                   .replace(/^&/, '')
                   .replace(/%20/g, '+');
};

AssetConvey.XhrTransferAgent = class {
    static isSupported() { return typeof XMLHttpRequest !== 'undefined' && (new XMLHttpRequest().upload); }
    constructor(cfg) {
        this.configuration = cfg;
        this.activeRequests = {};
        this.nextTransferId = 0;
    }
    add(fileInputOrFile) {
        const id = this.nextTransferId++;
        this.activeRequests[id] = {
            file: fileInputOrFile.files ? fileInputOrFile.files[0] : fileInputOrFile,
            fileName: fileInputOrFile.name || fileInputOrFile.fileName || (fileInputOrFile.value ? fileInputOrFile.value.replace(/.*(\/|\\)/, "") : 'unknown')
        };
        return id;
    }
    getName(id) {
        return this.activeRequests[id] ? this.activeRequests[id].fileName : undefined;
    }
    upload(id, extraParameters) {
        const transferInfo = this.activeRequests[id];
        if (!transferInfo) return;

        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                this.configuration.onProgress(id, transferInfo.fileName, e.loaded, e.total);
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    this.configuration.onComplete(id, transferInfo.fileName, response);
                } catch (e) {
                    this.configuration.onComplete(id, transferInfo.fileName, { success: false, error: "Invalid server response" });
                }
            } else {
                this.configuration.onComplete(id, transferInfo.fileName, { success: false, error: `HTTP Error: ${xhr.status}` });
            }
            delete this.activeRequests[id];
        });

        xhr.addEventListener('error', () => {
            this.configuration.onComplete(id, transferInfo.fileName, { success: false, error: "Network error" });
            delete this.activeRequests[id];
        });

        xhr.addEventListener('abort', () => {
            this.configuration.onCancel(id, transferInfo.fileName);
            delete this.activeRequests[id];
        });

        const formData = new FormData();
        formData.append(this.configuration.inputName || 'qqfile', transferInfo.file, transferInfo.fileName);
        for (const key in extraParameters) {
            if (Object.prototype.hasOwnProperty.call(extraParameters, key)) {
                formData.append(key, extraParameters[key]);
            }
        }

        xhr.open('POST', this.configuration.action, true);
        xhr.send(formData);
        transferInfo.xhr = xhr;
    }
    cancel(id) {
        if (this.activeRequests[id] && this.activeRequests[id].xhr) {
            this.activeRequests[id].xhr.abort();
        }
    }
};

AssetConvey.FormTransferAgent = class {
    constructor(cfg) {
        this.configuration = cfg;
        this.activeForms = {};
        this.nextTransferId = 0;
        this.iframeElement = this.createIframeContainer();
    }

    createIframeContainer() {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.name = `assetConveyIframe_${Date.now()}`; // Unique name
        document.body.appendChild(iframe);
        return iframe;
    }

    add(fileInput) {
        const id = this.nextTransferId++;
        const form = document.createElement('form');
        form.style.display = 'none';
        form.method = 'POST';
        form.action = this.configuration.action;
        form.enctype = 'multipart/form-data';
        form.target = this.iframeElement.name;
        document.body.appendChild(form);

        const originalParent = fileInput.parentNode;
        form.appendChild(fileInput);

        this.activeForms[id] = {
            form: form,
            fileInput: fileInput,
            fileName: fileInput.value.replace(/.*(\/|\\)/, ""),
            originalParent: originalParent
        };
        return id;
    }

    getName(id) {
        return this.activeForms[id] ? this.activeForms[id].fileName : undefined;
    }

    upload(id, extraParameters) {
        const transferInfo = this.activeForms[id];
        if (!transferInfo) return;

        for (const key in extraParameters) {
            if (Object.prototype.hasOwnProperty.call(extraParameters, key)) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = extraParameters[key];
                transferInfo.form.appendChild(input);
            }
        }

        const iframe = this.iframeElement;
        const form = transferInfo.form;
        const fileName = transferInfo.fileName;

        const completeCallback = () => {
            AssetConvey.deregisterEvent(iframe, 'load', completeCallback); // Deregister to prevent multiple calls
            try {
                let responseText = iframe.contentDocument.body.textContent;
                let response = JSON.parse(responseText);
                this.configuration.onComplete(id, fileName, response);
            } catch (e) {
                this.configuration.onComplete(id, fileName, { success: false, error: "Invalid server response or network issue" });
            } finally {
                this.cleanupForm(id);
            }
        };

        AssetConvey.registerEvent(iframe, 'load', completeCallback);
        form.submit();
    }

    cancel(id) {
        this.cleanupForm(id);
        this.configuration.onCancel(id, this.activeForms[id] ? this.activeForms[id].fileName : 'unknown');
    }

    cleanupForm(id) {
        const transferInfo = this.activeForms[id];
        if (transferInfo) {
            if (transferInfo.form.parentNode) {
                transferInfo.form.parentNode.removeChild(transferInfo.form);
            }
            if (transferInfo.fileInput.parentNode !== transferInfo.originalParent && transferInfo.originalParent) {
                transferInfo.originalParent.appendChild(transferInfo.fileInput);
            }
            delete this.activeForms[id];
        }
    }
};

AssetConvey.UploadButtonComponent = class {
    constructor(cfg) {
        this.configuration = cfg;
        this.inputElement = null;
        this.createInputElement();
        this.attachEvents();
    }

    createInputElement() {
        this.inputElement = document.createElement('input');
        this.inputElement.setAttribute('type', 'file');
        this.inputElement.setAttribute('name', 'file');
        this.inputElement.style.position = 'absolute';
        this.inputElement.style.right = '0px';
        this.inputElement.style.top = '0px';
        this.inputElement.style.fontFamily = 'Arial';
        this.inputElement.style.fontSize = '118px';
        this.inputElement.style.margin = '0px';
        this.inputElement.style.padding = '0px';
        this.inputElement.style.cursor = 'pointer';
        this.inputElement.style.opacity = '0';
        this.inputElement.style.zIndex = '2147483583';
        this.inputElement.style.direction = 'ltr';

        if (this.configuration.enableMultiSelect) {
            this.inputElement.setAttribute('multiple', 'multiple');
        }

        this.configuration.targetNode.style.position = this.configuration.targetNode.style.position || 'relative';
        this.configuration.targetNode.appendChild(this.inputElement);
    }

    attachEvents() {
        AssetConvey.registerEvent(this.inputElement, 'change', (e) => {
            this.configuration.onFileSelection(this.inputElement);
        });
    }

    resetInput() {
        if (this.inputElement.parentNode) {
            this.inputElement.parentNode.removeChild(this.inputElement);
        }
        this.createInputElement();
        this.attachEvents();
    }
};

AssetConvey.BaseAssetTransmitter = class {
    constructor(initialConfig) {
        this.configSettings = {
            debugMode: false,
            uploadEndpoint: '/server/upload',
            transferParameters: {},
            triggerElement: null,
            allowMultiple: true,
            concurrentTransfers: 3,
            permittedExtensions: [],
            maxFileSize: 0,
            minFileSize: 0,
            onTransferInitiated: (transferId, assetName) => {},
            onTransferProgress: (transferId, assetName, bytesLoaded, totalBytes) => {},
            onTransferFinished: (transferId, assetName, serverResponse) => {},
            onTransferAborted: (transferId, assetName) => {},
            feedbackMessages: {
                invalidExtension: "{file} has an unacceptable extension. Only {extensions} are permitted.",
                sizeExceeded: "{file} is too large; maximum size allowed is {sizeLimit}.",
                sizeBelowMinimum: "{file} is too small; minimum size allowed is {minSizeLimit}.",
                emptyFile: "{file} is empty. Please re-select files without it.",
                leavingPageWarning: "Files are currently uploading. Navigating away will cancel them.",
                failureGeneric: "Transfer failed."
            },
            displayAlert: (alertMessage) => {
                alert(alertMessage);
            }
        };
        AssetConvey.incorporate(this.configSettings, initialConfig);

        this.activeTransfersCount = 0;
        this.transferMechanism = this.setupTransferMechanism();

        if (this.configSettings.triggerElement) {
            this.uploadInitiator = this.createUploadInitiator(this.configSettings.triggerElement);
        }

        this.preventPageExitDuringUpload();
    }

    updateParameters(newParams) {
        this.configSettings.transferParameters = newParams;
    }

    getOngoingTransfers() {
        return this.activeTransfersCount;
    }

    createUploadInitiator(elementReference) {
        const selfReference = this;
        return new AssetConvey.UploadButtonComponent({
            targetNode: elementReference,
            enableMultiSelect: this.configSettings.allowMultiple && AssetConvey.XhrTransferAgent.isSupported(),
            onFileSelection: (fileInputNode) => {
                selfReference.handleFileInputChange(fileInputNode);
            }
        });
    }

    setupTransferMechanism() {
        const selfReference = this;
        let mechanismClass;

        if (AssetConvey.XhrTransferAgent.isSupported()) {
            mechanismClass = AssetConvey.XhrTransferAgent;
        } else {
            mechanismClass = AssetConvey.FormTransferAgent;
        }

        const agent = new mechanismClass({
            debug: this.configSettings.debugMode,
            action: this.configSettings.uploadEndpoint,
            maxConnections: this.configSettings.concurrentTransfers,
            onProgress: (tId, aName, bytesL, totalB) => {
                selfReference.processProgressUpdate(tId, aName, bytesL, totalB);
                selfReference.configSettings.onTransferProgress(tId, aName, bytesL, totalB);
            },
            onComplete: (tId, aName, sResponse) => {
                selfReference.processCompletion(tId, aName, sResponse);
                selfReference.configSettings.onTransferFinished(tId, aName, sResponse);
            },
            onCancel: (tId, aName) => {
                selfReference.processCancellation(tId, aName);
                selfReference.configSettings.onTransferAborted(tId, aName);
            }
        });
        return agent;
    }

    preventPageExitDuringUpload() {
        const selfReference = this;
        AssetConvey.registerEvent(window, 'beforeunload', (eventObj) => {
            if (!selfReference.activeTransfersCount) {
                return;
            }
            const eventTarget = eventObj || window.event;
            eventTarget.returnValue = selfReference.configSettings.feedbackMessages.leavingPageWarning;
            return selfReference.configSettings.feedbackMessages.leavingPageWarning;
        });
    }

    reportSubmission(transferId, assetName) {
        this.activeTransfersCount++;
    }

    processProgressUpdate(transferId, assetName, bytesLoaded, totalBytes) {
        // Base class does nothing here
    }

    processCompletion(transferId, assetName, serverResponse) {
        this.activeTransfersCount--;
        if (serverResponse.error) {
            this.configSettings.displayAlert(serverResponse.error);
        }
    }

    processCancellation(transferId, assetName) {
        this.activeTransfersCount--;
    }

    handleFileInputChange(inputElement) {
        if (this.transferMechanism instanceof AssetConvey.XhrTransferAgent) {
            this.initiateBatchUpload(inputElement.files);
        } else {
            if (this.verifyAsset(inputElement)) {
                this.initiateSingleUpload(inputElement);
            }
        }
        this.uploadInitiator.resetInput();
    }

    initiateBatchUpload(fileList) {
        for (let i = 0; i < fileList.length; i++) {
            if (!this.verifyAsset(fileList[i])) {
                return;
            }
        }
        for (let i = 0; i < fileList.length; i++) {
            this.initiateSingleUpload(fileList[i]);
        }
    }

    initiateSingleUpload(assetContainer) {
        const transferIdentifier = this.transferMechanism.add(assetContainer);
        const assetIdentifier = this.transferMechanism.getName(transferIdentifier);

        if (this.configSettings.onTransferInitiated(transferIdentifier, assetIdentifier) !== false) {
            this.reportSubmission(transferIdentifier, assetIdentifier);
            this.transferMechanism.upload(transferIdentifier, this.configSettings.transferParameters);
        }
    }

    verifyAsset(assetCandidate) {
        let assetName, assetSize;

        if (assetCandidate.value) {
            assetName = assetCandidate.value.replace(/.*(\/|\\)/, "");
        } else {
            assetName = assetCandidate.name || assetCandidate.fileName;
            assetSize = assetCandidate.size || assetCandidate.fileSize;
        }

        if (!this.isExtensionPermitted(assetName)) {
            this.signalError('invalidExtension', assetName);
            return false;
        } else if (assetSize === 0) {
            this.signalError('emptyFile', assetName);
            return false;
        } else if (assetSize && this.configSettings.maxFileSize && assetSize > this.configSettings.maxFileSize) {
            this.signalError('sizeExceeded', assetName);
            return false;
        } else if (assetSize && assetSize < this.configSettings.minFileSize) {
            this.signalError('sizeBelowMinimum', assetName);
            return false;
        }
        return true;
    }

    signalError(errorCode, assetName) {
        let feedbackMessage = this.configSettings.feedbackMessages[errorCode];

        const replacePlaceholder = (placeholder, replacement) => {
            feedbackMessage = feedbackMessage.replace(new RegExp(placeholder, 'g'), replacement);
        };

        replacePlaceholder('{file}', this.formatAssetName(assetName));
        replacePlaceholder('{extensions}', this.configSettings.permittedExtensions.join(', '));
        replacePlaceholder('{sizeLimit}', this.formatByteSize(this.configSettings.maxFileSize));
        replacePlaceholder('{minSizeLimit}', this.formatByteSize(this.configSettings.minFileSize));

        this.configSettings.displayAlert(feedbackMessage);
    }

    formatAssetName(originalName) {
        if (originalName.length > 33) {
            return originalName.slice(0, 19) + '...' + originalName.slice(-13);
        }
        return originalName;
    }

    isExtensionPermitted(fileName) {
        const assetExtension = (fileName.indexOf('.') !== -1) ? fileName.replace(/.*[.]/, '').toLowerCase() : '';
        const allowedTypes = this.configSettings.permittedExtensions;

        if (!allowedTypes.length) {
            return true;
        }

        return allowedTypes.some(ext => ext.toLowerCase() === assetExtension);
    }

    formatByteSize(byteCount) {
        let unitIndex = -1;
        do {
            byteCount = byteCount / 1024;
            unitIndex++;
        } while (byteCount > 99 && unitIndex < 5); // Limit unitIndex to prevent undefined access

        const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB'];
        return Math.max(byteCount, 0.1).toFixed(1) + units[unitIndex];
    }
};

AssetConvey.InteractiveAssetTransmitter = class extends AssetConvey.BaseAssetTransmitter {
    constructor(initialConfig) {
        const defaultInteractiveConfig = {
            element: null,
            listElement: null,
            template: '<div class="transfer-wrapper">' +
                '<div class="transfer-drop-zone"><span>Drop your files here</span></div>' +
                '<div class="transfer-trigger">Select files</div>' +
                '<ul class="transfer-list-display"></ul>' +
                '</div>',
            assetEntryTemplate: '<li>' +
                '<span class="asset-name"></span>' +
                '<span class="asset-spinner"></span>' +
                '<span class="asset-size-info"></span>' +
                '<a class="asset-cancel-action" href="#">Discard</a>' +
                '<span class="asset-failure-message">Failed</span>' +
                '</li>'
        };
        const mergedConfig = AssetConvey.incorporate(defaultInteractiveConfig, initialConfig);

        super(mergedConfig);

        this.rootContainer = AssetConvey.constructElement(this.configSettings.template);
        if (this.configSettings.element) {
            this.configSettings.element.appendChild(this.rootContainer);
        }

        this.dropZone = AssetConvey.findElementsByClass(this.rootContainer, 'transfer-drop-zone')[0];
        this.listDisplay = this.configSettings.listElement || AssetConvey.findElementsByClass(this.rootContainer, 'transfer-list-display')[0];

        this.configSettings.triggerElement = AssetConvey.findElementsByClass(this.rootContainer, 'transfer-trigger')[0];
        this.uploadInitiator = this.createUploadInitiator(this.configSettings.triggerElement);

        this.initializeDropZone();
        this.fileRegistry = {};
    }

    initializeDropZone() {
        AssetConvey.registerEvent(this.dropZone, 'dragenter', AssetConvey.haltEvent);
        AssetConvey.registerEvent(this.dropZone, 'dragexit', AssetConvey.haltEvent);
        AssetConvey.registerEvent(this.dropZone, 'dragover', AssetConvey.haltEvent);
        AssetConvey.registerEvent(this.dropZone, 'drop', (eventObj) => {
            AssetConvey.haltEvent(eventObj);
            this.initiateBatchUpload(eventObj.dataTransfer.files);
        });
    }

    initiateSingleUpload(assetContainer) {
        const transferIdentifier = this.transferMechanism.add(assetContainer);
        const assetIdentifier = this.transferMechanism.getName(transferIdentifier);

        this.createAssetListItem(transferIdentifier, assetIdentifier);

        if (this.configSettings.onTransferInitiated(transferIdentifier, assetIdentifier) !== false) {
            this.reportSubmission(transferIdentifier, assetIdentifier);
            this.transferMechanism.upload(transferIdentifier, this.configSettings.transferParameters);
        } else {
            this.processCancellation(transferIdentifier, assetIdentifier);
            this.removeAssetListItem(transferIdentifier);
        }
    }

    createAssetListItem(transferId, assetName) {
        const itemNode = AssetConvey.constructElement(this.configSettings.assetEntryTemplate);
        itemNode.setAttribute('transfer-id', transferId);

        const nameSpan = AssetConvey.findElementsByClass(itemNode, 'asset-name')[0];
        AssetConvey.updateTextContent(nameSpan, this.formatAssetName(assetName));

        const sizeSpan = AssetConvey.findElementsByClass(itemNode, 'asset-size-info')[0];
        AssetConvey.updateTextContent(sizeSpan, '0KB / 0KB');

        const cancelLink = AssetConvey.findElementsByClass(itemNode, 'asset-cancel-action')[0];
        AssetConvey.registerEvent(cancelLink, 'click', (e) => {
            AssetConvey.haltEvent(e);
            this.transferMechanism.cancel(transferId);
            this.removeAssetListItem(transferId);
        });

        AssetConvey.assignClass(itemNode, 'transfer-in-progress');

        this.listDisplay.appendChild(itemNode);
        this.fileRegistry[transferId] = {
            node: itemNode,
            nameSpan: nameSpan,
            sizeSpan: sizeSpan,
            cancelLink: cancelLink
        };
    }

    removeAssetListItem(transferId) {
        if (this.fileRegistry[transferId]) {
            AssetConvey.removeNode(this.fileRegistry[transferId].node);
            delete this.fileRegistry[transferId];
        }
    }

    processProgressUpdate(transferId, assetName, bytesLoaded, totalBytes) {
        super.processProgressUpdate(transferId, assetName, bytesLoaded, totalBytes);
        const item = this.fileRegistry[transferId];
        if (item && item.sizeSpan) {
            AssetConvey.updateTextContent(item.sizeSpan, `${this.formatByteSize(bytesLoaded)} / ${this.formatByteSize(totalBytes)}`);
        }
    }

    processCompletion(transferId, assetName, serverResponse) {
        super.processCompletion(transferId, assetName, serverResponse);
        const item = this.fileRegistry[transferId];
        if (item && item.node) {
            AssetConvey.removeClass(item.node, 'transfer-in-progress');
            AssetConvey.removeNode(AssetConvey.findElementsByClass(item.node, 'asset-spinner')[0]);
            AssetConvey.removeNode(item.cancelLink);

            if (serverResponse.success) {
                AssetConvey.assignClass(item.node, 'transfer-success');
                AssetConvey.updateTextContent(item.sizeSpan, this.formatByteSize(serverResponse.size || 0));
            } else {
                AssetConvey.assignClass(item.node, 'transfer-failed');
                const failureMessageSpan = AssetConvey.findElementsByClass(item.node, 'asset-failure-message')[0];
                AssetConvey.updateTextContent(failureMessageSpan, serverResponse.error || this.configSettings.feedbackMessages.failureGeneric);
                AssetConvey.applyStyles(failureMessageSpan, { display: 'inline' });
            }
        }
    }

    processCancellation(transferId, assetName) {
        super.processCancellation(transferId, assetName);
        this.removeAssetListItem(transferId);
    }
};