class DataTransferUnit {
    constructor(targetElement, configuration) {
        this.domNode = targetElement;
        this.config = this.configureUnit(configuration);
        this.unitState = {
            activeTransfers: [],
            totalTransferCount: 0,
        };
        this.captionDisplay = null;
        this.inputControl = null;

        this.setupUnit();
    }

    configureUnit(inputConfig) {
        const baseSettings = {
            initialCaption: 'Place content here',
            hoverCaption: 'Drop content now!',
            noSupportMessage: 'Your browser is not ready for this feature.',
            noPictureMessage: 'Unsupported content type!', // Not directly used in current flow, but good to keep
            successMessage: 'Sent!',
            maximumSizeMB: 10,
            wrapperEnabled: false,
            clickActivation: false,
            onUnitInit: () => {},
            onUnitStart: () => {},
            onUnitComplete: () => {},
            onUnitFailure: (errorInfo) => { console.error('DataTransferUnit Error:', errorInfo); return 0; },
            onUnitPreCheck: (payloadItem) => true,
            onUnitProgress: (completionRatio, progressDisplay, region) => {
                progressDisplay.style.height = `${completionRatio}%`;
                progressDisplay.style.lineHeight = `${(region.offsetHeight * completionRatio / 100)}px`;
                progressDisplay.style.verticalAlign = 'middle';
                const indicator = progressDisplay.querySelector('.progress-indicator');
                if (indicator) indicator.textContent = `${completionRatio}%`;
            },
            uploadedText: 'Uploaded'
        };
        return { ...baseSettings, ...inputConfig };
    }

    setupUnit() {
        const originalElement = this.domNode;

        if (this.config.wrapperEnabled) {
            const newContainer = document.createElement('div');
            newContainer.className = 'custom-container';
            if (originalElement.className) {
                newContainer.className += ' ' + originalElement.className;
            }

            originalElement.parentNode.insertBefore(newContainer, originalElement.nextSibling);
            newContainer.appendChild(originalElement);
            this.domNode = newContainer;
        }

        this.captionDisplay = document.createElement('div');
        this.captionDisplay.className = 'caption-display';
        this.domNode.prepend(this.captionDisplay);

        this.inputControl = originalElement.querySelector('input[type="file"]');
        if (!this.inputControl) {
            this.inputControl = document.createElement('input');
            this.inputControl.type = 'file';
            this.inputControl.style.display = 'none'; // Hide if newly created
            originalElement.appendChild(this.inputControl);
        }

        const initialVal = this.inputControl.dataset.value;
        if (initialVal && initialVal.length) {
            const initialImage = document.createElement('img');
            initialImage.src = initialVal;
            originalElement.appendChild(initialImage);
        } else {
            this.captionDisplay.textContent = this.config.initialCaption;
        }

        if (this.config.clickActivation) {
            this.inputControl.style.position = 'absolute';
            this.inputControl.style.top = '-1000px';
        }

        document.addEventListener('dragleave', this.handleGlobalDragLeave.bind(this));
        document.addEventListener('drop', this.handleGlobalDrop.bind(this));
        document.addEventListener('dragenter', this.handleGlobalDragEnter.bind(this));
        document.addEventListener('dragover', this.handleGlobalDragOver.bind(this));

        this.domNode.addEventListener('drop', this.handleRegionDrop.bind(this));
        this.domNode.addEventListener('click', this.handleRegionClick.bind(this));
        this.inputControl.addEventListener('change', this.handleInputSelection.bind(this));

        this.config.onUnitInit(this.domNode);
    }

    resetCaptionDisplay() {
        const originalElement = this.config.wrapperEnabled ? this.domNode.querySelector('div') : this.domNode;
        if (this.inputControl.dataset.value || originalElement.querySelector('img')) {
            this.captionDisplay.textContent = '';
            this.captionDisplay.classList.remove('over-state');
        } else {
            this.captionDisplay.textContent = this.config.initialCaption;
            this.captionDisplay.classList.remove('over-state');
        }
    }

    handleGlobalDragLeave(evt) {
        evt.preventDefault();
        this.resetCaptionDisplay();
    }

    handleGlobalDrop(evt) {
        evt.preventDefault();
        this.resetCaptionDisplay();
    }

    handleGlobalDragEnter(evt) {
        evt.preventDefault();
        this.captionDisplay.classList.add('over-state');
        this.captionDisplay.textContent = this.config.hoverCaption;
    }

    handleGlobalDragOver(evt) {
        evt.preventDefault();
        this.captionDisplay.classList.add('over-state');
        this.captionDisplay.textContent = this.config.hoverCaption;
    }

    handleRegionDrop(evt) {
        evt.preventDefault();
        this.config.onUnitStart(this.domNode);
        this.processIncomingPayloads(evt.dataTransfer.files);
        this.resetCaptionDisplay();
        this.inputControl.value = '';
    }

    handleRegionClick(evt) {
        this.inputControl.click();
    }

    handleInputSelection(evt) {
        this.processIncomingPayloads(evt.target.files);
        this.inputControl.value = '';
    }

    async processIncomingPayloads(fileList) {
        if (!fileList || fileList.length === 0 || !window.FileReader || !window.FormData) {
            this.captionDisplay.textContent = this.config.noSupportMessage;
            this.config.onUnitFailure({ message: this.config.noSupportMessage }, this.inputControl, this.domNode);
            return;
        }

        this.unitState.totalTransferCount = fileList.length;
        this.unitState.activeTransfers = [];

        const payloadPromises = Array.from(fileList).map(async (payload) => {
            try {
                await this.controlPayload(payload);
            } catch (error) {
                this.config.onUnitFailure(error, this.inputControl, this.domNode);
            }
        });

        await Promise.all(payloadPromises);
    }

    async controlPayload(payloadItem) {
        const payloadName = payloadItem.name.toLowerCase();
        const extension = payloadName.split('.').pop();

        const acceptedTypes = (this.domNode.dataset.contentType && this.domNode.dataset.contentType.split(',')) || [];

        if (this.inputControl.dataset.contentType && !acceptedTypes.includes(payloadItem.type)) {
            throw new Error(`Invalid content type: ${payloadItem.type}. Only ${this.inputControl.dataset.contentType} allowed.`);
        }

        if (payloadItem.size > (this.config.maximumSizeMB * 1048576)) {
            throw new Error(`Content exceeds max size: ${this.config.maximumSizeMB}MB.`);
        }

        if (this.config.onUnitPreCheck(payloadItem, this.inputControl, this.domNode) === false) {
            console.warn('DataTransferUnit: Payload rejected by pre-check filter.');
            return;
        }

        if ((/image/i).test(payloadItem.type) && this.inputControl.dataset.transform === 'true') {
            await this.transformImage(payloadItem);
        } else {
            await this.transmitPayload(payloadItem);
        }
    }

    async transformImage(originalPayload) {
        const originalName = originalPayload.name;
        const targetWidth = parseInt(this.inputControl.dataset.targetWidth) || 0;
        const targetHeight = parseInt(this.inputControl.dataset.targetHeight) || 0;
        const shouldCrop = this.inputControl.dataset.crop === 'true';
        const originalElement = this.config.wrapperEnabled ? this.domNode.querySelector('div') : this.domNode;

        return new Promise((resolve, reject) => {
            const dataReader = new FileReader();
            dataReader.onloadend = (event) => {
                const tempImage = new Image();
                tempImage.onload = async () => {
                    let currentWidth = tempImage.width;
                    let currentHeight = tempImage.height;
                    let newWidth = currentWidth;
                    let newHeight = currentHeight;

                    if ((targetWidth && currentWidth > targetWidth) || (targetHeight && currentHeight > targetHeight)) {
                        const aspectRatio = currentWidth / currentHeight;
                        if ((aspectRatio >= 1 || targetHeight === 0) && targetWidth && !shouldCrop) {
                            newWidth = targetWidth;
                            newHeight = targetWidth / aspectRatio;
                        } else if (shouldCrop && aspectRatio <= (targetWidth / targetHeight)) {
                            newWidth = targetWidth;
                            newHeight = targetWidth / aspectRatio;
                        } else {
                            newWidth = targetHeight * aspectRatio;
                            newHeight = targetHeight;
                        }
                    }

                    const drawingCanvas = document.createElement('canvas');
                    drawingCanvas.width = newWidth;
                    drawingCanvas.height = newHeight;
                    const graphicContext = drawingCanvas.getContext('2d');
                    graphicContext.drawImage(tempImage, 0, 0, newWidth, newHeight);

                    const imageDataURL = drawingCanvas.toDataURL('image/jpeg');

                    if (imageDataURL.length <= 6) {
                        reject({ message: 'Image transformation failed. Please retry.' });
                        return;
                    }

                    const newBlob = this.utilityMethods.binaryFromDataURI(imageDataURL);
                    Object.defineProperty(newBlob, 'name', { value: originalName, writable: false });

                    if (this.inputControl.dataset.postTarget) {
                        await this.transmitPayload(newBlob);
                    } else {
                        originalElement.appendChild(drawingCanvas);
                        this.inputControl.setAttribute('disabled', 'disabled');
                        const hiddenInput = document.createElement('input');
                        hiddenInput.setAttribute('name', this.inputControl.getAttribute('name'));
                        hiddenInput.setAttribute('value', imageDataURL);
                        this.inputControl.parentNode.insertBefore(hiddenInput, this.inputControl.nextSibling);
                    }
                    resolve();
                };
                tempImage.onerror = () => reject({ message: 'Failed to load image for transformation.' });
                tempImage.src = event.target.result;
            };
            dataReader.onerror = () => reject({ message: 'Failed to read image data.' });
            dataReader.readAsDataURL(originalPayload);
        });
    }

    async transmitPayload(payloadToTransmit) {
        const originalElement = this.config.wrapperEnabled ? this.domNode.querySelector('div') : this.domNode;

        if (this.unitState.totalTransferCount > 1) {
            originalElement.innerHTML = '';
            originalElement.prepend(this.captionDisplay);
            if (!originalElement.contains(this.inputControl)) {
                originalElement.appendChild(this.inputControl);
            }
        } else {
            Array.from(originalElement.children).forEach(child => {
                if (child !== this.captionDisplay && child !== this.inputControl) {
                    child.remove();
                }
            });
        }

        const currentProgressDisplay = document.createElement('div');
        currentProgressDisplay.className = 'progress-display';
        const progressIndicator = document.createElement('div');
        progressIndicator.className = 'progress-indicator';
        currentProgressDisplay.appendChild(progressIndicator);
        originalElement.appendChild(currentProgressDisplay);

        return new Promise((resolve, reject) => {
            const requestObject = new XMLHttpRequest();
            requestObject.open('POST', this.inputControl.dataset.postTarget, true);

            const csrfMeta = document.querySelector('meta[name="csrf-token"]');
            if (csrfMeta) {
                requestObject.setRequestHeader('X-CSRF-Token', csrfMeta.getAttribute('content'));
            }
            requestObject.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

            requestObject.upload.addEventListener('progress', (evt) => {
                if (evt.lengthComputable) {
                    const completionRatio = Math.ceil((evt.loaded / evt.total) * 100);
                    this.config.onUnitProgress(completionRatio, currentProgressDisplay, this.domNode);
                }
            });

            requestObject.addEventListener('load', (evt) => {
                if (evt.target.status !== 200) {
                    this.config.onUnitFailure({ message: evt.target.statusText, statusCode: evt.target.status }, this.inputControl, this.domNode);
                    reject(new Error(evt.target.statusText));
                    return;
                }

                let responseData;
                try {
                    responseData = JSON.parse(evt.target.responseText);
                } catch (e) {
                    responseData = { raw: evt.target.responseText };
                }

                this.config.onUnitComplete(responseData, payloadToTransmit, this.inputControl, this.domNode);

                currentProgressDisplay.classList.add('upload-success');
                progressIndicator.textContent = this.config.uploadedText;
                setTimeout(() => currentProgressDisplay.style.display = 'none', 1000);
                resolve();
            });

            requestObject.addEventListener('error', (evt) => {
                this.config.onUnitFailure({ message: 'Network error during upload.' }, this.inputControl, this.domNode);
                reject(new Error('Network error during upload.'));
            });

            requestObject.addEventListener('abort', (evt) => {
                this.config.onUnitFailure({ message: 'Upload aborted.' }, this.inputControl, this.domNode);
                reject(new Error('Upload aborted.'));
            });

            const transferForm = new FormData();
            for (const key in this.inputControl.dataset) {
                // Exclude 'value' for 'data-value', 'transform', 'targetWidth', 'targetHeight', 'crop', 'postTarget'
                if (!['value', 'transform', 'targetWidth', 'targetHeight', 'crop', 'postTarget', 'contentType'].includes(key) &&
                    typeof this.inputControl.dataset[key] !== 'object') {
                    transferForm.append(key, this.inputControl.dataset[key]);
                }
            }
            transferForm.append(this.inputControl.getAttribute('name') || 'file', payloadToTransmit);

            requestObject.send(transferForm);
        });
    }

    utilityMethods = {
        binaryFromDataURI: (dataURI) => {
            const base64String = dataURI.split(',')[1];
            const mimePart = dataURI.split(',')[0].split(':')[1].split(';')[0];

            const decodedBinary = atob(base64String);
            const dataLength = decodedBinary.length;
            const uint8Array = new Uint8Array(dataLength);

            for (let i = 0; i < dataLength; i++) {
                uint8Array[i] = decodedBinary.charCodeAt(i);
            }

            return new Blob([uint8Array], { type: mimePart });
        }
    };
}

const initializeDataTransfer = (selector, options) => {
    const targetElements = document.querySelectorAll(selector);
    targetElements.forEach(element => {
        if (!element.__dataTransferUnitInstance__) {
            element.__dataTransferUnitInstance__ = new DataTransferUnit(element, options);
        }
    });
};

// To mimic the original's self-executing nature and make it globally available
// without jQuery, we can attach the initializer to the window object or define it directly.
// The user would then call: window.initializeDataTransfer('.my-area', {});
// Or, if used as a module, it would be imported.
// For raw JS output, defining the class and the initializer is sufficient.