/*
 *  ImageProcessingEngine.js - Advanced Image Manipulation Library using HTML Canvas
 *  Project Repository: https://github.com/modern-dev/image-processing-engine
 *  Authored by: K. D. Mac - (c) 2023
 *  Licensed under the permissive MIT License.
 *  Last Modified: October 26, 2023
 */

// Define a utility constant for common image MIME types
const IMAGE_MIME_PNG = 'image/png';
const IMAGE_MIME_JPEG = 'image/jpeg';
const DEFAULT_EXPORT_TYPE = 'png'; // Fallback for unspecified output formats

/**
 * Core class for image manipulation operations.
 * Initializes a canvas context with a source image and provides methods
 * for applying various visual transformations.
 * @param {HTMLImageElement} sourcePictureElement - The original image element to process.
 * @param {string} [exportFormatType='png'] - The desired output format ('png', 'jpeg', 'webp').
 */
const ImageProcessor = function(sourcePictureElement, exportFormatType = DEFAULT_EXPORT_TYPE) {
    // Input validation: Ensure a valid image element is provided
    if (!(sourcePictureElement instanceof HTMLImageElement)) {
        console.error("ImageProcessor: Invalid source element provided. Must be an HTMLImageElement.");
        throw new Error("Invalid source image for ImageProcessor.");
    }

    this.originalSourceImage = sourcePictureElement;
    // Basic validation for the export format, defaulting to PNG if not JPEG
    this.desiredExportFormat = exportFormatType.toLowerCase() === 'jpeg' ? 'jpeg' : DEFAULT_EXPORT_TYPE; 

    // Attempt to locate and remove any pre-existing processed image display
    const existingOutputElement = document.getElementById('processedImageDisplay');
    if (existingOutputElement) {
        // A robust removal ensures no lingering elements with the same ID
        existingOutputElement.parentNode?.removeChild(existingOutputElement);
    }

    // Initialize the internal canvas for all processing operations
    this.processingCanvas = document.createElement('canvas');
    this.processingCanvas.id = 'processedImageDisplay'; // Unique ID for the output canvas
    this.processingCanvas.width = sourcePictureElement.naturalWidth;
    this.processingCanvas.height = sourcePictureElement.naturalHeight;

    // Obtain the 2D rendering context
    this.canvasContext = this.processingCanvas.getContext('2d');

    // Draw the initial image onto the canvas
    this.canvasContext.drawImage(sourcePictureElement, 0, 0);

    // Store the initial pixel data for perfect resets
    this.initialPixelState = this.canvasContext.getImageData(0, 0, this.processingCanvas.width, this.processingCanvas.height);
    // This buffer holds the pixel data after the most recent transformation
    this.currentPixelBuffer = null;
};

// Define the prototype methods for the ImageProcessor class
ImageProcessor.prototype = {

    /**
     * Overlays another graphic element onto the current canvas state.
     * @param {HTMLImageElement|HTMLCanvasElement|HTMLVideoElement} overlayGraphic - The graphic to draw over.
     */
    overlayImageLayer: function(overlayGraphic) {
        // Ensure the overlay graphic is a renderable element
        if (!overlayGraphic || !['IMG', 'CANVAS', 'VIDEO'].includes(overlayGraphic.tagName)) {
            console.warn("ImageProcessor: Invalid overlay graphic provided. Skipping overlay.");
            return;
        }
        this.canvasContext.drawImage(overlayGraphic, 0, 0, this.processingCanvas.width, this.processingCanvas.height);
    },

    /**
     * Applies a specified image transformation (filter) to the current pixel data.
     * The first argument is the name of the transformation method, followed by its specific parameters.
     * @param {string} effectName - The name of the transformation function (e.g., 'applyGrayscaleEffect').
     * @param {...any} effectParameters - Parameters specific to the chosen transformation.
     */
    applyTransformation: function(effectName, ...effectParameters) {
        // If a previous transformation has occurred, re-apply that state before new processing
        // This ensures filters are applied sequentially from a known state, not cumulatively from the canvas.
        // For multiple filters, it's often better to re-apply the base image or previous pixel buffer.
        if (this.currentPixelBuffer) {
            this.canvasContext.putImageData(this.currentPixelBuffer, 0, 0);
        } else {
            // If no buffer, ensure we start from the original image data
            this.canvasContext.putImageData(this.initialPixelState, 0, 0);
        }

        // Validate that the requested effect exists as a method on this object
        const transformationFunction = this[effectName];
        if (typeof transformationFunction !== 'function') {
            console.error(`ImageProcessor: Unknown transformation effect '${effectName}' requested.`);
            return; // Exit if the function doesn't exist
        }

        // Retrieve the current pixel data from the canvas for processing
        const imageDataForProcessing = this.canvasContext.getImageData(0, 0, this.processingCanvas.width, this.processingCanvas.height);

        // Prepend the image data to the effect parameters
        const fullArgumentsList = [imageDataForProcessing, ...effectParameters];

        // Execute the transformation and store the new pixel data
        this.currentPixelBuffer = transformationFunction.apply(this, fullArgumentsList);

        // Optionally, immediately apply the result to the canvas (for visual feedback or further processing)
        if (this.currentPixelBuffer instanceof ImageData) {
            this.canvasContext.putImageData(this.currentPixelBuffer, 0, 0);
        } else {
            console.warn(`ImageProcessor: Transformation '${effectName}' did not return valid ImageData.`);
        }
    },

    /**
     * Renders the processed image to the DOM, either as a canvas or a new image element.
     * @param {boolean} [shouldRevertToOriginal=false] - If true, the canvas is reset to the original image.
     */
    displayProcessedImage: function(shouldRevertToOriginal = false) {
        // Determine the parent element where the output will be inserted
        const parentOfOriginal = this.originalSourceImage.parentElement;
        if (!parentOfOriginal) {
            console.warn("ImageProcessor: Original image has no parent element, cannot insert processed image.");
            return;
        }

        if (shouldRevertToOriginal) {
            // Reset to the initial image state
            this.canvasContext.putImageData(this.initialPixelState, 0, 0);
            this.currentPixelBuffer = null; // Clear the processed buffer
        } else if (this.currentPixelBuffer) {
            // Apply the most recent processed pixel data
            this.canvasContext.putImageData(this.currentPixelBuffer, 0, 0);
        }

        let finalOutputElement;
        // If an output format is specified, create an <img> tag
        if (this.desiredExportFormat !== DEFAULT_EXPORT_TYPE || this.desiredExportFormat === IMAGE_MIME_JPEG) { // More explicit check
            finalOutputElement = this.generateOutputImageElement(this.desiredExportFormat);
        } else {
            // Otherwise, insert the canvas directly
            finalOutputElement = this.processingCanvas;
        }

        // Insert the new element before the original image
        parentOfOriginal.insertBefore(finalOutputElement, this.originalSourceImage);

        // Hide the original image element
        this.originalSourceImage.style.display = 'none';
        this.originalSourceImage.setAttribute('aria-hidden', 'true'); // Accessibility improvement
    },

    /**
     * Creates an HTMLImageElement from the current canvas content.
     * @param {string} exportImageType - The desired image format ('png', 'jpeg', 'webp').
     * @returns {HTMLImageElement} A new image element containing the processed data.
     */
    generateOutputImageElement: function(exportImageType) {
        const outputImageNode = document.createElement('img');
        outputImageNode.id = 'processedImageDisplay'; // Re-using the ID for the output element
        
        let validMimeType = IMAGE_MIME_PNG; // Default to PNG

        switch (exportImageType.toLowerCase()) {
            case 'jpeg':
                validMimeType = IMAGE_MIME_JPEG;
                break;
            case 'webp':
                // Check for WebP support (basic check by attempting to create a data URL)
                if (this.processingCanvas.toDataURL('image/webp').startsWith('data:image/webp')) {
                    validMimeType = 'image/webp';
                } else {
                    console.warn("ImageProcessor: WebP format not fully supported, falling back to PNG.");
                }
                break;
            default:
                // Default is PNG, already set
                break;
        }

        outputImageNode.src = this.processingCanvas.toDataURL(validMimeType);
        outputImageNode.alt = "Processed image output"; // Add alt text for accessibility
        return outputImageNode;
    },

    /**
     * Resets the canvas to its original state, clearing any applied transformations.
     */
    restoreOriginal: function() {
        this.displayProcessedImage(true); // Call render with reset flag
        this.currentPixelBuffer = null; // Ensure the internal buffer is cleared
    },

    /**
     * Applies a grayscale effect using the CIE 1931 luminance formula.
     * @param {ImageData} imageDataBuffer - The ImageData object to modify.
     * @returns {ImageData} The modified ImageData object.
     */
    applyGrayscaleEffect: function(imageDataBuffer) {
        if (!(imageDataBuffer instanceof ImageData)) {
            console.error("applyGrayscaleEffect: Invalid ImageData object provided.");
            return imageDataBuffer;
        }
        const pixelDataArray = imageDataBuffer.data; // Reference to the underlying Uint8ClampedArray

        // Iterate through each pixel (4 bytes: R, G, B, A)
        for (let i = 0; i < pixelDataArray.length; i += 4) {
            const redComponent = pixelDataArray[i];
            const greenComponent = pixelDataArray[i + 1];
            const blueComponent = pixelDataArray[i + 2];

            // Calculate luminance using standard coefficients
            const luminanceValue = Math.round(0.2126 * redComponent + 0.7152 * greenComponent + 0.0722 * blueComponent);

            // Set R, G, and B channels to the calculated luminance
            pixelDataArray[i] = luminanceValue;
            pixelDataArray[i + 1] = luminanceValue;
            pixelDataArray[i + 2] = luminanceValue;
            // Alpha channel (pixelDataArray[i + 3]) remains unchanged
        }
        return imageDataBuffer;
    },

    /**
     * Adjusts the brightness of each pixel.
     * @param {ImageData} imageDataBuffer - The ImageData object to modify.
     * @param {number} brightnessDelta - The amount to add/subtract from each RGB channel (e.g., -50 to 50).
     * @returns {ImageData} The modified ImageData object.
     */
    adjustBrightnessLevel: function(imageDataBuffer, brightnessDelta) {
        if (!(imageDataBuffer instanceof ImageData)) {
            console.error("adjustBrightnessLevel: Invalid ImageData object provided.");
            return imageDataBuffer;
        }
        // Ensure brightnessDelta is a number
        if (typeof brightnessDelta !== 'number' || isNaN(brightnessDelta)) {
            console.warn("adjustBrightnessLevel: Brightness delta is not a valid number, using 0.");
            brightnessDelta = 0;
        }

        const pixelDataArray = imageDataBuffer.data;

        for (let i = 0; i < pixelDataArray.length; i += 4) {
            // Apply adjustment and clamp values to stay within 0-255 range
            pixelDataArray[i] = Math.max(0, Math.min(255, pixelDataArray[i] + brightnessDelta));     // Red
            pixelDataArray[i + 1] = Math.max(0, Math.min(255, pixelDataArray[i + 1] + brightnessDelta)); // Green
            pixelDataArray[i + 2] = Math.max(0, Math.min(255, pixelDataArray[i + 2] + brightnessDelta)); // Blue
        }
        return imageDataBuffer;
    },

    /**
     * Multiplies RGB channels by specified factors.
     * Useful for tinting or color balance adjustments.
     * @param {ImageData} imageDataBuffer - The ImageData object to modify.
     * @param {number[]} rgbMultipliers - An array of three numbers [R_factor, G_factor, B_factor].
     * @returns {ImageData} The modified ImageData object.
     */
    modifyRgbChannels: function(imageDataBuffer, rgbMultipliers) {
        if (!(imageDataBuffer instanceof ImageData)) {
            console.error("modifyRgbChannels: Invalid ImageData object provided.");
            return imageDataBuffer;
        }
        // Validate rgbMultipliers
        if (!Array.isArray(rgbMultipliers) || rgbMultipliers.length !== 3 || rgbMultipliers.some(isNaN)) {
            console.error("modifyRgbChannels: Invalid RGB multipliers array. Expected [R, G, B] factors.");
            return imageDataBuffer;
        }

        const pixelDataArray = imageDataBuffer.data;

        for (let i = 0; i < pixelDataArray.length; i += 4) {
            pixelDataArray[i] = Math.max(0, Math.min(255, pixelDataArray[i] * rgbMultipliers[0]));     // Red
            pixelDataArray[i + 1] = Math.max(0, Math.min(255, pixelDataArray[i + 1] * rgbMultipliers[1])); // Green
            pixelDataArray[i + 2] = Math.max(0, Math.min(255, pixelDataArray[i + 2] * rgbMultipliers[2])); // Blue
        }
        return imageDataBuffer;
    },

    /**
     * Creates a new, empty ImageData object with specified dimensions.
     * This is a utility function for generating output buffers.
     * @param {number} targetWidth - The desired width of the ImageData.
     * @param {number} targetHeight - The desired height of the ImageData.
     * @returns {ImageData} A new ImageData object filled with transparent black.
     */
    createEmptyImageData: function(targetWidth, targetHeight) {
        // Modern browsers support direct ImageData constructor
        if (typeof ImageData === 'function') {
            return new ImageData(targetWidth, targetHeight);
        } else {
            // Fallback for older browsers: use an offscreen canvas
            const temporaryOffscreenCanvas = document.createElement('canvas');
            const offscreenContext = temporaryOffscreenCanvas.getContext('2d');
            return offscreenContext.createImageData(targetWidth, targetHeight);
        }
    },

    /**
     * Applies a convolution filter (e.g., blur, sharpen, edge detection) to the image.
     * @param {ImageData} inputPixelData - The source ImageData object.
     * @param {number[]} kernelMatrix - A 1D array representing the convolution kernel.
     * @param {boolean} [preserveAlpha=false] - If true, the alpha channel is preserved/not modified by the kernel.
     * @returns {ImageData} The new ImageData object with the convolution applied.
     */
    applyConvolutionFilter: function(inputPixelData, kernelMatrix, preserveAlpha = false) {
        if (!(inputPixelData instanceof ImageData)) {
            console.error("applyConvolutionFilter: Invalid inputPixelData object provided.");
            return inputPixelData;
        }
        if (!Array.isArray(kernelMatrix) || kernelMatrix.length === 0 || kernelMatrix.some(isNaN)) {
            console.error("applyConvolutionFilter: Invalid or empty kernelMatrix provided.");
            return inputPixelData;
        }

        const kernelSideLength = Math.round(Math.sqrt(kernelMatrix.length));
        if (kernelSideLength * kernelSideLength !== kernelMatrix.length) {
            console.error("applyConvolutionFilter: Kernel matrix must be a perfect square (e.g., 9 elements for 3x3).");
            return inputPixelData;
        }

        const kernelHalfSide = Math.floor(kernelSideLength / 2); // Integer division

        const sourcePixelsArray = inputPixelData.data;
        const sourceWidth = inputPixelData.width;
        const sourceHeight = inputPixelData.height;

        const outputWidth = sourceWidth;
        const outputHeight = sourceHeight;
        const resultImageData = this.createEmptyImageData(outputWidth, outputHeight);
        const destinationPixelsArray = resultImageData.data;

        // Factor to determine alpha channel handling: 1 for opaque (fixed 255), 0 for preserving source alpha.
        const alphaModificationFactor = preserveAlpha ? 0 : 1;

        // Helper function to get clamped pixel coordinates
        const getClampedCoordinate = (coord, max) => Math.min(max - 1, Math.max(0, coord));

        for (let currentY = 0; currentY < outputHeight; currentY++) {
            for (let currentX = 0; currentX < outputWidth; currentX++) {
                const destinationOffset = (currentY * outputWidth + currentX) * 4;
                let redSum = 0, greenSum = 0, blueSum = 0, alphaSum = 0;

                // Iterate over the convolution kernel
                for (let kernelY = 0; kernelY < kernelSideLength; kernelY++) {
                    for (let kernelX = 0; kernelX < kernelSideLength; kernelX++) {
                        // Calculate source coordinates, clamping to image boundaries
                        const sampleY = getClampedCoordinate(currentY + kernelY - kernelHalfSide, sourceHeight);
                        const sampleX = getClampedCoordinate(currentX + kernelX - kernelHalfSide, sourceWidth);

                        const sourceOffset = (sampleY * sourceWidth + sampleX) * 4;
                        const weightValue = kernelMatrix[kernelY * kernelSideLength + kernelX];

                        redSum += sourcePixelsArray[sourceOffset] * weightValue;
                        greenSum += sourcePixelsArray[sourceOffset + 1] * weightValue;
                        blueSum += sourcePixelsArray[sourceOffset + 2] * weightValue;
                        alphaSum += sourcePixelsArray[sourceOffset + 3] * weightValue;
                    }
                }

                // Apply sums to destination pixels, clamping to 0-255
                destinationPixelsArray[destinationOffset] = Math.max(0, Math.min(255, redSum));
                destinationPixelsArray[destinationOffset + 1] = Math.max(0, Math.min(255, greenSum));
                destinationPixelsArray[destinationOffset + 2] = Math.max(0, Math.min(255, blueSum));

                // Alpha channel handling:
                // If preserveAlpha is true, use original alpha.
                // Otherwise, calculate with kernel and add a "fill" factor to ensure opacity if kernel result is low.
                destinationPixelsArray[destinationOffset + 3] = preserveAlpha
                    ? sourcePixelsArray[destinationOffset + 3]
                    : Math.max(0, Math.min(255, alphaSum + alphaModificationFactor * (255 - alphaSum)));
            }
        }
        return resultImageData;
    }
};