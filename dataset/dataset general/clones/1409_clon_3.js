(function(winObj, jq, isUndef) {
    'use strict';

    // Verify essential browser capabilities for advanced file and image manipulation.
    // This check ensures File API and Blob construction are available.
    jq.support.imageProcessingAPI = !!(winObj.File && winObj.FileReader && winObj.FileList && winObj.Blob);

    // Default configuration object for all thumbnail generation operations.
    // These settings can be overridden by user-provided options.
    const processingDefaults = {
        outputWidth: 0, // Desired horizontal dimension of the resulting image.
        outputHeight: 0, // Desired vertical dimension of the resulting image.
        padSmallImages: false, // If true, images smaller than target dimensions will be padded.
        canvasFillColor: '#fff', // Background color used for padding or empty canvas areas.
        outputFormat: 'image/jpeg', // The MIME type for the output thumbnail ('image/jpeg' or 'image/png').
        scalingStrategy: 'contain', // Defines how the image scales within the canvas ('contain', 'cover', 'auto').
        overlayConfig: {}, // Configuration for optional watermarks (text or image).
        forceStretchSmall: false, // For certain scaling strategies, forces stretching if source is smaller.
        preRenderHook: null, // Callback executed before image processing begins.
        completionHandler: null, // Callback invoked upon successful thumbnail creation.
        failureCallback: null, // Callback invoked if an error occurs during processing.
        finalizer: null // Callback always invoked after processing, regardless of success or failure.
    };

    // Regular expression to quickly identify common image file types.
    const imgFilePattern = /image\/(jpeg|png|gif|bmp|webp)/i;

    /**
     * Transforms a Base64-encoded Data URL string into a native Blob object.
     * This is useful for uploading or further manipulation of binary data.
     * @param {string} base64DataURL - The complete Data URL string (e.g., "data:image/png;base64,iVBORw...").
     * @param {string} [desiredMimeType] - Optional MIME type to explicitly assign to the Blob.
     * @returns {Blob|null} A Blob instance representing the binary data, or null if conversion fails.
     */
    const base64ToBlobConverter = function (base64DataURL, desiredMimeType) {
        if (!jq.support.imageProcessingAPI || !winObj.Uint8Array) {
            console.warn("Required APIs (Uint8Array, Blob) are not fully supported for Blob conversion.");
            return null;
        }
        if (typeof base64DataURL !== 'string' || !base64DataURL.startsWith('data:')) {
            console.error("Invalid or malformed Data URL string provided.");
            return null;
        }

        const dataSegments = base64DataURL.split(',');
        if (dataSegments.length < 2) {
            console.error("Data URL missing encoded content part.");
            return null;
        }

        const encodedContent = dataSegments[1];
        const inferredMime = dataSegments[0].split(':')[1].split(';')[0];
        const finalMimeType = desiredMimeType || inferredMime || 'application/octet-stream';

        let binaryString;
        try {
            binaryString = atob(encodedContent); // Decode the Base64 string.
        } catch (e) {
            console.error("Error decoding Base64 content:", e);
            return null;
        }

        const byteCount = binaryString.length;
        const dataBytes = new winObj.Uint8Array(byteCount);

        // Populate the Uint8Array with character codes from the binary string.
        for (let byteIdx = 0; byteIdx < byteCount; byteIdx++) {
            dataBytes[byteIdx] = binaryString.charCodeAt(byteIdx);
        }

        try {
            return new winObj.Blob([dataBytes], { type: finalMimeType });
        } catch (e) {
            console.error("Failed to construct Blob object:", e);
            return null;
        }
    };

    /**
     * jQuery plugin: Attaches functionality to file input elements to generate image thumbnails.
     * This function should be called on a jQuery selection of <input type="file"> elements.
     * @param {object} userOptions - An object to override default processing settings.
     * @returns {jQuery} The original jQuery object, allowing for method chaining.
     */
    jq.fn.createThumbnail = function(userOptions) {
        const currentProcessingSettings = {};
        jq.extend(true, currentProcessingSettings, processingDefaults, userOptions); // Deep merge options

        const targetInputElements = this; // Store reference to the jQuery selection.

        // Abort if the browser does not support the necessary File API features.
        if (!jq.support.imageProcessingAPI) {
            console.error("Client browser lacks support for image processing APIs (File, FileReader, Blob).");
            return targetInputElements;
        }

        // Cache references to the callback functions for performance and clarity.
        const startHook = currentProcessingSettings.preRenderHook;
        const finishedHook = currentProcessingSettings.finalizer;
        const successHandler = currentProcessingSettings.completionHandler;
        const errorHandler = currentProcessingSettings.failureCallback;

        // Bind an event listener to the 'change' event of the selected input elements.
        targetInputElements.on('change', function() {
            const currentInputContext = this; // The DOM element that triggered the change.
            const selectedFiles = currentInputContext.files;
            let finalDataURL = '';
            let finalBlob = null;
            let currentFileEvent = null; // Stores the FileReader event object.

            // Execute the pre-render hook if it's a valid function.
            if (typeof startHook === 'function') {
                startHook.call(currentInputContext);
            }

            // Perform initial validation: check if any files were selected.
            if (!selectedFiles || selectedFiles.length === 0) {
                console.info("No files detected for processing.");
                if (typeof errorHandler === 'function') {
                    errorHandler.call(currentInputContext, null, new Error("No file selected for processing."));
                }
                if (typeof finishedHook === 'function') {
                    finishedHook.call(currentInputContext);
                }
                return; // Exit early if no files.
            }

            const inputImageFile = selectedFiles[0]; // Process only the first selected file.
            const dataReaderInstance = new winObj.FileReader(); // Instantiate a FileReader.

            // Dynamically create an off-screen canvas element for drawing.
            const outputCanvasElement = jq('<canvas></canvas>')[0];
            const drawingSurfaceContext = outputCanvasElement.getContext('2d');

            let sourceImageElement; // Will hold the loaded Image object.
            let imageExifData; // Stores EXIF metadata read from the image.
            let megaPixelImageProcessor; // Instance of the external MegaPixImage library.

            /**
             * Completes the processing pipeline: converts canvas output, applies watermark, and calls callbacks.
             * This function is typically invoked after the image has been rendered on the canvas.
             */
            const finalizeImageProcessing = function() {
                // Retrieve the actual dimensions of the canvas after MegaPixImage's rendering.
                const actualOutputWidth = outputCanvasElement.width;
                const actualOutputHeight = outputCanvasElement.height;

                finalDataURL = outputCanvasElement.toDataURL(currentProcessingSettings.outputFormat);
                finalBlob = base64ToBlobConverter(finalDataURL, currentProcessingSettings.outputFormat);

                // --- Placeholder for Watermark Application Logic ---
                // If watermark configuration is present, apply it here.
                // This demonstrates adding new logic fragments.
                const watermarkSettings = currentProcessingSettings.overlayConfig;
                if (watermarkSettings && Object.keys(watermarkSettings).length > 0) {
                    drawingSurfaceContext.save(); // Save current canvas state.
                    drawingSurfaceContext.globalAlpha = 0.5; // Example: semi-transparent watermark.
                    if (watermarkSettings.text) {
                        drawingSurfaceContext.font = watermarkSettings.font || '20px Arial';
                        drawingSurfaceContext.fillStyle = watermarkSettings.color || '#000';
                        drawingSurfaceContext.fillText(watermarkSettings.text, watermarkSettings.x || 10, watermarkSettings.y || 30);
                    } else if (watermarkSettings.src) {
                        // Logic to load and draw an image watermark would go here.
                        // For brevity, only text watermark placeholder is shown.
                    }
                    drawingSurfaceContext.restore(); // Restore canvas state.
                }
                // --- End Watermark Placeholder ---

                if (typeof successHandler === 'function') {
                    const resultDimensions = { width: actualOutputWidth, height: actualOutputHeight };
                    const originalDimensions = { width: sourceImageElement.naturalWidth, height: sourceImageElement.naturalHeight };
                    successHandler.call(currentInputContext, finalDataURL, finalBlob, resultDimensions, inputImageFile, originalDimensions, currentFileEvent);
                }
                if (typeof finishedHook === 'function') {
                    finishedHook.call(currentInputContext);
                }
                jq(outputCanvasElement).remove(); // Clean up the temporary canvas element.
            };

            /**
             * Renders the source image onto the canvas, applying background fill and EXIF orientation.
             * This function prepares the canvas for MegaPixImage processing.
             * @param {object} [imageMetadata] - EXIF data, primarily for image orientation.
             */
            const prepareAndRenderImage = function(imageMetadata) {
                const imageOrientation = imageMetadata ? imageMetadata.Orientation : 1; // Default to normal orientation (1).

                // Set initial canvas dimensions based on desired output.
                outputCanvasElement.width = currentProcessingSettings.outputWidth;
                outputCanvasElement.height = currentProcessingSettings.outputHeight;

                // Fill the canvas background if a color is specified.
                if (currentProcessingSettings.canvasFillColor) {
                    drawingSurfaceContext.fillStyle = currentProcessingSettings.canvasFillColor;
                    drawingSurfaceContext.fillRect(0, 0, outputCanvasElement.width, outputCanvasElement.height);
                }

                // Utilize MegaPixImage for sophisticated rendering, including scaling,
                // orientation correction, and potential quality adjustments.
                megaPixelImageProcessor.render(outputCanvasElement, {
                    maxWidth: currentProcessingSettings.outputWidth,
                    maxHeight: currentProcessingSettings.outputHeight,
                    orientation: imageOrientation,
                    quality: 0.85 // Example: Added a specific quality setting for JPEG output.
                });
            };

            // Define the error handler for the FileReader.
            dataReaderInstance.onerror = function(readerErrorEvent) {
                currentFileEvent = readerErrorEvent;
                console.error("An error occurred during file reading:", readerErrorEvent);
                if (typeof errorHandler === 'function') {
                    errorHandler.call(currentInputContext, inputImageFile, readerErrorEvent);
                }
                if (typeof finishedHook === 'function') {
                    finishedHook.call(currentInputContext);
                }
            };

            // Define the success handler for the FileReader.
            dataReaderInstance.onload = function(readerLoadEvent) {
                currentFileEvent = readerLoadEvent;
                const fileContentResult = readerLoadEvent.target.result;

                sourceImageElement = new winObj.Image(); // Create a new Image object.

                // Handle potential errors during the Image object's loading phase.
                sourceImageElement.onerror = function() {
                    console.error("Failed to load image from the provided Data URL.");
                    if (typeof errorHandler === 'function') {
                        errorHandler.call(currentInputContext, inputImageFile);
                    }
                    if (typeof finishedHook === 'function') {
                        finishedHook.call(currentInputContext);
                    }
                };

                // Once the Image object has successfully loaded, proceed with EXIF and rendering.
                sourceImageElement.onload = function() {
                    prepareAndRenderImage(imageExifData); // Pass EXIF data for orientation correction.
                };

                // Extract the Base64 data part for EXIF processing.
                const encodedDataPart = fileContentResult.split(',')[1];
                const rawBinaryContent = atob(encodedDataPart);
                const binaryFileWrapper = new winObj.BinaryFile(rawBinaryContent); // Assumes BinaryFile library is globally available.

                // Read EXIF metadata from the binary content.
                imageExifData = winObj.EXIF.readFromBinaryFile(binaryFileWrapper);

                // Initialize the MegaPixImage processor with the file.
                megaPixelImageProcessor = new winObj.MegaPixImage(inputImageFile);
                megaPixelImageProcessor.onrender = function() {
                    // This callback signifies that MegaPixImage has completed its rendering to the canvas.
                    finalizeImageProcessing();
                };

                sourceImageElement.src = fileContentResult; // Set the source to trigger image loading.
            };

            // Determine if the selected file is an image and initiate reading.
            if (imgFilePattern.test(inputImageFile.type)) {
                dataReaderInstance.readAsDataURL(inputImageFile);
            } else {
                // If the file type is not recognized as an image, log a warning and trigger failure callbacks.
                console.warn(`File type "${inputImageFile.type}" is not supported for image thumbnail generation.`);
                if (typeof errorHandler === 'function') {
                    errorHandler.call(currentInputContext, inputImageFile, new Error("Unsupported file type detected."));
                }
                if (typeof finishedHook === 'function') {
                    finishedHook.call(currentInputContext);
                }
            }
        });
    };
})(window, jQuery);