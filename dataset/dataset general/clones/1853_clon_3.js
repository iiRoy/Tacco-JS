const ImageProcessingLibrary = require('canvas');
const GraphicAsset = ImageProcessingLibrary.Image;
const FileOperationsHandler = require('fs');

// Configuration constants for image processing operations
const PROCESSING_SETTINGS = Object.freeze({
    JPEG_BUFFER_SIZE: 2048,
    JPEG_QUALITY_PERCENT: 80,
    COLOR_CHANNEL_COUNT: 3, // R, G, B (excluding Alpha for diff calc)
    PIXEL_BYTE_STRIDE: 4,   // Standard RGBA pixel data
    DIFF_NEUTRAL_OFFSET: 127 // Mid-point for difference image, 127 means no change
});

// Global state and derived path variables
let processingCompletionTracker = 0; // Tracks completion of initial scaling tasks
const initialSourcePath = process.argv[2]; // Captures the input image file path from command line arguments

// Determines the base name for output files. Includes a fallback if no input path is provided.
const baseOutputIdentifier = initialSourcePath
    ? `${__dirname}/${initialSourcePath.split('.')[0]}`
    : `${__dirname}/default_processed_image`;

// --- General Utility Functions for Image Processing ---

/**
 * Clamps a numeric value to ensure it falls within the 0-255 byte range.
 * This is essential for color channel values.
 * @param {number} rawValue - The number to be clamped.
 * @returns {number} The clamped byte value (0-255).
 */
function clampByteValue(rawValue) {
    return Math.min(255, Math.max(0, rawValue));
}

/**
 * Provides a standardized error handler for image loading failures.
 * This function logs the error and re-throws it to indicate a critical failure.
 * @param {Error} error - The error object encountered during image loading.
 */
function handleImageLoadError(error) {
    console.error("Critical error during image asset loading:", error.message);
    throw error; // Propagate the error to stop further execution
}

/**
 * Creates a JPEG stream from a Canvas instance using predefined quality settings.
 * @param {object} canvasInstance - The Canvas object from which to create the stream.
 * @returns {object} A JPEG stream configured with standard settings.
 */
function createJpegOutputSteam(canvasInstance) {
    return canvasInstance.createJPEGStream({
        bufsize: PROCESSING_SETTINGS.JPEG_BUFFER_SIZE,
        quality: PROCESSING_SETTINGS.JPEG_QUALITY_PERCENT
    });
}

/**
 * Pipes a given stream (e.g., JPEG stream from canvas) to a file on the filesystem.
 * Includes logging for success and error conditions.
 * @param {object} outputStream - The readable stream to be written to a file.
 * @param {string} destinationPath - The full path where the file should be saved.
 * @param {function} [onWriteComplete] - An optional callback function to execute after the file is successfully written.
 */
function saveCanvasStreamToFile(outputStream, destinationPath, onWriteComplete) {
    const fileWriter = FileOperationsHandler.createWriteStream(destinationPath);

    fileWriter.on('close', () => {
        console.log(`Successfully saved processed image to: ${destinationPath}`);
        onWriteComplete?.(); // Invoke callback if provided, using optional chaining
    });

    fileWriter.on('error', (err) => {
        console.error(`Failed to write image to ${destinationPath}:`, err.message);
        // Depending on context, might re-throw or call a specific error callback
    });

    outputStream.pipe(fileWriter); // Start the data transfer
}

// --- Primary Image Transformation Functions ---

/**
 * Scales an input image down by a specified factor and persists the result as a JPEG file.
 * @param {string} inputFilePath - The absolute path to the source image file.
 * @param {string} outputFilePath - The absolute path where the scaled image will be saved.
 * @param {number} reductionFactor - The integer factor by which image dimensions will be divided (e.g., 2 for half, 4 for quarter).
 * @param {function} [completionCallback] - An optional function to call once the scaling and saving are complete.
 */
function scaleAndPersistImage(inputFilePath, outputFilePath, reductionFactor, completionCallback) {
    // Robust input validation
    if (!inputFilePath || !outputFilePath || typeof reductionFactor !== 'number' || reductionFactor <= 0) {
        console.error("Invalid parameters provided for scaleAndPersistImage. Please check file paths and reduction factor.");
        completionCallback?.(new Error("Invalid input parameters")); // Indicate error via callback
        return;
    }
    console.log(`Initiating image downscaling: '${inputFilePath}' to '${outputFilePath}' with factor ${reductionFactor}`);

    const sourceGraphic = new GraphicAsset(); // Create a new image object

    sourceGraphic.onerror = handleImageLoadError; // Assign global error handler

    sourceGraphic.onload = () => {
        const scaledWidth = Math.floor(sourceGraphic.width / reductionFactor);
        const scaledHeight = Math.floor(sourceGraphic.height / reductionFactor);

        // Guard against invalid dimensions after scaling
        if (scaledWidth <= 0 || scaledHeight <= 0) {
            console.warn(`Resulting dimensions for '${inputFilePath}' are non-positive (${scaledWidth}x${scaledHeight}). Skipping save.`);
            completionCallback?.(); // Still call callback to indicate completion (even if skipped)
            return;
        }

        const targetCanvas = new ImageProcessingLibrary(scaledWidth, scaledHeight); // Create a new canvas for scaled image
        const drawingContext = targetCanvas.getContext('2d'); // Get 2D rendering context

        // Draw the source image onto the new canvas, scaled to target dimensions
        drawingContext.drawImage(sourceGraphic, 0, 0, scaledWidth, scaledHeight);

        const jpegDataStream = createJpegOutputSteam(targetCanvas); // Get JPEG stream from canvas
        saveCanvasStreamToFile(jpegDataStream, outputFilePath, completionCallback); // Save stream to file
    };

    sourceGraphic.src = inputFilePath; // Set the image source to trigger loading
}

/**
 * Computes and saves a "difference image" (JPEG) between two input images.
 * The output image represents the visual delta, centered around 127 for no change.
 * @param {string} primaryImagePath - Path to the first image (often the higher resolution one).
 * @param {string} secondaryImagePath - Path to the second image.
 * @param {string} outputDestinationPath - Path where the difference image will be stored.
 * @param {function} [onOperationComplete] - Optional callback function for completion.
 */
function computeVisualDelta(primaryImagePath, secondaryImagePath, outputDestinationPath, onOperationComplete) {
    console.log(`Calculating visual delta: '${primaryImagePath}' versus '${secondaryImagePath}' -> '${outputDestinationPath}'`);

    const primaryImageElement = new GraphicAsset();
    const secondaryImageElement = new GraphicAsset();

    primaryImageElement.onerror = handleImageLoadError;
    secondaryImageElement.onerror = handleImageLoadError;

    primaryImageElement.onload = () => {
        const imgWidth = primaryImageElement.width;
        const imgHeight = primaryImageElement.height;

        const processingCanvas = new ImageProcessingLibrary(imgWidth, imgHeight);
        const renderingContext = processingCanvas.getContext('2d');

        renderingContext.drawImage(primaryImageElement, 0, 0, imgWidth, imgHeight);
        const primaryImageData = renderingContext.getImageData(0, 0, imgWidth, imgHeight);

        secondaryImageElement.onload = () => {
            // It's assumed for this operation that both images are of compatible dimensions.
            // A more robust system would handle dimension mismatches (e.g., scaling, erroring out).
            if (secondaryImageElement.width !== imgWidth || secondaryImageElement.height !== imgHeight) {
                console.warn(`Dimension mismatch detected: Secondary image (${secondaryImageElement.width}x${secondaryImageElement.height}) differs from primary (${imgWidth}x${imgHeight}). Proceeding, but results may be unexpected.`);
            }

            renderingContext.drawImage(secondaryImageElement, 0, 0, imgWidth, imgHeight);
            const secondaryImageData = renderingContext.getImageData(0, 0, imgWidth, imgHeight);

            const totalPixels = imgWidth * imgHeight;
            const outputPixelBuffer = primaryImageData.data; // We'll modify this buffer in place

            // Iterate through each pixel and color channel to compute the difference
            for (let pixelIdx = 0; pixelIdx < totalPixels; pixelIdx++) {
                for (let channelIdx = 0; channelIdx < PROCESSING_SETTINGS.COLOR_CHANNEL_COUNT; channelIdx++) {
                    const byteOffset = (PROCESSING_SETTINGS.PIXEL_BYTE_STRIDE * pixelIdx) + channelIdx;
                    const deltaValue = outputPixelBuffer[byteOffset] - secondaryImageData.data[byteOffset];
                    outputPixelBuffer[byteOffset] = clampByteValue(deltaValue + PROCESSING_SETTINGS.DIFF_NEUTRAL_OFFSET);
                }
                // The alpha channel (index 3) is intentionally ignored, as per original logic.
            }

            renderingContext.putImageData(primaryImageData, 0, 0); // Apply the modified pixel data back to the canvas

            const jpegDataStream = createJpegOutputSteam(processingCanvas);
            saveCanvasStreamToFile(jpegDataStream, outputDestinationPath, onOperationComplete);
        };

        secondaryImageElement.src = secondaryImagePath;
    };

    primaryImageElement.src = primaryImagePath;
}

/**
 * Reconstructs an image by applying a difference image to a base image.
 * The reconstructed image is returned as a Data URL (PNG format).
 * @param {string} baseImagePath - Path to the base image.
 * @param {string} deltaImagePath - Path to the difference image.
 * @param {function(string): void} [renderResultCallback] - Callback function to receive the reconstructed image's Data URL.
 */
function applyDifferenceAndRender(baseImagePath, deltaImagePath, renderResultCallback) {
    console.log(`Initiating image reconstruction: Base='${baseImagePath}', Delta='${deltaImagePath}'`);

    const baseImage = new GraphicAsset();
    const deltaImage = new GraphicAsset();

    baseImage.onerror = handleImageLoadError;
    deltaImage.onerror = handleImageLoadError;

    baseImage.onload = () => {
        deltaImage.onload = () => {
            // The canvas dimensions for reconstruction are determined by the delta image
            const canvasWidth = deltaImage.width;
            const canvasHeight = deltaImage.height;

            const reconstructionCanvas = new ImageProcessingLibrary(canvasWidth, canvasHeight);
            const drawingContext = reconstructionCanvas.getContext('2d');

            // Draw base image to get its pixel data
            drawingContext.drawImage(baseImage, 0, 0, canvasWidth, canvasHeight);
            const baseImageData = drawingContext.getImageData(0, 0, canvasWidth, canvasHeight);

            // Draw delta image to get its pixel data
            drawingContext.drawImage(deltaImage, 0, 0, canvasWidth, canvasHeight);
            const deltaImageData = drawingContext.getImageData(0, 0, canvasWidth, canvasHeight);

            const totalPixels = canvasWidth * canvasHeight;
            const reconstructedBuffer = baseImageData.data; // Modify base image's pixel data in place

            // Apply the difference to reconstruct the target image
            for (let pixelIdx = 0; pixelIdx < totalPixels; pixelIdx++) {
                for (let channelIdx = 0; channelIdx < PROCESSING_SETTINGS.COLOR_CHANNEL_COUNT; channelIdx++) {
                    const byteOffset = (PROCESSING_SETTINGS.PIXEL_BYTE_STRIDE * pixelIdx) + channelIdx;
                    // Subtract the neutral offset to get the actual delta value
                    const actualDelta = deltaImageData.data[byteOffset] - PROCESSING_SETTINGS.DIFF_NEUTRAL_OFFSET;
                    reconstructedBuffer[byteOffset] = clampByteValue(reconstructedBuffer[byteOffset] + actualDelta);
                }
                // Alpha channel (index 3) is ignored, consistent with difference calculation.
            }

            drawingContext.putImageData(baseImageData, 0, 0); // Put reconstructed data onto canvas

            // Return the reconstructed image as a PNG Data URL
            renderResultCallback?.(drawingContext.canvas.toDataURL('image/png'));
        };
        deltaImage.src = deltaImagePath;
    };
    baseImage.src = baseImagePath;
}

// --- Orchestration and Main Execution Flow ---

/**
 * Manages the sequential phases of image processing after the initial downscaling tasks.
 * This function increments a counter and proceeds to the next steps only when all
 * preceding asynchronous operations have signaled completion.
 */
function orchestrateImageProcessingStages() {
    processingCompletionTracker++;
    console.log(`Processing stage completion signal received. Current count: ${processingCompletionTracker}`);

    // This block executes once both initial downscaling operations are complete
    if (processingCompletionTracker === 2) {
        console.log("All initial downscaling tasks finished. Initiating difference image computation and decoding sequence.");

        const lowResOutput = `${baseOutputIdentifier}_low.jpg`;
        const medResOutput = `${baseOutputIdentifier}_med.jpg`;
        const lowToMedDiffOutput = `${baseOutputIdentifier}_low_to_med_diff.jpg`;
        const medToFullDiffOutput = `${baseOutputIdentifier}_med_to_full_diff.jpg`;
        const originalFullResPath = `${__dirname}/${initialSourcePath}`;

        // Step 1: Generate the difference image between the medium and low resolution versions.
        computeVisualDelta(medResOutput, lowResOutput, lowToMedDiffOutput, () => {
            console.log(`Generated difference image: ${lowToMedDiffOutput}`);

            // Step 2: Reconstruct the medium resolution image using the low-res base and the diff image.
            applyDifferenceAndRender(lowResOutput, lowToMedDiffOutput, (decodedMedResDataUrl) => {
                console.log(`Successfully decoded medium resolution image (as a Data URL).`);

                // The original code implicitly tried to use a Data URL as a file path for `createDiffImg`,
                // which is not directly supported by `img.src`.
                // To maintain functional similarity, we must save the Data URL to a temporary file.
                const tempDecodedMedResFile = `${baseOutputIdentifier}_decoded_med_temp.png`;

                // Ensure any previous temporary file is removed to prevent conflicts
                if (FileOperationsHandler.existsSync(tempDecodedMedResFile)) {
                    FileOperationsHandler.unlinkSync(tempDecodedMedResFile);
                    console.log(`Removed stale temporary file: ${tempDecodedMedResFile}`);
                }

                // Convert the Data URL to a buffer and write it to a temporary file
                const dataUrlParts = decodedMedResDataUrl.split(',');
                if (dataUrlParts.length < 2) {
                    console.error("Invalid Data URL format received for decoded medium resolution image.");
                    return;
                }
                const base64ImageBuffer = Buffer.from(dataUrlParts[1], 'base64');

                FileOperationsHandler.writeFile(tempDecodedMedResFile, base64ImageBuffer, (writeErr) => {
                    if (writeErr) {
                        console.error(`Error saving temporary decoded medium resolution image to '${tempDecodedMedResFile}':`, writeErr.message);
                        return;
                    }
                    console.log(`Temporary decoded medium resolution image saved to: ${tempDecodedMedResFile}`);

                    // Step 3: Compute the difference between the original full-resolution image and the decoded medium-resolution (temp file).
                    computeVisualDelta(originalFullResPath, tempDecodedMedResFile, medToFullDiffOutput, () => {
                        console.log(`Generated final difference image: ${medToFullDiffOutput}`);
                        console.log("All planned image processing stages have been successfully completed!");

                        // Clean up the temporary file created for the decoded medium-resolution image
                        FileOperationsHandler.unlink(tempDecodedMedResFile, (unlinkErr) => {
                            if (unlinkErr) console.warn(`Could not delete temporary file '${tempDecodedMedResFile}': ${unlinkErr.message}`);
                            else console.log(`Cleaned up temporary file: ${tempDecodedMedResFile}`);
                        });
                    });
                });
            });
        });
    }
}

// --- Application Entry Point ---

// Validate that an initial image path was provided as a command-line argument
if (!initialSourcePath) {
    console.error("Usage Error: Please provide an initial image file path. Example: node script.js my_image.jpg");
    process.exit(1); // Exit with an error code
}

console.log(`Beginning comprehensive image processing workflow for: '${initialSourcePath}'`);

// Initiate two concurrent downscaling operations for the initial image
scaleAndPersistImage(
    `${__dirname}/${initialSourcePath}`,
    `${baseOutputIdentifier}_low.jpg`,
    4, // Scale to quarter resolution
    orchestrateImageProcessingStages // Callback to track completion
);

scaleAndPersistImage(
    `${__dirname}/${initialSourcePath}`,
    `${baseOutputIdentifier}_med.jpg`,
    2, // Scale to half resolution
    orchestrateImageProcessingStages // Callback to track completion
);