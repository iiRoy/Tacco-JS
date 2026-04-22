class EventDispenser {
    constructor() {
        this.observerRegistry = {};
    }

    on(signalName, callback) {
        if (!this.observerRegistry[signalName]) {
            this.observerRegistry[signalName] = [];
        }
        this.observerRegistry[signalName].push(callback);
    }

    emit(signalName, payload) {
        if (this.observerRegistry[signalName]) {
            this.observerRegistry[signalName].forEach(callback => {
                try {
                    callback(payload);
                } catch (err) {
                    console.error(`Issue encountered in event observer for '${signalName}':`, err);
                }
            });
        }
    }
}

const constructDomFragment = (htmlString) => {
    const temporaryContainer = document.createElement('div');
    temporaryContainer.innerHTML = htmlString.trim();
    return Array.from(temporaryContainer.children);
};

const performElementAnimation = (targetElement, className, durationHint = 200) => {
    return new Promise(resolve => {
        if (!targetElement) {
            resolve();
            return;
        }

        const transitionEndEvent = 'transitionend';

        const finishAnimation = () => {
            targetElement.removeEventListener(transitionEndEvent, onTransitionEnd);
            resolve(targetElement);
        };

        const hasTransitions = getComputedStyle(targetElement).getPropertyValue('transition-property') !== 'none';

        if (hasTransitions) {
            targetElement.addEventListener(transitionEndEvent, onTransitionEnd);
            targetElement.offsetWidth; // Force reflow
            if (className) {
                targetElement.classList.toggle(className);
            }
            // Fallback timeout for transitionend not firing or element being removed
            setTimeout(() => {
                if (targetElement.isConnected) {
                    finishAnimation();
                } else {
                    resolve(targetElement); // Element is no longer in DOM
                }
            }, durationHint + 50); // A bit longer than expected duration
        } else {
            if (className) {
                targetElement.classList.toggle(className);
            }
            resolve(targetElement);
        }
    });
};

const generateImageRepresentation = (fileItem, targetContainer, configuration) => {
    return new Promise(resolve => {
        if (!fileItem || !fileItem.type.match(configuration.previewImageTypes) || !window.FileReader || !window.Image) {
            resolve(targetContainer);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageObject = new Image();
            imageObject.onload = () => {
                let displayElement;
                if (configuration.visualsAsCanvas && document.createElement('canvas').getContext) {
                    const canvasElement = document.createElement('canvas');
                    const context = canvasElement.getContext('2d');

                    let width = imageObject.width;
                    let height = imageObject.height;

                    if (width > configuration.visualsMaxWidth) {
                        height *= configuration.visualsMaxWidth / width;
                        width = configuration.visualsMaxWidth;
                    }
                    if (height > configuration.visualsMaxHeight) {
                        width *= configuration.visualsMaxHeight / height;
                        height = configuration.visualsMaxHeight;
                    }

                    canvasElement.width = width;
                    canvasElement.height = height;
                    context.drawImage(imageObject, 0, 0, width, height);
                    displayElement = canvasElement;
                } else {
                    displayElement = imageObject;
                    displayElement.style.maxWidth = `${configuration.visualsMaxWidth}px`;
                    displayElement.style.maxHeight = `${configuration.visualsMaxHeight}px`;
                    displayElement.style.height = 'auto';
                    displayElement.style.width = 'auto';
                }
                targetContainer.appendChild(displayElement);
                performElementAnimation(targetContainer, 'visual-fade-in').then(() => resolve(targetContainer));
            };
            imageObject.onerror = () => resolve(targetContainer);
            imageObject.src = e.target.result;
        };
        reader.onerror = () => resolve(targetContainer);
        reader.readAsDataURL(fileItem);
    });
};

const convertBytesToReadable = (byteCount) => {
    if (typeof byteCount !== 'number' || isNaN(byteCount)) {
        return '';
    }
    const units = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let currentSize = byteCount;
    while (currentSize >= 1024 && unitIndex < units.length - 1) {
        currentSize /= 1024;
        unitIndex++;
    }
    return `${currentSize.toFixed(2)} ${units[unitIndex]}`;
};

class UploadController extends EventDispenser {
    constructor(hostElement, options = {}) {
        super();
        this.hostElement = hostElement;
        this.config = {
            automaticInitiation: false,
            maximumAllowedEntries: undefined,
            maximumEntrySize: undefined,
            minimumEntrySize: undefined,
            permittedFileTypes: /.+$/i,
            previewImageTypes: /^image\/(gif|jpeg|png)$/,
            previewImageMaxSize: 5000000,
            previewImageWidth: 80,
            previewImageHeight: 80,
            visualsAsCanvas: true,
            uploadPanelId: 'template-upload',
            downloadPanelId: 'template-download',
            outputArea: undefined,
            prependNewEntries: false,
            transferDataType: 'json',

            onAddEntry: this.defaultAddEntry.bind(this),
            onInitiateTransfer: this.defaultInitiateTransfer.bind(this),
            onTransferSuccess: this.defaultTransferSuccess.bind(this),
            onTransferFailure: this.defaultTransferFailure.bind(this),
            onEntryProgress: this.defaultEntryProgress.bind(this),
            onOverallProgress: this.defaultOverallProgress.bind(this),
            onProcessStart: this.defaultProcessStart.bind(this),
            onProcessStop: this.defaultProcessStop.bind(this),
            onEntryRemoval: this.defaultEntryRemoval.bind(this)
        };
        Object.assign(this.config, options);

        this.internalState = {
            currentFileCount: 0,
            remainingCapacity: this.config.maximumAllowedEntries,
            processingQueue: Promise.resolve()
        };

        this.elementReferences = {
            outputArea: this.config.outputArea ? document.querySelector(this.config.outputArea) : this.hostElement.querySelector('.files'),
            fileInput: this.hostElement.querySelector('input[type="file"]')
        };

        this.initializeComponent();
    }

    initializeComponent() {
        this.hostElement.addEventListener('click', this.handleInterfaceClick.bind(this));
        if (this.elementReferences.fileInput) {
            this.elementReferences.fileInput.addEventListener('change', (evt) => {
                const files = Array.from(evt.target.files);
                if (files.length > 0) {
                    this.addFilesToQueue(files);
                    evt.target.value = '';
                }
            });
        }
        this.updateFileCapacity(0);
    }

    handleInterfaceClick(evt) {
        const target = evt.target;
        if (target.matches('[data-action="start-upload"]')) {
            evt.preventDefault();
            const entryPanel = target.closest('.template-upload');
            const entryData = entryPanel ? this.retrieveEntryData(entryPanel) : null;
            if (entryData && entryData.initiateAction && !entryData.ongoingTransfer) {
                target.disabled = true;
                entryData.initiateAction();
            }
        } else if (target.matches('[data-action="cancel-upload"]')) {
            evt.preventDefault();
            const entryPanel = target.closest('.template-upload');
            const entryData = entryPanel ? this.retrieveEntryData(entryPanel) : null;
            if (entryData) {
                if (!entryData.ongoingTransfer) {
                    entryData.transferStatus = 'abort';
                    this.emit('transferFailed', { event: evt, itemData: entryData });
                } else {
                    entryData.ongoingTransfer.abort();
                }
            }
        } else if (target.matches('[data-action="delete-entry"]')) {
            evt.preventDefault();
            const targetPanel = target.closest('.template-download');
            const entryData = targetPanel ? this.retrieveEntryData(targetPanel) : null;

            if (entryData) {
                this.emit('entryRemoval', { event: evt, itemData: entryData });
            }
        }
    }

    storeEntryData(element, data) {
        element.__entryData = data;
    }

    retrieveEntryData(element) {
        return element.__entryData;
    }

    updateFileCapacity(changeAmount) {
        if (typeof this.config.maximumAllowedEntries === 'number') {
            this.internalState.remainingCapacity += changeAmount;
            this.toggleFileInputActivation();
        }
    }

    toggleFileInputActivation() {
        if (this.elementReferences.fileInput) {
            if (this.config.maximumAllowedEntries !== undefined && this.internalState.remainingCapacity < 1) {
                this.elementReferences.fileInput.disabled = true;
                this.elementReferences.fileInput.parentElement.classList.add('disabled-input');
            } else {
                this.elementReferences.fileInput.disabled = false;
                this.elementReferences.fileInput.parentElement.classList.remove('disabled-input');
            }
        }
    }

    checkEntryValidity(item) {
        if (item.transferStatus) {
            return item.transferStatus;
        }
        if (typeof this.config.maximumAllowedEntries === 'number' && this.internalState.remainingCapacity < 0) {
            return 'maxNumberOfFiles';
        }
        if (!(this.config.permittedFileTypes.test(item.type) || this.config.permittedFileTypes.test(item.name))) {
            return 'acceptFileTypes';
        }
        if (this.config.maximumEntrySize && item.size > this.config.maximumEntrySize) {
            return 'maxFileSize';
        }
        if (typeof item.size === 'number' && item.size < this.config.minimumEntrySize) {
            return 'minFileSize';
        }
        return null;
    }

    verifyInputEntries(itemCollection) {
        let allValid = true;
        itemCollection.forEach(item => {
            item.transferStatus = this.checkEntryValidity(item);
            if (item.transferStatus) {
                allValid = false;
            }
        });
        return allValid;
    }

    generateStructure(templateId, data) {
        const templateElement = document.getElementById(templateId);
        if (!templateElement) {
            return [];
        }
        const templateContent = templateElement.innerHTML;
        let renderedHtml = '';
        if (data && data.files) {
            renderedHtml = data.files.map(fileItem => {
                let itemHtml = templateContent;
                itemHtml = itemHtml.replace(/\{\{file\.name\}\}/g, fileItem.name || '');
                itemHtml = itemHtml.replace(/\{\{file\.size\}\}/g, convertBytesToReadable(fileItem.size));
                itemHtml = itemHtml.replace(/\{\{file\.error\}\}/g, fileItem.transferStatus || '');
                itemHtml = itemHtml.replace(/\{\{file\.id\}\}/g, fileItem.id || '');
                itemHtml = itemHtml.replace(/\{\{file\.url\}\}/g, fileItem.url || ''); // For download links
                itemHtml = itemHtml.replace(/\{\{file\.type\}\}/g, fileItem.type || ''); // For download links
                return itemHtml;
            }).join('');
        }

        return constructDomFragment(renderedHtml);
    }

    displayUploadUnit(itemCollection) {
        return this.generateStructure(this.config.uploadPanelId, {
            files: itemCollection,
            formatFileSize: convertBytesToReadable,
            options: this.config
        });
    }

    displayDownloadUnit(itemCollection) {
        const elements = this.generateStructure(this.config.downloadPanelId, {
            files: itemCollection,
            formatFileSize: convertBytesToReadable,
            options: this.config
        });
        elements.forEach(el => {
            const downloadLink = el.querySelector('a[download]');
            if (downloadLink) {
                this.enableDragToDesktop(downloadLink);
            }
        });
        return elements;
    }

    enableDragToDesktop(linkElement) {
        const url = linkElement.href;
        const name = linkElement.download;
        const type = linkElement.getAttribute('data-type') || 'application/octet-stream';
        linkElement.addEventListener('dragstart', (e) => {
            try {
                e.dataTransfer.setData('DownloadURL', [type, name, url].join(':'));
            } catch (err) {
                console.warn('Drag-to-desktop feature failed:', err);
            }
        });
    }

    sequencePreviewGeneration(itemCollection, hostElements) {
        hostElements.forEach((element, index) => {
            const fileItem = itemCollection[index];
            const previewTarget = element.querySelector('.preview span');
            if (previewTarget &&
                this.config.previewImageTypes.test(fileItem.type) &&
                (typeof this.config.previewImageMaxSize !== 'number' || fileItem.size < this.config.previewImageMaxSize)) {

                this.internalState.processingQueue = this.internalState.processingQueue.then(() => {
                    return generateImageRepresentation(fileItem.fileObject, previewTarget, {
                        previewImageTypes: this.config.previewImageTypes,
                        visualsMaxWidth: this.config.previewImageWidth,
                        visualsMaxHeight: this.config.previewImageHeight,
                        visualsAsCanvas: this.config.visualsAsCanvas
                    });
                });
            }
        });
        return this.internalState.processingQueue;
    }

    defaultAddEntry(payload) {
        const { filesToAdd, event } = payload;
        const processedItems = filesToAdd.map(f => ({ ...f, id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` }));

        Promise.resolve(processedItems)
            .then(items => {
                this.updateFileCapacity(-items.length);
                const isValid = this.verifyInputEntries(items);
                items.forEach(item => item.isValidated = isValid);

                const uploadPanels = this.displayUploadUnit(items);
                uploadPanels.forEach((panel, i) => {
                    this.storeEntryData(panel, {
                        originalFile: items[i],
                        elementRef: panel,
                        isValidated: isValid,
                        initiateAction: () => this.initiateTransfer(panel, items[i], event),
                        transferStatus: items[i].transferStatus
                    });
                });

                if (this.config.prependNewEntries) {
                    uploadPanels.reverse().forEach(panel => this.elementReferences.outputArea.prepend(panel));
                } else {
                    uploadPanels.forEach(panel => this.elementReferences.outputArea.appendChild(panel));
                }

                this.sequencePreviewGeneration(processedItems, uploadPanels).then(() => {
                    this.emit('entryAdded', { event: event, itemData: processedItems, elementRefs: uploadPanels });
                    if (this.config.automaticInitiation && isValid) {
                        uploadPanels.forEach((panel, i) => {
                            const data = this.retrieveEntryData(panel);
                            if (data && data.initiateAction && data.transferStatus === null) { // Only auto-upload if no initial errors
                                panel.querySelector('[data-action="start-upload"]').disabled = true;
                                data.initiateAction();
                            }
                        });
                    }
                });
            });
    }

    defaultInitiateTransfer(payload) {
        const { elementRef, originalFile, transferDataType } = payload.itemData;
        const itemData = payload.itemData;

        if (!itemData.isValidated) {
            if (!this.verifyInputEntries([originalFile])) {
                return false;
            }
        }

        const progressContainer = elementRef.querySelector('.progress');
        if (progressContainer && transferDataType && transferDataType.startsWith('iframe')) {
            progressContainer.classList.add('progress-animated');
            const progressBar = progressContainer.querySelector('.bar');
            if (progressBar) {
                progressBar.style.width = '100%';
            }
        }
        this.emit('transferStarted', { event: payload.event, itemData: itemData });
        return true;
    }

    defaultTransferSuccess(payload) {
        const { event, itemData, resultData } = payload;
        const { elementRef, originalFile } = itemData;

        if (elementRef) {
            performElementAnimation(elementRef, 'fade', 200).then(() => {
                let successfulItem = (Array.isArray(resultData) && resultData[0]) || { error: 'emptyResult' };
                if (successfulItem.error) {
                    this.updateFileCapacity(1);
                }
                const downloadPanels = this.displayDownloadUnit([successfulItem]);
                if (downloadPanels.length > 0) {
                    elementRef.replaceWith(downloadPanels[0]);
                    this.storeEntryData(downloadPanels[0], { ...itemData, elementRef: downloadPanels[0], result: resultData });
                    performElementAnimation(downloadPanels[0], 'fade', 200).then(() => {
                        this.emit('transferCompleted', { event: event, itemData: itemData, elementRef: downloadPanels[0], result: resultData });
                    });
                } else {
                     this.emit('transferCompleted', { event: event, itemData: itemData, elementRef: elementRef, result: resultData });
                }
            });
        } else {
            const downloadPanels = this.displayDownloadUnit(Array.isArray(resultData) ? resultData : [resultData]);
            if (downloadPanels.length > 0) {
                if (this.config.prependNewEntries) {
                    downloadPanels.reverse().forEach(panel => this.elementReferences.outputArea.prepend(panel));
                } else {
                    downloadPanels.forEach(panel => this.elementReferences.outputArea.appendChild(panel));
                }
                downloadPanels.forEach(panel => {
                    this.storeEntryData(panel, { ...itemData, elementRef: panel, result: resultData });
                    performElementAnimation(panel, 'fade', 200).then(() => {
                        this.emit('transferCompleted', { event: event, itemData: itemData, elementRef: panel, result: resultData });
                    });
                });
            } else {
                this.emit('transferCompleted', { event: event, itemData: itemData, elementRef: elementRef, result: resultData });
            }
        }
    }

    defaultTransferFailure(payload) {
        const { event, itemData } = payload;
        const { elementRef, originalFile, transferStatus } = itemData;

        this.updateFileCapacity(1);

        if (elementRef) {
            performElementAnimation(elementRef, 'fade', 200).then(() => {
                if (transferStatus !== 'abort') {
                    originalFile.transferStatus = originalFile.transferStatus || transferStatus || 'error';
                    const downloadPanels = this.displayDownloadUnit([originalFile]);
                    if (downloadPanels.length > 0) {
                        elementRef.replaceWith(downloadPanels[0]);
                        this.storeEntryData(downloadPanels[0], { ...itemData, elementRef: downloadPanels[0] });
                        performElementAnimation(downloadPanels[0], 'fade', 200).then(() => {
                            this.emit('transferFailed', { event: event, itemData: itemData, elementRef: downloadPanels[0] });
                        });
                    } else {
                        this.emit('transferFailed', { event: event, itemData: itemData, elementRef: elementRef });
                    }
                } else {
                    elementRef.remove();
                    this.emit('transferFailed', { event: event, itemData: itemData, elementRef: null });
                }
            });
        } else if (transferStatus !== 'abort') {
            const uploadPanels = this.displayUploadUnit([originalFile]);
            if (uploadPanels.length > 0) {
                if (this.config.prependNewEntries) {
                    uploadPanels.reverse().forEach(panel => this.elementReferences.outputArea.prepend(panel));
                } else {
                    uploadPanels.forEach(panel => this.elementReferences.outputArea.appendChild(panel));
                }
                uploadPanels.forEach(panel => {
                    this.storeEntryData(panel, { ...itemData, elementRef: panel });
                    performElementAnimation(panel, 'fade', 200).then(() => {
                        this.emit('transferFailed', { event: event, itemData: itemData, elementRef: panel });
                    });
                });
            } else {
                this.emit('transferFailed', { event: event, itemData: itemData, elementRef: null });
            }
        } else {
            this.emit('transferFailed', { event: event, itemData: itemData, elementRef: null });
        }
    }

    defaultEntryProgress(payload) {
        const { elementRef, loadedBytes, totalBytes } = payload;
        if (elementRef) {
            const progressBar = elementRef.querySelector('.progress .bar');
            if (progressBar) {
                const percentage = Math.floor((loadedBytes / totalBytes) * 100);
                progressBar.style.width = `${percentage}%`;
            }
        }
    }

    defaultOverallProgress(payload) {
        const { loadedBytes, totalBytes } = payload;
        const globalProgressBar = this.hostElement.querySelector('.fileupload-buttonbar .progress .bar');
        if (globalProgressBar) {
            const percentage = Math.floor((loadedBytes / totalBytes) * 100);
            globalProgressBar.style.width = `${percentage}%`;
        }
    }

    defaultProcessStart(payload) {
        const globalProgressContainer = this.hostElement.querySelector('.fileupload-buttonbar .progress');
        performElementAnimation(globalProgressContainer, 'fade', 200).then(() => {
            this.emit('processStarted', payload);
        });
    }

    defaultProcessStop(payload) {
        const globalProgressContainer = this.hostElement.querySelector('.fileupload-buttonbar .progress');
        performElementAnimation(globalProgressContainer, 'fade', 200).then(() => {
            const globalProgressBar = globalProgressContainer.querySelector('.bar');
            if (globalProgressBar) {
                globalProgressBar.style.width = '0%';
            }
            this.emit('processStopped', payload);
        });
    }

    defaultEntryRemoval(payload) {
        const { event, itemData } = payload;
        const { elementRef, originalFile } = itemData;

        if (originalFile && originalFile.url) {
            this.performDeleteRequest(originalFile.url, originalFile.type || 'DELETE', originalFile.dataType || this.config.transferDataType)
                .then(() => {
                    this.updateFileCapacity(1);
                    if (elementRef) {
                        performElementAnimation(elementRef, 'fade', 200).then(() => {
                            elementRef.remove();
                            this.emit('itemRemoved', { event: event, itemData: itemData });
                        });
                    } else {
                        this.emit('itemRemoved', { event: event, itemData: itemData });
                    }
                })
                .catch(err => {
                    console.error('Deletion request failed:', err);
                    this.emit('itemRemovalFailed', { event: event, itemData: itemData, error: err });
                });
        } else {
            this.updateFileCapacity(1);
            if (elementRef) {
                performElementAnimation(elementRef, 'fade', 200).then(() => {
                    elementRef.remove();
                    this.emit('itemRemoved', { event: event, itemData: itemData });
                });
            } else {
                this.emit('itemRemoved', { event: event, itemData: itemData });
            }
        }
    }

    async initiateTransfer(elementRef, fileItem, originalEvent) {
        const itemData = this.retrieveEntryData(elementRef);
        itemData.originalFile = fileItem;
        itemData.elementRef = elementRef;

        if (!this.config.onInitiateTransfer({ event: originalEvent, itemData: itemData })) {
            return;
        }

        const formData = new FormData();
        formData.append('files[]', fileItem.fileObject, fileItem.name);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            itemData.ongoingTransfer = xhr;

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    this.config.onEntryProgress({
                        event: originalEvent,
                        itemData: itemData,
                        elementRef: elementRef,
                        loadedBytes: e.loaded,
                        totalBytes: e.total
                    });
                    // Global progress aggregation would be handled externally or through another emit
                }
            });

            xhr.addEventListener('load', () => {
                try {
                    let responseData;
                    if (this.config.transferDataType === 'json') {
                        responseData = JSON.parse(xhr.responseText);
                    } else {
                        responseData = xhr.responseText;
                    }
                    this.config.onTransferSuccess({ event: originalEvent, itemData: itemData, resultData: responseData });
                    resolve(responseData);
                } catch (err) {
                    this.config.onTransferFailure({ event: originalEvent, itemData: itemData, transferStatus: 'parseError', error: err });
                    reject(err);
                }
            });

            xhr.addEventListener('error', () => {
                this.config.onTransferFailure({ event: originalEvent, itemData: itemData, transferStatus: 'error', error: xhr.statusText });
                reject(new Error('Network error'));
            });

            xhr.addEventListener('abort', () => {
                this.config.onTransferFailure({ event: originalEvent, itemData: itemData, transferStatus: 'abort' });
                reject(new Error('Aborted'));
            });

            xhr.open('POST', '/upload', true);
            xhr.send(formData);
        });
    }

    async performDeleteRequest(url, method = 'DELETE', dataType = 'json') {
        const requestOptions = {
            method: method
        };
        try {
            const response = await fetch(url, requestOptions);
            if (!response.ok) {
                throw new Error(`HTTP issue! status: ${response.status}`);
            }
            if (dataType === 'json') {
                return await response.json();
            }
            return await response.text();
        } catch (error) {
            console.error('Delete request encountered an error:', error);
            throw error;
        }
    }

    addFilesToQueue(files) {
        const fileList = Array.from(files).map(f => ({
            name: f.name,
            size: f.size,
            type: f.type,
            fileObject: f
        }));
        this.config.onAddEntry({ filesToAdd: fileList, event: null });
    }
}