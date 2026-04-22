const uplink = {};

// 1. qq.extend -> uplink.mergeProperties
uplink.mergeProperties = (target, source) => Object.assign(target, source);

// 2. qq.indexOf -> uplink.findPosition
uplink.findPosition = (dataArray, searchItem, startIndex = 0) => {
    return dataArray.findIndex((item, index) => index >= startIndex && item === searchItem);
};

// 3. qq.getUniqueId -> uplink.obtainKey
uplink.obtainKey = (() => {
    const idGenerator = (function* () {
        let currentId = 0;
        while (true) {
            yield currentId++;
        }
    })();
    return () => idGenerator.next().value;
})();

// 4. qq.attach / qq.detach -> uplink.registerEvent / uplink.unregisterEvent
const eventManager = (() => {
    const addListener = (target, eventType, callback, useCapture = false) => {
        if (target.addEventListener) {
            target.addEventListener(eventType, callback, useCapture);
        } else if (target.attachEvent) {
            target.attachEvent('on' + eventType, callback);
        }
    };
    const removeListener = (target, eventType, callback, useCapture = false) => {
        if (target.removeEventListener) {
            target.removeEventListener(eventType, callback, useCapture);
        } else if (target.detachEvent) {
            target.detachEvent('on' + eventType, callback);
        }
    };
    return {
        addListener: addListener,
        removeListener: removeListener
    };
})();
uplink.registerEvent = eventManager.addListener;
uplink.unregisterEvent = eventManager.removeListener;

// 5. qq.preventDefault -> uplink.haltEvent
uplink.haltEvent = (eventObject) => {
    eventObject.preventDefault ? eventObject.preventDefault() : (eventObject.returnValue = false);
};

// 6. qq.insertBefore -> uplink.insertPreceding
uplink.insertPreceding = (newChild, referenceChild) => {
    referenceChild.parentNode.insertBefore(newChild, referenceChild);
};

// 7. qq.remove -> uplink.expelNode
uplink.expelNode = (targetNode) => {
    targetNode.parentNode.removeChild(targetNode);
};

// 8. qq.contains -> uplink.enclosesNode
uplink.enclosesNode = (ancestor, descendant) => {
    if (ancestor === descendant) return true;
    let current = descendant;
    while (current && current.parentNode) {
        if (current.parentNode === ancestor) return true;
        current = current.parentNode;
    }
    return false;
};

// 9. qq.toElement -> uplink.convertHtmlToNode
uplink.convertHtmlToNode = (() => {
    const tempContainer = document.createElement('section');
    return (htmlString) => {
        tempContainer.innerHTML = htmlString;
        const generatedNode = tempContainer.firstChild;
        if (generatedNode) {
            tempContainer.removeChild(generatedNode);
        }
        return generatedNode;
    };
})();

// 10. qq.css -> uplink.styleElement
uplink.styleElement = (domNode, styleProperties) => {
    Object.entries(styleProperties).forEach(([propName, propValue]) => {
        if (propName === 'opacity' && typeof domNode.style.opacity !== 'string' && typeof domNode.filters !== 'undefined') {
            domNode.style.filter = `alpha(opacity=${Math.round(100 * propValue)})`;
        } else {
            domNode.style[propName] = propValue;
        }
    });
};

// 11. qq.hasClass / qq.addClass / qq.removeClass -> uplink.hasStyleClass / uplink.addStyleClass / uplink.removeStyleClass
uplink.hasStyleClass = (domNode, className) => domNode.classList.contains(className);
uplink.addStyleClass = (domNode, className) => domNode.classList.add(className);
uplink.removeStyleClass = (domNode, className) => domNode.classList.remove(className);

// 12. qq.setText -> uplink.assignTextContent
uplink.assignTextContent = (domNode, newText) => {
    domNode.textContent = newText;
};

// 13. qq.children -> uplink.fetchChildElements
uplink.fetchChildElements = (parentNode) => Array.from(parentNode.children);

// 14. qq.getByClass -> uplink.selectByClass
uplink.selectByClass = (parentNode, className) => {
    if (parentNode.querySelectorAll) {
        return Array.from(parentNode.querySelectorAll(`.${className}`));
    }
    return Array.from(parentNode.getElementsByTagName('*')).filter(node => uplink.hasStyleClass(node, className));
};

// 15. qq.obj2url -> uplink.serializeObjectToUrl
uplink.serializeObjectToUrl = (dataBody, baseOrKeyPath = '', isInternalCall = false) => {
    const collectedStrings = [];
    const internalJoinPrefix = '&';

    const addEntry = (valueData, keyIdentifier) => {
        const nextPathSegment = baseOrKeyPath
            ? (Array.isArray(dataBody) && /\[\]$/.test(baseOrKeyPath))
                ? baseOrKeyPath
                : `${baseOrKeyPath}[${keyIdentifier}]`
            : keyIdentifier;

        if (nextPathSegment !== 'undefined' && keyIdentifier !== 'undefined') {
            const valueType = Object.prototype.toString.call(valueData);
            if (valueType === '[object Object]' || valueType === '[object Array]') {
                collectedStrings.push(
                    uplink.serializeObjectToUrl(valueData, nextPathSegment, true)
                );
            } else if (valueType === '[object Function]') {
                collectedStrings.push(
                    `${encodeURIComponent(nextPathSegment)}=${encodeURIComponent(valueData())}`
                );
            } else {
                collectedStrings.push(
                    `${encodeURIComponent(nextPathSegment)}=${encodeURIComponent(valueData)}`
                );
            }
        }
    };

    if (!isInternalCall && baseOrKeyPath) {
        let urlSeparator = '?';
        if (/\?/.test(baseOrKeyPath)) {
            urlSeparator = (/\?$/.test(baseOrKeyPath)) ? '' : '&';
        }
        collectedStrings.push(baseOrKeyPath);
        collectedStrings.push(uplink.serializeObjectToUrl(dataBody));
    } else if (Array.isArray(dataBody)) {
        dataBody.forEach((item, index) => addEntry(item, index));
    } else if (typeof dataBody === 'object' && dataBody !== null) {
        Object.entries(dataBody).forEach(([key, value]) => addEntry(value, key));
    } else {
        if (baseOrKeyPath && typeof dataBody !== 'undefined') { // Ensure key exists for scalar
            collectedStrings.push(`${encodeURIComponent(baseOrKeyPath)}=${encodeURIComponent(dataBody)}`);
        }
    }

    return collectedStrings.join(internalJoinPrefix)
        .replace(/^&/, '')
        .replace(/%20/g, '+');
};

// Placeholder for qq.UploadButton -> uplink.ActionInitiator
class ActionInitiator {
    constructor(config) {
        this._config = config;
        if (this._config.element) {
            uplink.registerEvent(this._config.element, 'click', (e) => {
                if (e.target.type === 'file' && this._config.onChange) {
                    this._config.onChange({ files: [], value: '' });
                }
            });
        }
    }
    reset() {}
}

// Placeholder for qq.UploadHandlerXhr -> uplink.XHRTransferHandler
class XHRTransferHandler {
    constructor(config) {
        this._config = config;
        this._transferMap = new Map();
    }
    static isSupported() {
        return typeof XMLHttpRequest !== 'undefined' && (new XMLHttpRequest().upload !== undefined);
    }
    add(fileSource) {
        const transferId = uplink.obtainKey();
        this._transferMap.set(transferId, {
            source: fileSource,
            name: fileSource.name || fileSource.fileName || 'unknown',
            loaded: 0,
            total: fileSource.size || 100
        });
        return transferId;
    }
    getName(transferId) {
        return this._transferMap.get(transferId)?.name || 'unknown';
    }
    upload(transferId, parameters) {
        const transferInfo = this._transferMap.get(transferId);
        if (!transferInfo) return;

        if (this._config.onProgress) {
            this._config.onProgress(transferId, transferInfo.name, transferInfo.total / 2, transferInfo.total);
        }
        setTimeout(() => {
            if (this._config.onComplete) {
                this._config.onComplete(transferId, transferInfo.name, { success: true });
            }
            this._transferMap.delete(transferId);
        }, 100);
    }
    cancel(transferId) {
        if (this._transferMap.has(transferId)) {
            const transferInfo = this._transferMap.get(transferId);
            if (this._config.onCancel) {
                this._config.onCancel(transferId, transferInfo.name);
            }
            this._transferMap.delete(transferId);
        }
    }
}

// Placeholder for qq.UploadHandlerForm -> uplink.FormTransferHandler
class FormTransferHandler {
    constructor(config) {
        this._config = config;
        this._transferMap = new Map();
    }
    static isSupported() {
        return true;
    }
    add(fileInput) {
        const transferId = uplink.obtainKey();
        this._transferMap.set(transferId, {
            input: fileInput,
            name: fileInput.value ? fileInput.value.replace(/.*(\/|\\)/, "") : 'unknown',
            loaded: 0,
            total: 100
        });
        return transferId;
    }
    getName(transferId) {
        return this._transferMap.get(transferId)?.name || 'unknown';
    }
    upload(transferId, parameters) {
        const transferInfo = this._transferMap.get(transferId);
        if (!transferInfo) return;

        setTimeout(() => {
            if (this._config.onComplete) {
                this._config.onComplete(transferId, transferInfo.name, { success: true });
            }
            this._transferMap.delete(transferId);
        }, 50);
    }
    cancel(transferId) {
        if (this._transferMap.has(transferId)) {
            const transferInfo = this._transferMap.get(transferId);
            if (this._config.onCancel) {
                this._config.onCancel(transferId, transferInfo.name);
            }
            this._transferMap.delete(transferId);
        }
    }
}
uplink.ActionInitiator = ActionInitiator;
uplink.XHRTransferHandler = XHRTransferHandler;
uplink.FormTransferHandler = FormTransferHandler;

// Class for BasicTransferAgent (clone of qq.FileUploaderBasic)
class BasicTransferAgent {
    constructor(initSettings) {
        this._config = {
            debug: false,
            action: '/server/upload',
            params: {},
            button: null,
            multiple: true,
            maxConnections: 3,
            allowedExtensions: [],
            sizeLimit: 0,
            minSizeLimit: 0,
            onSubmit: (id, fileName) => {},
            onProgress: (id, fileName, loaded, total) => {},
            onComplete: (id, fileName, responseJSON) => {},
            onCancel: (id, fileName) => {},
            messages: {
                typeError: "{file} has invalid extension. Only {extensions} are allowed.",
                sizeError: "{file} is too large, maximum file size is {sizeLimit}.",
                minSizeError: "{file} is too small, minimum file size is {minSizeLimit}.",
                emptyError: "{file} is empty, please select files again without it.",
                onLeave: "The files are being uploaded, if you leave now the upload will be cancelled."
            },
            displayMessage: (message) => {
                alert(message);
            }
        };
        uplink.mergeProperties(this._config, initSettings);

        this._activeTransfers = 0;
        this._transferProcessor = this._initiateProcessor();

        if (this._config.button) {
            this._uploadTrigger = this._createUploadButton(this._config.button);
        }

        this._preventNavAway();
    }

    alterParameters(newParameters) {
        this._config.params = newParameters;
    }

    getLiveTransfersCount() {
        return this._activeTransfers;
    }

    _createUploadButton(triggerElement) {
        const selfRef = this;
        return new uplink.ActionInitiator({
            element: triggerElement,
            multiple: this._config.multiple && uplink.XHRTransferHandler.isSupported(),
            onChange: (fileInput) => {
                selfRef._handleFileSelection(fileInput);
            }
        });
    }

    _initiateProcessor() {
        const selfRef = this;
        let processorClass;

        if (uplink.XHRTransferHandler.isSupported()) {
            processorClass = uplink.XHRTransferHandler;
        } else {
            processorClass = uplink.FormTransferHandler;
        }

        return new processorClass({
            debug: this._config.debug,
            action: this._config.action,
            maxConnections: this._config.maxConnections,
            onProgress: (itemId, itemName, currentLoaded, totalSize) => {
                selfRef._progressNotifier(itemId, itemName, currentLoaded, totalSize);
                selfRef._config.onProgress(itemId, itemName, currentLoaded, totalSize);
            },
            onComplete: (itemId, itemName, responseInfo) => {
                selfRef._completionNotifier(itemId, itemName, responseInfo);
                selfRef._config.onComplete(itemId, itemName, responseInfo);
            },
            onCancel: (itemId, itemName) => {
                selfRef._cancelNotifier(itemId, itemName);
                selfRef._config.onCancel(itemId, itemName);
            }
        });
    }

    _preventNavAway() {
        const selfRef = this;
        uplink.registerEvent(window, 'beforeunload', (ev) => {
            if (!selfRef._activeTransfers) return;

            const eventObj = ev || window.event;
            eventObj.returnValue = selfRef._config.messages.onLeave;
            return selfRef._config.messages.onLeave;
        });
    }

    _submissionNotifier(itemId, itemName) {
        this._activeTransfers++;
    }

    _progressNotifier(itemId, itemName, currentLoaded, totalSize) {
    }

    _completionNotifier(itemId, itemName, responseInfo) {
        this._activeTransfers--;
        if (responseInfo.error) {
            this._config.displayMessage(responseInfo.error);
        }
    }

    _cancelNotifier(itemId, itemName) {
        this._activeTransfers--;
    }

    _handleFileSelection(fileInputEntity) {
        if (this._transferProcessor instanceof uplink.XHRTransferHandler) {
            this._processFileList(fileInputEntity.files);
        } else {
            if (this._validateFileEntity(fileInputEntity)) {
                this._processSingleFile(fileInputEntity);
            }
        }
        this._uploadTrigger.reset();
    }

    _processFileList(fileCollection) {
        for (let idx = 0; idx < fileCollection.length; idx++) {
            if (!this._validateFileEntity(fileCollection[idx])) {
                return;
            }
        }
        for (let idx = 0; idx < fileCollection.length; idx++) {
            this._processSingleFile(fileCollection[idx]);
        }
    }

    _processSingleFile(fileSourceEntry) {
        const itemId = this._transferProcessor.add(fileSourceEntry);
        const itemName = this._transferProcessor.getName(itemId);

        if (this._config.onSubmit(itemId, itemName) !== false) {
            this._submissionNotifier(itemId, itemName);
            this._transferProcessor.upload(itemId, this._config.params);
        }
    }

    _validateFileEntity(fileEntry) {
        let entryName, entrySize;

        if (fileEntry.value) {
            entryName = fileEntry.value.replace(/.*(\/|\\)/, "");
        } else {
            entryName = fileEntry.fileName != null ? fileEntry.fileName : fileEntry.name;
            entrySize = fileEntry.fileSize != null ? fileEntry.fileSize : fileEntry.size;
        }

        if (!this._isExtensionPermitted(entryName)) {
            this._reportError('typeError', entryName);
            return false;
        } else if (entrySize === 0) {
            this._reportError('emptyError', entryName);
            return false;
        } else if (entrySize && this._config.sizeLimit && entrySize > this._config.sizeLimit) {
            this._reportError('sizeError', entryName);
            return false;
        } else if (entrySize && entrySize < this._config.minSizeLimit) {
            this._reportError('minSizeError', entryName);
            return false;
        }

        return true;
    }

    _reportError(errorCode, erroneousFileName) {
        let messageText = this._config.messages[errorCode];
        const replacePlaceholder = (placeholder, replacement) => {
            messageText = messageText.replace(placeholder, replacement);
        };

        replacePlaceholder('{file}', this._formatDisplayName(erroneousFileName));
        replacePlaceholder('{extensions}', this._config.allowedExtensions.join(', '));
        replacePlaceholder('{sizeLimit}', this._formatByteSize(this._config.sizeLimit));
        replacePlaceholder('{minSizeLimit}', this._formatByteSize(this._config.minSizeLimit));

        this._config.displayMessage(messageText);
    }

    _formatDisplayName(originalName) {
        return originalName.length > 33
            ? `${originalName.slice(0, 19)}...${originalName.slice(-13)}`
            : originalName;
    }

    _isExtensionPermitted(fileNameString) {
        const fileExtension = (-1 !== fileNameString.indexOf('.'))
            ? fileNameString.replace(/.*[.]/, '').toLowerCase()
            : '';
        const allowedList = this._config.allowedExtensions;

        if (!allowedList.length) return true;

        return allowedList.some(ext => ext.toLowerCase() === fileExtension);
    }

    _formatByteSize(byteCount) {
        let unitIndex = -1;
        let processedBytes = byteCount;
        do {
            processedBytes /= 1024;
            unitIndex++;
        } while (processedBytes > 99);

        return `${Math.max(processedBytes, 0.1).toFixed(1)}${['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][unitIndex]}`;
    }
}

// Class for EnhancedTransferAgent (clone of qq.FileUploader)
class EnhancedTransferAgent extends BasicTransferAgent {
    constructor(...constructionArgs) {
        super(...constructionArgs);

        uplink.mergeProperties(this._config, {
            containerNode: null,
            listContainer: null,

            displayMarkup: '<div class="up-loader-wrapper">' +
                '<div class="up-drop-region"><span>Drop files here to upload</span></div>' +
                '<div class="up-action-button">Upload a file</div>' +
                '<ul class="up-item-list"></ul>' +
             '</div>',

            itemMarkup: '<li>' +
                '<span class="up-file-name"></span>' +
                '<span class="up-status-spinner"></span>' +
                '<span class="up-file-size"></span>' +
                '<a class="up-cancel-link" href="#">Cancel</a>' +
                '<span class="up-failure-message">Failed</span>' +
            '</li>',
        });

        if (constructionArgs[0]) {
             uplink.mergeProperties(this._config, constructionArgs[0]);
        }
    }
}