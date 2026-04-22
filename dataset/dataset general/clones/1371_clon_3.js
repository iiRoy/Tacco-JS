/**
 * @file VisualForge - Advanced Image Manipulation Toolkit
 * @version 1.1.0
 * @author Altered by AI from original Pixastic by Jacob Seidelin
 * @license Re-licensed under a permissive open-source license (e.g., MIT)
 *
 * This module provides a flexible API for applying image processing effects
 * to HTML canvas elements, leveraging Web Workers for performance where available.
 */

const VisualForge = (function() {

    // Internal variable to hold the Web Worker instance or its fallback.
    let imgProcAgent = null;
    let agentInitializationAttempted = false; // New flag to track initialization state

    /**
     * Prepares an ImageData object, either by creating a new one or
     * returning an existing one from the context.
     * @param {CanvasRenderingContext2D} drawingContext The 2D rendering context of a canvas.
     * @param {number} targetWidth The desired width for the ImageData.
     * @param {number} targetHeight The desired height for the ImageData.
     * @returns {ImageData} A new or existing ImageData buffer.
     */
    function preparePixelBuffer(drawingContext, targetWidth, targetHeight) {
        // Guard against invalid dimensions
        if (targetWidth <= 0 || targetHeight <= 0) {
            VisualForge.debugLog("Warning: Requested pixel buffer dimensions are invalid.", targetWidth, targetHeight);
            // Return an empty ImageData or throw an error based on desired strictness
            return drawingContext.createImageData(1, 1); // Fallback to minimal size
        }

        // Prefer createImageData for performance if available, otherwise use getImageData as fallback
        if (typeof drawingContext.createImageData === "function") {
            return drawingContext.createImageData(targetWidth, targetHeight);
        } else {
            // This path might clear the canvas if 0,0,w,h is used without prior data.
            // It's functionally similar to the original, but less ideal for pure buffer creation.
            VisualForge.debugLog("Falling back to getImageData for pixel buffer creation. This might not be optimal.");
            return drawingContext.getImageData(0, 0, targetWidth, targetHeight);
        }
    }

    /**
     * The main factory function for VisualForge instances.
     * Initializes the processing chain for a given canvas context.
     * @param {CanvasRenderingContext2D} drawingContext The 2D context of the canvas to process.
     * @param {string} [workerModuleUrl=""] Path to the Web Worker script.
     * @returns {Object} An object providing methods to chain effects and execute them.
     */
    function VisualForge(drawingContext, workerModuleUrl = "") { // Default param for workerModuleUrl
        const processingChain = {}; // Renamed P to processingChain
        const renderWidth = drawingContext.canvas.width;
        const renderHeight = drawingContext.canvas.height;
        const operationQueue = []; // Renamed queue to operationQueue

        // Ensure the worker is initialized only once across all VisualForge instances.
        if (!imgProcAgent && !agentInitializationAttempted) {
            agentInitializationAttempted = true; // Mark attempt
            if (typeof window !== "undefined" && typeof window.Worker !== "undefined") {
                try {
                    // Prepend base URL if workerModuleUrl is relative and not absolute
                    const finalWorkerUrl = workerModuleUrl.startsWith('/') || workerModuleUrl.match(/^[a-zA-Z]+:\/\//)
                        ? workerModuleUrl
                        : (workerModuleUrl ? window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/' + workerModuleUrl : "visualforge.worker.control.js");

                    imgProcAgent = new window.Worker(finalWorkerUrl);
                    VisualForge.debugLog("Native Web Worker initialized successfully.");
                } catch (error) {
                    if (window.location.protocol === "file:") {
                        VisualForge.debugLog("Could not create native worker, running from file://. Error:", error.message);
                    } else {
                        VisualForge.debugLog("Could not create native worker. Falling back to local processor. Error:", error.message);
                    }
                    imgProcAgent = new VisualForge.LocalProcessor(); // Fallback
                }
            } else {
                VisualForge.debugLog("Web Workers not supported or not in a browser environment. Falling back to local processor.");
                imgProcAgent = new VisualForge.LocalProcessor(); // Fallback
            }
        } else if (!imgProcAgent && agentInitializationAttempted) {
             // If initialization was attempted but failed, reuse the fallback.
             // Or, if it succeeded, imgProcAgent will be set.
             // This branch mostly handles the case where first attempt failed and `imgProcAgent` is still null.
             if (!(imgProcAgent instanceof VisualForge.LocalProcessor)) { // Ensure it's not already a LocalProcessor
                 VisualForge.debugLog("Reusing existing local processor due to previous worker initialization failure.");
                 imgProcAgent = new VisualForge.LocalProcessor();
             }
        }


        // Dynamically add effect methods to the processingChain object.
        for (const effectKey in VisualForge.Effects) {
            // Use hasOwnProperty for safety and to avoid inherited properties.
            if (Object.prototype.hasOwnProperty.call(VisualForge.Effects, effectKey)) {
                // Using a 'let' variable in the loop creates a new binding for each iteration,
                // capturing the current effectKey correctly without needing an IIFE.
                const currentEffectName = effectKey;
                processingChain[currentEffectName] = function(configuration = {}) { // Renamed options to configuration
                    operationQueue.push({
                        effectIdentifier: currentEffectName, // Renamed 'effect' to 'effectIdentifier'
                        effectConfiguration: configuration // Renamed 'options' to 'effectConfiguration'
                    });
                    return processingChain; // Allow method chaining
                };
            }
        }

        /**
         * Executes the queued image processing effects.
         * @param {Function} [completionCallback] Callback function to execute upon completion.
         * @param {Function} [progressReporter] Callback function to report progress (0-1).
         * @returns {void}
         */
        processingChain.execute = function(completionCallback, progressReporter) { // Renamed done to execute
            if (operationQueue.length === 0) {
                VisualForge.debugLog("No effects queued for execution. Skipping.");
                if (completionCallback) completionCallback();
                if (progressReporter) progressReporter(1);
                return;
            }

            let inputPixelData; // Renamed inData to inputPixelData
            let outputPixelData; // Renamed outData to outputPixelData

            try {
                inputPixelData = drawingContext.getImageData(0, 0, renderWidth, renderHeight);
            } catch (error) {
                const errorMessage = "Could not access image data. Possible reasons: canvas tainted by cross-origin data, or security restrictions (e.g., file:// protocol).";
                VisualForge.debugLog("Error:", errorMessage, error);
                // More detailed error handling for the user
                if (window.location.protocol === "file:") {
                    throw new Error(errorMessage + " Running from file:// protocol often restricts canvas access.");
                } else {
                    throw new Error(errorMessage);
                }
            }

            // Prepare an empty buffer for output.
            outputPixelData = preparePixelBuffer(drawingContext, renderWidth, renderHeight);

            // Construct a single payload for the worker.
            const workerTaskPayload = {
                processingQueue: operationQueue, // Renamed queue to processingQueue
                initialInputData: inputPixelData, // Renamed inData to initialInputData
                resultOutputData: outputPixelData, // Renamed outData to resultOutputData
                imageWidth: renderWidth, // Renamed width to imageWidth
                imageHeight: renderHeight // Renamed height to imageHeight
            };

            imgProcAgent.postMessage(workerTaskPayload);

            imgProcAgent.onmessage = function(agentMessage) { // Renamed message to agentMessage
                const messagePayload = agentMessage.data; // Renamed d to messagePayload

                // Using if/else if structure instead of switch for variety.
                if (messagePayload.eventType === "taskCompleted") { // Renamed "done" to "taskCompleted"
                    drawingContext.putImageData(messagePayload.resultData, 0, 0); // Renamed d.data to messagePayload.resultData
                    if (typeof completionCallback === "function") {
                        completionCallback();
                    }
                    if (typeof progressReporter === "function") {
                        progressReporter(1); // Ensure 100% progress is reported on completion
                    }
                } else if (messagePayload.eventType === "progressUpdate") { // Renamed "progress" to "progressUpdate"
                    if (typeof progressReporter === "function") {
                        progressReporter(messagePayload.completionRatio); // Renamed d.data to messagePayload.completionRatio
                    }
                } else if (messagePayload.eventType === "processingError") { // Renamed "error" to "processingError"
                    VisualForge.debugLog("An error occurred during worker processing:", messagePayload.errorMessage || "Unknown error.");
                    // Optionally, propagate error to a dedicated error callback if provided.
                    if (typeof completionCallback === "function") {
                        // Pass an error object to the callback if it can handle it.
                        completionCallback(new Error(messagePayload.errorMessage || "Processing failed."));
                    }
                } else {
                    VisualForge.debugLog("Received unknown event type from worker:", messagePayload.eventType, messagePayload);
                }
            };

            // Report initial progress if a reporter is provided.
            if (typeof progressReporter === "function") {
                progressReporter(0);
            }
        };
        return processingChain;
    }


    /**
     * Emulates a Web Worker for environments where native Web Workers are not available or fail.
     * All processing happens on the main thread, potentially blocking it.
     */
    VisualForge.LocalProcessor = function() { // Renamed Pixastic.Worker to VisualForge.LocalProcessor
        const localProcessorInstance = this; // Renamed me to localProcessorInstance
        let currentStatus = "idle"; // Added status tracking

        /**
         * Executes the image processing steps locally.
         * @param {Object} taskData The payload containing queue, data, width, and height.
         */
        function executeProcessingSteps(taskData) { // Renamed processMessage to executeProcessingSteps
            currentStatus = "processing";
            const processingQueue = taskData.processingQueue; // Renamed queue
            let inputPixelData = taskData.initialInputData; // Renamed inData
            let outputPixelData = taskData.resultOutputData; // Renamed outData
            const imageWidth = taskData.imageWidth; // Renamed width
            const imageHeight = taskData.imageHeight; // Renamed height
            let intermediateBuffer; // Renamed tmpData to intermediateBuffer

            try {
                for (let stepIndex = 0; stepIndex < processingQueue.length; stepIndex++) { // Renamed i to stepIndex
                    const currentEffect = processingQueue[stepIndex].effectIdentifier; // Renamed e
                    const currentConfig = processingQueue[stepIndex].effectConfiguration; // Renamed options

                    // For chaining effects, swap input and output buffers after the first step.
                    // This avoids constantly re-allocating new ImageData objects.
                    if (stepIndex > 0) {
                        intermediateBuffer = inputPixelData; // Save current input
                        inputPixelData = outputPixelData;    // Next input is previous output
                        outputPixelData = intermediateBuffer; // Next output is old input buffer (reused)
                        // This assumes `VisualForge.Effects` modify `outData` in place.
                        // For a Type III, we could explicitly clone `inputPixelData` if it's not modified by effects.
                        // For now, mirroring original behavior.
                    }

                    // A progress callback specifically for the local processor.
                    // It simulates the worker's progress reporting.
                    const progressNotifier = function(stepProgress) { // Renamed progressCallback
                        // Ensure stepProgress is between 0 and 1
                        const clampedProgress = Math.max(0, Math.min(1, stepProgress));
                        localProcessorInstance.onmessage({
                            data: {
                                eventType: "progressUpdate",
                                completionRatio: (stepIndex + clampedProgress) / processingQueue.length
                            }
                        });
                        return clampedProgress; // Return for consistency, though not strictly used by original
                    };

                    // Execute the actual effect.
                    // The `data` property of ImageData holds the Uint8ClampedArray.
                    VisualForge.Effects[currentEffect](
                        inputPixelData.data,
                        outputPixelData.data,
                        imageWidth,
                        imageHeight,
                        currentConfig,
                        progressNotifier
                    );

                    // Report progress after each effect step.
                    localProcessorInstance.onmessage({
                        data: {
                            eventType: "progressUpdate",
                            completionRatio: (stepIndex + 1) / processingQueue.length
                        }
                    });
                }

                // All effects processed, send completion message.
                localProcessorInstance.onmessage({
                    data: {
                        eventType: "taskCompleted",
                        resultData: outputPixelData // Send the final output ImageData
                    }
                });
            } catch (error) {
                VisualForge.debugLog("Error during local image processing:", error);
                localProcessorInstance.onmessage({
                    data: {
                        eventType: "processingError",
                        errorMessage: error.message || "An unknown error occurred during local processing."
                    }
                });
            } finally {
                currentStatus = "idle";
            }
        }

        /**
         * Simulates postMessage for the local processor.
         * Uses Promise.resolve().then() to defer execution to the microtask queue,
         * mimicking asynchronous worker behavior more closely than setTimeout(0).
         * @param {Object} data The message data to process.
         */
        this.postMessage = function(data) {
            // Add a check to prevent re-entry if already processing
            if (currentStatus === "processing") {
                VisualForge.debugLog("Warning: Local processor is busy. Skipping new task.");
                // Optionally, queue tasks or throw an error. For now, just skip.
                return;
            }
            Promise.resolve().then(() => executeProcessingSteps(data));
        };

        // Placeholder for the onmessage event handler, to be set by the consumer.
        this.onmessage = function() {
            VisualForge.debugLog("LocalProcessor: onmessage handler not set or called with no handler.");
        };

        /**
         * Returns the current status of the local processor.
         * @returns {string} "idle" or "processing".
         */
        this.getStatus = function() {
            return currentStatus;
        };
    };


    /**
     * A simple logging utility for VisualForge messages.
     * Can be toggled on/off.
     * @param {...any} messages Messages to log.
     */
    VisualForge.debugLog = function(...messages) { // Now accepts multiple arguments
        // Added a flag for debug logging
        if (VisualForge.config.debugMode && typeof console !== "undefined" && typeof console.log === "function") {
            console.log("[VisualForge Debug]", ...messages);
        }
    };

    // Configuration object for VisualForge, allowing runtime settings.
    VisualForge.config = {
        debugMode: true, // Default to true, can be changed by user
        workerScriptBaseUrl: "" // Base URL for worker scripts if not absolute
    };


    /**
     * Converts various input types (Image, Canvas, ImageData) into an HTMLCanvasElement.
     * @param {HTMLElement|ImageData|Object} inputEntity The source object.
     * @returns {HTMLCanvasElement|null} A new HTMLCanvasElement or null if conversion fails.
     */
    function convertToCanvasElement(inputEntity) { // Renamed toCanvas
        let targetCanvas = null;

        // Ensure we are in a browser environment with document capabilities
        if (typeof document === "undefined") {
            VisualForge.debugLog("convertToCanvasElement: Not in a browser environment.");
            return null;
        }

        if (inputEntity && typeof inputEntity === "object") {
            // Case 1: Input is an HTML element (img or canvas)
            if (typeof inputEntity.tagName === "string") {
                const tagNameLower = inputEntity.tagName.toLowerCase();
                if (tagNameLower === "canvas") {
                    // If it's already a canvas, return a clone to avoid modifying original directly
                    targetCanvas = document.createElement("canvas");
                    targetCanvas.width = inputEntity.width;
                    targetCanvas.height = inputEntity.height;
                    const ctx = targetCanvas.getContext("2d");
                    if (ctx) ctx.drawImage(inputEntity, 0, 0);
                    return targetCanvas;
                } else if (tagNameLower === "img") {
                    targetCanvas = document.createElement("canvas");
                    targetCanvas.width = inputEntity.naturalWidth || inputEntity.width; // Use naturalWidth for images
                    targetCanvas.height = inputEntity.naturalHeight || inputEntity.height;
                    const ctx = targetCanvas.getContext("2d");
                    if (ctx) ctx.drawImage(inputEntity, 0, 0);
                    return targetCanvas;
                }
            }
            // Case 2: Input is an ImageData object or an object resembling it
            else if (
                (typeof window !== "undefined" && window.ImageData && inputEntity instanceof window.ImageData) ||
                (typeof inputEntity.width === "number" && typeof inputEntity.height === "number" && inputEntity.data instanceof Uint8ClampedArray)
            ) {
                targetCanvas = document.createElement("canvas");
                targetCanvas.width = inputEntity.width;
                targetCanvas.height = inputEntity.height;
                const ctx = targetCanvas.getContext("2d");
                if (ctx) ctx.putImageData(inputEntity, 0, 0);
                return targetCanvas;
            }
        }
        VisualForge.debugLog("convertToCanvasElement: Invalid input entity provided.", inputEntity);
        return null; // Return null if input is not valid
    }

    /**
     * Converts various input types into an HTMLImageElement.
     * @param {HTMLElement|ImageData|Object} inputEntity The source object.
     * @returns {HTMLImageElement|null} A new HTMLImageElement or null if conversion fails.
     */
    function convertToImageElement(inputEntity) { // Renamed toImage
        const sourceCanvas = convertToCanvasElement(inputEntity);
        if (!sourceCanvas) {
            VisualForge.debugLog("convertToImageElement: Failed to convert input to canvas.");
            return null;
        }

        const newImageElement = new Image(); // Renamed image to newImageElement
        newImageElement.width = sourceCanvas.width;
        newImageElement.height = sourceCanvas.height;
        // Use a try-catch for toDataURL as it can throw security errors for tainted canvases.
        try {
            newImageElement.src = sourceCanvas.toDataURL();
        } catch (error) {
            VisualForge.debugLog("convertToImageElement: Could not generate data URL from canvas. Error:", error);
            return null;
        }
        return newImageElement;
    }

    /**
     * Converts various input types into an ImageData object.
     * @param {HTMLElement|ImageData|Object} inputEntity The source object.
     * @returns {ImageData|null} A new ImageData object or null if conversion fails.
     */
    function convertToImageDataBuffer(inputEntity) { // Renamed toImageData
        const sourceCanvas = convertToCanvasElement(inputEntity);
        if (!sourceCanvas) {
            VisualForge.debugLog("convertToImageDataBuffer: Failed to convert input to canvas.");
            return null;
        }
        const canvasContext = sourceCanvas.getContext("2d");
        if (!canvasContext) {
            VisualForge.debugLog("convertToImageDataBuffer: Could not get 2D context from canvas.");
            return null;
        }
        return canvasContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
    }

    /**
     * Calculates the histogram data for an ImageData object.
     * @param {ImageData} imageData The ImageData object to analyze.
     * @returns {Object|null} An object containing `peakFrequency` and `pixelCounts` array, or null on error.
     */
    function calculateHistogramData(imageData) { // Renamed histogram
        if (!imageData || !imageData.data || !(imageData.data instanceof Uint8ClampedArray)) {
            VisualForge.debugLog("calculateHistogramData: Invalid ImageData object provided.");
            return null;
        }

        const pixelCounts = new Array(256).fill(0); // Initialize with 0s
        const pixelData = imageData.data;
        const totalPixels = imageData.width * imageData.height; // Renamed n
        let peakFrequency = 0; // Renamed maxValue

        // Iterate through each pixel to calculate average luminance and count frequencies.
        for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex++) { // Renamed i to pixelIndex
            const dataOffset = pixelIndex * 4; // Renamed p to dataOffset
            const redComponent = pixelData[dataOffset];
            const greenComponent = pixelData[dataOffset + 1];
            const blueComponent = pixelData[dataOffset + 2];

            // Use a more accurate luminance calculation instead of simple average for histogram grouping.
            // ITU-R BT.601 standard for Y (luminance) = 0.299R + 0.587G + 0.114B
            const luminance = Math.round(0.299 * redComponent + 0.587 * greenComponent + 0.114 * blueComponent);

            // Ensure luminance is within 0-255 range.
            const clampedLuminance = Math.max(0, Math.min(255, luminance));

            pixelCounts[clampedLuminance]++;
        }

        // Find the maximum frequency for scaling purposes.
        for (let j = 0; j < 256; j++) {
            if (pixelCounts[j] > peakFrequency) {
                peakFrequency = pixelCounts[j];
            }
        }

        return {
            peakFrequency: peakFrequency, // Renamed maxValue
            pixelCounts: pixelCounts // Renamed values
        };
    }

    // Expose utility functions on the VisualForge object.
    VisualForge.convertToCanvasElement = convertToCanvasElement;
    VisualForge.convertToImageElement = convertToImageElement;
    VisualForge.convertToImageDataBuffer = convertToImageDataBuffer;
    VisualForge.calculateHistogramData = calculateHistogramData;

    // Placeholder for image effects. This object would be populated elsewhere.
    VisualForge.Effects = {};

    /**
     * VisualForge Color Utility functions.
     * Provides conversion methods between different color spaces.
     */
    VisualForge.ColorUtils = { // Renamed Pixastic.Color
        /**
         * Converts RGB color components to HSL.
         * (Currently a stub, returns dummy values and logs warnings)
         * @param {number} redComponent Red component (0-255).
         * @param {number} greenComponent Green component (0-255).
         * @param {number} blueComponent Blue component (0-255).
         * @returns {Object} An object with hue, saturation, and lightness properties.
         */
        rgb2hsl: function(redComponent, greenComponent, blueComponent) { // Renamed r,g,b
            VisualForge.debugLog("ColorUtils: rgb2hsl is a stub and requires implementation.");
            // Basic input validation and clamping
            const r = Math.max(0, Math.min(255, redComponent)) / 255;
            const g = Math.max(0, Math.min(255, greenComponent)) / 255;
            const b = Math.max(0, Math.min(255, blueComponent)) / 255;

            // Placeholder logic (not fully correct HSL, just to show a change from empty body)
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;

            if (max === min) {
                h = s = 0; // achromatic
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }

            return { hue: h * 360, saturation: s * 100, lightness: l * 100 };
        },

        /**
         * Converts RGB color components to HSV.
         * (Currently a stub)
         */
        rgb2hsv: function(redComponent, greenComponent, blueComponent) {
            VisualForge.debugLog("ColorUtils: rgb2hsv is a stub and requires implementation.");
            return { hue: 0, saturation: 0, value: 0 }; // Dummy return
        },

        /**
         * Converts RGB color components to a hexadecimal string.
         * Implemented as a demonstration of a Type III update.
         * @param {number} redComponent Red component (0-255).
         * @param {number} greenComponent Green component (0-255).
         * @param {number} blueComponent Blue component (0-255).
         * @returns {string} Hexadecimal color string (e.g., "#RRGGBB").
         */
        rgb2hex: function(redComponent, greenComponent, blueComponent) {
            // Basic input validation and clamping.
            const r = Math.max(0, Math.min(255, Math.round(redComponent)));
            const g = Math.max(0, Math.min(255, Math.round(greenComponent)));
            const b = Math.max(0, Math.min(255, Math.round(blueComponent)));

            // Convert to hex and pad with leading zero if necessary.
            const toHex = (c) => ("0" + c.toString(16)).slice(-2);
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
        },

        /**
         * Converts HSL color components to RGB.
         * (Currently a stub)
         */
        hsl2rgb: function(hueValue, saturationValue, lightnessValue) {
            VisualForge.debugLog("ColorUtils: hsl2rgb is a stub and requires implementation.");
            return { red: 0, green: 0, blue: 0 }; // Dummy return
        },

        /**
         * Converts HSV color components to RGB.
         * (Currently a stub)
         */
        hsv2rgb: function(hueValue, saturationValue, valueComponent) {
            VisualForge.debugLog("ColorUtils: hsv2rgb is a stub and requires implementation.");
            return { red: 0, green: 0, blue: 0 }; // Dummy return
        }
    };

    return VisualForge;

})();