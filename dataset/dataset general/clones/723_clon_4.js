const visualDataStoreSettings = {
    cloudIdentifier: "your_cloud_name_placeholder",
    uploadDestination: "your_upload_preset_placeholder"
};

class VisualAssetManagementSystem {
    constructor(fileInputElementIdentifier, dropZoneElementIdentifier, labelInputElementIdentifier) {
        this.sourceInputControl = document.getElementById(fileInputElementIdentifier);
        this.receptionZoneElement = document.getElementById(dropZoneElementIdentifier);
        this.captionInputControl = document.getElementById(labelInputElementIdentifier);

        this.currentOperationState = {
            processedVisualsCollection: [],
            ongoingTransfersMap: new Map(),
            aggregateProgressRatio: 0,
            operationMessage: "System initialized, awaiting content.",
            assetCaptionValue: ""
        };

        this.establishControlBindings();
        this.initializeSystemState();
    }

    initializeSystemState() {
        this.currentOperationState.ongoingTransfersMap.clear();
        this.currentOperationState.aggregateProgressRatio = 0;
        this.currentOperationState.operationMessage = "Ready for visual assets.";
        this.currentOperationState.assetCaptionValue = this.captionInputControl ? this.captionInputControl.value : "";
        this.signalSystemUpdate();
    }

    establishControlBindings() {
        if (this.sourceInputControl) {
            this.sourceInputControl.addEventListener('change', this.handleInputFileSelection.bind(this));
        }
        if (this.receptionZoneElement) {
            this.receptionZoneElement.addEventListener('dragover', this.handleDropZoneDragOver.bind(this));
            this.receptionZoneElement.addEventListener('dragleave', this.handleDropZoneDragLeave.bind(this));
            this.receptionZoneElement.addEventListener('drop', this.handleDropZoneDrop.bind(this));
        }
        if (this.captionInputControl) {
            this.captionInputControl.addEventListener('input', this.updateAssetCaption.bind(this));
        }
    }

    updateAssetCaption() {
        this.currentOperationState.assetCaptionValue = this.captionInputControl.value;
        this.signalSystemUpdate();
    }

    handleInputFileSelection(event) {
        const selectedFiles = Array.from(event.target.files);
        this.initiateFileProcessing(selectedFiles);
    }

    handleDropZoneDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        this.receptionZoneElement.classList.add('active-drop-area');
        event.dataTransfer.dropEffect = 'copy';
    }

    handleDropZoneDragLeave(event) {
        event.stopPropagation();
        this.receptionZoneElement.classList.remove('active-drop-area');
    }

    handleDropZoneDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        this.receptionZoneElement.classList.remove('active-drop-area');

        const droppedFiles = Array.from(event.dataTransfer.files);
        this.initiateFileProcessing(droppedFiles);
    }

    initiateFileProcessing(filesToProcess) {
        this.currentOperationState.operationMessage = "Starting content transfers...";
        this.currentOperationState.ongoingTransfersMap.clear();
        this.currentOperationState.aggregateProgressRatio = 0;
        this.signalSystemUpdate();

        filesToProcess.forEach(fileItem => this.executeAssetUpload(fileItem));
    }

    executeAssetUpload(assetFile) {
        const uploadTargetURL = `https://api.cloudinary.com/v1_1/${visualDataStoreSettings.cloudIdentifier}/upload`;
        const fileUniqueName = assetFile.name;

        this.currentOperationState.ongoingTransfersMap.set(fileUniqueName, {
            transferProgress: 0,
            currentStatus: "Queued...",
            fileName: fileUniqueName,
            finalResponse: null
        });
        this.signalSystemUpdate();

        const uploadFormData = new FormData();
        uploadFormData.append('file', assetFile);
        uploadFormData.append('upload_preset', visualDataStoreSettings.uploadDestination);
        uploadFormData.append('tags', 'visual_asset_uploads');
        uploadFormData.append('context', `custom:content_label=${this.currentOperationState.assetCaptionValue}`);

        const transferRequest = new XMLHttpRequest();
        transferRequest.open('POST', uploadTargetURL, true);

        transferRequest.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
                const individualFileProgress = Math.round((event.loaded * 100.0) / event.total);
                const fileRecord = this.currentOperationState.ongoingTransfersMap.get(fileUniqueName);
                if (fileRecord) {
                    fileRecord.transferProgress = individualFileProgress;
                    fileRecord.currentStatus = `Sending... ${individualFileProgress}%`;
                    this.currentOperationState.ongoingTransfersMap.set(fileUniqueName, fileRecord);
                }
                this.calculateOverallProgress();
                this.signalSystemUpdate();
            }
        });

        transferRequest.addEventListener('load', () => {
            if (transferRequest.status >= 200 && transferRequest.status < 300) {
                const serverResponse = JSON.parse(transferRequest.responseText);
                const fileRecord = this.currentOperationState.ongoingTransfersMap.get(fileUniqueName);
                if (fileRecord) {
                    fileRecord.currentStatus = "Transfer completed!";
                    fileRecord.finalResponse = serverResponse;
                    serverResponse.context = {custom: {content_label: this.currentOperationState.assetCaptionValue}};
                    this.currentOperationState.processedVisualsCollection.push(serverResponse);
                    this.currentOperationState.ongoingTransfersMap.set(fileUniqueName, fileRecord);
                }
                this.calculateOverallProgress();
                this.signalSystemUpdate();
            } else {
                console.error(`Upload for ${fileUniqueName} failed: ${transferRequest.status} ${transferRequest.statusText}`);
                const fileRecord = this.currentOperationState.ongoingTransfersMap.get(fileUniqueName);
                if (fileRecord) {
                    fileRecord.currentStatus = `Failed: ${transferRequest.status}`;
                    this.currentOperationState.ongoingTransfersMap.set(fileUniqueName, fileRecord);
                }
                this.currentOperationState.operationMessage = "Some transfers encountered errors.";
                this.signalSystemUpdate();
            }
        });

        transferRequest.addEventListener('error', () => {
            console.error(`Network communication error for ${fileUniqueName}`);
            const fileRecord = this.currentOperationState.ongoingTransfersMap.get(fileUniqueName);
            if (fileRecord) {
                fileRecord.currentStatus = "Network error!";
                this.currentOperationState.ongoingTransfersMap.set(fileUniqueName, fileRecord);
            }
            this.currentOperationState.operationMessage = "A network issue disrupted transfers.";
            this.signalSystemUpdate();
        });

        transferRequest.send(uploadFormData);
    }

    calculateOverallProgress() {
        if (this.currentOperationState.ongoingTransfersMap.size === 0) {
            this.currentOperationState.aggregateProgressRatio = 0;
            this.currentOperationState.operationMessage = "Awaiting visual assets.";
            return;
        }

        let totalProgressSum = 0;
        let activeTransferCount = 0;

        for (const record of this.currentOperationState.ongoingTransfersMap.values()) {
            totalProgressSum += record.transferProgress;
            activeTransferCount++;
        }

        if (activeTransferCount > 0) {
            this.currentOperationState.aggregateProgressRatio = Math.round(totalProgressSum / activeTransferCount);
        } else {
            this.currentOperationState.aggregateProgressRatio = 0;
        }

        if (this.currentOperationState.aggregateProgressRatio === 100 && activeTransferCount > 0) {
            this.currentOperationState.operationMessage = "All visual transfers successfully concluded!";
        } else if (activeTransferCount > 0) {
            this.currentOperationState.operationMessage = `Overall transfer: ${this.currentOperationState.aggregateProgressRatio}%`;
        }
    }

    signalSystemUpdate() {
        document.dispatchEvent(new CustomEvent('visualAssetSystemStateChanged', {
            detail: { ...this.currentOperationState }
        }));
    }
}