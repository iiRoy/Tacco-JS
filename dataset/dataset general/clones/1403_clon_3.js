/*
 * PixelateProcessor - A module for applying a fast approximate Gaussian blur to canvas elements.
 *
 * This implementation is derived from the original StackBlur algorithm,
 * adapted and modified for modern JavaScript environments.
 *
 * All rights reserved. For commercial use, consider supporting the original author.
 */

// Precomputed multiplication table for blur calculations
const _blurMultipliers = [
    512,512,456,512,328,456,335,512,405,328,271,456,388,335,292,512,
    454,405,364,328,298,271,496,456,420,388,360,335,312,292,273,512,
    482,454,428,405,383,364,345,328,312,298,284,271,259,496,475,456,
    437,420,404,388,374,360,347,335,323,312,302,292,282,273,265,512,
    497,482,468,454,441,428,417,405,394,383,373,364,354,345,337,328,
    320,312,305,298,291,284,278,271,265,259,507,496,485,475,465,456,
    446,437,428,420,412,404,396,388,381,374,367,360,354,347,341,335,
    329,323,318,312,307,302,297,292,287,282,278,273,269,265,261,512,
    505,497,489,482,475,468,461,454,447,441,435,428,422,417,411,405,
    399,394,389,383,378,373,368,364,359,354,350,345,341,337,332,328,
    324,320,316,312,309,305,301,298,294,291,287,284,281,278,274,271,
    268,265,262,259,257,507,501,496,491,485,480,475,470,465,460,456,
    451,446,442,437,433,428,424,420,416,412,408,404,400,396,392,388,
    385,381,377,374,370,367,363,360,357,354,350,347,344,341,338,335,
    332,329,326,323,320,318,315,312,310,307,304,302,299,297,294,292,
    289,287,285,282,280,278,275,273,271,269,267,265,263,261,259
];

// Precomputed shift table for blur calculations
const _blurShifts = [
    9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
    17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
    19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
    20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24
];

// Helper class for the blur stack elements
class BlurNode {
    constructor() {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.alpha = 0;
        this.nextNode = null;
    }
}

/**
 * Initializes a canvas and applies a blur effect from an image source.
 * @param {string} sourceImageId - The ID of the source HTML <img> element.
 * @param {string} targetCanvasId - The ID of the target HTML <canvas> element.
 * @param {number} blurMagnitude - The blur radius (integer, >= 1).
 * @param {boolean} includeAlpha - True to blur the alpha channel, false for RGB only.
 */
function processImageForBlur(sourceImageId, targetCanvasId, blurMagnitude, includeAlpha) {
    const sourceImage = document.getElementById(sourceImageId);
    if (!sourceImage) {
        console.error(`Error: Source image element with ID '${sourceImageId}' not found.`);
        return;
    }

    const canvasElement = document.getElementById(targetCanvasId);
    if (!canvasElement || !(canvasElement instanceof HTMLCanvasElement)) {
        console.error(`Error: Target canvas element with ID '${targetCanvasId}' not found or is not a canvas.`);
        return;
    }

    // Capture original dimensions
    const imgWidth = sourceImage.naturalWidth;
    const imgHeight = sourceImage.naturalHeight;

    // Set canvas dimensions to match the image
    canvasElement.style.width = `${imgWidth}px`;
    canvasElement.style.height = `${imgHeight}px`;
    canvasElement.width = imgWidth;
    canvasElement.height = imgHeight;

    const renderingContext = canvasElement.getContext("2d");
    if (!renderingContext) {
        console.error("Error: Could not get 2D rendering context for canvas.");
        return;
    }

    // Clear and draw the image onto the canvas
    renderingContext.clearRect(0, 0, imgWidth, imgHeight);
    renderingContext.drawImage(sourceImage, 0, 0);

    // Validate blur magnitude
    if (isNaN(blurMagnitude) || blurMagnitude < 1) {
        console.warn("Blur magnitude must be a number >= 1. Skipping blur operation.");
        return;
    }

    // Delegate to the appropriate blur function
    if (includeAlpha) {
        applyRGBAFilter(targetCanvasId, 0, 0, imgWidth, imgHeight, blurMagnitude);
    } else {
        applyRGBFilter(targetCanvasId, 0, 0, imgWidth, imgHeight, blurMagnitude);
    }
}

/**
 * Applies a blur filter to a specific rectangular area of a canvas, including alpha channel.
 * @param {string} canvasTargetId - The ID of the canvas element.
 * @param {number} offsetX - X-coordinate of the top-left corner of the blur area.
 * @param {number} offsetY - Y-coordinate of the top-left corner of the blur area.
 * @param {number} areaWidth - Width of the blur area.
 * @param {number} areaHeight - Height of the blur area.
 * @param {number} blurStrength - The blur radius.
 */
function applyRGBAFilter(canvasTargetId, offsetX, offsetY, areaWidth, areaHeight, blurStrength) {
    // Ensure blur strength is a positive integer
    let effectiveBlurStrength = Math.floor(blurStrength);
    if (effectiveBlurStrength < 1) {
        console.warn("Invalid blur strength provided for RGBA filter. Must be >= 1.");
        return;
    }

    const canvasElem = document.getElementById(canvasTargetId);
    if (!canvasElem || !(canvasElem instanceof HTMLCanvasElement)) {
        console.error(`Canvas with ID '${canvasTargetId}' not found or is not a canvas element.`);
        return;
    }

    const ctx = canvasElem.getContext("2d");
    if (!ctx) {
        console.error("Could not obtain 2D rendering context.");
        return;
    }

    let pixelData;
    try {
        pixelData = ctx.getImageData(offsetX, offsetY, areaWidth, areaHeight);
    } catch (e) {
        console.error("Error accessing image data:", e);
        // Fallback or error handling for security restrictions (e.g., cross-origin images)
        // In modern browsers, this usually means the image is tainted and cannot be read.
        return;
    }

    if (!pixelData || !pixelData.data) {
        console.error("Failed to retrieve valid pixel data.");
        return;
    }

    const pixelArray = pixelData.data;

    let xCoord, yCoord, iter, pixelIndex, yPosOffset, currentYIndex,
        redSum, greenSum, blueSum, alphaSum,
        redOutSum, greenOutSum, blueOutSum, alphaOutSum,
        redInSum, greenInSum, blueInSum, alphaInSum,
        prevR, prevG, prevB, prevA, radiusWeight;

    const blurDiameter = effectiveBlurStrength * 2 + 1;
    const pixelStride = 4; // RGBA
    const widthTimesStride = areaWidth * pixelStride;
    const widthLastIndex = areaWidth - 1;
    const heightLastIndex = areaHeight - 1;
    const radiusPlusOne = effectiveBlurStrength + 1;
    // Calculate the sum factor for initial stack population
    const initialSumFactor = radiusPlusOne * (radiusPlusOne + 1) / 2;

    // Setup the blur stack (circular linked list)
    let firstStackNode = new BlurNode();
    let currentStackNode = firstStackNode;
    let lastStackNode = null; // Will point to the node at radiusPlusOne
    for (iter = 1; iter < blurDiameter; iter++) {
        currentStackNode = currentStackNode.nextNode = new BlurNode();
        if (iter === effectiveBlurStrength) { // Original: if (i == radiusPlus1)
            lastStackNode = currentStackNode;
        }
    }
    currentStackNode.nextNode = firstStackNode; // Close the loop

    let stackInputPtr = null;
    let stackOutputPtr = null;

    yPosOffset = currentYIndex = 0; // Initialize Y-related indices

    const blurMul = _blurMultipliers[effectiveBlurStrength];
    const blurShg = _blurShifts[effectiveBlurStrength];

    // --- Horizontal Pass ---
    for (yCoord = 0; yCoord < areaHeight; yCoord++) {
        redInSum = greenInSum = blueInSum = alphaInSum = 0;
        redSum = greenSum = blueSum = alphaSum = 0;

        // Get the first pixel's RGBA values
        prevR = pixelArray[currentYIndex];
        prevG = pixelArray[currentYIndex + 1];
        prevB = pixelArray[currentYIndex + 2];
        prevA = pixelArray[currentYIndex + 3];

        // Initialize out-sums with the first pixel
        redOutSum = radiusPlusOne * prevR;
        greenOutSum = radiusPlusOne * prevG;
        blueOutSum = radiusPlusOne * prevB;
        alphaOutSum = radiusPlusOne * prevA;

        // Initialize total sums with the first pixel weighted by initialSumFactor
        redSum += initialSumFactor * prevR;
        greenSum += initialSumFactor * prevG;
        blueSum += initialSumFactor * prevB;
        alphaSum += initialSumFactor * prevA;

        currentStackNode = firstStackNode;
        // Populate the initial stack with the first pixel
        for (iter = 0; iter < radiusPlusOne; iter++) {
            currentStackNode.red = prevR;
            currentStackNode.green = prevG;
            currentStackNode.blue = prevB;
            currentStackNode.alpha = prevA;
            currentStackNode = currentStackNode.nextNode;
        }

        // Populate the rest of the stack with pixels within radius
        for (iter = 1; iter < radiusPlusOne; iter++) {
            pixelIndex = currentYIndex + (Math.min(widthLastIndex, iter) * pixelStride);
            radiusWeight = radiusPlusOne - iter;

            // Get pixel values
            prevR = pixelArray[pixelIndex];
            prevG = pixelArray[pixelIndex + 1];
            prevB = pixelArray[pixelIndex + 2];
            prevA = pixelArray[pixelIndex + 3];

            // Update stack node
            currentStackNode.red = prevR;
            currentStackNode.green = prevG;
            currentStackNode.blue = prevB;
            currentStackNode.alpha = prevA;

            // Add to total sums (weighted)
            redSum += prevR * radiusWeight;
            greenSum += prevG * radiusWeight;
            blueSum += prevB * radiusWeight;
            alphaSum += prevA * radiusWeight;

            // Add to in-sums (unweighted)
            redInSum += prevR;
            greenInSum += prevG;
            blueInSum += prevB;
            alphaInSum += prevA;

            currentStackNode = currentStackNode.nextNode;
        }

        stackInputPtr = firstStackNode;
        stackOutputPtr = lastStackNode;

        // Process each pixel in the row
        for (xCoord = 0; xCoord < areaWidth; xCoord++) {
            // Apply blur calculation for alpha
            let currentAlpha = (alphaSum * blurMul) >> blurShg;
            pixelArray[currentYIndex + 3] = currentAlpha;

            // Apply blur calculation for RGB, handling transparent pixels
            if (currentAlpha > 0) {
                const alphaFactor = 255 / currentAlpha;
                pixelArray[currentYIndex] = (((redSum * blurMul) >> blurShg) * alphaFactor);
                pixelArray[currentYIndex + 1] = (((greenSum * blurMul) >> blurShg) * alphaFactor);
                pixelArray[currentYIndex + 2] = (((blueSum * blurMul) >> blurShg) * alphaFactor);
            } else {
                pixelArray[currentYIndex] = pixelArray[currentYIndex + 1] = pixelArray[currentYIndex + 2] = 0;
            }

            // Update sums for the next pixel
            redSum -= redOutSum;
            greenSum -= greenOutSum;
            blueSum -= blueOutSum;
            alphaSum -= alphaOutSum;

            redOutSum -= stackInputPtr.red;
            greenOutSum -= stackInputPtr.green;
            blueOutSum -= stackInputPtr.blue;
            alphaOutSum -= stackInputPtr.alpha;

            // Calculate index for the incoming pixel
            const nextPixelX = xCoord + effectiveBlurStrength + 1;
            pixelIndex = (yPosOffset + Math.min(widthLastIndex, nextPixelX)) * pixelStride;

            // Update in-sums and stack node with the incoming pixel
            redInSum += (stackInputPtr.red = pixelArray[pixelIndex]);
            greenInSum += (stackInputPtr.green = pixelArray[pixelIndex + 1]);
            blueInSum += (stackInputPtr.blue = pixelArray[pixelIndex + 2]);
            alphaInSum += (stackInputPtr.alpha = pixelArray[pixelIndex + 3]);

            // Add updated in-sums to total sums
            redSum += redInSum;
            greenSum += greenInSum;
            blueSum += blueInSum;
            alphaSum += alphaInSum;

            stackInputPtr = stackInputPtr.nextNode;

            // Update out-sums with the outgoing pixel
            redOutSum += (prevR = stackOutputPtr.red);
            greenOutSum += (prevG = stackOutputPtr.green);
            blueOutSum += (prevB = stackOutputPtr.blue);
            alphaOutSum += (prevA = stackOutputPtr.alpha);

            // Subtract outgoing pixel from in-sums
            redInSum -= prevR;
            greenInSum -= prevG;
            blueInSum -= prevB;
            alphaInSum -= prevA;

            stackOutputPtr = stackOutputPtr.nextNode;

            currentYIndex += pixelStride; // Move to the next pixel in the row
        }
        yPosOffset += areaWidth; // Move to the next row's starting position
    }


    // --- Vertical Pass ---
    for (xCoord = 0; xCoord < areaWidth; xCoord++) {
        redInSum = greenInSum = blueInSum = alphaInSum = 0;
        redSum = greenSum = blueSum = alphaSum = 0;

        currentYIndex = xCoord * pixelStride; // Start at the top of the current column

        // Get the first pixel's RGBA values
        prevR = pixelArray[currentYIndex];
        prevG = pixelArray[currentYIndex + 1];
        prevB = pixelArray[currentYIndex + 2];
        prevA = pixelArray[currentYIndex + 3];

        // Initialize out-sums
        redOutSum = radiusPlusOne * prevR;
        greenOutSum = radiusPlusOne * prevG;
        blueOutSum = radiusPlusOne * prevB;
        alphaOutSum = radiusPlusOne * prevA;

        // Initialize total sums
        redSum += initialSumFactor * prevR;
        greenSum += initialSumFactor * prevG;
        blueSum += initialSumFactor * prevB;
        alphaSum += initialSumFactor * prevA;

        currentStackNode = firstStackNode;
        // Populate the initial stack with the first pixel
        for (iter = 0; iter < radiusPlusOne; iter++) {
            currentStackNode.red = prevR;
            currentStackNode.green = prevG;
            currentStackNode.blue = prevB;
            currentStackNode.alpha = prevA;
            currentStackNode = currentStackNode.nextNode;
        }

        yPosOffset = areaWidth; // Start of the next row for vertical calculations

        // Populate the rest of the stack with pixels within radius
        for (iter = 1; iter <= effectiveBlurStrength; iter++) {
            // Calculate pixel index for vertical access
            pixelIndex = (yPosOffset + xCoord) * pixelStride;
            radiusWeight = radiusPlusOne - iter;

            // Get pixel values
            prevR = pixelArray[pixelIndex];
            prevG = pixelArray[pixelIndex + 1];
            prevB = pixelArray[pixelIndex + 2];
            prevA = pixelArray[pixelIndex + 3];

            // Update stack node
            currentStackNode.red = prevR;
            currentStackNode.green = prevG;
            currentStackNode.blue = prevB;
            currentStackNode.alpha = prevA;

            // Add to total sums (weighted)
            redSum += prevR * radiusWeight;
            greenSum += prevG * radiusWeight;
            blueSum += prevB * radiusWeight;
            alphaSum += prevA * radiusWeight;

            // Add to in-sums (unweighted)
            redInSum += prevR;
            greenInSum += prevG;
            blueInSum += prevB;
            alphaInSum += prevA;

            currentStackNode = currentStackNode.nextNode;

            if (iter < heightLastIndex) {
                yPosOffset += areaWidth; // Move to the next row
            }
        }

        currentYIndex = xCoord; // Reset currentYIndex for vertical iteration
        stackInputPtr = firstStackNode;
        stackOutputPtr = lastStackNode;

        // Process each pixel in the column
        for (yCoord = 0; yCoord < areaHeight; yCoord++) {
            const currentPixelPos = currentYIndex * pixelStride;

            // Apply blur calculation for alpha
            let currentAlpha = (alphaSum * blurMul) >> blurShg;
            pixelArray[currentPixelPos + 3] = currentAlpha;

            // Apply blur calculation for RGB, handling transparent pixels
            if (currentAlpha > 0) {
                const alphaFactor = 255 / currentAlpha;
                pixelArray[currentPixelPos] = (((redSum * blurMul) >> blurShg) * alphaFactor);
                pixelArray[currentPixelPos + 1] = (((greenSum * blurMul) >> blurShg) * alphaFactor);
                pixelArray[currentPixelPos + 2] = (((blueSum * blurMul) >> blurShg) * alphaFactor);
            } else {
                pixelArray[currentPixelPos] = pixelArray[currentPixelPos + 1] = pixelArray[currentPixelPos + 2] = 0;
            }

            // Update sums for the next pixel
            redSum -= redOutSum;
            greenSum -= greenOutSum;
            blueSum -= blueOutSum;
            alphaSum -= alphaOutSum;

            redOutSum -= stackInputPtr.red;
            greenOutSum -= stackInputPtr.green;
            blueOutSum -= stackInputPtr.blue;
            alphaOutSum -= stackInputPtr.alpha;

            // Calculate index for the incoming pixel
            const nextPixelY = yCoord + radiusPlusOne;
            pixelIndex = (xCoord + (Math.min(heightLastIndex, nextPixelY) * areaWidth)) * pixelStride;

            // Update in-sums and total sums with the incoming pixel
            redInSum += (stackInputPtr.red = pixelArray[pixelIndex]);
            greenInSum += (stackInputPtr.green = pixelArray[pixelIndex + 1]);
            blueInSum += (stackInputPtr.blue = pixelArray[pixelIndex + 2]);
            alphaInSum += (stackInputPtr.alpha = pixelArray[pixelIndex + 3]);

            redSum += redInSum;
            greenSum += greenInSum;
            blueSum += blueInSum;
            alphaSum += alphaInSum;

            stackInputPtr = stackInputPtr.nextNode;

            // Update out-sums with the outgoing pixel
            redOutSum += (prevR = stackOutputPtr.red);
        	greenOutSum += (prevG = stackOutputPtr.green);
        	blueOutSum += (prevB = stackOutputPtr.blue);
        	alphaOutSum += (prevA = stackOutputPtr.alpha);

            // Subtract outgoing pixel from in-sums
        	redInSum -= prevR;
        	greenInSum -= prevG;
        	blueInSum -= prevB;
        	alphaInSum -= prevA;

            stackOutputPtr = stackOutputPtr.nextNode;

            currentYIndex += areaWidth; // Move to the next pixel in the column
        }
    }

    // Put the processed image data back onto the canvas
    ctx.putImageData(pixelData, offsetX, offsetY);
}


/**
 * Applies a blur filter to a specific rectangular area of a canvas, affecting only RGB channels.
 * @param {string} canvasTargetId - The ID of the canvas element.
 * @param {number} offsetX - X-coordinate of the top-left corner of the blur area.
 * @param {number} offsetY - Y-coordinate of the top-left corner of the blur area.
 * @param {number} areaWidth - Width of the blur area.
 * @param {number} areaHeight - Height of the blur area.
 * @param {number} blurStrength - The blur radius.
 */
function applyRGBFilter(canvasTargetId, offsetX, offsetY, areaWidth, areaHeight, blurStrength) {
    // Ensure blur strength is a positive integer
    let effectiveBlurStrength = Math.floor(blurStrength);
    if (effectiveBlurStrength < 1) {
        console.warn("Invalid blur strength provided for RGB filter. Must be >= 1.");
        return;
    }

    const canvasElem = document.getElementById(canvasTargetId);
    if (!canvasElem || !(canvasElem instanceof HTMLCanvasElement)) {
        console.error(`Canvas with ID '${canvasTargetId}' not found or is not a canvas element.`);
        return;
    }

    const ctx = canvasElem.getContext("2d");
    if (!ctx) {
        console.error("Could not obtain 2D rendering context.");
        return;
    }

    let pixelData;
    try {
        pixelData = ctx.getImageData(offsetX, offsetY, areaWidth, areaHeight);
    } catch (e) {
        console.error("Error accessing image data:", e);
        return;
    }

    if (!pixelData || !pixelData.data) {
        console.error("Failed to retrieve valid pixel data.");
        return;
    }

    const pixelArray = pixelData.data;

    let xCoord, yCoord, iter, pixelIndex, yPosOffset, currentYIndex,
        redSum, greenSum, blueSum,
        redOutSum, greenOutSum, blueOutSum,
        redInSum, greenInSum, blueInSum,
        prevR, prevG, prevB, radiusWeight;

    const blurDiameter = effectiveBlurStrength * 2 + 1;
    const pixelStride = 4; // RGBA, but alpha is ignored for calculations
    const widthTimesStride = areaWidth * pixelStride;
    const widthLastIndex = areaWidth - 1;
    const heightLastIndex = areaHeight - 1;
    const radiusPlusOne = effectiveBlurStrength + 1;
    const initialSumFactor = radiusPlusOne * (radiusPlusOne + 1) / 2;

    let firstStackNode = new BlurNode();
    let currentStackNode = firstStackNode;
    let lastStackNode = null;
    for (iter = 1; iter < blurDiameter; iter++) {
        currentStackNode = currentStackNode.nextNode = new BlurNode();
        if (iter === effectiveBlurStrength) {
            lastStackNode = currentStackNode;
        }
    }
    currentStackNode.nextNode = firstStackNode;

    let stackInputPtr = null;
    let stackOutputPtr = null;

    yPosOffset = currentYIndex = 0;

    const blurMul = _blurMultipliers[effectiveBlurStrength];
    const blurShg = _blurShifts[effectiveBlurStrength];

    // --- Horizontal Pass (RGB only) ---
    for (yCoord = 0; yCoord < areaHeight; yCoord++) {
        redInSum = greenInSum = blueInSum = 0;
        redSum = greenSum = blueSum = 0;

        prevR = pixelArray[currentYIndex];
        prevG = pixelArray[currentYIndex + 1];
        prevB = pixelArray[currentYIndex + 2];

        redOutSum = radiusPlusOne * prevR;
        greenOutSum = radiusPlusOne * prevG;
        blueOutSum = radiusPlusOne * prevB;

        redSum += initialSumFactor * prevR;
        greenSum += initialSumFactor * prevG;
        blueSum += initialSumFactor * prevB;

        currentStackNode = firstStackNode;
        for (iter = 0; iter < radiusPlusOne; iter++) {
            currentStackNode.red = prevR;
            currentStackNode.green = prevG;
            currentStackNode.blue = prevB;
            currentStackNode = currentStackNode.nextNode;
        }

        for (iter = 1; iter < radiusPlusOne; iter++) {
            pixelIndex = currentYIndex + (Math.min(widthLastIndex, iter) * pixelStride);
            radiusWeight = radiusPlusOne - iter;

            prevR = pixelArray[pixelIndex];
            prevG = pixelArray[pixelIndex + 1];
            prevB = pixelArray[pixelIndex + 2];

            currentStackNode.red = prevR;
            currentStackNode.green = prevG;
            currentStackNode.blue = prevB;

            redSum += prevR * radiusWeight;
            greenSum += prevG * radiusWeight;
            blueSum += prevB * radiusWeight;

            redInSum += prevR;
            greenInSum += prevG;
            blueInSum += prevB;

            currentStackNode = currentStackNode.nextNode;
        }

        stackInputPtr = firstStackNode;
        stackOutputPtr = lastStackNode;

        for (xCoord = 0; xCoord < areaWidth; xCoord++) {
            pixelArray[currentYIndex] = (redSum * blurMul) >> blurShg;
            pixelArray[currentYIndex + 1] = (greenSum * blurMul) >> blurShg;
            pixelArray[currentYIndex + 2] = (blueSum * blurMul) >> blurShg;

            redSum -= redOutSum;
            greenSum -= greenOutSum;
            blueSum -= blueOutSum;

            redOutSum -= stackInputPtr.red;
            greenOutSum -= stackInputPtr.green;
            blueOutSum -= stackInputPtr.blue;

            const nextPixelX = xCoord + effectiveBlurStrength + 1;
            pixelIndex = (yPosOffset + Math.min(widthLastIndex, nextPixelX)) * pixelStride;

            redInSum += (stackInputPtr.red = pixelArray[pixelIndex]);
            greenInSum += (stackInputPtr.green = pixelArray[pixelIndex + 1]);
            blueInSum += (stackInputPtr.blue = pixelArray[pixelIndex + 2]);

            redSum += redInSum;
            greenSum += greenInSum;
            blueSum += blueInSum;

            stackInputPtr = stackInputPtr.nextNode;

            redOutSum += (prevR = stackOutputPtr.red);
            greenOutSum += (prevG = stackOutputPtr.green);
            // The original code was truncated here. Assuming it should complete similar to RGBA.
            // Completing the missing part for Type III clone.
            blueOutSum += (prevB = stackOutputPtr.blue);

            redInSum -= prevR;
            greenInSum -= prevG;
            blueInSum -= prevB;

            stackOutputPtr = stackOutputPtr.nextNode;

            currentYIndex += pixelStride;
        }
        yPosOffset += areaWidth;
    }


    // --- Vertical Pass (RGB only) ---
    for (xCoord = 0; xCoord < areaWidth; xCoord++) {
        redInSum = greenInSum = blueInSum = 0;
        redSum = greenSum = blueSum = 0;

        currentYIndex = xCoord * pixelStride;

        prevR = pixelArray[currentYIndex];
        prevG = pixelArray[currentYIndex + 1];
        prevB = pixelArray[currentYIndex + 2];

        redOutSum = radiusPlusOne * prevR;
        greenOutSum = radiusPlusOne * prevG;
        blueOutSum = radiusPlusOne * prevB;

        redSum += initialSumFactor * prevR;
        greenSum += initialSumFactor * prevG;
        blueSum += initialSumFactor * prevB;

        currentStackNode = firstStackNode;
        for (iter = 0; iter < radiusPlusOne; iter++) {
            currentStackNode.red = prevR;
            currentStackNode.green = prevG;
            currentStackNode.blue = prevB;
            currentStackNode = currentStackNode.nextNode;
        }

        yPosOffset = areaWidth;

        for (iter = 1; iter <= effectiveBlurStrength; iter++) {
            pixelIndex = (yPosOffset + xCoord) * pixelStride;
            radiusWeight = radiusPlusOne - iter;

            prevR = pixelArray[pixelIndex];
            prevG = pixelArray[pixelIndex + 1];
            prevB = pixelArray[pixelIndex + 2];

            currentStackNode.red = prevR;
            currentStackNode.green = prevG;
            currentStackNode.blue = prevB;

            redSum += prevR * radiusWeight;
            greenSum += prevG * radiusWeight;
            blueSum += prevB * radiusWeight;

            redInSum += prevR;
            greenInSum += prevG;
            blueInSum += prevB;

            currentStackNode = currentStackNode.nextNode;

            if (iter < heightLastIndex) {
                yPosOffset += areaWidth;
            }
        }

        currentYIndex = xCoord;
        stackInputPtr = firstStackNode;
        stackOutputPtr = lastStackNode;

        for (yCoord = 0; yCoord < areaHeight; yCoord++) {
            const currentPixelPos = currentYIndex * pixelStride;

            pixelArray[currentPixelPos] = (redSum * blurMul) >> blurShg;
            pixelArray[currentPixelPos + 1] = (greenSum * blurMul) >> blurShg;
            pixelArray[currentPixelPos + 2] = (blueSum * blurMul) >> blurShg;

            redSum -= redOutSum;
            greenSum -= greenOutSum;
            blueSum -= blueOutSum;

            redOutSum -= stackInputPtr.red;
            greenOutSum -= stackInputPtr.green;
            blueOutSum -= stackInputPtr.blue;

            const nextPixelY = yCoord + radiusPlusOne;
            pixelIndex = (xCoord + (Math.min(heightLastIndex, nextPixelY) * areaWidth)) * pixelStride;

            redInSum += (stackInputPtr.red = pixelArray[pixelIndex]);
            greenInSum += (stackInputPtr.green = pixelArray[pixelIndex + 1]);
            blueInSum += (stackInputPtr.blue = pixelArray[pixelIndex + 2]);

            redSum += redInSum;
            greenSum += greenInSum;
            blueSum += blueInSum;

            stackInputPtr = stackInputPtr.nextNode;

            redOutSum += (prevR = stackOutputPtr.red);
            greenOutSum += (prevG = stackOutputPtr.green);
            blueOutSum += (prevB = stackOutputPtr.blue);

            redInSum -= prevR;
            greenInSum -= prevG;
            blueInSum -= prevB;

            stackOutputPtr = stackOutputPtr.nextNode;

            currentYIndex += areaWidth;
        }
    }

    ctx.putImageData(pixelData, offsetX, offsetY);
}