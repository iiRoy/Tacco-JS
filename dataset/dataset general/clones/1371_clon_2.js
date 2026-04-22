/*
 * VisualCraft - Image Processing Utility
 * http://visualcraft.dev/ (hypothetical new domain)
 * Copyright 2023, Acme Imaging Solutions
 *
 * Licensed under the Apache License 2.0 or MIT License.
 * http://visualcraft.dev/license-apache.txt (hypothetical new license links)
 * http://visualcraft.dev/license-mit.txt
 *
 */

var VisualCraft = (function() {

    // Internal reference to the background task handler
    var jobHandler;

    /**
     * Produces a new ImageData object.
     * @param {CanvasRenderingContext2D} drawingSurface The 2D rendering context.
     * @param {number} xDimension The desired width.
     * @param {number} yDimension The desired height.
     * @returns {ImageData} A new ImageData instance.
     */
    function producePixelData(drawingSurface, xDimension, yDimension) {
        // Check if the context supports direct ImageData creation
        if (drawingSurface.createImageData) {
            return drawingSurface.createImageData(xDimension, yDimension);
        } else {
            // Fallback: get existing image data then clear it (less efficient but compatible)
            return drawingSurface.getImageData(0, 0, xDimension, yDimension);
        }
    }


    /**
     * Main VisualCraft constructor. Initializes the processing chain.
     * @param {CanvasRenderingContext2D} drawingSurface The canvas context to operate on.
     * @param {string} handlerScriptURL Path to the background worker script.
     * @returns {object} An object with methods to chain image operations.
     */
    function VisualCraft(drawingSurface, handlerScriptURL) {

        // Object to hold chained operations
        var toolSet = {};
        // Store canvas dimensions
        var xDimension = drawingSurface.canvas.width;
        var yDimension = drawingSurface.canvas.height;
        // List of operations to be performed
        var jobQueue = [];
        // Default path for the worker script
        handlerScriptURL = handlerScriptURL || "";

        // Initialize background worker if not already done
        if (!jobHandler) {
            // Check if Web Workers are supported
            if (typeof window.Worker != "undefined") {
                try {
                    // Attempt to create a native Web Worker
                    jobHandler = new window.Worker(handlerScriptURL + "visualcraft.processor.unit.js");
                } catch(err) {
                    // Handle errors during native worker creation
                    if (location.protocol == "file:") {
                        VisualCraft.recordLog("Failed to instantiate native worker, running from local file system.")
                    } else {
                        VisualCraft.recordLog("Failed to instantiate native worker.")
                    }
                }
            }
            // If native worker failed or not supported, use the fallback in-browser worker
            if (!jobHandler) {
                jobHandler = new VisualCraft.ProcessingUnit();
            }
        }

        // Dynamically add effect methods to the toolSet
        for (var operationKey in VisualCraft.Operations) {
            // Ensure property belongs to VisualCraft.Operations, not prototype chain
            if (VisualCraft.Operations.hasOwnProperty(operationKey)) {
                // Create a closure to capture the current operationKey
                (function(currentOperationKey) {
                    toolSet[currentOperationKey] = function(settings) {
                        // Add the operation and its settings to the job queue
                        jobQueue.push({
                            operation : currentOperationKey,
                            settings : settings
                        });
                        // Allow method chaining
                        return toolSet;
                    }
                })(operationKey); // Pass operationKey into the closure
            }
        }

        /**
         * Executes the queued image operations.
         * @param {Function} completionCallback Callback function executed upon completion.
         * @param {Function} onProgressUpdate Callback function for progress updates.
         */
        toolSet.finalize = function(completionCallback, onProgressUpdate) {
            var sourceData, resultData;

            try {
                // Retrieve the initial pixel data from the canvas
                sourceData = drawingSurface.getImageData(0, 0, xDimension, yDimension);
            } catch(err) {
                // Error handling for tainted canvases or local file access issues
                if (location.protocol == "file:") {
                    throw new Error("Cannot access image data, application running from file://");
                } else {
                    throw new Error("Cannot access image data, canvas might be tainted by cross-origin content.");
                }
            }

            // Create an empty ImageData object for the output
            resultData = producePixelData(drawingSurface, xDimension, yDimension);

            // Send the entire job queue and image data to the worker
            jobHandler.postMessage({
                jobList : jobQueue,
                inputPixelMap : sourceData,
                outputPixelMap : resultData,
                pixelWidth : xDimension,
                pixelHeight : yDimension
            });

            // Set up the worker's message handler
            jobHandler.onmessage = function(workerMessage) {
                var messagePayload = workerMessage.data;
                // Distribute messages based on event type
                switch (messagePayload.eventType) {
                    case "completed" :
                        // Put the processed image data back onto the canvas
                        drawingSurface.putImageData(messagePayload.data, 0, 0);
                        // Execute completion callback if provided
                        if (completionCallback) {
                            completionCallback();
                        }
                        // Report 100% progress
                        if (onProgressUpdate) {
                            onProgressUpdate(1);
                        }
                        break;
                    case "progress_update" :
                        // Report intermediate progress
                        if (onProgressUpdate) {
                            onProgressUpdate(messagePayload.data);
                        }
                        break;
                    case "processing_error" :
                        // Handle errors from the worker (placeholder for now)
                        break;
                }
            }

            // Report initial progress (0%)
            if (onProgressUpdate) {
                onProgressUpdate(0);
            }
        }; // End of toolSet.finalize

        return toolSet;
    }


    /**
     * Fallback/In-browser implementation of a Web Worker.
     * Mimics the Web Worker API for environments where it's not available.
     */
    VisualCraft.ProcessingUnit = function() {
        var selfRef = this; // Reference to this instance

        /**
         * Processes an incoming message, simulating worker behavior.
         * @param {object} incomingData The data object received from postMessage.
         */
        function handleIncomingMessage(incomingData) {
            var jobList = incomingData.jobList;
            var inputPixelMap = incomingData.inputPixelMap;
            var outputPixelMap = incomingData.outputPixelMap;
            var pixelWidth = incomingData.pixelWidth;
            var pixelHeight = incomingData.pixelHeight;
            var swapData; // Temporary storage for data swapping

            // Iterate through each job in the queue
            for (var taskIndex = 0; taskIndex < jobList.length; taskIndex++) {
                var operationKey = jobList[taskIndex].operation;
                var settings = jobList[taskIndex].settings;
                var progressNotifier; // Function to report progress

                // For subsequent operations, swap input and output buffers
                if (taskIndex > 0) {
                    swapData = inputPixelMap;
                    inputPixelMap = outputPixelMap;
                    outputPixelMap = swapData;
                }

                // If running in a true worker context (e.g., actual Web Worker),
                // define a progress notifier for reporting back to main thread.
                if (typeof importScripts == "function") {
                    progressNotifier = function(currentProgress) {
                        selfRef.onUnitMessage({
                            data : {
                                eventType : "progress_update",
                                data : (taskIndex + currentProgress) / jobList.length
                            }
                        });
                        return currentProgress; // Return progress for potential chaining or logging
                    }
                }

                // Execute the actual image processing operation
                VisualCraft.Operations[operationKey](inputPixelMap.data, outputPixelMap.data, pixelWidth, pixelHeight, settings, progressNotifier);

                // Report progress after each operation completes
                selfRef.onUnitMessage({
                    data : {
                        eventType : "progress_update",
                        data : (taskIndex + 1) / jobList.length
                    }
                });
            }

            // Signal that all processing is done
            selfRef.onUnitMessage({
                data : {
                    eventType : "completed",
                    data : outputPixelMap
                }
            });
        }

        /**
         * Simulates postMessage for the in-browser worker.
         * Uses setTimeout to mimic async behavior.
         * @param {object} outgoingData Data to be "posted" to the worker.
         */
        this.sendTaskMessage = function(outgoingData) {
            // Asynchronously process the message
            setTimeout(function() {
                handleIncomingMessage(outgoingData)
            }, 0);
        };

        // Placeholder for the message event handler
        this.onUnitMessage = function() {};

    }; // End of VisualCraft.ProcessingUnit


    /**
     * Logs messages to the console, prefixed for clarity.
     * @param {string} messageText The message string to log.
     */
    VisualCraft.recordLog = function(messageText) {
        // Check if console is available
        if (typeof console != "undefined" && console.log) {
            console.log("VisualCraft Debug: " + messageText);
        }
    };


    /**
     * Converts various image sources into a canvas element.
     * @param {object} sourceObject The input image source (canvas, image, ImageData).
     * @returns {HTMLCanvasElement|undefined} A canvas element or undefined if conversion fails.
     */
    function createCanvasFromSource(sourceObject) {
        var drawingCanvas; // Canvas element to be created

        if (typeof sourceObject == "object") {
            // If it's an HTML element with a tag name
            if (typeof sourceObject.tagName == "string") {
                var tagNameLower = sourceObject.tagName.toLowerCase();
                // If it's already a canvas or an image element
                if (tagNameLower == "canvas" || tagNameLower == "img") {
                    drawingCanvas = document.createElement("canvas");
                    drawingCanvas.width = sourceObject.width;
                    drawingCanvas.height = sourceObject.height;
                    drawingCanvas.getContext("2d").drawImage(sourceObject, 0, 0);
                }
            } else if ((window.ImageData && sourceObject instanceof window.ImageData) // If it's an ImageData object
                        || (typeof sourceObject.width == "number" && typeof sourceObject.height == "number" && typeof sourceObject.data == "object")) {
                // If it's a generic object resembling ImageData
                drawingCanvas = document.createElement("canvas");
                drawingCanvas.width = sourceObject.width;
                drawingCanvas.height = sourceObject.height;
                drawingCanvas.getContext("2d").putImageData(sourceObject, 0, 0);
            }
        }
        return drawingCanvas;
    };


    /**
     * Converts an image source (or ImageData) into an HTML Image element.
     * @param {object} sourceObject The input image source.
     * @returns {HTMLImageElement} An Image element.
     */
    function convertCanvasToImage(sourceObject) {
        var drawingCanvas = createCanvasFromSource(sourceObject);
        var resultImage = new Image();
        resultImage.width = drawingCanvas.width;
        resultImage.height = drawingCanvas.height;
        resultImage.src = drawingCanvas.toDataURL(); // Convert canvas content to data URL
        return resultImage;
    };


    /**
     * Extracts raw pixel data (ImageData) from an image source.
     * @param {object} sourceObject The input image source.
     * @returns {ImageData} The raw pixel data.
     */
    function extractPixelMap(sourceObject) {
        var drawingCanvas = createCanvasFromSource(sourceObject);
        var renderContext = drawingCanvas.getContext("2d");
        return renderContext.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height);
    };


    /**
     * Calculates the intensity histogram for an ImageData object.
     * @param {ImageData} pixelMap The ImageData object.
     * @returns {object} An object containing the peak value and array of intensity counts.
     */
    function generateHistogram(pixelMap) {
        var intensityCounts = []; // Array to store counts for each intensity level
        var loopIndex;
        var dataPointer;
        var pixelArray = pixelMap.data; // Raw pixel array
        var mathRound = Math.round; // Cache Math.round for performance
        var peakValue; // Maximum count found in the histogram
        var pixelCount = pixelMap.width * pixelMap.height; // Total number of pixels

        // Initialize all intensity counts to zero
        for (loopIndex = 0; loopIndex < 256; loopIndex++) {
            intensityCounts[loopIndex] = 0;
        }

        // Iterate through pixels and populate histogram
        for (loopIndex = 0; loopIndex < pixelCount; loopIndex++) {
            dataPointer = loopIndex * 4; // Each pixel has 4 components (RGBA)
            // Calculate average intensity and increment its count
            intensityCounts[ mathRound((pixelArray[dataPointer] + pixelArray[dataPointer+1] + pixelArray[dataPointer+2]) / 3) ]++;
        }

        // Find the maximum count in the histogram
        peakValue = 0;
        for (loopIndex = 0; loopIndex < 256; loopIndex++) {
            if (intensityCounts[loopIndex] > peakValue) {
                peakValue = intensityCounts[loopIndex];
            }
        }

        return {
            peakValue : peakValue,
            intensityCounts : intensityCounts
        };
    }


    // Expose utility functions on the VisualCraft object
    VisualCraft.createCanvasFromSource = createCanvasFromSource;
    VisualCraft.convertCanvasToImage = convertCanvasToImage;
    VisualCraft.extractPixelMap = extractPixelMap;
    VisualCraft.generateHistogram = generateHistogram;


    // Placeholder for color conversion utilities
    VisualCraft.ColorUtils = {
        /**
         * Converts RGB color components to HSL.
         * @param {number} redComp Red component (0-255).
         * @param {number} greenComp Green component (0-255).
         * @param {number} blueComp Blue component (0-255).
         */
        convertRGBtoHSL : function(redComp, greenComp, blueComp) {
            // Input validation and clamping (note: original had a potential bug of setting to 0 if > 255)
            if (redComp < 0) redComp = 0;
            if (greenComp < 0) greenComp = 0;
            if (blueComp < 0) blueComp = 0;
            if (redComp > 255) redComp = 0; // Preserving original logic's potential bug here
            if (greenComp > 255) greenComp = 0; // Preserving original logic's potential bug here
            if (blueComp > 255) blueComp = 0; // Preserving original logic's potential bug here
        },

        /**
         * Converts RGB color components to HSV.
         * @param {number} redComp Red component (0-255).
         * @param {number} greenComp Green component (0-255).
         * @param {number} blueComp Blue component (0-255).
         */
        convertRGBtoHSV : function(redComp, greenComp, blueComp) {
            // Implementation pending
        },

        /**
         * Converts RGB color components to a hexadecimal string.
         * @param {number} redComp Red component (0-255).
         * @param {number} greenComp Green component (0-255).
         * @param {number} blueComp Blue component (0-255).
         */
        convertRGBtoHEX : function(redComp, greenComp, blueComp) {
            // Implementation pending
        },

        /**
         * Converts HSL color components to RGB.
         * @param {number} hueVal Hue value.
         * @param {number} satVal Saturation value.
         * @param {number} lightVal Lightness value.
         */
        convertHSLtoRGB : function(hueVal, satVal, lightVal) {
            // Implementation pending
        },

        /**
         * Converts HSV color components to RGB.
         * @param {number} hueVal Hue value.
         * @param {number} satVal Saturation value.
         * @param {number} valVal Value component.
         */
        convertHSVtoRGB : function(hueVal, satVal, valVal) {
            // Implementation pending
        }

    }; // End of VisualCraft.ColorUtils

    return VisualCraft;

})();