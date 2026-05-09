class EventDispenser {
    constructor() {
        this.listeningPoints = {};
    }

    on(signalName, handlerFunction) {
        if (!this.listeningPoints[signalName]) {
            this.listeningPoints[signalName] = [];
        }
        this.listeningPoints[signalName].push(handlerFunction);
    }

    emit(signalName, ...dataPayload) {
        if (this.listeningPoints[signalName]) {
            this.listeningPoints[signalName].forEach(handlerFunction => handlerFunction(...dataPayload));
        }
    }
}

class AssetProcessor extends EventDispenser {
    constructor(processingSettings) {
        super();
        this.processingSettings = processingSettings;
        this.itemQueue = [];
        this.isTransferring = false;
        this.nextItemIdentifier = 0;
        this.validationChecks = [];
    }

    findQueuedItemIndex(targetItem) {
        return this.itemQueue.indexOf(targetItem);
    }

    addValidationRule(ruleFunction) {
        this.validationChecks.push(ruleFunction);
    }

    async enqueueAsset(sourceFile) {
        const meetsCriteria = this.validationChecks.every(rule => rule(sourceFile));
        if (!meetsCriteria) {
            this.emit('validationFailure', sourceFile);
            return null;
        }

        const newItemEntry = {
            sourceFile: sourceFile,
            statusIndicator: 'awaiting_processing',
            progressPercentage: 0,
            itemIdentifier: this.nextItemIdentifier++
        };
        this.itemQueue.push(newItemEntry);
        this.emit('assetEnqueued', newItemEntry);

        // Pre-generate base64 for later transmission
        try {
            newItemEntry.base64Content = await this.readFileInputAsBase64(sourceFile);
        } catch (error) {
            console.error('Failed to read file as base64:', error);
            newItemEntry.statusIndicator = 'base64_error';
            this.emit('base64ConversionError', newItemEntry, error);
        }

        return newItemEntry;
    }

    enqueueMultipleAssets(sourceFiles) {
        const enqueuedItems = sourceFiles.map(file => this.enqueueAsset(file));
        Promise.all(enqueuedItems).then(results => {
            this.emit('allAssetsEnqueued', results.filter(Boolean));
        });
    }

    async beginTransmission(itemToProcess) {
        if (this.isTransferring) return;
        this.isTransferring = true;

        const currentItemIndex = this.findQueuedItemIndex(itemToProcess);
        if (currentItemIndex === -1) {
            this.isTransferring = false;
            return;
        }
        const currentItem = this.itemQueue[currentItemIndex];

        this.emit('transmissionStart', currentItem);

        if (!currentItem.base64Content) {
            console.error('Base64 content not available for item:', currentItem.sourceFile.name);
            this.emit('transmissionError', { response: 'Base64 content missing', status: -1 }, currentItem);
            this.emit('transmissionEnd', { response: 'Base64 content missing', status: -1 }, currentItem);
            this.isTransferring = false;
            return;
        }

        const fileNameParts = currentItem.sourceFile.name.split('.');
        const fileExtension = fileNameParts.pop();
        const fileNameWithoutExt = fileNameParts.join('.');

        try {
            const networkResponse = await fetch(this.processingSettings.uploadEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    base64data: currentItem.base64Content,
                    assetName: fileNameWithoutExt,
                    assetType: currentItem.sourceFile.type
                })
            });

            const responseData = await networkResponse.json();
            const responseStatus = networkResponse.status;

            if (networkResponse.ok) {
                this.emit('transmissionSuccessful', { serverResponse: responseData, httpStatus: responseStatus }, currentItem, responseData);
            } else {
                this.emit('transmissionFailure', { serverResponse: responseData, httpStatus: responseStatus }, currentItem);
            }
            this.emit('transmissionEnd', { serverResponse: responseData, httpStatus: responseStatus }, currentItem, responseData);

        } catch (error) {
            console.error('Network transmission error:', error);
            this.emit('transmissionFailure', { serverResponse: error.message, httpStatus: 0 }, currentItem);
            this.emit('transmissionEnd', { serverResponse: error.message, httpStatus: 0 }, currentItem);
        } finally {
            this.isTransferring = false;
        }
    }

    readFileInputAsBase64(fileObject) {
        return new Promise((resolve, reject) => {
            const fileReaderInstance = new FileReader();
            fileReaderInstance.onload = (e) => resolve(e.target.result);
            fileReaderInstance.onerror = (e) => reject(e);
            fileReaderInstance.readAsDataURL(fileObject);
        });
    }

    updateProgress(item, percentage) {
        item.progressPercentage = percentage;
        this.emit('transferProgress', item, percentage);
    }
}

function generateCanvasThumbnail(containerElement, displayOptions) {
    const isClientSupported = !!(window.FileReader && window.CanvasRenderingContext2D);
    if (!isClientSupported) return;

    const { targetAssetFile, desiredWidth, desiredHeight } = displayOptions;

    const isFileInstance = (candidate) => candidate instanceof File;
    const isImageFileType = (fileCandidate) => {
        const typePart = '|' + fileCandidate.type.slice(fileCandidate.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(typePart) !== -1;
    };

    if (!isFileInstance(targetAssetFile) || !isImageFileType(targetAssetFile)) return;

    const renderingSurface = document.createElement('canvas');
    containerElement.appendChild(renderingSurface);

    const fileReaderForData = new FileReader();

    fileReaderForData.onload = (dataEvent) => {
        const visualImage = new Image();
        visualImage.onload = () => {
            const calculatedWidth = desiredWidth || (visualImage.width / visualImage.height) * desiredHeight;
            const calculatedHeight = desiredHeight || (visualImage.height / visualImage.width) * desiredWidth;

            renderingSurface.setAttribute('width', calculatedWidth);
            renderingSurface.setAttribute('height', calculatedHeight);
            renderingSurface.getContext('2d').drawImage(visualImage, 0, 0, calculatedWidth, calculatedHeight);
        };
        visualImage.src = dataEvent.target.result;
    };
    fileReaderForData.readAsDataURL(targetAssetFile);
}

class MainContentManager {
    constructor(rootElementId) {
        this.applicationRoot = document.getElementById(rootElementId);
        if (!this.applicationRoot) {
            console.error('Application root element not found.');
            return;
        }

        this.initialContentEntries = [{
            'sourceUrl': 'https://scontent-a-iad.xx.fbcdn.net/hphotos-prn2/t1.0-9/1151081_10201852161326618_2087299939_n.jpg',
            'label': 'Sample From Server',
        }, {
            'sourceUrl': 'https://scontent-b-iad.xx.fbcdn.net/hphotos-frc3/t31.0-8/416754_3799985799085_1769166011_o.jpg',
            'label': 'Sample Crop',
            'cropData': {
                'xCoord': 0,
                'yCoord': 286,
                'x2Coord': 2046,
                'y2Coord': 971
            }
        }, {
            'sourceUrl': 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-ash3/t1.0-9/221754_2045126368696_101105_n.jpg',
            'label': 'Sample Rotate',
            'orientation': 180
        }, {
            'sourceUrl': 'https://fbcdn-sphotos-a-a.akamaihd.net/hphotos-ak-ash2/t31.0-8/738229_10200191249604863_465734781_o.jpg',
            'label': 'Sample Crop and Rotate',
            'cropData': {
                'xCoord': 400,
                'yCoord': 9,
                'x2Coord': 821,
                'y2Coord': 667
            },
            'orientation': 90
        }];

        this.mediaTransferSystem = new AssetProcessor({
            uploadEndpoint: 'test-upload.php'
        });

        this.initializeTransferHandlers();
        this.configureFileInputMechanism();
        this.displayInitialContent();
    }

    initializeTransferHandlers() {
        this.mediaTransferSystem.addValidationRule((fileObject) => {
            const fileType = fileObject.type;
            const fileExtension = fileObject.name.slice(fileObject.name.lastIndexOf('.') + 1);
            const normalizedMimeType = '|' + fileType.toLowerCase().slice(fileType.lastIndexOf('/') + 1) + '|';
            const normalizedExtension = '|' + fileExtension.toLowerCase() + '|';
            return '|jpg|png|jpeg|bmp|gif|'.indexOf(normalizedMimeType) !== -1 || '|jpg|png|jpeg|bmp|gif|'.indexOf(normalizedExtension) !== -1;
        });

        this.mediaTransferSystem.on('assetEnqueued', (item) => {
            console.log('Asset added to processing queue:', item.sourceFile.name);
            const thumbnailDisplayArea = document.createElement('div');
            thumbnailDisplayArea.style.border = '1px solid #eee';
            thumbnailDisplayArea.style.margin = '5px';
            thumbnailDisplayArea.style.display = 'inline-block';
            this.applicationRoot.appendChild(thumbnailDisplayArea);
            generateCanvasThumbnail(thumbnailDisplayArea, { targetAssetFile: item.sourceFile, desiredWidth: 100, desiredHeight: 100 });
        });
        this.mediaTransferSystem.on('validationFailure', (item) => console.warn('Asset validation failed for:', item.name));
        this.mediaTransferSystem.on('allAssetsEnqueued', (items) => console.log(`All ${items.length} assets processed for queuing.`));
        this.mediaTransferSystem.on('base64ConversionError', (item, error) => console.error(`Base64 conversion failed for ${item.sourceFile.name}:`, error));
        this.mediaTransferSystem.on('transmissionStart', (item) => console.log('Starting asset transmission:', item.sourceFile.name));
        this.mediaTransferSystem.on('transferProgress', (item, progress) => console.log(`Transmission progress for ${item.sourceFile.name}: ${progress}%`));
        this.mediaTransferSystem.on('transmissionSuccessful', (responseInfo, item, serverData) => console.log('Transmission successful:', item.sourceFile.name, serverData));
        this.mediaTransferSystem.on('transmissionFailure', (responseInfo, item) => console.error('Transmission error for:', item.sourceFile.name, responseInfo.serverResponse));
        this.mediaTransferSystem.on('transmissionEnd', (responseInfo, item) => console.log('Transmission complete for:', item.sourceFile.name));
    }

    configureFileInputMechanism() {
        const fileSelectionElement = document.createElement('input');
        fileSelectionElement.type = 'file';
        fileSelectionElement.multiple = true;
        fileSelectionElement.style.display = 'none';
        this.applicationRoot.appendChild(fileSelectionElement);

        const openSelectorButton = document.createElement('button');
        openSelectorButton.textContent = 'Add Media Files';
        openSelectorButton.onclick = () => fileSelectionElement.click();
        this.applicationRoot.appendChild(openSelectorButton);

        fileSelectionElement.addEventListener('change', (event) => {
            const selectedFiles = Array.from(event.target.files);
            this.mediaTransferSystem.enqueueMultipleAssets(selectedFiles);
            event.target.value = '';
        });

        const beginAllTransmissionsButton = document.createElement('button');
        beginAllTransmissionsButton.textContent = 'Initiate All Uploads';
        beginAllTransmissionsButton.onclick = () => {
            this.mediaTransferSystem.itemQueue.forEach(item => {
                if (item.statusIndicator === 'awaiting_processing') {
                    this.mediaTransferSystem.beginTransmission(item);
                }
            });
        };
        this.applicationRoot.appendChild(beginAllTransmissionsButton);
    }

    displayInitialContent() {
        console.log('Pre-defined content entries:', this.initialContentEntries);
        // The original code only defines this data, it doesn't render it using ngThumb.
        // If rendering were required, a separate mechanism to load/display images from URLs would be needed.
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const mainAppContainer = document.createElement('div');
    mainAppContainer.id = 'application-root-container';
    document.body.appendChild(mainAppContainer);
    new MainContentManager('application-root-container');
});