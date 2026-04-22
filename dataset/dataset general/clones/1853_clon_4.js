const DrawingSurface = require('canvas')
  , RasterGraphic = DrawingSurface.Image
  , FileSystem = require('fs/promises')
  , PathOperations = require('path');

// Global variables transformed to constants within the main execution scope
const initialSourceArgument = process.argv[2];
const baseOutputIdentifier = initialSourceArgument ? PathOperations.join(__dirname, initialSourceArgument.split('.')[0]) : null;

// Utility function to load an image asynchronously
async function acquireGraphic(sourcePath) {
    const graphicElement = new RasterGraphic();
    return new Promise((completion, rejection) => {
        graphicElement.onerror = (issue) => rejection(issue);
        graphicElement.onload = () => completion(graphicElement);
        graphicElement.src = sourcePath;
    });
}

// Utility function to save a canvas content as a JPEG file asynchronously
async function persistSurfaceAsJpeg(renderTarget, destinationPath) {
    const byteBuffer = await renderTarget.toBuffer('image/jpeg', { quality: 0.8, progressive: true });
    await FileSystem.writeFile(destinationPath, byteBuffer);
}

// Generic pixel transformation utility
function performPixelManipulation(primaryPixelSet, secondaryPixelSet, dimensionWidth, dimensionHeight, transformationLogic) {
    const resultantPixelData = new Uint8ClampedArray(primaryPixelSet.data); // Start with a copy of primary
    const totalPixels = dimensionWidth * dimensionHeight;

    for (let pixelIndex = 0; pixelIndex < totalPixels; pixelIndex++) {
        for (let colorChannel = 0; colorChannel < 3; colorChannel++) { // Iterate RGB channels
            const byteOffset = 4 * pixelIndex + colorChannel;
            resultantPixelData[byteOffset] = transformationLogic(primaryPixelSet.data[byteOffset], secondaryPixelSet.data[byteOffset]);
        }
    }
    return new DrawingSurface.ImageData(resultantPixelData, dimensionWidth, dimensionHeight);
}

// Function equivalent to 'downscale'
async function resizeAndStoreImage(inputLocation, outputLocation, reductionMultiplier) {
    const sourceGraphic = await acquireGraphic(inputLocation);

    const scaledWidth = sourceGraphic.width / reductionMultiplier;
    const scaledHeight = sourceGraphic.height / reductionMultiplier;

    const temporaryCanvas = DrawingSurface.createCanvas(scaledWidth, scaledHeight);
    const canvasContext = temporaryCanvas.getContext('2d');

    canvasContext.drawImage(sourceGraphic, 0, 0, scaledWidth, scaledHeight);

    await persistSurfaceAsJpeg(temporaryCanvas, outputLocation);
}

// Function equivalent to 'createDiffImg'
async function produceDifferenceImage(highResPath, lowResPath, differenceOutputPath) {
    const highResGraphic = await acquireGraphic(highResPath);
    const lowResGraphic = await acquireGraphic(lowResPath);

    // Canvas dimensions are based on the first image, as per original logic
    const processingWidth = highResGraphic.width;
    const processingHeight = highResGraphic.height;

    const processingCanvas = DrawingSurface.createCanvas(processingWidth, processingHeight);
    const processingContext = processingCanvas.getContext('2d');

    processingContext.drawImage(highResGraphic, 0, 0, processingWidth, processingHeight);
    const highResPixels = processingContext.getImageData(0, 0, processingWidth, processingHeight);

    processingContext.drawImage(lowResGraphic, 0, 0, processingWidth, processingHeight);
    const lowResPixels = processingContext.getImageData(0, 0, processingWidth, processingHeight);

    // Difference formula: Math.min(255, Math.max(0, (pixel1 - pixel2) + 127))
    const differenceCalculator = (val1, val2) => Math.min(255, Math.max(0, (val1 - val2) + 127));
    const calculatedDifferencePixels = performPixelManipulation(highResPixels, lowResPixels, processingWidth, processingHeight, differenceCalculator);

    processingContext.putImageData(calculatedDifferencePixels, 0, 0);

    await persistSurfaceAsJpeg(processingCanvas, differenceOutputPath);
}

// Function equivalent to 'testDecode'
async function reconstructImageFromDifference(baseImagePath, differenceImagePath) {
    const baseGraphic = await acquireGraphic(baseImagePath);
    const differenceGraphic = await acquireGraphic(differenceImagePath);

    // Canvas dimensions are based on the second image (difference image), as per original logic
    const processingWidth = differenceGraphic.width;
    const processingHeight = differenceGraphic.height;

    const processingCanvas = DrawingSurface.createCanvas(processingWidth, processingHeight);
    const processingContext = processingCanvas.getContext('2d');

    processingContext.drawImage(baseGraphic, 0, 0, processingWidth, processingHeight);
    const basePixels = processingContext.getImageData(0, 0, processingWidth, processingHeight);

    processingContext.drawImage(differenceGraphic, 0, 0, processingWidth, processingHeight);
    const differencePixels = processingContext.getImageData(0, 0, processingWidth, processingHeight);

    // Decoding formula: Math.min(255, Math.max(0, (pixel1 + (pixel2 - 127))))
    const decoderFunction = (val1, val2) => Math.min(255, Math.max(0, (val1 + (val2 - 127))));
    const reconstructedPixels = performPixelManipulation(basePixels, differencePixels, processingWidth, processingHeight, decoderFunction);

    processingContext.putImageData(reconstructedPixels, 0, 0);

    return processingCanvas.toDataURL(); // Returns a Data URL string
}

// Main orchestration function using async/await
async function coordinateImageWorkflow() {
    if (!initialSourceArgument) {
        console.error("ERROR: Please provide an image filename as the second command-line argument.");
        process.exit(1);
    }

    const fullOriginalImagePath = PathOperations.join(__dirname, initialSourceArgument);
    const lowResolutionPath = baseOutputIdentifier + '_low.jpg';
    const mediumResolutionPath = baseOutputIdentifier + '_med.jpg';
    const lowToMediumDifferencePath = baseOutputIdentifier + '_low_to_med_diff.jpg';
    const mediumToFullDifferencePath = baseOutputIdentifier + '_med_to_full_diff.jpg';

    // Phase 1: Parallel downscaling operations
    await Promise.all([
        resizeAndStoreImage(fullOriginalImagePath, lowResolutionPath, 4),
        resizeAndStoreImage(fullOriginalImagePath, mediumResolutionPath, 2)
    ]);

    // Phase 2: Sequential difference and reconstruction
    await produceDifferenceImage(mediumResolutionPath, lowResolutionPath, lowToMediumDifferencePath);

    const reconstructedMediumDataURL = await reconstructImageFromDifference(lowResolutionPath, lowToMediumDifferencePath);

    await produceDifferenceImage(fullOriginalImagePath, reconstructedMediumDataURL, mediumToFullDifferencePath);

    // Optional: Log completion or handle final output
    // console.log("All image processing steps completed successfully.");
}

// Execute the main workflow and handle potential errors
coordinateImageWorkflow().catch(operationalError => {
    console.error("An unexpected error occurred during image processing:", operationalError);
    process.exit(1);
});