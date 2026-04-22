class ImageTransformer {
    constructor(inputElementIdentifier, configurationObject = {}) {
        const defaultSettings = {
            targetWidth: 0,
            targetHeight: 0,
            padWhenSmaller: false,
            backgroundColor: '#fff',
            outputFormat: 'image/jpeg',
            scalingMode: 'contain', // 'contain', 'cover', 'auto'
            watermark: null, // Placeholder for watermark, not implemented
            forceStretch: false, // stretch small images
            onProcessStart: null,
            onProcessSuccess: null,
            onProcessFailure: null,
            onProcessComplete: null
        };

        this.currentConfig = Object.assign({}, defaultSettings, configurationObject);
        this.sourceElement = typeof inputElementIdentifier === 'string' ?
            document.getElementById(inputElementIdentifier) :
            inputElementIdentifier;

        if (!this.sourceElement || this.sourceElement.tagName !== 'INPUT' || this.sourceElement.type !== 'file') {
            console.error('Provided element is not a valid file input.');
            return;
        }

        this.verifyBrowserCapabilities();
        this.attachFileChangeListener();
    }

    verifyBrowserCapabilities() {
        this.canProcessFiles = !!(window.File && window.FileReader && window.FileList && window.Blob);
        if (!this.canProcessFiles) {
            console.warn('Browser does not fully support file processing APIs. Functionality may be limited.');
        }
    }

    attachFileChangeListener() {
        if (this.sourceElement) {
            this.sourceElement.addEventListener('change', this.handleInputFileChange.bind(this));
        }
    }

    handleInputFileChange(event) {
        if (!this.canProcessFiles) {
            this.invokeCallback(this.currentConfig.onProcessFailure, 'Browser APIs not supported.');
            this.invokeCallback(this.currentConfig.onProcessComplete);
            return;
        }

        this.invokeCallback(this.currentConfig.onProcessStart);

        const selectedFiles = event.target.files;
        if (!selectedFiles || selectedFiles.length === 0) {
            this.invokeCallback(this.currentConfig.onProcessFailure, 'No file chosen.');
            this.invokeCallback(this.currentConfig.onProcessComplete);
            return;
        }

        const primaryFile = selectedFiles[0];
        if (!primaryFile.type.startsWith('image/')) {
            this.invokeCallback(this.currentConfig.onProcessFailure, 'Selected file is not an image type.');
            this.invokeCallback(this.currentConfig.onProcessComplete);
            return;
        }

        this.readFileData(primaryFile);
    }

    readFileData(fileObject) {
        const dataURLReader = new FileReader();
        const arrayBufferReader = new FileReader();

        let imageDataUrlResult = null;
        let imageArrayBufferResult = null;

        let dataURLReadComplete = false;
        let arrayBufferReadComplete = false;

        const checkBothReadsFinished = () => {
            if (dataURLReadComplete && arrayBufferReadComplete) {
                this.processImageWithData(fileObject, imageDataUrlResult, imageArrayBufferResult);
            }
        };

        dataURLReader.onload = (e) => {
            imageDataUrlResult = e.target.result;
            dataURLReadComplete = true;
            checkBothReadsFinished();
        };

        arrayBufferReader.onload = (e) => {
            imageArrayBufferResult = e.target.result;
            arrayBufferReadComplete = true;
            checkBothReadsFinished();
        };

        dataURLReader.onerror = arrayBufferReader.onerror = (e) => {
            this.invokeCallback(this.currentConfig.onProcessFailure, 'Error during file reading: ' + e.target.error.name);
            this.invokeCallback(this.currentConfig.onProcessComplete);
        };

        dataURLReader.readAsDataURL(fileObject);
        arrayBufferReader.readAsArrayBuffer(fileObject);
    }

    processImageWithData(originalFile, dataURI, buffer) {
        const imageRepresentation = new Image();
        imageRepresentation.onload = () => {
            let imageOrientation = this.extractExifOrientation(buffer);
            this.generateThumbnail(originalFile, imageRepresentation, dataURI, imageOrientation);
        };
        imageRepresentation.onerror = () => {
            this.invokeCallback(this.currentConfig.onProcessFailure, 'Image data could not be loaded.');
            this.invokeCallback(this.currentConfig.onProcessComplete);
        };
        imageRepresentation.src = dataURI;
    }

    // Minimal EXIF parser to extract the Orientation tag (0x0112)
    extractExifOrientation(buffer) {
        const dataView = new DataView(buffer);
        if (dataView.getUint16(0, false) !== 0xFFD8) return 1; // Not a JPEG (SOI marker)

        let offset = 2;
        const totalLength = buffer.byteLength;
        while (offset < totalLength) {
            if (dataView.getUint16(offset + 1, false) === 0xFFE1) { // APP1 segment marker
                offset += 4; // Skip marker and length
                if (dataView.getUint32(offset, false) !== 0x45786966) return 1; // "Exif\0\0"
                
                const tiffHeaderOffset = offset + 6;
                const isBigEndian = dataView.getUint16(tiffHeaderOffset, false) === 0x4D4D; // "MM" for big-endian
                const ifd0Offset = dataView.getUint32(tiffHeaderOffset + 4, isBigEndian) + tiffHeaderOffset;

                const tagCount = dataView.getUint16(ifd0Offset, isBigEndian);
                for (let i = 0; i < tagCount; i++) {
                    const entryPosition = ifd0Offset + 2 + (i * 12);
                    if (dataView.getUint16(entryPosition, isBigEndian) === 0x0112) { // Orientation tag
                        return dataView.getUint16(entryPosition + 8, isBigEndian);
                    }
                }
            } else {
                offset += 2 + dataView.getUint16(offset + 1, false); // Skip segment marker and length
            }
        }
        return 1; // Default orientation
    }

    generateThumbnail(originalFile, imageObject, originalDataURI, orientationValue) {
        // Step 1: Draw original image to an intermediate canvas, applying EXIF orientation
        const orientedCanvas = document.createElement('canvas');
        const orientedCtx = orientedCanvas.getContext('2d');

        let orientedImageSourceWidth = imageObject.naturalWidth;
        let orientedImageSourceHeight = imageObject.naturalHeight;

        // Adjust intermediate canvas dimensions for rotated images
        if (orientationValue >= 5 && orientationValue <= 8) { // Orientations 5-8 involve 90-degree rotations
            orientedImageSourceWidth = imageObject.naturalHeight;
            orientedImageSourceHeight = imageObject.naturalWidth;
        }
        orientedCanvas.width = orientedImageSourceWidth;
        orientedCanvas.height = orientedImageSourceHeight;

        orientedCtx.save();
        this.applyOrientationTransforms(orientedCtx, orientationValue, imageObject.naturalWidth, imageObject.naturalHeight, orientedImageSourceWidth, orientedImageSourceHeight);
        orientedCtx.drawImage(imageObject, 0, 0, imageObject.naturalWidth, imageObject.naturalHeight);
        orientedCtx.restore();

        // Now, orientedCanvas contains the image correctly oriented. Use it as the source for the final thumbnail.
        const sourceWidth = orientedImageSourceWidth;
        const sourceHeight = orientedImageSourceHeight;

        const finalDrawingSurface = document.createElement('canvas');
        const finalDrawingContext = finalDrawingSurface.getContext('2d');

        const {
            targetWidth,
            targetHeight,
            scalingMode,
            padWhenSmaller,
            backgroundColor,
            forceStretch,
            outputFormat
        } = this.currentConfig;

        let canvasOutputWidth = targetWidth > 0 ? targetWidth : sourceWidth;
        let canvasOutputHeight = targetHeight > 0 ? targetHeight : sourceHeight;

        let imageDrawWidth = sourceWidth;
        let imageDrawHeight = sourceHeight;
        let imageDrawX = 0;
        let imageDrawY = 0;

        let currentScaleRatio = 1;

        if (targetWidth > 0 && targetHeight > 0) { // Both target dimensions provided
            const targetAspect = targetWidth / targetHeight;
            const sourceAspect = sourceWidth / sourceHeight;

            if (scalingMode === 'contain') {
                currentScaleRatio = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
            } else if (scalingMode === 'cover') {
                currentScaleRatio = Math.max(targetWidth / sourceWidth, targetHeight / sourceHeight);
            } else { // 'auto'
                currentScaleRatio = 1;
            }

            imageDrawWidth = sourceWidth * currentScaleRatio;
            imageDrawHeight = sourceHeight * currentScaleRatio;

            const imageIsSmallerThanTarget = (imageDrawWidth < targetWidth && imageDrawHeight < targetHeight);

            if (imageIsSmallerThanTarget) {
                if (!padWhenSmaller) {
                    canvasOutputWidth = imageDrawWidth;
                    canvasOutputHeight = imageDrawHeight;
                }

                if (forceStretch && (scalingMode === 'auto' || scalingMode === 'contain')) {
                    imageDrawWidth = canvasOutputWidth;
                    imageDrawHeight = canvasOutputHeight;
                }
            }
            
            imageDrawX = (canvasOutputWidth - imageDrawWidth) / 2;
            imageDrawY = (canvasOutputHeight - imageDrawHeight) / 2;

        } else { // Only one or no target dimension provided
            if (targetWidth > 0) {
                currentScaleRatio = targetWidth / sourceWidth;
                canvasOutputWidth = targetWidth;
                canvasOutputHeight = sourceHeight * currentScaleRatio;
            } else if (targetHeight > 0) {
                currentScaleRatio = targetHeight / sourceWidth; // corrected to targetHeight / sourceHeight
                canvasOutputHeight = targetHeight;
                canvasOutputWidth = sourceWidth * currentScaleRatio;
            }
            imageDrawWidth = sourceWidth * currentScaleRatio;
            imageDrawHeight = sourceHeight * currentScaleRatio;
        }

        finalDrawingSurface.width = canvasOutputWidth;
        finalDrawingSurface.height = canvasOutputHeight;

        if (backgroundColor) {
            finalDrawingContext.fillStyle = backgroundColor;
            finalDrawingContext.fillRect(0, 0, canvasOutputWidth, canvasOutputHeight);
        }

        // Step 2: Draw the oriented image from the intermediate canvas to the final thumbnail canvas
        finalDrawingContext.drawImage(orientedCanvas, imageDrawX, imageDrawY, imageDrawWidth, imageDrawHeight);
        
        const finalDataURL = finalDrawingSurface.toDataURL(outputFormat);
        const finalBlob = this.convertDataURItoBlob(finalDataURL, outputFormat);

        const resultDimensions = {
            width: canvasOutputWidth,
            height: canvasOutputHeight
        };

        this.invokeCallback(this.currentConfig.onProcessSuccess, finalDataURL, finalBlob, resultDimensions, originalFile, {
            width: orientedImageSourceWidth,
            height: orientedImageSourceHeight
        }, null);

        this.invokeCallback(this.currentConfig.onProcessComplete);

        // Clean up canvases
        orientedCanvas.remove();
        finalDrawingSurface.remove();
    }

    applyOrientationTransforms(ctx, orientation, naturalW, naturalH, canvasW, canvasH) {
        switch (orientation) {
            case 2: // Flip horizontal
                ctx.translate(canvasW, 0);
                ctx.scale(-1, 1);
                break;
            case 3: // Rotate 180
                ctx.translate(canvasW, canvasH);
                ctx.rotate(Math.PI);
                break;
            case 4: // Flip vertical
                ctx.translate(0, canvasH);
                ctx.scale(1, -1);
                break;
            case 5: // Rotate 90 CCW and flip horizontal
                ctx.rotate(0.5 * Math.PI);
                ctx.scale(1, -1);
                break;
            case 6: // Rotate 90 CW
                ctx.translate(canvasW, 0);
                ctx.rotate(0.5 * Math.PI);
                break;
            case 7: // Rotate 90 CW and flip horizontal
                ctx.translate(canvasW, canvasH);
                ctx.rotate(0.5 * Math.PI);
                ctx.scale(1, -1);
                break;
            case 8: // Rotate 90 CCW
                ctx.translate(0, canvasH);
                ctx.rotate(-0.5 * Math.PI);
                break;
        }
    }

    convertDataURItoBlob(dataURI, mimeType) {
        const parts = dataURI.split(',');
        const base64 = parts[1];
        const contentType = mimeType || parts[0].split(':')[1].split(';')[0];
        const byteCharacters = atob(base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new Blob([byteArray], {
            type: contentType
        });
    }

    invokeCallback(callbackFunction, ...args) {
        if (typeof callbackFunction === 'function') {
            callbackFunction(...args);
        }
    }
}