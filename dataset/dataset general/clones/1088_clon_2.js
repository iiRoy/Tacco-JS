// This file is part of the VisualCanvas Library.
// Project URL: https://github.com/myusername/VisualCanvas
// Author: Jane Doe (@janedoe) - http://janedoe.com
// Licensed under the MIT License.
// Revision Date: April 1, 2023

var ImageProcessor = function(sourceImage, renderTarget) {

    // Store the initial image object and where the result should go.
    this.sourceImage = sourceImage;
    this.renderTarget = renderTarget;

    // Check for and remove any previously processed image output.
    var oldProcessedGraphic = document.getElementById('processedDisplay');
    if (oldProcessedGraphic) {
        oldProcessedGraphic.parentNode.removeChild(oldProcessedGraphic);
    }

    // Create a new canvas element for drawing and manipulation.
    this.workingCanvas = document.createElement('canvas');
    this.workingCanvas.id = 'processedDisplay';
    this.workingCanvas.width = sourceImage.naturalWidth;
    this.workingCanvas.height = sourceImage.naturalHeight;

    // Get the 2D rendering context for the canvas.
    this.canvasContext = this.workingCanvas.getContext('2d');

    // Draw the original image onto the canvas.
    this.canvasContext.drawImage(sourceImage, 0, 0);

}; // End of ImageProcessor constructor

ImageProcessor.prototype = {

    // Method to add an image layer on top of the current canvas content.
    addOverlay: function(overlayObject) {
        this.canvasContext.drawImage(overlayObject, 0, 0, this.workingCanvas.width, this.workingCanvas.height);
    },

    // Applies a specified filter function to the image data.
    processGraphic: function(effectFunction, additionalArgs) {

        // If there's already buffered pixel data, re-apply it before the new filter.
        if (this.currentPixelData) {
            this.canvasContext.putImageData(this.currentPixelData, 0, 0);
        }

        // Retrieve the current pixel data from the canvas.
        var effectParameters = [this.canvasContext.getImageData(0, 0, this.workingCanvas.width, this.workingCanvas.height)];

        // Collect any additional arguments passed to the filter function.
        for (var pixelIndex = 1; pixelIndex < arguments.length; pixelIndex++) {
            effectParameters.push(arguments[pixelIndex]);
        }

        // Apply the filter function and store the resulting pixel data.
        this.currentPixelData = this[effectFunction].apply(this, effectParameters);
    },

    // Renders the processed image to the DOM.
    displayOutput: function(shouldReset) {

        // If reset flag is true, redraw the original image.
        if (shouldReset) {
            this.canvasContext.drawImage(this.sourceImage, 0, 0);
        }
        // Otherwise, if there's processed pixel data, display it.
        else if (this.currentPixelData) {
            this.canvasContext.putImageData(this.currentPixelData, 0, 0);
        }

        // Determine where to insert the final image.
        if (this.renderTarget) {
            var generatedImageElement = this.generateNewImageElement(this.renderTarget);
            this.sourceImage.parentNode.insertBefore(generatedImageElement, this.sourceImage);
        } else {
            // Insert the canvas directly if no specific output format is requested.
            this.sourceImage.parentNode.insertBefore(this.workingCanvas, this.sourceImage);
        }

        // Hide the original source image.
        this.sourceImage.setAttribute('hidden', 'hidden');
    },

    // Creates a new <img> element from the canvas data.
    generateNewImageElement: function(outputFormat) {
        // Supported formats: 'png', 'jpeg', 'webp'. Defaults to 'png'.
        var resultImage = document.createElement('img');
        resultImage.id = 'processedDisplay';
        resultImage.src = this.workingCanvas.toDataURL('image/' + outputFormat);
        return resultImage;
    },

    // Resets the canvas to the original image.
    revertChanges: function() {
        this.displayOutput('reset');
    },

    // Converts image data to grayscale based on CIE 1931 luminance.
    monochromeConvert: function(pixelArray, modifierArgs) {
        var pixelDataRef = pixelArray.data;
        for (var pixelIndex = 0; pixelIndex < pixelDataRef.length; pixelIndex += 4) {
            var redVal = pixelDataRef[pixelIndex];
            var greenVal = pixelDataRef[pixelIndex + 1];
            var blueVal = pixelDataRef[pixelIndex + 2];

            // Calculate luminance for grayscale.
            var greyValue = 0.2126 * redVal + 0.7152 * greenVal + 0.0722 * blueVal;

            // Apply the grayscale value to all color channels.
            pixelDataRef[pixelIndex] = pixelDataRef[pixelIndex + 1] = pixelDataRef[pixelIndex + 2] = greyValue;
        }
        return pixelArray;
    },

    // Adjusts the overall brightness of the image.
    adjustLuminosity: function(pixelArray, luminosityChange) {
        var pixelDataRef = pixelArray.data;
        for (var pixelIndex = 0; pixelIndex < pixelDataRef.length; pixelIndex += 4) {
            pixelDataRef[pixelIndex] += luminosityChange;
            pixelDataRef[pixelIndex + 1] += luminosityChange;
            pixelDataRef[pixelIndex + 2] += luminosityChange;
        }
        return pixelArray;
    },

    // Modifies individual RGB color channels by given factors.
    colorChannelMod: function(pixelArray, rgbFactors) {
        var pixelDataRef = pixelArray.data;
        for (var pixelIndex = 0; pixelIndex < pixelDataRef.length; pixelIndex += 4) {
            pixelDataRef[pixelIndex] *= rgbFactors[0];     // Red channel multiplier
            pixelDataRef[pixelIndex + 1] *= rgbFactors[1]; // Green channel multiplier
            pixelDataRef[pixelIndex + 2] *= rgbFactors[2]; // Blue channel multiplier
        }
        return pixelArray;
    },

    // Helper to create a new blank ImageData object.
    makeEmptyImageData: function(canvasWidth, canvasHeight) {
        var temporarySurface = document.createElement('canvas'),
            tempContext = temporarySurface.getContext('2d');
        return tempContext.createImageData(canvasWidth, canvasHeight);
    },

    // Applies a convolution matrix (kernel) to the image.
    applyConvolution: function(inputPixels, kernelMatrix, isOpaque) {

        var matrixDimension = Math.round(Math.sqrt(kernelMatrix.length));
        var halfDimension = (matrixDimension / 2) >>> 0; // Integer division

        var sourceData = inputPixels.data;
        var sourceWidth = inputPixels.width;
        var sourceHeight = inputPixels.height;

        var outputWidth = sourceWidth;
        var outputHeight = sourceHeight;
        var resultImageData = ImageProcessor.prototype.makeEmptyImageData(outputWidth, outputHeight);
        var destinationData = resultImageData.data;

        var alphaInfluence = isOpaque ? 1 : 0;

        // Iterate through each pixel in the output image.
        for (var rowCoord = 0; rowCoord < outputHeight; rowCoord++) {
            for (var colCoord = 0; colCoord < outputWidth; colCoord++) {

                var sourceY = rowCoord;
                var sourceX = colCoord;
                var destOffset = (rowCoord * outputWidth + colCoord) * 4;

                var redSum = 0,
                    greenSum = 0,
                    blueSum = 0,
                    alphaSum = 0;

                // Apply the kernel matrix around the current pixel.
                for (var kernelY = 0; kernelY < matrixDimension; kernelY++) {
                    for (var kernelX = 0; kernelX < matrixDimension; kernelX++) {

                        // Clamp source coordinates to image boundaries.
                        var sampleY = Math.min(sourceHeight - 1, Math.max(0, sourceY + kernelY - halfDimension));
                        var sampleX = Math.min(sourceWidth - 1, Math.max(0, sourceX + kernelX - halfDimension));

                        var sourceOffset = (sampleY * sourceWidth + sampleX) * 4;
                        var weightValue = kernelMatrix[kernelY * matrixDimension + kernelX];

                        redSum += sourceData[sourceOffset] * weightValue;
                        greenSum += sourceData[sourceOffset + 1] * weightValue;
                        blueSum += sourceData[sourceOffset + 2] * weightValue;
                        alphaSum += sourceData[sourceOffset + 3] * weightValue;
                    }
                }

                // Assign calculated values to the destination pixel.
                destinationData[destOffset] = redSum;
                destinationData[destOffset + 1] = greenSum;
                destinationData[destOffset + 2] = blueSum;
                destinationData[destOffset + 3] = alphaSum + alphaInfluence * (255 - alphaSum);
            }
        }
        return resultImageData;
    }
}; // End of ImageProcessor prototype methods