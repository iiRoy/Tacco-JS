const magicTableA = [
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
    289,287,285,282,280,278,275,273,271,269,267,265,263,261,259];

const shiftTableA = [
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
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24 ];

class ColorElement {
    constructor(redVal=0, greenVal=0, blueVal=0, alphaVal=0) {
        this.red = redVal;
        this.green = greenVal;
        this.blue = blueVal;
        this.alpha = alphaVal;
    }
}

function applyArtisticBlur(sourceImageId, targetCanvasId, effectRadius, includeAlphaChannel) {
    const visualAsset = document.getElementById(sourceImageId);
    if (!visualAsset) {
        // alert("Image asset not found: " + sourceImageId); // Original uses alert
        return;
    }

    const naturalWidth = visualAsset.naturalWidth;
    const naturalHeight = visualAsset.naturalHeight;

    const canvasSurface = document.getElementById(targetCanvasId);
    if (!canvasSurface) {
        // alert("Canvas surface not found: " + targetCanvasId); // Original uses alert
        return;
    }

    canvasSurface.style.width = naturalWidth + "px";
    canvasSurface.style.height = naturalHeight + "px";
    canvasSurface.width = naturalWidth;
    canvasSurface.height = naturalHeight;

    const surfaceContext = canvasSurface.getContext("2d");
    surfaceContext.clearRect(0, 0, naturalWidth, naturalHeight);
    surfaceContext.drawImage(visualAsset, 0, 0);

    if (isNaN(effectRadius) || effectRadius < 1) {
        return;
    }

    processImageBlend(targetCanvasId, 0, 0, naturalWidth, naturalHeight, effectRadius, includeAlphaChannel);
}

function processImageBlend(canvasId, offsetX, offsetY, imgWidth, imgHeight, blurStrength, useAlpha) {
    if (isNaN(blurStrength) || blurStrength < 1) return;
    blurStrength = blurStrength | 0;

    const canvasElement = document.getElementById(canvasId);
    const renderContext = canvasElement.getContext("2d");
    let pixelDataContainer;

    try {
        pixelDataContainer = renderContext.getImageData(offsetX, offsetY, imgWidth, imgHeight);
    } catch (e) {
        // Replicating original's error handling for local files / security
        try {
            netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
            pixelDataContainer = renderContext.getImageData(offsetX, offsetY, imgWidth, imgHeight);
        } catch(e2) {
            alert("Cannot access local image");
            throw new Error("unable to access local image data: " + e2);
        }
    }

    const rawPixels = pixelDataContainer.data;
    const channelCount = useAlpha ? 4 : 3;

    const pixelObjects = [];
    for (let i = 0; i < rawPixels.length; i += 4) {
        pixelObjects.push(new ColorElement(rawPixels[i], rawPixels[i+1], rawPixels[i+2], rawPixels[i+3]));
    }

    const processedPixels = applyBlurPasses(pixelObjects, imgWidth, imgHeight, blurStrength, channelCount);

    for (let i = 0; i < processedPixels.length; i++) {
        const p = processedPixels[i];
        rawPixels[i * 4]     = p.red;
        rawPixels[i * 4 + 1] = p.green;
        rawPixels[i * 4 + 2] = p.blue;
        rawPixels[i * 4 + 3] = p.alpha;
    }

    renderContext.putImageData(pixelDataContainer, offsetX, offsetY);
}

function applyBlurPasses(pixelObjectsArray, imageWidth, imageHeight, radiusValue, componentCount) {
    let currentPixelData = Array.from(pixelObjectsArray);

    for (let currentY = 0; currentY < imageHeight; currentY++) {
        const rowStartIdx = currentY * imageWidth;
        const rowPixels = currentPixelData.slice(rowStartIdx, rowStartIdx + imageWidth);
        const blurredRow = performOneDimensionalBlend(rowPixels, radiusValue, componentCount);
        blurredRow.forEach((p, idx) => {
            currentPixelData[rowStartIdx + idx] = p;
        });
    }

    for (let currentX = 0; currentX < imageWidth; currentX++) {
        const columnPixels = Array(imageHeight);
        for (let currentY = 0; currentY < imageHeight; currentY++) {
            columnPixels[currentY] = currentPixelData[currentY * imageWidth + currentX];
        }
        const blurredColumn = performOneDimensionalBlend(columnPixels, radiusValue, componentCount);
        blurredColumn.forEach((p, idx) => {
            currentPixelData[idx * imageWidth + currentX] = p;
        });
    }

    return currentPixelData;
}

function performOneDimensionalBlend(inputPixelSequence, blendRadius, numChannels) {
    const sequenceLength = inputPixelSequence.length;
    const resultSequence = new Array(sequenceLength);

    const filterSize = blendRadius * 2 + 1;
    const filterMultiplier = magicTableA[blendRadius];
    const filterShift = shiftTableA[blendRadius];

    const radiusPlusOne = blendRadius + 1;
    const sumAccumulator = radiusPlusOne * (radiusPlusOne + 1) / 2;

    const pixelWindowElements = new Array(filterSize).fill(null).map(() => new ColorElement());

    let currentTotalRed = 0;
    let currentTotalGreen = 0;
    let currentTotalBlue = 0;
    let currentTotalAlpha = 0;

    let rightSideSumRed = 0;
    let rightSideSumGreen = 0;
    let rightSideSumBlue = 0;
    let rightSideSumAlpha = 0;

    let leftSideSumRed = 0;
    let leftSideSumGreen = 0;
    let leftSideSumBlue = 0;
    let leftSideSumAlpha = 0;

    let bufferHead = 0;
    let bufferTail = radiusPlusOne;

    const firstActualPixel = inputPixelSequence[0];

    leftSideSumRed = radiusPlusOne * firstActualPixel.red;
    leftSideSumGreen = radiusPlusOne * firstActualPixel.green;
    leftSideSumBlue = radiusPlusOne * firstActualPixel.blue;
    leftSideSumAlpha = radiusPlusOne * firstActualPixel.alpha;

    currentTotalRed = sumAccumulator * firstActualPixel.red;
    currentTotalGreen = sumAccumulator * firstActualPixel.green;
    currentTotalBlue = sumAccumulator * firstActualPixel.blue;
    currentTotalAlpha = sumAccumulator * firstActualPixel.alpha;

    for (let i = 0; i < radiusPlusOne; i++) {
        pixelWindowElements[i].red = firstActualPixel.red;
        pixelWindowElements[i].green = firstActualPixel.green;
        pixelWindowElements[i].blue = firstActualPixel.blue;
        pixelWindowElements[i].alpha = firstActualPixel.alpha;
    }

    for (let i = 1; i < radiusPlusOne; i++) {
        const pixelSourceIndex = Math.min(sequenceLength - 1, i);
        const actualPixel = inputPixelSequence[pixelSourceIndex];
        const weightFactor = radiusPlusOne - i;

        pixelWindowElements[i + blendRadius].red = actualPixel.red;
        pixelWindowElements[i + blendRadius].green = actualPixel.green;
        pixelWindowElements[i + blendRadius].blue = actualPixel.blue;
        pixelWindowElements[i + blendRadius].alpha = actualPixel.alpha;

        currentTotalRed += actualPixel.red * weightFactor;
        currentTotalGreen += actualPixel.green * weightFactor;
        currentTotalBlue += actualPixel.blue * weightFactor;
        currentTotalAlpha += actualPixel.alpha * weightFactor;

        rightSideSumRed += actualPixel.red;
        rightSideSumGreen += actualPixel.green;
        rightSideSumBlue += actualPixel.blue;
        rightSideSumAlpha += actualPixel.alpha;
    }

    for (let currentPixelIndex = 0; currentPixelIndex < sequenceLength; currentPixelIndex++) {
        const outputPixel = new ColorElement();

        outputPixel.alpha = (currentTotalAlpha * filterMultiplier) >> filterShift;
        if (numChannels === 4 && outputPixel.alpha !== 0) {
            const alphaCorrection = 255 / outputPixel.alpha;
            outputPixel.red = (((currentTotalRed * filterMultiplier) >> filterShift) * alphaCorrection) | 0;
            outputPixel.green = (((currentTotalGreen * filterMultiplier) >> filterShift) * alphaCorrection) | 0;
            outputPixel.blue = (((currentTotalBlue * filterMultiplier) >> filterShift) * alphaCorrection) | 0;
        } else {
            outputPixel.red = (currentTotalRed * filterMultiplier) >> filterShift;
            outputPixel.green = (currentTotalGreen * filterMultiplier) >> filterShift;
            outputPixel.blue = (currentTotalBlue * filterMultiplier) >> filterShift;
            if (numChannels === 3) outputPixel.alpha = 255;
        }
        resultSequence[currentPixelIndex] = outputPixel;

        currentTotalRed -= leftSideSumRed;
        currentTotalGreen -= leftSideSumGreen;
        currentTotalBlue -= leftSideSumBlue;
        currentTotalAlpha -= leftSideSumAlpha;

        const pixelLeavingWindow = pixelWindowElements[bufferHead];
        leftSideSumRed -= pixelLeavingWindow.red;
        leftSideSumGreen -= pixelLeavingWindow.green;
        leftSideSumBlue -= pixelLeavingWindow.blue;
        leftSideSumAlpha -= pixelLeavingWindow.alpha;

        const nextIncomingPixelSourceIndex = currentPixelIndex + blendRadius + 1;
        const newIncomingPixel = (nextIncomingPixelSourceIndex < sequenceLength) ?
            inputPixelSequence[nextIncomingPixelSourceIndex] :
            inputPixelSequence[Math.max(0, sequenceLength - 1)];

        const bufferSlotForIncoming = pixelWindowElements[bufferHead];
        bufferSlotForIncoming.red = newIncomingPixel.red;
        bufferSlotForIncoming.green = newIncomingPixel.green;
        bufferSlotForIncoming.blue = newIncomingPixel.blue;
        bufferSlotForIncoming.alpha = newIncomingPixel.alpha;

        currentTotalRed += (rightSideSumRed += bufferSlotForIncoming.red);
        currentTotalGreen += (rightSideSumGreen += bufferSlotForIncoming.green);
        currentTotalBlue += (rightSideSumBlue += bufferSlotForIncoming.blue);
        currentTotalAlpha += (rightSideSumAlpha += bufferSlotForIncoming.alpha);

        const pixelBecomingOldest = pixelWindowElements[bufferTail];
        leftSideSumRed += pixelBecomingOldest.red;
        leftSideSumGreen += pixelBecomingOldest.green;
        leftSideSumBlue += pixelBecomingOldest.blue;
        leftSideSumAlpha += pixelBecomingOldest.alpha;

        rightSideSumRed -= pixelBecomingOldest.red;
        rightSideSumGreen -= pixelBecomingOldest.green;
        rightSideSumBlue -= pixelBecomingOldest.blue;
        rightSideSumAlpha -= pixelBecomingOldest.alpha;

        bufferHead = (bufferHead + 1) % filterSize;
        bufferTail = (bufferTail + 1) % filterSize;
    }

    return resultSequence;
}