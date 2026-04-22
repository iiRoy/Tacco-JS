const PixelArtisan = (function() {

    // Internal catalog for image processing operations
    const operationCatalog = {};

    /**
     * Utility to generate a new ImageData buffer.
     * @param {CanvasRenderingContext2D} renderingContext - The 2D rendering context.
     * @param {number} bufferWidth - Desired width for the buffer.
     * @param {number} bufferHeight - Desired height for the buffer.
     * @returns {ImageData} A new ImageData object.
     */
    function obtainPixelBuffer(renderingContext, bufferWidth, bufferHeight) {
        if (renderingContext.createImageData) {
            return renderingContext.createImageData(bufferWidth, bufferHeight);
        } else {
            // Fallback for environments without createImageData on context, using the global ImageData constructor.
            return new ImageData(bufferWidth, bufferHeight);
        }
    }

    /**
     * Core class for orchestrating image transformations.
     * @class VisualModifier
     */
    class VisualModifier {
        /**
         * @param {CanvasRenderingContext2D} renderingContext - The 2D rendering context of a canvas element.
         */
        constructor(renderingContext) {
            this.renderingContext = renderingContext;
            this.imageWidth = renderingContext.canvas.width;
            this.imageHeight = renderingContext.canvas.height;
            this.transformationList = [];
            this.progressCallbackHandle = null; // Stores the progress reporting function
        }

        /**
         * Appends an image processing step to the transformation chain.
         * @param {string} transformationName - Identifier for the transformation.
         * @param {object} [transformationConfig={}] - Configuration parameters for the transformation.
         * @returns {VisualModifier} The current instance for method chaining.
         */
        appendTransformation(transformationName, transformationConfig = {}) {
            this.transformationList.push({
                kind: transformationName,
                settings: transformationConfig
            });
            return this;
        }

        /**
         * Executes all queued image transformations asynchronously.
         * @param {Function} [completionAction] - Function to call upon successful completion.
         * @param {Function} [progressReporter] - Function to call with progress updates (value from 0 to 1).
         * @returns {Promise<void>} A Promise that resolves when processing is done or rejects on error.
         */
        applyAllTransformations(completionAction, progressReporter) {
            this.progressCallbackHandle = progressReporter;

            return new Promise((resolve, reject) => {
                let initialPixelData, currentSourcePixels, currentTargetPixels;

                try {
                    initialPixelData = this.renderingContext.getImageData(0, 0, this.imageWidth, this.imageHeight);
                } catch (error) {
                    const errorDetail = "Failed to retrieve pixel data. Is the canvas cross-origin tainted?";
                    PixelArtisan.dispatchMessage(errorDetail);
                    return reject(new Error(errorDetail));
                }

                currentSourcePixels = initialPixelData;
                currentTargetPixels = obtainPixelBuffer(this.renderingContext, this.imageWidth, this.imageHeight);

                const totalSteps = this.transformationList.length;
                let stepIndex = 0;

                const performNextStep = () => {
                    if (stepIndex < totalSteps) {
                        const currentTransformation = this.transformationList[stepIndex];
                        const processingFunction = operationCatalog[currentTransformation.kind];

                        if (!processingFunction) {
                            const errorDetail = `Unknown transformation operation: '${currentTransformation.kind}'`;
                            PixelArtisan.dispatchMessage(errorDetail);
                            return reject(new Error(errorDetail));
                        }

                        // Swap buffers for chained operations:
                        // The output of the previous step becomes the input for the current step.
                        // The previous input buffer becomes the new output buffer.
                        if (stepIndex > 0) {
                            const tempBuffer = currentSourcePixels;
                            currentSourcePixels = currentTargetPixels;
                            currentTargetPixels = tempBuffer;
                        }

                        // Execute the transformation function
                        processingFunction(
                            currentSourcePixels.data,
                            currentTargetPixels.data,
                            this.imageWidth,
                            this.imageHeight,
                            currentTransformation.settings,
                            (internalStepProgress) => { // Progress for a single transformation function
                                if (this.progressCallbackHandle) {
                                    this.progressCallbackHandle((stepIndex + internalStepProgress) / totalSteps);
                                }
                            }
                        );

                        stepIndex++;
                        if (this.progressCallbackHandle) {
                            this.progressCallbackHandle(stepIndex / totalSteps);
                        }
                        // Simulate asynchronous execution for each step to prevent UI blocking
                        setTimeout(performNextStep, 0);
                    } else {
                        // All transformations completed, render the final result to the canvas
                        this.renderingContext.putImageData(currentTargetPixels, 0, 0);
                        if (completionAction) {
                            completionAction();
                        }
                        if (this.progressCallbackHandle) {
                            this.progressCallbackHandle(1); // Ensure 100% progress is reported
                        }
                        resolve();
                    }
                };

                if (this.progressCallbackHandle) {
                    this.progressCallbackHandle(0); // Report initial progress (0%)
                }
                // Start the asynchronous transformation sequence
                setTimeout(performNextStep, 0);
            });
        }
    }

    // Public API object, serving as a factory for VisualModifier instances
    const publicAPI = function(renderingContext, processingUnitPath) { // processingUnitPath is ignored in this implementation
        return new VisualModifier(renderingContext);
    };

    /**
     * Outputs a message to the console for debugging or informational purposes.
     * @param {string} messageText - The text message to display.
     */
    publicAPI.dispatchMessage = function(messageText) {
        if (typeof console !== "undefined" && console.log) {
            console.log("PixelArtisan: " + messageText);
        }
    };

    /**
     * Converts various image sources (Image, Canvas, ImageData) into an HTMLCanvasElement.
     * @param {*} sourceObject - The input source.
     * @returns {HTMLCanvasElement|null} A canvas element containing the source content, or null.
     */
    publicAPI.renderToSurface = function(sourceObject) {
        let outputCanvas = null;
        if (typeof sourceObject === "object") {
            if (typeof sourceObject.tagName === "string") {
                const tagIdentifier = sourceObject.tagName.toLowerCase();
                if (tagIdentifier === "canvas" || tagIdentifier === "img") {
                    outputCanvas = document.createElement("canvas");
                    outputCanvas.width = sourceObject.width;
                    outputCanvas.height = sourceObject.height;
                    outputCanvas.getContext("2d").drawImage(sourceObject, 0, 0);
                }
            } else if ((window.ImageData && sourceObject instanceof window.ImageData) ||
                       (typeof sourceObject.width === "number" && typeof sourceObject.height === "number" && typeof sourceObject.data === "object")) {
                outputCanvas = document.createElement("canvas");
                outputCanvas.width = sourceObject.width;
                outputCanvas.height = sourceObject.height;
                outputCanvas.getContext("2d").putImageData(sourceObject, 0, 0);
            }
        }
        return outputCanvas;
    };

    /**
     * Converts various image sources into an HTMLImageElement.
     * @param {*} sourceObject - The input source.
     * @returns {HTMLImageElement} An Image element.
     */
    publicAPI.convertImage = function(sourceObject) {
        const tempCanvas = publicAPI.renderToSurface(sourceObject);
        const newImageElement = new Image();
        newImageElement.width = tempCanvas.width;
        newImageElement.height = tempCanvas.height;
        newImageElement.src = tempCanvas.toDataURL();
        return newImageElement;
    };

    /**
     * Converts various image sources into an ImageData object.
     * @param {*} sourceObject - The input source.
     * @returns {ImageData} An ImageData object.
     */
    publicAPI.extractPixelData = function(sourceObject) {
        const tempCanvas = publicAPI.renderToSurface(sourceObject);
        const context = tempCanvas.getContext("2d");
        return context.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    };

    /**
     * Computes the grayscale histogram for an ImageData object.
     * @param {ImageData} pixelDataSource - The ImageData object to analyze.
     * @returns {{peakValue: number, distributionArray: number[]}} Object containing the highest frequency count and the histogram array.
     */
    publicAPI.analyzePixelDistribution = function(pixelDataSource) {
        const frequencyBuckets = new Array(256).fill(0);
        const pixelArray = pixelDataSource.data;
        const totalPixelCount = pixelDataSource.width * pixelDataSource.height;
        const roundToNearest = Math.round;

        for (let i = 0; i < totalPixelCount; i++) {
            const dataOffset = i * 4;
            const averageLuminance = roundToNearest((pixelArray[dataOffset] + pixelArray[dataOffset + 1] + pixelArray[dataOffset + 2]) / 3);
            frequencyBuckets[averageLuminance]++;
        }

        let peakValue = 0;
        for (let i = 0; i < 256; i++) {
            if (frequencyBuckets[i] > peakValue) {
                peakValue = frequencyBuckets[i];
            }
        }

        return {
            peakValue: peakValue,
            distributionArray: frequencyBuckets
        };
    };

    /**
     * Provides a collection of color manipulation utilities (stubs).
     */
    publicAPI.ColorUtility = {
        rgbToHsl: function(red, green, blue) {
            // Stub: Input validation and actual conversion logic would be here.
            if (red < 0) red = 0;
            if (green < 0) green = 0;
            if (blue < 0) blue = 0;
            if (red > 255) red = 255;
            if (green > 255) green = 255;
            if (blue > 255) blue = 255;
            // Return actual HSL values
        },
        rgbToHsv: function(red, green, blue) {},
        rgbToHex: function(red, green, blue) {},
        hslToRgb: function(hue, saturation, lightness) {},
        hsvToRgb: function(hue, saturation, value) {}
    };

    /**
     * Registers a custom image processing operation to be available in the pipeline.
     * @param {string} operationIdentifier - A unique name for the operation.
     * @param {Function} processorLogic - The function implementing the operation.
     *   Signature: (sourcePixelArray, destinationPixelArray, imageWidth, imageHeight, settings, progressNotifier)
     */
    publicAPI.registerOperation = function(operationIdentifier, processorLogic) {
        operationCatalog[operationIdentifier] = processorLogic;
    };

    return publicAPI;

})();

// Example of how an external image processing operation would be registered.
// This mimics the role of Pixastic.Effects being populated.
PixelArtisan.registerOperation('invertColor', function(inputPixels, outputPixels, canvasWidth, canvasHeight, currentSettings, currentOperationProgress) {
    for (let pixelIdx = 0; pixelIdx < inputPixels.length; pixelIdx += 4) {
        outputPixels[pixelIdx] = 255 - inputPixels[pixelIdx];       // Red channel
        outputPixels[pixelIdx + 1] = 255 - inputPixels[pixelIdx + 1]; // Green channel
        outputPixels[pixelIdx + 2] = 255 - inputPixels[pixelIdx + 2]; // Blue channel
        outputPixels[pixelIdx + 3] = inputPixels[pixelIdx + 3];     // Alpha channel (unchanged)
    }
    if (currentOperationProgress) currentOperationProgress(1); // Report 100% completion for this specific operation
});