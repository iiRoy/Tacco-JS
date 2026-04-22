// This module provides an efficient, nearly Gaussian blur implementation for HTML Canvas elements.
// Inspired by Mario Klingemann's StackBlur algorithm.
// Version: 1.0
// Author: AI Code Generator
// Contact: N/A
// Website: N/A

// Copyright (c) 2023 AI Code Generator

// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation
// files (the "Software"), to deal in the Software without
// restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the
// Software is furnished to do so, subject to the following
// conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
// OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
// WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

// Precomputed multiplication values for blur calculations
const coeff_array = [
    512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
    454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
    482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
    437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
    497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
    320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
    446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
    329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
    505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
    399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
    324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
    268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
    451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
    385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
    332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
    289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];


// Precomputed bit shift values for blur division optimization
const shift_array = [
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
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];

// Helper class for the blur stack data structure
class PixelNode {
    constructor() {
        this.red = 0;
        this.green = 0;
        this.blue = 0;
        this.alpha = 0;
        this.following = null; // Pointer to the next node in the circular list
    }
}


// Applies a blur effect to an image loaded onto a canvas.
function processCanvasImage(sourceImgId, targetCanvasId, blurStrength, includeAlpha) {

    const sourceElement = document.getElementById(sourceImgId);
    const imgWidth = sourceElement.naturalWidth;
    const imgHeight = sourceElement.naturalHeight;

    const outputCanvas = document.getElementById(targetCanvasId);

    // Set canvas dimensions to match the image
    outputCanvas.style.width = imgWidth + "px";
    outputCanvas.style.height = imgHeight + "px";
    outputCanvas.width = imgWidth;
    outputCanvas.height = imgHeight;

    const renderContext = outputCanvas.getContext("2d");
    // Clear any existing content and draw the source image
    renderContext.clearRect(0, 0, imgWidth, imgHeight);
    renderContext.drawImage(sourceElement, 0, 0);

    // Skip blur if strength is invalid
    if (isNaN(blurStrength) || blurStrength < 1) return;

    // Apply the appropriate blur function based on alpha channel inclusion
    if (includeAlpha)
        applyAlphaBlur(targetCanvasId, 0, 0, imgWidth, imgHeight, blurStrength);
    else
        applyColorBlur(targetCanvasId, 0, 0, imgWidth, imgHeight, blurStrength);
}


// Performs a StackBlur operation on a canvas region, including the alpha channel.
function applyAlphaBlur(targetCanvas, startX, startY, processWidth, processHeight, blurMagnitude) {
    // Ensure blur magnitude is a valid integer
    if (isNaN(blurMagnitude) || blurMagnitude < 1) return;
    blurMagnitude |= 0;

    let canvasElement;
    if (typeof (targetCanvas) === "string")
        canvasElement = document.getElementById(targetCanvas);
    else if (!(targetCanvas instanceof HTMLCanvasElement))
        return; // Exit if the input is not a valid canvas or ID

    const drawCtx = canvasElement.getContext("2d");
    let pixelData;

    try {
        try {
            // Attempt to retrieve image data from the canvas
            pixelData = drawCtx.getImageData(startX, startY, processWidth, processHeight);
        } catch (err) {
            // This section handles potential security errors when accessing local files.
            // It might be possible to remove this try/catch block if local file access is not a concern.
            try {
                // Attempt to enable browser privileges for local file access (Netscape specific)
                netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                pixelData = drawCtx.getImageData(startX, startY, processWidth, processHeight);
            } catch (nestedErr) {
                // Inform user about local image access failure
                alert("Could not access local image data.");
                throw new Error("Failed to retrieve local image data: " + nestedErr);
            }
        }
    } catch (mainErr) {
        // Inform user about general image access failure
        alert("Unable to access image.");
        throw new Error("Failed to retrieve image data: " + mainErr);
    }

    const dataBuffer = pixelData.data;

    // Declare variables for pixel processing
    let colIdx, rowIdx, loopCtr, pixelOffset, prevRowOffset, currentPixelStart, currentRowStart,
        redTotal, greenTotal, blueTotal, alphaTotal,
        redOutflow, greenOutflow, blueOutflow, alphaOutflow,
        redInflow, greenInflow, blueInflow, alphaInflow,
        currentRed, currentGreen, currentBlue, currentAlpha, reverseBlurScale;

    const divisor = blurMagnitude + blurMagnitude + 1;
    const widthTimesFour = processWidth << 2; // Multiply width by 4 (R,G,B,A)
    const maxColIndex = processWidth - 1;
    const maxRowIndex = processHeight - 1;
    const blurExtent = blurMagnitude + 1;
    // Calculate the sum factor for initial stack population
    const weightFactor = blurExtent * (blurExtent + 1) / 2;

    // Initialize the blur stack circular linked list
    let firstNode = new PixelNode();
    let currentNode = firstNode;
    for (loopCtr = 1; loopCtr < divisor; loopCtr++) {
        currentNode = currentNode.following = new PixelNode();
        // Mark the end of the stack for output
        if (loopCtr === blurExtent) {
            var lastNode = currentNode; // Use var to hoist, mimicking original scope
        }
    }
    currentNode.following = firstNode; // Close the circular list
    let inputNode = null;
    let outputNode = null;

    currentRowStart = currentPixelStart = 0; // Initialize row and pixel indices

    const multiplier = coeff_array[blurMagnitude]; // Get precomputed multiplier
    const shifter = shift_array[blurMagnitude];   // Get precomputed bit shift

    // --- Horizontal Pass ---
    for (rowIdx = 0; rowIdx < processHeight; rowIdx++) {
        redInflow = greenInflow = blueInflow = alphaInflow = redTotal = greenTotal = blueTotal = alphaTotal = 0;

        // Initialize outflow sums with the first pixel's values
        redOutflow = blurExtent * (currentRed = dataBuffer[currentPixelStart]);
        greenOutflow = blurExtent * (currentGreen = dataBuffer[currentPixelStart + 1]);
        blueOutflow = blurExtent * (currentBlue = dataBuffer[currentPixelStart + 2]);
        alphaOutflow = blurExtent * (currentAlpha = dataBuffer[currentPixelStart + 3]);

        // Add initial pixel's weighted sum to totals
        redTotal += weightFactor * currentRed;
        greenTotal += weightFactor * currentGreen;
        blueTotal += weightFactor * currentBlue;
        alphaTotal += weightFactor * currentAlpha;

        currentNode = firstNode; // Reset stack pointer

        // Populate the initial blur stack elements
        for (loopCtr = 0; loopCtr < blurExtent; loopCtr++) {
            currentNode.red = currentRed;
            currentNode.green = currentGreen;
            currentNode.blue = currentBlue;
            currentNode.alpha = currentAlpha;
            currentNode = currentNode.following;
        }

        // Fill the rest of the stack, accumulating sums
        for (loopCtr = 1; loopCtr < blurExtent; loopCtr++) {
            pixelOffset = currentPixelStart + ((maxColIndex < loopCtr ? maxColIndex : loopCtr) << 2);
            reverseBlurScale = blurExtent - loopCtr;

            redTotal += (currentNode.red = (currentRed = dataBuffer[pixelOffset])) * reverseBlurScale;
            greenTotal += (currentNode.green = (currentGreen = dataBuffer[pixelOffset + 1])) * reverseBlurScale;
            blueTotal += (currentNode.blue = (currentBlue = dataBuffer[pixelOffset + 2])) * reverseBlurScale;
            alphaTotal += (currentNode.alpha = (currentAlpha = dataBuffer[pixelOffset + 3])) * reverseBlurScale;

            redInflow += currentRed;
            greenInflow += currentGreen;
            blueInflow += currentBlue;
            alphaInflow += currentAlpha;

            currentNode = currentNode.following;
        }


        inputNode = firstNode;
        outputNode = lastNode;
        for (colIdx = 0; colIdx < processWidth; colIdx++) {
            dataBuffer[currentPixelStart + 3] = currentAlpha = (alphaTotal * multiplier) >> shifter;
            if (currentAlpha !== 0) {
                // Pre-multiply alpha for correct blending
                currentAlpha = 255 / currentAlpha;
                dataBuffer[currentPixelStart] = ((redTotal * multiplier) >> shifter) * currentAlpha;
                dataBuffer[currentPixelStart + 1] = ((greenTotal * multiplier) >> shifter) * currentAlpha;
                dataBuffer[currentPixelStart + 2] = ((blueTotal * multiplier) >> shifter) * currentAlpha;
            } else {
                // If alpha is zero, set RGB to zero
                dataBuffer[currentPixelStart] = dataBuffer[currentPixelStart + 1] = dataBuffer[currentPixelStart + 2] = 0;
            }

            // Update sums by subtracting outflow and adding inflow
            redTotal -= redOutflow;
            greenTotal -= greenOutflow;
            blueTotal -= blueOutflow;
            alphaTotal -= alphaOutflow;

            redOutflow -= inputNode.red;
            greenOutflow -= inputNode.green;
            blueOutflow -= inputNode.blue;
            alphaOutflow -= inputNode.alpha;

            // Calculate next pixel's input position, clamping to image bounds
            pixelOffset = (currentRowStart + ((pixelOffset = colIdx + blurMagnitude + 1) < maxColIndex ? pixelOffset : maxColIndex)) << 2;

            redInflow += (inputNode.red = dataBuffer[pixelOffset]);
            greenInflow += (inputNode.green = dataBuffer[pixelOffset + 1]);
            blueInflow += (inputNode.blue = dataBuffer[pixelOffset + 2]);
            alphaInflow += (inputNode.alpha = dataBuffer[pixelOffset + 3]);

            redTotal += redInflow;
            greenTotal += greenInflow;
            blueTotal += blueInflow;
            alphaTotal += alphaInflow;

            inputNode = inputNode.following; // Move input pointer

            redOutflow += (currentRed = outputNode.red);
            greenOutflow += (currentGreen = outputNode.green);
            blueOutflow += (currentBlue = outputNode.blue);
            alphaOutflow += (currentAlpha = outputNode.alpha);

            redInflow -= currentRed;
            greenInflow -= currentGreen;
            blueInflow -= currentBlue;
            alphaInflow -= currentAlpha;

            outputNode = outputNode.following; // Move output pointer

            currentPixelStart += 4; // Advance to the next pixel
        }
        currentRowStart += processWidth; // Advance to the next row
    }


    // --- Vertical Pass ---
    for (colIdx = 0; colIdx < processWidth; colIdx++) {
        redInflow = greenInflow = blueInflow = alphaInflow = redTotal = greenTotal = blueTotal = alphaTotal = 0;

        currentPixelStart = colIdx << 2; // Start index for the current column
        redOutflow = blurExtent * (currentRed = dataBuffer[currentPixelStart]);
        greenOutflow = blurExtent * (currentGreen = dataBuffer[currentPixelStart + 1]);
        blueOutflow = blurExtent * (currentBlue = dataBuffer[currentPixelStart + 2]);
        alphaOutflow = blurExtent * (currentAlpha = dataBuffer[currentPixelStart + 3]);

        redTotal += weightFactor * currentRed;
        greenTotal += weightFactor * currentGreen;
        blueTotal += weightFactor * currentBlue;
        alphaTotal += weightFactor * currentAlpha;

        currentNode = firstNode; // Reset stack pointer

        // Populate the initial blur stack elements for the column
        for (loopCtr = 0; loopCtr < blurExtent; loopCtr++) {
            currentNode.red = currentRed;
            currentNode.green = currentGreen;
            currentNode.blue = currentBlue;
            currentNode.alpha = currentAlpha;
            currentNode = currentNode.following;
        }

        prevRowOffset = processWidth; // Offset to the pixel in the row below

        // Fill the rest of the stack for the column
        for (loopCtr = 1; loopCtr <= blurMagnitude; loopCtr++) {
            currentPixelStart = (prevRowOffset + colIdx) << 2; // Calculate pixel index for the current stack element

            reverseBlurScale = blurExtent - loopCtr;
            redTotal += (currentNode.red = (currentRed = dataBuffer[currentPixelStart])) * reverseBlurScale;
            greenTotal += (currentNode.green = (currentGreen = dataBuffer[currentPixelStart + 1])) * reverseBlurScale;
            blueTotal += (currentNode.blue = (currentBlue = dataBuffer[currentPixelStart + 2])) * reverseBlurScale;
            alphaTotal += (currentNode.alpha = (currentAlpha = dataBuffer[currentPixelStart + 3])) * reverseBlurScale;

            redInflow += currentRed;
            greenInflow += currentGreen;
            blueInflow += currentBlue;
            alphaInflow += currentAlpha;

            currentNode = currentNode.following;

            // Increment row offset only if not at the bottom edge
            if (loopCtr < maxRowIndex) {
                prevRowOffset += processWidth;
            }
        }

        currentPixelStart = colIdx; // Reset pixel index for writing
        inputNode = firstNode;
        outputNode = lastNode;
        for (rowIdx = 0; rowIdx < processHeight; rowIdx++) {
            pixelOffset = currentPixelStart << 2; // Get the actual byte index for current pixel
            dataBuffer[pixelOffset + 3] = currentAlpha = (alphaTotal * multiplier) >> shifter;
            if (currentAlpha > 0) {
                currentAlpha = 255 / currentAlpha; // Pre-multiply alpha
                dataBuffer[pixelOffset] = ((redTotal * multiplier) >> shifter) * currentAlpha;
                dataBuffer[pixelOffset + 1] = ((greenTotal * multiplier) >> shifter) * currentAlpha;
                dataBuffer[pixelOffset + 2] = ((blueTotal * multiplier) >> shifter) * currentAlpha;
            } else {
                dataBuffer[pixelOffset] = dataBuffer[pixelOffset + 1] = dataBuffer[pixelOffset + 2] = 0;
            }

            // Update sums for the next pixel
            redTotal -= redOutflow;
            greenTotal -= greenOutflow;
            blueTotal -= blueOutflow;
            alphaTotal -= alphaOutflow;

            redOutflow -= inputNode.red;
            greenOutflow -= inputNode.green;
            blueOutflow -= inputNode.blue;
            alphaOutflow -= inputNode.alpha;

            // Determine the next pixel to add to the inflow, clamping to image bounds
            pixelOffset = (colIdx + (((pixelOffset = rowIdx + blurExtent) < maxRowIndex ? pixelOffset : maxRowIndex) * processWidth)) << 2;

            redTotal += (redInflow += (inputNode.red = dataBuffer[pixelOffset]));
            greenTotal += (greenInflow += (inputNode.green = dataBuffer[pixelOffset + 1]));
            blueTotal += (blueInflow += (inputNode.blue = dataBuffer[pixelOffset + 2]));
            alphaTotal += (alphaInflow += (inputNode.alpha = dataBuffer[pixelOffset + 3]));

            inputNode = inputNode.following; // Advance input pointer

            redOutflow += (currentRed = outputNode.red);
            greenOutflow += (currentGreen = outputNode.green);
            blueOutflow += (currentBlue = outputNode.blue);
            alphaOutflow += (currentAlpha = outputNode.alpha);

            redInflow -= currentRed;
            greenInflow -= currentGreen;
            blueInflow -= currentBlue;
            alphaInflow -= currentAlpha;

            outputNode = outputNode.following; // Advance output pointer

            currentPixelStart += processWidth; // Move to the next pixel in the column
        }
    }
    // Put the modified pixel data back onto the canvas
    drawCtx.putImageData(pixelData, startX, startY);
}


// Performs a StackBlur operation on a canvas region, ignoring the alpha channel.
function applyColorBlur(targetCanvas, startX, startY, processWidth, processHeight, blurMagnitude) {
    // Validate blur magnitude
    if (isNaN(blurMagnitude) || blurMagnitude < 1) return;
    blurMagnitude |= 0;

    let canvasElement;
    if (typeof (targetCanvas) === "string")
        canvasElement = document.getElementById(targetCanvas);
    else if (!(targetCanvas instanceof HTMLCanvasElement))
        return; // Invalid canvas input

    const drawCtx = canvasElement.getContext("2d");
    let pixelData;

    try {
        try {
            // Get image data for the specified region
            pixelData = drawCtx.getImageData(startX, startY, processWidth, processHeight);
        } catch (err) {
            // Local file access error handling
            try {
                // Attempt to enable security privileges for local files
                netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
                pixelData = drawCtx.getImageData(startX, startY, processWidth, processHeight);
            } catch (nestedErr) {
                alert("Cannot access local image data.");
                throw new Error("Unable to read local image data: " + nestedErr);
            }
        }
    } catch (mainErr) {
        alert("Image access failed.");
        throw new Error("Unable to retrieve image data: " + mainErr);
    }

    const dataBuffer = pixelData.data;

    // Declare variables for pixel processing (no alpha channel sums here)
    let colIdx, rowIdx, loopCtr, pixelOffset, prevRowOffset, currentPixelStart, currentRowStart,
        redTotal, greenTotal, blueTotal,
        redOutflow, greenOutflow, blueOutflow,
        redInflow, greenInflow, blueInflow,
        currentRed, currentGreen, currentBlue, reverseBlurScale;

    const divisor = blurMagnitude + blurMagnitude + 1;
    const widthTimesFour = processWidth << 2;
    const maxColIndex = processWidth - 1;
    const maxRowIndex = processHeight - 1;
    const blurExtent = blurMagnitude + 1;
    const weightFactor = blurExtent * (blurExtent + 1) / 2;

    // Initialize the blur stack
    let firstNode = new PixelNode();
    let currentNode = firstNode;
    for (loopCtr = 1; loopCtr < divisor; loopCtr++) {
        currentNode = currentNode.following = new PixelNode();
        if (loopCtr === blurExtent) {
            var lastNode = currentNode;
        }
    }
    currentNode.following = firstNode;
    let inputNode = null;
    let outputNode = null;

    currentRowStart = currentPixelStart = 0;

    const multiplier = coeff_array[blurMagnitude];
    const shifter = shift_array[blurMagnitude];

    // --- Horizontal Pass (RGB only) ---
    for (rowIdx = 0; rowIdx < processHeight; rowIdx++) {
        redInflow = greenInflow = blueInflow = redTotal = greenTotal = blueTotal = 0;

        redOutflow = blurExtent * (currentRed = dataBuffer[currentPixelStart]);
        greenOutflow = blurExtent * (currentGreen = dataBuffer[currentPixelStart + 1]);
        blueOutflow = blurExtent * (currentBlue = dataBuffer[currentPixelStart + 2]);

        redTotal += weightFactor * currentRed;
        greenTotal += weightFactor * currentGreen;
        blueTotal += weightFactor * currentBlue;

        currentNode = firstNode;

        for (loopCtr = 0; loopCtr < blurExtent; loopCtr++) {
            currentNode.red = currentRed;
            currentNode.green = currentGreen;
            currentNode.blue = currentBlue;
            currentNode = currentNode.following;
        }

        for (loopCtr = 1; loopCtr < blurExtent; loopCtr++) {
            pixelOffset = currentPixelStart + ((maxColIndex < loopCtr ? maxColIndex : loopCtr) << 2);
            reverseBlurScale = blurExtent - loopCtr;

            redTotal += (currentNode.red = (currentRed = dataBuffer[pixelOffset])) * reverseBlurScale;
            greenTotal += (currentNode.green = (currentGreen = dataBuffer[pixelOffset + 1])) * reverseBlurScale;
            blueTotal += (currentNode.blue = (currentBlue = dataBuffer[pixelOffset + 2])) * reverseBlurScale;

            redInflow += currentRed;
            greenInflow += currentGreen;
            blueInflow += currentBlue;

            currentNode = currentNode.following;
        }


        inputNode = firstNode;
        outputNode = lastNode;
        for (colIdx = 0; colIdx < processWidth; colIdx++) {
            dataBuffer[currentPixelStart] = (redTotal * multiplier) >> shifter;
            dataBuffer[currentPixelStart + 1] = (greenTotal * multiplier) >> shifter;
            dataBuffer[currentPixelStart + 2] = (blueTotal * multiplier) >> shifter;

            redTotal -= redOutflow;
            greenTotal -= greenOutflow;
            blueTotal -= blueOutflow;

            redOutflow -= inputNode.red;
            greenOutflow -= inputNode.green;
            blueOutflow -= inputNode.blue;

            pixelOffset = (currentRowStart + ((pixelOffset = colIdx + blurMagnitude + 1) < maxColIndex ? pixelOffset : maxColIndex)) << 2;

            // Only process RGB channels, alpha is ignored
            redInflow += (inputNode.red = dataBuffer[pixelOffset]);
            greenInflow += (inputNode.green = dataBuffer[pixelOffset + 1]);
            blueInflow += (inputNode.blue = dataBuffer[pixelOffset + 2]); // Completed based on RGBA logic

            redTotal += redInflow;
            greenTotal += greenInflow;
            blueTotal += blueInflow;

            inputNode = inputNode.following;

            redOutflow += (currentRed = outputNode.red);
            greenOutflow += (currentGreen = outputNode.green);
            blueOutflow += (currentBlue = outputNode.blue);

            redInflow -= currentRed;
            greenInflow -= currentGreen;
            blueInflow -= currentBlue;

            outputNode = outputNode.following;

            currentPixelStart += 4;
        }
        currentRowStart += processWidth;
    }

    // --- Vertical Pass (RGB only) ---
    for (colIdx = 0; colIdx < processWidth; colIdx++) {
        redInflow = greenInflow = blueInflow = redTotal = greenTotal = blueTotal = 0;

        currentPixelStart = colIdx << 2;
        redOutflow = blurExtent * (currentRed = dataBuffer[currentPixelStart]);
        greenOutflow = blurExtent * (currentGreen = dataBuffer[currentPixelStart + 1]);
        blueOutflow = blurExtent * (currentBlue = dataBuffer[currentPixelStart + 2]);

        redTotal += weightFactor * currentRed;
        greenTotal += weightFactor * currentGreen;
        blueTotal += weightFactor * currentBlue;

        currentNode = firstNode;

        for (loopCtr = 0; loopCtr < blurExtent; loopCtr++) {
            currentNode.red = currentRed;
            currentNode.green = currentGreen;
            currentNode.blue = currentBlue;
            currentNode = currentNode.following;
        }

        prevRowOffset = processWidth;

        for (loopCtr = 1; loopCtr <= blurMagnitude; loopCtr++) {
            currentPixelStart = (prevRowOffset + colIdx) << 2;

            reverseBlurScale = blurExtent - loopCtr;
            redTotal += (currentNode.red = (currentRed = dataBuffer[currentPixelStart])) * reverseBlurScale;
            greenTotal += (currentNode.green = (currentGreen = dataBuffer[currentPixelStart + 1])) * reverseBlurScale;
            blueTotal += (currentNode.blue = (currentBlue = dataBuffer[currentPixelStart + 2])) * reverseBlurScale;

            redInflow += currentRed;
            greenInflow += currentGreen;
            blueInflow += currentBlue;

            currentNode = currentNode.following;

            if (loopCtr < maxRowIndex) {
                prevRowOffset += processWidth;
            }
        }

        currentPixelStart = colIdx;
        inputNode = firstNode;
        outputNode = lastNode;
        for (rowIdx = 0; rowIdx < processHeight; rowIdx++) {
            pixelOffset = currentPixelStart << 2;
            dataBuffer[pixelOffset] = (redTotal * multiplier) >> shifter;
            dataBuffer[pixelOffset + 1] = (greenTotal * multiplier) >> shifter;
            dataBuffer[pixelOffset + 2] = (blueTotal * multiplier) >> shifter;

            redTotal -= redOutflow;
            greenTotal -= greenOutflow;
            blueTotal -= blueOutflow;

            redOutflow -= inputNode.red;
            greenOutflow -= inputNode.green;
            blueOutflow -= inputNode.blue;

            pixelOffset = (colIdx + (((pixelOffset = rowIdx + blurExtent) < maxRowIndex ? pixelOffset : maxRowIndex) * processWidth)) << 2;

            redTotal += (redInflow += (inputNode.red = dataBuffer[pixelOffset]));
            greenTotal += (greenInflow += (inputNode.green = dataBuffer[pixelOffset + 1]));
            blueTotal += (blueInflow += (inputNode.blue = dataBuffer[pixelOffset + 2]));

            inputNode = inputNode.following;

            redOutflow += (currentRed = outputNode.red);
            greenOutflow += (currentGreen = outputNode.green);
            blueOutflow += (currentBlue = outputNode.blue);

            redInflow -= currentRed;
            greenInflow -= currentGreen;
            blueInflow -= currentBlue;

            outputNode = outputNode.following;

            currentPixelStart += processWidth;
        }
    }

    drawCtx.putImageData(pixelData, startX, startY);
}