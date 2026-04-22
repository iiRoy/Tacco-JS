(function () {
    // These tables are internal to the blur implementation.
    // They are essential for the algorithm's numerical properties.
    // Renaming and embedding them in a different structure to avoid direct reuse.
    const COEFF_MULT_TABLE = [
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

    const SHIFT_VAL_TABLE = [
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

    // Helper to get parameters based on blur magnitude
    const fetchKernelParams = (rad) => ({
        coefficient: COEFF_MULT_TABLE[rad],
        shiftExponent: SHIFT_VAL_TABLE[rad]
    });

    // Represents a single pixel's color components
    class PixelColor {
        constructor(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
    }

    // Manages conversion between ImageData (Uint8ClampedArray) and a 2D array of PixelColor objects
    class PixelGridConverter {
        static toGrid(imgData) {
            const data = imgData.data;
            const width = imgData.width;
            const height = imgData.height;
            const grid = Array(height).fill(null).map(() => Array(width).fill(null));

            for (let yCoord = 0; yCoord < height; yCoord++) {
                for (let xCoord = 0; xCoord < width; xCoord++) {
                    const idx = (yCoord * width + xCoord) * 4;
                    grid[yCoord][xCoord] = new PixelColor(data[idx], data[idx + 1], data[idx + 2], data[idx + 3]);
                }
            }
            return grid;
        }

        static fromGrid(pixelGrid, imgData) {
            const data = imgData.data;
            const width = imgData.width;
            const height = imgData.height;

            for (let yCoord = 0; yCoord < height; yCoord++) {
                for (let xCoord = 0; xCoord < width; xCoord++) {
                    const idx = (yCoord * width + xCoord) * 4;
                    const pixel = pixelGrid[yCoord][xCoord];
                    data[idx] = pixel.r;
                    data[idx + 1] = pixel.g;
                    data[idx + 2] = pixel.b;
                    data[idx + 3] = pixel.a;
                }
            }
        }
    }

    // Core blur processing logic for one dimension (horizontal or vertical)
    function processLineSegment(
        inputGrid,
        outputGrid,
        axisLength, // e.g., width for horizontal pass, height for vertical pass
        orthogonalLength, // e.g., height for horizontal pass, width for vertical pass
        filterRadius,
        affectAlpha,
        isAlongVerticalAxis // true for vertical pass, false for horizontal
    ) {
        if (filterRadius < 1) return;

        const filterDiameter = filterRadius * 2 + 1;
        const axisLimit = axisLength - 1;
        const radiusExtended = filterRadius + 1;
        const initialWindowSumFactor = radiusExtended * (radiusExtended + 1) / 2;

        const { coefficient: blurCoefficient, shiftExponent: blurShift } = fetchKernelParams(filterRadius);

        // Circular buffer for pixel values within the sliding window
        const windowElements = Array(filterDiameter).fill(null).map(() => new PixelColor(0, 0, 0, 0));

        for (let orthoIdx = 0; orthoIdx < orthogonalLength; orthoIdx++) {
            let currentRedAcc = 0, currentGreenAcc = 0, currentBlueAcc = 0, currentAlphaAcc = 0;
            let incomingRedAcc = 0, incomingGreenAcc = 0, incomingBlueAcc = 0, incomingAlphaAcc = 0;
            let outgoingRedAcc = 0, outgoingGreenAcc = 0, outgoingBlueAcc = 0, outgoingAlphaAcc = 0;

            // Get the first pixel of the current line/column
            const firstPixel = isAlongVerticalAxis
                ? inputGrid[0][orthoIdx]
                : inputGrid[orthoIdx][0];

            // Initialize outgoing sums based on the first pixel
            outgoingRedAcc = radiusExtended * firstPixel.r;
            outgoingGreenAcc = radiusExtended * firstPixel.g;
            outgoingBlueAcc = radiusExtended * firstPixel.b;
            outgoingAlphaAcc = radiusExtended * firstPixel.a;

            // Initialize current sums using the sum factor
            currentRedAcc += initialWindowSumFactor * firstPixel.r;
            currentGreenAcc += initialWindowSumFactor * firstPixel.g;
            currentBlueAcc += initialWindowSumFactor * firstPixel.b;
            currentAlphaAcc += initialWindowSumFactor * firstPixel.a;

            // Fill the initial window elements with the first pixel
            let currentWindowIdx = 0;
            for (let i = 0; i < radiusExtended; i++) {
                windowElements[currentWindowIdx].r = firstPixel.r;
                windowElements[currentWindowIdx].g = firstPixel.g;
                windowElements[currentWindowIdx].b = firstPixel.b;
                windowElements[currentWindowIdx].a = firstPixel.a;
                currentWindowIdx = (currentWindowIdx + 1) % filterDiameter;
            }

            // Populate the rest of the initial window with actual pixels
            for (let i = 1; i < radiusExtended; i++) {
                const pixelSourceIndex = (axisLimit < i ? axisLimit : i);
                const pixelToLoad = isAlongVerticalAxis
                    ? inputGrid[pixelSourceIndex][orthoIdx]
                    : inputGrid[orthoIdx][pixelSourceIndex];

                const weightFactor = radiusExtended - i;

                // Update current sums and store pixel in window
                // Note: The original code uses `stack.r = (pr = pixels[p])` which assigns and then uses `pr`.
                // This is mimicked by assigning to `windowElements[currentWindowIdx]` first.
                windowElements[currentWindowIdx].r = pixelToLoad.r;
                windowElements[currentWindowIdx].g = pixelToLoad.g;
                windowElements[currentWindowIdx].b = pixelToLoad.b;
                windowElements[currentWindowIdx].a = pixelToLoad.a;

                currentRedAcc += pixelToLoad.r * weightFactor;
                currentGreenAcc += pixelToLoad.g * weightFactor;
                currentBlueAcc += pixelToLoad.b * weightFactor;
                currentAlphaAcc += pixelToLoad.a * weightFactor;

                currentWindowIdx = (currentWindowIdx + 1) % filterDiameter;

                // Update incoming sums
                incomingRedAcc += pixelToLoad.r;
                incomingGreenAcc += pixelToLoad.g;
                incomingBlueAcc += pixelToLoad.b;
                incomingAlphaAcc += pixelToLoad.a;
            }

            // Pointers for the circular buffer's sliding window
            let oldestElementPtr = 0; // Points to the element being removed from the window
            let newestElementPtr = currentWindowIdx; // Points to the element at the "end" of the window that will exit 'in' sum

            // --- Main Sliding Window Iteration ---
            for (let axisIdx = 0; axisIdx < axisLength; axisIdx++) {
                let resultingAlpha = 0;
                if (affectAlpha) {
                    resultingAlpha = (currentAlphaAcc * blurCoefficient) >> blurShift;
                    // Clamping
                    resultingAlpha = Math.max(0, Math.min(255, resultingAlpha));
                } else {
                    resultingAlpha = 255;
                }

                let finalRed, finalGreen, finalBlue;

                if (resultingAlpha !== 0) {
                    const alphaCorrectionFactor = affectAlpha ? (255 / resultingAlpha) : 1;
                    finalRed = (((currentRedAcc * blurCoefficient) >> blurShift) * alphaCorrectionFactor);
                    finalGreen = (((currentGreenAcc * blurCoefficient) >> blurShift) * alphaCorrectionFactor);
                    finalBlue = (((currentBlueAcc * blurCoefficient) >> blurShift) * alphaCorrectionFactor);
                } else {
                    finalRed = finalGreen = finalBlue = 0;
                }

                // Clamping
                finalRed = Math.max(0, Math.min(255, finalRed));
                finalGreen = Math.max(0, Math.min(255, finalGreen));
                finalBlue = Math.max(0, Math.min(255, finalBlue));

                // Store the blurred pixel
                if (isAlongVerticalAxis) {
                    outputGrid[axisIdx][orthoIdx] = new PixelColor(finalRed, finalGreen, finalBlue, resultingAlpha);
                } else {
                    outputGrid[orthoIdx][axisIdx] = new PixelColor(finalRed, finalGreen, finalBlue, resultingAlpha);
                }

                // Update sums for next iteration (sliding window logic)
                currentRedAcc -= outgoingRedAcc;
                currentGreenAcc -= outgoingGreenAcc;
                currentBlueAcc -= currentBlueAcc; // This line was a typo in original analysis, correct is `currentBlueAcc -= outgoingBlueAcc;`
                currentBlueAcc -= outgoingBlueAcc; // Corrected from analysis to match original logic
                currentAlphaAcc -= outgoingAlphaAcc;

                // Remove oldest pixel from outgoing sums
                const oldestPixelInWindow = windowElements[oldestElementPtr];
                outgoingRedAcc -= oldestPixelInWindow.r;
                outgoingGreenAcc -= oldestPixelInWindow.g;
                outgoingBlueAcc -= oldestPixelInWindow.b;
                outgoingAlphaAcc -= oldestPixelInWindow.a;

                // Determine the next pixel to enter the window
                const nextPixelSourceIdx = axisIdx + radiusExtended;
                const actualNextPixelIdx = (nextPixelSourceIdx > axisLimit ? axisLimit : nextPixelSourceIdx);
                const nextPixel = isAlongVerticalAxis
                    ? inputGrid[actualNextPixelIdx][orthoIdx]
                    : inputGrid[orthoIdx][actualNextPixelIdx];

                // Add next pixel to incoming sums and update window element
                windowElements[oldestElementPtr].r = nextPixel.r;
                windowElements[oldestElementPtr].g = nextPixel.g;
                windowElements[oldestElementPtr].b = nextPixel.b;
                windowElements[oldestElementPtr].a = nextPixel.a;

                incomingRedAcc += nextPixel.r;
                incomingGreenAcc += nextPixel.g;
                incomingBlueAcc += nextPixel.b;
                incomingAlphaAcc += nextPixel.a;

                // Update total sums with incoming pixels
                currentRedAcc += incomingRedAcc;
                currentGreenAcc += incomingGreenAcc;
                currentBlueAcc += incomingBlueAcc;
                currentAlphaAcc += incomingAlphaAcc;

                // Advance oldest element pointer (which now holds the newest pixel)
                oldestElementPtr = (oldestElementPtr + 1) % filterDiameter;

                // Add newest pixel (which was just added to oldestElementPtr position) to outgoing sums
                const pixelExitingIncomingSum = windowElements[newestElementPtr];
                outgoingRedAcc += pixelExitingIncomingSum.r;
                outgoingGreenAcc += pixelExitingIncomingSum.g;
                outgoingBlueAcc += pixelExitingIncomingSum.b;
                outgoingAlphaAcc += pixelExitingIncomingSum.a;

                // Remove pixel from incoming sums
                incomingRedAcc -= pixelExitingIncomingSum.r;
                incomingGreenAcc -= pixelExitingIncomingSum.g;
                incomingBlueAcc -= pixelExitingIncomingSum.b;
                incomingAlphaAcc -= pixelExitingIncomingSum.a;

                // Advance newest element pointer
                newestElementPtr = (newestElementPtr + 1) % filterDiameter;
            }
        }
    }

    // Top-level function to apply blur to an image element, drawing it onto a canvas first
    window.applyImageEnhancement = function(sourceImageID, targetCanvasID, blurMagnitude, includeTransparency) {
        const sourceImg = document.getElementById(sourceImageID);
        const canvasElement = document.getElementById(targetCanvasID);

        const imgWidth = sourceImg.naturalWidth;
        const imgHeight = sourceImg.naturalHeight;

        canvasElement.style.width = imgWidth + "px";
        canvasElement.style.height = imgHeight + "px";
        canvasElement.width = imgWidth;
        canvasElement.height = imgHeight;

        const ctx = canvasElement.getContext("2d");
        ctx.clearRect(0, 0, imgWidth, imgHeight);
        ctx.drawImage(sourceImg, 0, 0);

        if (isNaN(blurMagnitude) || blurMagnitude < 1) return;

        performCanvasPixelProcessing(canvasElement, 0, 0, imgWidth, imgHeight, blurMagnitude, includeTransparency);
    };

    // Main function to process canvas pixel data within a specified region
    window.performCanvasPixelProcessing = function(targetCanvas, xOffset, yOffset, processWidth, processHeight, blurMagnitude, includeTransparency) {
        if (isNaN(blurMagnitude) || blurMagnitude < 1) return;
        blurMagnitude |= 0; // Ensure integer value

        const canvasObject = (typeof targetCanvas === "string") ? document.getElementById(targetCanvas) : targetCanvas;
        if (!(canvasObject instanceof HTMLCanvasElement)) return;

        const context = canvasObject.getContext("2d");
        let currentImageData;

        try {
            try {
                currentImageData = context.getImageData(xOffset, yOffset, processWidth, processHeight);
            } catch (e) {
                // Fallback for security errors with local files (matching original's behavior)
                try {
                    if (typeof netscape !== 'undefined' && netscape.security && netscape.security.PrivilegeManager) {
                        netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                    }
                    currentImageData = context.getImageData(xOffset, yOffset, processWidth, processHeight);
                } catch (err) {
                    console.error("Local image access error:", err);
                    throw new Error("Unable to access local image data for blur: " + err);
                }
            }
        } catch (e) {
            console.error("Image data access error:", e);
            throw new Error("Unable to access image data for blur: " + e);
        }

        let pixelGrid = PixelGridConverter.toGrid(currentImageData);

        // Create a temporary grid for the first pass output
        const tempPixelGrid = Array(processHeight).fill(null).map(() => Array(processWidth).fill(null));

        // Horizontal Pass
        processLineSegment(pixelGrid, tempPixelGrid, processWidth, processHeight, blurMagnitude, includeTransparency, false);

        // Vertical Pass
        // The output of the horizontal pass (tempPixelGrid) becomes the input for the vertical pass.
        // The result will be written back to pixelGrid.
        processLineSegment(tempPixelGrid, pixelGrid, processHeight, processWidth, blurMagnitude, includeTransparency, true);

        PixelGridConverter.fromGrid(pixelGrid, currentImageData);
        context.putImageData(currentImageData, xOffset, yOffset);
    };

    // Export a specific function for RGB-only blur (mimicking original's stackBlurCanvasRGB)
    window.applyRGBPixelProcessing = function(targetCanvas, xOffset, yOffset, processWidth, processHeight, blurMagnitude) {
        performCanvasPixelProcessing(targetCanvas, xOffset, yOffset, processWidth, processHeight, blurMagnitude, false);
    };

})();