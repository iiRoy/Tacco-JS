const colorFactorMap = [
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

const shiftValueMap = [
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

class ColorNode {
    constructor() {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.alpha = 0;
        this.next = null;
    }
}

function validateBlurStrength(strength) {
    if (isNaN(strength) || strength < 1) {
        console.warn("Invalid blur strength provided. Must be a number >= 1. Defaulting to 1.");
        return 1;
    }
    return Math.floor(strength);
}

function getCanvasAndContext(canvasInput) {
    let canvasElement;
    if (typeof canvasInput === "string") {
        canvasElement = document.getElementById(canvasInput);
        if (!canvasElement) {
            throw new Error(`Canvas element with ID '${canvasInput}' not found.`);
        }
    } else if (canvasInput instanceof HTMLCanvasElement) {
        canvasElement = canvasInput;
    } else {
        throw new TypeError("Invalid canvas input. Must be an ID string or an HTMLCanvasElement.");
    }

    const renderingContext = canvasElement.getContext("2d");
    if (!renderingContext) {
        throw new Error("Failed to get 2D rendering context for the canvas.");
    }

    return { element: canvasElement, context: renderingContext };
}

function processImageForBlur(sourceImgId, targetCanvasId, blurStrength, includeAlpha) {
    const sourceImageElement = document.getElementById(sourceImgId);
    if (!sourceImageElement) {
        console.error(`Source image element with ID '${sourceImgId}' not found.`);
        return;
    }

    const imageWidth = sourceImageElement.naturalWidth;
    const imageHeight = sourceImageElement.naturalHeight;

    let { element: outputCanvasElement, context: canvasRenderContext } = getCanvasAndContext(targetCanvasId);

    outputCanvasElement.style.width = `${imageWidth}px`;
    outputCanvasElement.style.height = `${imageHeight}px`;
    outputCanvasElement.width = imageWidth;
    outputCanvasElement.height = imageHeight;

    canvasRenderContext.clearRect(0, 0, imageWidth, imageHeight);
    canvasRenderContext.drawImage(sourceImageElement, 0, 0);

    const validatedBlurStrength = validateBlurStrength(blurStrength);

    if (includeAlpha) {
        applyAlphaChannelBlur(outputCanvasElement, 0, 0, imageWidth, imageHeight, validatedBlurStrength);
    } else {
        applyColorChannelBlur(outputCanvasElement, 0, 0, imageWidth, imageHeight, validatedBlurStrength);
    }
}

function applyAlphaChannelBlur(targetCanvas, offsetX, offsetY, regionWidth, regionHeight, blurStrength) {
    const validatedStrength = validateBlurStrength(blurStrength);

    let { element: canvasElement, context: canvasRenderContext } = getCanvasAndContext(targetCanvas);

    let pixelData;
    try {
        pixelData = canvasRenderContext.getImageData(offsetX, offsetY, regionWidth, regionHeight);
    } catch (error) {
        console.error("Cannot access image data. Ensure image is from the same origin or CORS is enabled.", error);
        throw new Error("Unable to access image data: " + error.message);
    }

    const pixelArray = pixelData.data;

    let colIdx, rowIdx, loopIdx, tempPixelIdx;
    let currentPixelOffset, prevRowOffset;

    let totalRed, totalGreen, totalBlue, totalAlpha;
    let exitRed, exitGreen, exitBlue, exitAlpha;
    let enterRed, enterGreen, enterBlue, enterAlpha;
    let currentRed, currentGreen, currentBlue, currentAlpha;
    let weightFactor;

    const blurKernelSize = (validatedStrength * 2) + 1;
    const maxRegionX = regionWidth - 1;
    const maxRegionY = regionHeight - 1;
    const kernelHalfSizePlusOne = validatedStrength + 1;
    const initialSumFactor = kernelHalfSizePlusOne * (kernelHalfSizePlusOne + 1) / 2;

    let firstStackNode = new ColorNode();
    let currentNode = firstStackNode;
    let lastStackNode;

    for (loopIdx = 1; loopIdx < blurKernelSize; loopIdx++) {
        currentNode = currentNode.next = new ColorNode();
        if (loopIdx === validatedStrength) {
            lastStackNode = currentNode;
        }
    }
    currentNode.next = firstStackNode;

    let inputNode = null;
    let outputNode = null;

    prevRowOffset = currentPixelOffset = 0;

    const currentMultiplyFactor = colorFactorMap[validatedStrength];
    const currentShiftFactor = shiftValueMap[validatedStrength];

    for (rowIdx = 0; rowIdx < regionHeight; rowIdx++) {
        totalRed = totalGreen = totalBlue = totalAlpha = 0;
        enterRed = enterGreen = enterBlue = enterAlpha = 0;
        exitRed = exitGreen = exitBlue = exitAlpha = 0;

        currentRed = pixelArray[currentPixelOffset];
        currentGreen = pixelArray[currentPixelOffset + 1];
        currentBlue = pixelArray[currentPixelOffset + 2];
        currentAlpha = pixelArray[currentPixelOffset + 3];

        exitRed = kernelHalfSizePlusOne * currentRed;
        exitGreen = kernelHalfSizePlusOne * currentGreen;
        exitBlue = kernelHalfSizePlusOne * currentBlue;
        exitAlpha = kernelHalfSizePlusOne * currentAlpha;

        totalRed += initialSumFactor * currentRed;
        totalGreen += initialSumFactor * currentGreen;
        totalBlue += initialSumFactor * currentBlue;
        totalAlpha += initialSumFactor * currentAlpha;

        currentNode = firstStackNode;
        for (loopIdx = 0; loopIdx < kernelHalfSizePlusOne; loopIdx++) {
            currentNode.red = currentRed;
            currentNode.green = currentGreen;
            currentNode.blue = currentBlue;
            currentNode.alpha = currentAlpha;
            currentNode = currentNode.next;
        }

        for (loopIdx = 1; loopIdx < kernelHalfSizePlusOne; loopIdx++) {
            tempPixelIdx = currentPixelOffset + (Math.min(maxRegionX, loopIdx) * 4);

            currentRed = pixelArray[tempPixelIdx];
            currentGreen = pixelArray[tempPixelIdx + 1];
            currentBlue = pixelArray[tempPixelIdx + 2];
            currentAlpha = pixelArray[tempPixelIdx + 3];

            weightFactor = kernelHalfSizePlusOne - loopIdx;

            totalRed += (currentNode.red = currentRed) * weightFactor;
            totalGreen += (currentNode.green = currentGreen) * weightFactor;
            totalBlue += (currentNode.blue = currentBlue) * weightFactor;
            totalAlpha += (currentNode.alpha = currentAlpha) * weightFactor;

            enterRed += currentRed;
            enterGreen += currentGreen;
            enterBlue += currentBlue;
            enterAlpha += currentAlpha;

            currentNode = currentNode.next;
        }

        inputNode = firstStackNode;
        outputNode = lastStackNode;

        for (colIdx = 0; colIdx < regionWidth; colIdx++) {
            currentAlpha = (totalAlpha * currentMultiplyFactor) >> currentShiftFactor;
            pixelArray[currentPixelOffset + 3] = currentAlpha;

            if (currentAlpha !== 0) {
                const inverseAlpha = 255 / currentAlpha;
                pixelArray[currentPixelOffset] = (((totalRed * currentMultiplyFactor) >> currentShiftFactor) * inverseAlpha) | 0;
                pixelArray[currentPixelOffset + 1] = (((totalGreen * currentMultiplyFactor) >> currentShiftFactor) * inverseAlpha) | 0;
                pixelArray[currentPixelOffset + 2] = (((totalBlue * currentMultiplyFactor) >> currentShiftFactor) * inverseAlpha) | 0;
            } else {
                pixelArray[currentPixelOffset] = pixelArray[currentPixelOffset + 1] = pixelArray[currentPixelOffset + 2] = 0;
            }

            totalRed -= exitRed;
            totalGreen -= exitGreen;
            totalBlue -= exitBlue;
            totalAlpha -= exitAlpha;

            exitRed -= inputNode.red;
            exitGreen -= inputNode.green;
            exitBlue -= inputNode.blue;
            exitAlpha -= inputNode.alpha;

            tempPixelIdx = prevRowOffset + (Math.min(maxRegionX, colIdx + validatedStrength + 1) * 4);

            enterRed += (inputNode.red = pixelArray[tempPixelIdx]);
            enterGreen += (inputNode.green = pixelArray[tempPixelIdx + 1]);
            enterBlue += (inputNode.blue = pixelArray[tempPixelIdx + 2]);
            enterAlpha += (inputNode.alpha = pixelArray[tempPixelIdx + 3]);

            totalRed += enterRed;
            totalGreen += enterGreen;
            totalBlue += enterBlue;
            totalAlpha += enterAlpha;

            inputNode = inputNode.next;

            currentRed = outputNode.red;
            currentGreen = outputNode.green;
            currentBlue = outputNode.blue;
            currentAlpha = outputNode.alpha;

            exitRed += currentRed;
            exitGreen += currentGreen;
            exitBlue += currentBlue;
            exitAlpha += currentAlpha;

            enterRed -= currentRed;
            enterGreen -= currentGreen;
            enterBlue -= currentBlue;
            enterAlpha -= currentAlpha;

            outputNode = outputNode.next;

            currentPixelOffset += 4;
        }
        prevRowOffset += regionWidth * 4;
    }

    prevRowOffset = 0;
    for (colIdx = 0; colIdx < regionWidth; colIdx++) {
        totalRed = totalGreen = totalBlue = totalAlpha = 0;
        enterRed = enterGreen = enterBlue = enterAlpha = 0;
        exitRed = exitGreen = exitBlue = exitAlpha = 0;

        currentPixelOffset = colIdx * 4;

        currentRed = pixelArray[currentPixelOffset];
        currentGreen = pixelArray[currentPixelOffset + 1];
        currentBlue = pixelArray[currentPixelOffset + 2];
        currentAlpha = pixelArray[currentPixelOffset + 3];

        exitRed = kernelHalfSizePlusOne * currentRed;
        exitGreen = kernelHalfSizePlusOne * currentGreen;
        exitBlue = kernelHalfSizePlusOne * currentBlue;
        exitAlpha = kernelHalfSizePlusOne * currentAlpha;

        totalRed += initialSumFactor * currentRed;
        totalGreen += initialSumFactor * currentGreen;
        totalBlue += initialSumFactor * currentBlue;
        totalAlpha += initialSumFactor * currentAlpha;

        currentNode = firstStackNode;
        for (loopIdx = 0; loopIdx < kernelHalfSizePlusOne; loopIdx++) {
            currentNode.red = currentRed;
            currentNode.green = currentGreen;
            currentNode.blue = currentBlue;
            currentNode.alpha = currentAlpha;
            currentNode = currentNode.next;
        }

        let currentRowScanOffset = regionWidth;
        for (loopIdx = 1; loopIdx <= validatedStrength; loopIdx++) {
            currentPixelOffset = ( (currentRowScanOffset + colIdx) * 4 );

            currentRed = pixelArray[currentPixelOffset];
            currentGreen = pixelArray[currentPixelOffset + 1];
            currentBlue = pixelArray[currentPixelOffset + 2];
            currentAlpha = pixelArray[currentPixelOffset + 3];

            weightFactor = kernelHalfSizePlusOne - loopIdx;

            totalRed += (currentNode.red = currentRed) * weightFactor;
            totalGreen += (currentNode.green = currentGreen) * weightFactor;
            totalBlue += (currentNode.blue = currentBlue) * weightFactor;
            totalAlpha += (currentNode.alpha = currentAlpha) * weightFactor;

            enterRed += currentRed;
            enterGreen += currentGreen;
            enterBlue += currentBlue;
            enterAlpha += currentAlpha;

            currentNode = currentNode.next;

            if (loopIdx < maxRegionY) {
                currentRowScanOffset += regionWidth;
            }
        }

        currentPixelOffset = colIdx;
        inputNode = firstStackNode;
        outputNode = lastStackNode;

        for (rowIdx = 0; rowIdx < regionHeight; rowIdx++) {
            tempPixelIdx = currentPixelOffset * 4;

            currentAlpha = (totalAlpha * currentMultiplyFactor) >> currentShiftFactor;
            pixelArray[tempPixelIdx + 3] = currentAlpha;

            if (currentAlpha > 0) {
                const inverseAlpha = 255 / currentAlpha;
                pixelArray[tempPixelIdx] = (((totalRed * currentMultiplyFactor) >> currentShiftFactor) * inverseAlpha) | 0;
                pixelArray[tempPixelIdx + 1] = (((totalGreen * currentMultiplyFactor) >> currentShiftFactor) * inverseAlpha) | 0;
                pixelArray[tempPixelIdx + 2] = (((totalBlue * currentMultiplyFactor) >> currentShiftFactor) * inverseAlpha) | 0;
            } else {
                pixelArray[tempPixelIdx] = pixelArray[tempPixelIdx + 1] = pixelArray[tempPixelIdx + 2] = 0;
            }

            totalRed -= exitRed;
            totalGreen -= exitGreen;
            totalBlue -= exitBlue;
            totalAlpha -= exitAlpha;

            exitRed -= inputNode.red;
            exitGreen -= inputNode.green;
            exitBlue -= inputNode.blue;
            exitAlpha -= inputNode.alpha;

            const nextPixelRow = Math.min(maxRegionY, rowIdx + validatedStrength + 1);
            tempPixelIdx = (colIdx + (nextPixelRow * regionWidth)) * 4;

            enterRed += (inputNode.red = pixelArray[tempPixelIdx]);
            enterGreen += (inputNode.green = pixelArray[tempPixelIdx + 1]);
            enterBlue += (inputNode.blue = pixelArray[tempPixelIdx + 2]);
            enterAlpha += (inputNode.alpha = pixelArray[tempPixelIdx + 3]);

            totalRed += enterRed;
            totalGreen += enterGreen;
            totalBlue += enterBlue;
            totalAlpha += enterAlpha;

            inputNode = inputNode.next;

            currentRed = outputNode.red;
            currentGreen = outputNode.green;
            currentBlue = outputNode.blue;
            currentAlpha = outputNode.alpha;

            exitRed += currentRed;
            exitGreen += currentGreen;
            exitBlue += currentBlue;
            exitAlpha += currentAlpha;

            enterRed -= currentRed;
            enterGreen -= currentGreen;
            enterBlue -= currentBlue;
            enterAlpha -= currentAlpha;

            outputNode = outputNode.next;

            currentPixelOffset += regionWidth;
        }
    }

    canvasRenderContext.putImageData(pixelData, offsetX, offsetY);
}

function applyColorChannelBlur(targetCanvas, offsetX, offsetY, regionWidth, regionHeight, blurStrength) {
    const validatedStrength = validateBlurStrength(blurStrength);

    let { element: canvasElement, context: canvasRenderContext } = getCanvasAndContext(targetCanvas);

    let pixelData;
    try {
        pixelData = canvasRenderContext.getImageData(offsetX, offsetY, regionWidth, regionHeight);
    } catch (error) {
        console.error("Cannot access image data. Ensure image is from the same origin or CORS is enabled.", error);
        throw new Error("Unable to access image data: " + error.message);
    }

    const pixelArray = pixelData.data;

    let colIdx, rowIdx, loopIdx, tempPixelIdx;
    let currentPixelOffset, prevRowOffset;

    let totalRed, totalGreen, totalBlue;
    let exitRed, exitGreen, exitBlue;
    let enterRed, enterGreen, enterBlue;
    let currentRed, currentGreen, currentBlue;
    let weightFactor;

    const blurKernelSize = (validatedStrength * 2) + 1;
    const maxRegionX = regionWidth - 1;
    const maxRegionY = regionHeight - 1;
    const kernelHalfSizePlusOne = validatedStrength + 1;
    const initialSumFactor = kernelHalfSizePlusOne * (kernelHalfSizePlusOne + 1) / 2;

    let firstStackNode = new ColorNode();
    let currentNode = firstStackNode;
    let lastStackNode;

    for (loopIdx = 1; loopIdx < blurKernelSize; loopIdx++) {
        currentNode = currentNode.next = new ColorNode();
        if (loopIdx === validatedStrength) {
            lastStackNode = currentNode;
        }
    }
    currentNode.next = firstStackNode;

    let inputNode = null;
    let outputNode = null;

    prevRowOffset = currentPixelOffset = 0;

    const currentMultiplyFactor = colorFactorMap[validatedStrength];
    const currentShiftFactor = shiftValueMap[validatedStrength];

    for (rowIdx = 0; rowIdx < regionHeight; rowIdx++) {
        totalRed = totalGreen = totalBlue = 0;
        enterRed = enterGreen = enterBlue = 0;
        exitRed = exitGreen = exitBlue = 0;

        currentRed = pixelArray[currentPixelOffset];
        currentGreen = pixelArray[currentPixelOffset + 1];
        currentBlue = pixelArray[currentPixelOffset + 2];

        exitRed = kernelHalfSizePlusOne * currentRed;
        exitGreen = kernelHalfSizePlusOne * currentGreen;
        exitBlue = kernelHalfSizePlusOne * currentBlue;

        totalRed += initialSumFactor * currentRed;
        totalGreen += initialSumFactor * currentGreen;
        totalBlue += initialSumFactor * currentBlue;

        currentNode = firstStackNode;
        for (loopIdx = 0; loopIdx < kernelHalfSizePlusOne; loopIdx++) {
            currentNode.red = currentRed;
            currentNode.green = currentGreen;
            currentNode.blue = currentBlue;
            currentNode = currentNode.next;
        }

        for (loopIdx = 1; loopIdx < kernelHalfSizePlusOne; loopIdx++) {
            tempPixelIdx = currentPixelOffset + (Math.min(maxRegionX, loopIdx) * 4);

            currentRed = pixelArray[tempPixelIdx];
            currentGreen = pixelArray[tempPixelIdx + 1];
            currentBlue = pixelArray[tempPixelIdx + 2];

            weightFactor = kernelHalfSizePlusOne - loopIdx;

            totalRed += (currentNode.red = currentRed) * weightFactor;
            totalGreen += (currentNode.green = currentGreen) * weightFactor;
            totalBlue += (currentNode.blue = currentBlue) * weightFactor;

            enterRed += currentRed;
            enterGreen += currentGreen;
            enterBlue += currentBlue;

            currentNode = currentNode.next;
        }

        inputNode = firstStackNode;
        outputNode = lastStackNode;

        for (colIdx = 0; colIdx < regionWidth; colIdx++) {
            pixelArray[currentPixelOffset] = ((totalRed * currentMultiplyFactor) >> currentShiftFactor) | 0;
            pixelArray[currentPixelOffset + 1] = ((totalGreen * currentMultiplyFactor) >> currentShiftFactor) | 0;
            pixelArray[currentPixelOffset + 2] = ((totalBlue * currentMultiplyFactor) >> currentShiftFactor) | 0;

            totalRed -= exitRed;
            totalGreen -= exitGreen;
            totalBlue -= exitBlue;

            exitRed -= inputNode.red;
            exitGreen -= inputNode.green;
            exitBlue -= inputNode.blue;

            tempPixelIdx = prevRowOffset + (Math.min(maxRegionX, colIdx + validatedStrength + 1) * 4);

            enterRed += (inputNode.red = pixelArray[tempPixelIdx]);
            enterGreen += (inputNode.green = pixelArray[tempPixelIdx + 1]);
            enterBlue += (inputNode.blue = pixelArray[tempPixelIdx + 2]);

            totalRed += enterRed;
            totalGreen += enterGreen;
            totalBlue += enterBlue;

            inputNode = inputNode.next;

            currentRed = outputNode.red;
            currentGreen = outputNode.green;
            currentBlue = outputNode.blue;

            exitRed += currentRed;
            exitGreen += currentGreen;
            exitBlue += currentBlue;

            enterRed -= currentRed;
            enterGreen -= currentGreen;
            enterBlue -= currentBlue;

            outputNode = outputNode.next;

            currentPixelOffset += 4;
        }
        prevRowOffset += regionWidth * 4;
    }

    prevRowOffset = 0;
    for (colIdx = 0; colIdx < regionWidth; colIdx++) {
        totalRed = totalGreen = totalBlue = 0;
        enterRed = enterGreen = enterBlue = 0;
        exitRed = exitGreen = exitBlue = 0;

        currentPixelOffset = colIdx * 4;

        currentRed = pixelArray[currentPixelOffset];
        currentGreen = pixelArray[currentPixelOffset + 1];
        currentBlue = pixelArray[currentPixelOffset + 2];

        exitRed = kernelHalfSizePlusOne * currentRed;
        exitGreen = kernelHalfSizePlusOne * currentGreen;
        exitBlue = kernelHalfSizePlusOne * currentBlue;

        totalRed += initialSumFactor * currentRed;
        totalGreen += initialSumFactor * currentGreen;
        totalBlue += initialSumFactor * currentBlue;

        currentNode = firstStackNode;
        for (loopIdx = 0; loopIdx < kernelHalfSizePlusOne; loopIdx++) {
            currentNode.red = currentRed;
            currentNode.green = currentGreen;
            currentNode.blue = currentBlue;
            currentNode = currentNode.next;
        }

        let currentRowScanOffset = regionWidth;
        for (loopIdx = 1; loopIdx <= validatedStrength; loopIdx++) {
            currentPixelOffset = ( (currentRowScanOffset + colIdx) * 4 );

            currentRed = pixelArray[currentPixelOffset];
            currentGreen = pixelArray[currentPixelOffset + 1];
            currentBlue = pixelArray[currentPixelOffset + 2];

            weightFactor = kernelHalfSizePlusOne - loopIdx;

            totalRed += (currentNode.red = currentRed) * weightFactor;
            totalGreen += (currentNode.green = currentGreen) * weightFactor;
            totalBlue += (currentNode.blue = currentBlue) * weightFactor;

            enterRed += currentRed;
            enterGreen += currentGreen;
            enterBlue += currentBlue;

            currentNode = currentNode.next;

            if (loopIdx < maxRegionY) {
                currentRowScanOffset += regionWidth;
            }
        }

        currentPixelOffset = colIdx;
        inputNode = firstStackNode;
        outputNode = lastStackNode;

        for (rowIdx = 0; rowIdx < regionHeight; rowIdx++) {
            tempPixelIdx = currentPixelOffset * 4;

            pixelArray[tempPixelIdx] = ((totalRed * currentMultiplyFactor) >> currentShiftFactor) | 0;
            pixelArray[tempPixelIdx + 1] = ((totalGreen * currentMultiplyFactor) >> currentShiftFactor) | 0;
            pixelArray[tempPixelIdx + 2] = ((totalBlue * currentMultiplyFactor) >> currentShiftFactor) | 0;

            totalRed -= exitRed;
            totalGreen -= exitGreen;
            totalBlue -= exitBlue;

            exitRed -= inputNode.red;
            exitGreen -= inputNode.green;
            exitBlue -= inputNode.blue;

            const nextPixelRow = Math.min(maxRegionY, rowIdx + validatedStrength + 1);
            tempPixelIdx = (colIdx + (nextPixelRow * regionWidth)) * 4;

            enterRed += (inputNode.red = pixelArray[tempPixelIdx]);
            enterGreen += (inputNode.green = pixelArray[tempPixelIdx + 1]);
            enterBlue += (inputNode.blue = pixelArray[tempPixelIdx + 2]);

            totalRed += enterRed;
            totalGreen += enterGreen;
            totalBlue += enterBlue;

            inputNode = inputNode.next;

            currentRed = outputNode.red;
            currentGreen = outputNode.green;
            currentBlue = outputNode.blue;

            exitRed += currentRed;
            exitGreen += currentGreen;
            exitBlue += currentBlue;

            enterRed -= currentRed;
            enterGreen -= currentGreen;
            enterBlue -= currentBlue;

            outputNode = outputNode.next;

            currentPixelOffset += regionWidth;
        }
    }

    canvasRenderContext.putImageData(pixelData, offsetX, offsetY);
}