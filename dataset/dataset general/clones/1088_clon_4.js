const pixelProcessor = {
    traverseAndModify: (imageDataBundle, modificationOperation) => {
        const pixelBytes = imageDataBundle.data;
        for (let currentByteIndex = 0; currentByteIndex < pixelBytes.length; currentByteIndex += 4) {
            modificationOperation(pixelBytes, currentByteIndex);
        }
        return imageDataBundle;
    },

    convertMonochrome: (imageDataBundle) => {
        return pixelProcessor.traverseAndModify(imageDataBundle, (dataArray, byteIndex) => {
            const redValue = dataArray[byteIndex];
            const greenValue = dataArray[byteIndex + 1];
            const blueValue = dataArray[byteIndex + 2];
            const calculatedLuminance = (0.2126 * redValue) + (0.7152 * greenValue) + (0.0722 * blueValue);
            dataArray[byteIndex] = dataArray[byteIndex + 1] = dataArray[byteIndex + 2] = calculatedLuminance;
        });
    },

    adjustChannelIntensity: (imageDataBundle, luminosityOffset) => {
        return pixelProcessor.traverseAndModify(imageDataBundle, (dataArray, byteIndex) => {
            dataArray[byteIndex] += luminosityOffset;
            dataArray[byteIndex + 1] += luminosityOffset;
            dataArray[byteIndex + 2] += luminosityOffset;
        });
    },

    scaleRgbValues: (imageDataBundle, colorMultipliers) => {
        const [redFactor, greenFactor, blueFactor] = colorMultipliers;
        return pixelProcessor.traverseAndModify(imageDataBundle, (dataArray, byteIndex) => {
            dataArray[byteIndex] *= redFactor;
            dataArray[byteIndex + 1] *= greenFactor;
            dataArray[byteIndex + 2] *= blueFactor;
        });
    },

    convolvePixels: (imageDataBundle, convolutionKernel, preserveAlpha) => {
        const kernelDimension = Math.round(Math.sqrt(convolutionKernel.length));
        const kernelCenterOffset = Math.floor(kernelDimension / 2);

        const sourcePixelData = imageDataBundle.data;
        const sourceImageWidth = imageDataBundle.width;
        const sourceImageHeight = imageDataBundle.height;

        const temporaryCanvasElement = document.createElement('canvas');
        const temporaryCanvasContext = temporaryCanvasElement.getContext('2d');
        const outputImageDataBundle = temporaryCanvasContext.createImageData(sourceImageWidth, sourceImageHeight);
        const destinationPixelData = outputImageDataBundle.data;

        const alphaBlendFactor = preserveAlpha ? 1 : 0;

        for (let currentY = 0; currentY < sourceImageHeight; currentY++) {
            for (let currentX = 0; currentX < sourceImageWidth; currentX++) {
                const destinationPixelOffset = (currentY * sourceImageWidth + currentX) * 4;
                let sumRed = 0, sumGreen = 0, sumBlue = 0, sumAlpha = 0;

                for (let kernelRow = 0; kernelRow < kernelDimension; kernelRow++) {
                    for (let kernelCol = 0; kernelCol < kernelDimension; kernelCol++) {
                        const sampledY = Math.min(sourceImageHeight - 1, Math.max(0, currentY + kernelRow - kernelCenterOffset));
                        const sampledX = Math.min(sourceImageWidth - 1, Math.max(0, currentX + kernelCol - kernelCenterOffset));
                        const sourcePixelOffset = (sampledY * sourceImageWidth + sampledX) * 4;
                        const kernelWeight = convolutionKernel[kernelRow * kernelDimension + kernelCol];

                        sumRed += sourcePixelData[sourcePixelOffset] * kernelWeight;
                        sumGreen += sourcePixelData[sourcePixelOffset + 1] * kernelWeight;
                        sumBlue += sourcePixelData[sourcePixelOffset + 2] * kernelWeight;
                        sumAlpha += sourcePixelData[sourcePixelOffset + 3] * kernelWeight;
                    }
                }
                destinationPixelData[destinationPixelOffset] = sumRed;
                destinationPixelData[destinationPixelOffset + 1] = sumGreen;
                destinationPixelData[destinationPixelOffset + 2] = sumBlue;
                destinationPixelData[destinationPixelOffset + 3] = sumAlpha + alphaBlendFactor * (255 - sumAlpha);
            }
        }
        return outputImageDataBundle;
    }
};

class VisualModifier {
    #originalInputImage;
    #outputSpecification;
    #processingCanvas;
    #canvasDrawingContext;
    #currentProcessedPixelData;

    constructor(inputHtmlImage, outputFormatString) {
        this.#originalInputImage = inputHtmlImage;
        this.#outputSpecification = outputFormatString;

        const previouslyModifiedElement = document.querySelector('[data-output-type="processed-image"]');
        if (previouslyModifiedElement) {
            previouslyModifiedElement.parentNode.removeChild(previouslyModifiedElement);
        }

        this.#processingCanvas = document.createElement('canvas');
        this.#processingCanvas.setAttribute('data-output-type', 'processed-image');
        this.#processingCanvas.width = inputHtmlImage.naturalWidth;
        this.#processingCanvas.height = inputHtmlImage.naturalHeight;
        this.#canvasDrawingContext = this.#processingCanvas.getContext('2d');
        this.#canvasDrawingContext.drawImage(inputHtmlImage, 0, 0);
    }

    // Draws an additional image on top of the current canvas content
    overlayImage(topLayerHtmlImage) {
        this.#canvasDrawingContext.drawImage(topLayerHtmlImage, 0, 0, this.#processingCanvas.width, this.#processingCanvas.height);
    }

    // Applies a specified transformation to the image data
    performTransformation(transformationKey, ...transformationParameters) {
        if (this.#currentProcessedPixelData) {
            this.#canvasDrawingContext.putImageData(this.#currentProcessedPixelData, 0, 0);
        }
        let currentImageRawData = this.#canvasDrawingContext.getImageData(0, 0, this.#processingCanvas.width, this.#processingCanvas.height);

        const transformationDispatchMap = {
            'monochrome': pixelProcessor.convertMonochrome,
            'lightness': pixelProcessor.adjustChannelIntensity,
            'colorBalance': pixelProcessor.scaleRgbValues,
            'spatialFilter': pixelProcessor.convolvePixels
        };

        const transformationFunction = transformationDispatchMap[transformationKey];
        if (transformationFunction) {
            this.#currentProcessedPixelData = transformationFunction(currentImageRawData, ...transformationParameters);
        } else {
            console.warn(`Unrecognized transformation key: ${transformationKey}`);
        }
    }

    // Displays the processed image or canvas in the DOM
    presentResult(shouldRevertToOriginal = false) {
        if (shouldRevertToOriginal) {
            this.#canvasDrawingContext.drawImage(this.#originalInputImage, 0, 0);
            this.#currentProcessedPixelData = null;
        } else if (this.#currentProcessedPixelData) {
            this.#canvasDrawingContext.putImageData(this.#currentProcessedPixelData, 0, 0);
        }

        if (this.#outputSpecification) {
            const newOutputImageElement = this.#createFinalDisplayImage(this.#outputSpecification);
            this.#originalInputImage.parentNode.insertBefore(newOutputImageElement, this.#originalInputImage);
        } else {
            this.#originalInputImage.parentNode.insertBefore(this.#processingCanvas, this.#originalInputImage);
        }
        this.#originalInputImage.setAttribute('hidden', 'true');
    }

    // Generates a new image element from the canvas data URL
    #createFinalDisplayImage(outputFormatType) {
        const generatedImageElement = document.createElement('img');
        generatedImageElement.setAttribute('data-output-type', 'processed-image');
        const imageMimeType = ['png', 'jpeg', 'webp'].includes(outputFormatType) ? `image/${outputFormatType}` : 'image/png';
        generatedImageElement.src = this.#processingCanvas.toDataURL(imageMimeType);
        return generatedImageElement;
    }

    // Resets the canvas to the original image state
    restoreOriginal() {
        this.presentResult(true);
    }
}