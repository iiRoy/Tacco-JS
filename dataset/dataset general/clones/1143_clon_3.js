let graphicsUtil;
((nsScope) => {
    ((imgProc) => {

        // Represents an image with indexed colors and a palette.
        class PalettedImage {
            /**
             * Initializes a new instance of PalettedImage.
             * @param {object} dimensions - Object with width and height properties.
             * @param {number[]} pixelIndices - Array of color indices for each pixel.
             * @param {number[]} colorMapData - Flat array of RGB values representing the palette.
             */
            constructor(dimensions, pixelIndices, colorMapData) {
                if (!dimensions || typeof dimensions.width !== 'number' || typeof dimensions.height !== 'number') {
                    throw new Error("Invalid dimensions provided for PalettedImage.");
                }
                if (!Array.isArray(pixelIndices) || !Array.isArray(colorMapData)) {
                    throw new Error("Pixel indices or color map data must be arrays.");
                }

                this.imageWidth = dimensions.width;
                this.imageHeight = dimensions.height;
                this.indexedPixels = pixelIndices;
                this.colorPalette = colorMapData;
            }
        }
        imgProc.PalettedImage = PalettedImage;

        // Utility for encoding LZW-compressed codes into a byte stream.
        class BitDataWriter {
            constructor() {
                this.outputBytes = [];      // Stores the resulting byte array.
                this.currentBitBuffer = 0; // Accumulates bits until 8 are available.
                this.bufferedBitCount = 0; // Number of bits currently in currentBitBuffer.
            }

            /**
             * Appends a code (value) with a specified number of bits to the internal byte stream.
             * @param {number} codeValue - The code to write.
             * @param {number} bitsToUse - The number of bits to take from codeValue.
             */
            writeCode(codeValue, bitsToUse) {
                let remainingBits = bitsToUse;
                while (remainingBits > 0) {
                    // Combine new bits with existing buffered bits.
                    this.currentBitBuffer |= (codeValue & ((1 << remainingBits) - 1)) << this.bufferedBitCount;

                    if (remainingBits + this.bufferedBitCount >= 8) {
                        // Enough bits to form a full byte.
                        this.outputBytes.push(this.currentBitBuffer & 0xFF);
                        remainingBits -= (8 - this.bufferedBitCount);
                        codeValue >>= (8 - this.bufferedBitCount);
                        this.currentBitBuffer = 0;
                        this.bufferedBitCount = 0;
                    } else {
                        // Not enough bits for a full byte yet, just update buffer count.
                        this.bufferedBitCount += remainingBits;
                        remainingBits = 0;
                    }
                }
            }

            /**
             * Flushes any remaining buffered bits, typically with padding, and returns the accumulated bytes.
             * Resets the internal state.
             * @returns {number[]} The array of bytes generated.
             */
            finalizeStream() {
                // Pad with zeros and flush any remaining bits
                if (this.bufferedBitCount > 0) {
                    this.outputBytes.push(this.currentBitBuffer & 0xFF);
                }
                this.bufferedBitCount = 0;
                this.currentBitBuffer = 0;
                const result = this.outputBytes;
                this.outputBytes = []; // Reset for next use
                return result;
            }
        }

        // LZW compression algorithm adapted for GIF.
        function lzwCompressImageCodes(pixelIndices, initialCodeLength) {
            const bitWriter = new BitDataWriter();
            const clearCodeVal = (1 << initialCodeLength);
            const endOfInformationCode = clearCodeVal + 1;
            let currentDictionary;
            let nextAvailableCode;
            let currentCodeBitLength;

            // Helper to reset LZW state (dictionary and code lengths)
            const resetLzwState = () => {
                nextAvailableCode = endOfInformationCode + 1;
                currentCodeBitLength = initialCodeLength + 1;
                currentDictionary = Object.create(null); // Use null prototype for performance
            };

            resetLzwState();
            bitWriter.writeCode(clearCodeVal, currentCodeBitLength);

            let currentSequence = "";
            for (let i = 0, numPixels = pixelIndices.length; i < numPixels; ++i) {
                const pixelValue = pixelIndices[i];
                const pixelChar = String.fromCharCode(pixelValue); // Represent pixel value as a character for string keys

                // Initialize dictionary with single pixel values if not present
                if (!(pixelChar in currentDictionary)) {
                    currentDictionary[pixelChar] = pixelValue;
                }

                const previousSequence = currentSequence;
                currentSequence += pixelChar;

                if (!(currentSequence in currentDictionary)) {
                    // New sequence found, output code for previous sequence
                    bitWriter.writeCode(currentDictionary[previousSequence], currentCodeBitLength);

                    // Add new sequence to dictionary if space available
                    const maxDictSize = 4095; // LZW maximum code value
                    if (nextAvailableCode <= maxDictSize) {
                        currentDictionary[currentSequence] = nextAvailableCode;
                        // Increase code bit length if next code exceeds current max
                        if (nextAvailableCode === (1 << currentCodeBitLength)) {
                            currentCodeBitLength++;
                        }
                        nextAvailableCode++;
                    } else {
                        // Dictionary full, reset and output clear code
                        bitWriter.writeCode(clearCodeVal, currentCodeBitLength);
                        resetLzwState();
                        // Re-add the current pixel value as a single character to the new dictionary
                        currentDictionary[pixelChar] = pixelValue;
                    }
                    currentSequence = pixelChar; // Start new sequence with current pixel
                }
            }

            // Output the code for the last sequence
            if (currentSequence.length > 0) {
                bitWriter.writeCode(currentDictionary[currentSequence], currentCodeBitLength);
            }

            // Output End of Information code
            bitWriter.writeCode(endOfInformationCode, currentCodeBitLength);

            return bitWriter.finalizeStream();
        }

        // Main class for composing GIF frames and writing to an output stream.
        class GifFrameComposer {
            /**
             * @param {object} dataStream - An object with writeByte and writeBytes methods.
             */
            constructor(dataStream) {
                if (!dataStream || typeof dataStream.writeByte !== 'function' || typeof dataStream.writeBytes !== 'function') {
                    console.warn("GifFrameComposer initialized with an invalid output stream.");
                }
                this.outputHandler = dataStream;
            }

            // Private method to write a 16-bit integer (little-endian).
            _writeUInt16(value) {
                this.outputHandler.writeBytes([
                    value & 0xFF,
                    (value >> 8) & 0xFF
                ]);
            }

            // Private method to write data in GIF sub-blocks (max 255 bytes per block).
            _writeByteSubBlocks(dataBuffer) {
                const stream = this.outputHandler;
                let currentPos = 0;
                const totalLength = dataBuffer.length;

                // Ensure dataBuffer is an array-like object.
                if (!Array.isArray(dataBuffer) && !dataBuffer.buffer) {
                    console.error("Invalid data buffer provided to _writeByteSubBlocks.");
                    return;
                }

                while (currentPos < totalLength) {
                    const bytesToWrite = Math.min(totalLength - currentPos, 255);
                    const subArray = dataBuffer.slice(currentPos, currentPos + bytesToWrite);
                    stream.writeByte(subArray.length); // Block size byte
                    stream.writeBytes(subArray);       // Data bytes
                    currentPos += bytesToWrite;
                }
            }

            // Private method to write the block terminator (0x00).
            _writeBlockEnd() {
                this.outputHandler.writeByte(0x00);
            }

            /**
             * Writes the GIF file header ("GIF89a").
             */
            writeGifSignature() {
                const stream = this.outputHandler;
                stream.writeBytes([0x47, 0x49, 0x46]); // G I F
                stream.writeBytes([0x38, 0x39, 0x61]); // 8 9 a
            }

            /**
             * Writes the GIF file trailer (0x3B).
             */
            writeGifTerminator() {
                this.outputHandler.writeByte(0x3B);
            }

            /**
             * Writes the Logical Screen Descriptor and Global Color Table (if present).
             * @param {object} canvasSize - Object with width and height.
             * @param {object} [config] - Configuration options for the logical screen.
             * @param {number[]} [config.globalColorData] - Global color table data (RGB triples).
             * @param {boolean} [config.sortGlobalColorTable=false] - Whether GCT is sorted.
             * @param {number} [config.backgroundColorIndex=0] - Index of background color in GCT.
             * @param {number} [config.pixelAspectRatio=0] - Pixel aspect ratio.
             */
            writeLogicalScreen(canvasSize, config = {}) {
                const hasGlobalColorTable = Array.isArray(config.globalColorData) && config.globalColorData.length > 0;
                const globalColorTableSize = hasGlobalColorTable ? this._calculateColorTablePower(config.globalColorData) : 0;
                const bgIndex = config.backgroundColorIndex ?? 0;
                const aspectRatio = config.pixelAspectRatio ?? 0;

                this._writeLogicalScreenDescriptor(
                    canvasSize,
                    hasGlobalColorTable,
                    config.sortGlobalColorTable || false,
                    globalColorTableSize,
                    bgIndex,
                    aspectRatio
                );

                if (hasGlobalColorTable) {
                    this._writeColorTable(config.globalColorData, globalColorTableSize);
                }
            }

            // Private helper to calculate log2(numColors) - 1 for color table size field.
            _calculateColorTablePower(colorTableArray) {
                const numberOfColors = colorTableArray.length / 3;
                let power = 0;
                let value = 2;
                while (value < numberOfColors) {
                    power++;
                    value <<= 1; // Equivalent to value * 2
                }
                return power;
            }

            // Private method to write the Logical Screen Descriptor block.
            _writeLogicalScreenDescriptor(dimensions, useGCT, gctSorted, gctSize, bgColorIdx, pxRatio) {
                const stream = this.outputHandler;
                this._writeUInt16(dimensions.width);
                this._writeUInt16(dimensions.height);

                // Packed field byte:
                // Bit 7: Global Color Table Flag (1=present)
                // Bits 6-4: Color Resolution (ignored in GIF89a)
                // Bit 3: Sort Flag (1=sorted)
                // Bits 2-0: Size of Global Color Table (2^(N+1) colors)
                let packedField = 0;
                if (useGCT) packedField |= 0x80; // Set GCT Flag
                packedField |= (7 << 4);         // Color Resolution (default 8 bits)
                if (gctSorted) packedField |= 0x08; // Set Sort Flag
                packedField |= gctSize;          // Set GCT Size

                stream.writeByte(packedField);
                stream.writeByte(bgColorIdx);
                stream.writeByte(pxRatio);
            }

            /**
             * Writes an image block (Image Descriptor, Local Color Table, and Image Data).
             * @param {PalettedImage} imageFrame - The indexed color image data.
             * @param {object} [frameOptions] - Options specific to this image frame.
             */
            writeImageBlock(imageFrame, frameOptions = {}) {
                if (!(imageFrame instanceof PalettedImage)) {
                    throw new Error("Invalid imageFrame provided; must be a PalettedImage instance.");
                }

                const useLocalColorTable = Array.isArray(imageFrame.colorPalette) && imageFrame.colorPalette.length > 0;
                const lctSizeField = useLocalColorTable ? this._calculateColorTablePower(imageFrame.colorPalette) : 0;

                this._writeImageDescriptor(imageFrame, useLocalColorTable, lctSizeField, frameOptions);

                if (useLocalColorTable) {
                    this._writeColorTable(imageFrame.colorPalette, lctSizeField);
                }

                this._writeImageData(imageFrame.indexedPixels, lctSizeField + 1); // LZW min code size
            }

            /**
             * Writes an image block with a preceding Graphic Control Extension.
             * @param {PalettedImage} imageFrame - The indexed color image data.
             * @param {object} controlOptions - Options for the graphic control extension.
             */
            writeImageWithGraphicsControl(imageFrame, controlOptions) {
                this._writeGraphicsControlExtension(controlOptions);
                this.writeImageBlock(imageFrame, controlOptions);
            }

            // Private method to write the Image Descriptor block.
            _writeImageDescriptor(imgData, useLCT, lctSize, frameSettings) {
                const stream = this.outputHandler;
                stream.writeByte(0x2C); // Image Separator

                const leftOffset = frameSettings.leftPosition ?? 0;
                const topOffset = frameSettings.topPosition ?? 0;

                this._writeUInt16(leftOffset);
                this._writeUInt16(topOffset);
                this._writeUInt16(imgData.imageWidth);
                this._writeUInt16(imgData.imageHeight);

                // Packed field byte:
                // Bit 7: Local Color Table Flag (1=present)
                // Bit 6: Interlace Flag (0=no interlace)
                // Bit 5: Sort Flag (0=not sorted)
                // Bits 4-3: Reserved (0)
                // Bits 2-0: Size of Local Color Table (2^(N+1) colors)
                let packedField = 0;
                if (useLCT) packedField |= 0x80; // Set LCT Flag
                packedField |= lctSize;          // Set LCT Size

                stream.writeByte(packedField);
            }

            // Private method to write the LZW compressed image data.
            _writeImageData(pixelData, lzwMinCodeSize) {
                const stream = this.outputHandler;
                // GIF LZW minimum code size is 2, even if palette has fewer colors.
                const effectiveLzwMinCode = Math.max(2, lzwMinCodeSize);

                const compressedBytes = lzwCompressImageCodes(pixelData, effectiveLzwMinCode);
                stream.writeByte(effectiveLzwMinCode); // LZW Minimum Code Size field
                this._writeByteSubBlocks(compressedBytes);
                this._writeBlockEnd();
            }

            // Private method to write a color table (Global or Local).
            _writeColorTable(colorEntryData, tableSizePower) {
                const stream = this.outputHandler;
                stream.writeBytes(colorEntryData);

                // Pad the color table with zeros if its length is less than the expected size.
                const expectedLength = 3 * (1 << (tableSizePower + 1)); // 3 bytes per color, 2^(N+1) colors
                const paddingNeeded = expectedLength - colorEntryData.length;

                if (paddingNeeded > 0) {
                    const padding = new Array(paddingNeeded).fill(0);
                    stream.writeBytes(padding);
                }
            }

            // Private method to write the Graphic Control Extension.
            _writeGraphicsControlExtension(controlSettings = {}) {
                const stream = this.outputHandler;
                const delayInMs = controlSettings.delayTimeInMS ?? 0;
                const disposalMethod = controlSettings.disposalMethod ?? 2; // Default to RestoreToBackgroundColor

                let transparentColorIdx = 0;
                let transparencyFlag = 0;
                if (controlSettings.transparentColorIndex !== undefined && controlSettings.transparentColorIndex >= 0) {
                    transparentColorIdx = controlSettings.transparentColorIndex & 0xFF; // Ensure byte value
                    transparencyFlag = 1;
                }

                stream.writeBytes([
                    0x21, // Extension Introducer
                    0xF9, // Graphic Control Label
                    0x04  // Block Size (4 bytes)
                ]);

                // Packed field byte:
                // Bits 7-5: Reserved (0)
                // Bits 4-2: Disposal Method
                // Bit 1: User Input Flag (0=no user input)
                // Bit 0: Transparent Color Flag
                const packedField = (disposalMethod << 2) | transparencyFlag;
                stream.writeByte(packedField);

                this._writeUInt16(Math.round(delayInMs / 10)); // Delay Time in 1/100ths of a second
                stream.writeByte(transparentColorIdx);
                stream.writeByte(0x00); // Block Terminator
            }

            /**
             * Writes the Application Extension for animation loop control (NETSCAPE2.0).
             * @param {number} loopIterations - Number of times to repeat the animation (0 for infinite).
             */
            writeLoopingDirective(loopIterations) {
                this.outputHandler.writeBytes([
                    0x21, // Extension Introducer
                    0xFF, // Application Extension Label
                    0x0B, // Block Size (11 bytes)
                    0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30, // "NETSCAPE2.0"
                    0x03, // Sub-block Size (3 bytes)
                    0x01, // Loop Sub-block ID
                    (loopIterations & 0xFF),        // Loop Count (LSB)
                    ((loopIterations >> 8) & 0xFF), // Loop Count (MSB)
                    0x00  // Block Terminator
                ]);
            }
        }
        imgProc.GifFrameComposer = GifFrameComposer;

    })(nsScope.imgProc || (nsScope.imgProc = {}));
    const imgProc = nsScope.imgProc;
})(graphicsUtil || (graphicsUtil = {}));


let graphicsUtil;
((nsScope) => {
    ((imgProc) => {

        // --- Utility functions for array manipulation and selection ---

        // Swaps two elements in an array.
        function swapElements(arr, indexA, indexB) {
            if (indexA === indexB || !arr || indexA < 0 || indexB < 0 || indexA >= arr.length || indexB >= arr.length) {
                return; // No-op for invalid indices or self-swap
            }
            const temp = arr[indexA];
            arr[indexA] = arr[indexB];
            arr[indexB] = temp;
        }

        // Partitions an array segment around a pivot for quickselect.
        function partitionSegment(dataArray, startIndex, endIndex, pivotIdx) {
            const pivotValue = dataArray[pivotIdx];
            swapElements(dataArray, pivotIdx, endIndex); // Move pivot to end
            let storeIndex = startIndex;
            for (let k = startIndex; k < endIndex; ++k) {
                if (dataArray[k] <= pivotValue) {
                    swapElements(dataArray, storeIndex, k);
                    storeIndex++;
                }
            }
            swapElements(dataArray, endIndex, storeIndex); // Move pivot to its final sorted position
            return storeIndex; // Return pivot's new index
        }

        // Finds the k-th smallest element in an array segment using Quickselect.
        function findKthSmallest(sourceList, leftBound, rightBound, kRank) {
            // kRank is 1-based, convert to 0-based index
            const targetIndex = leftBound + kRank - 1;

            while (leftBound <= rightBound) {
                // Choose a pivot (e.g., middle element)
                const currentPivotIndex = Math.floor((leftBound + rightBound) / 2);
                const newPivotPosition = partitionSegment(sourceList, leftBound, rightBound, currentPivotIndex);

                if (newPivotPosition === targetIndex) {
                    return sourceList[newPivotPosition]; // Found the k-th element
                } else if (newPivotPosition < targetIndex) {
                    leftBound = newPivotPosition + 1; // Search in the right partition
                } else {
                    rightBound = newPivotPosition - 1; // Search in the left partition
                }
            }
            // Should not be reached if kRank is valid.
            return null;
        }

        // --- Color matching utilities ---

        // Finds the closest color in a palette to a given color.
        function findNearestPaletteColor(targetColor, paletteEntries) {
            const idx = findNearestPaletteColorIndex(targetColor, paletteEntries);
            return paletteEntries[idx];
        }

        // Finds the index of the closest color in a palette to a given color using Euclidean distance.
        function findNearestPaletteColorIndex(queryColor, paletteList) {
            let minimumDistanceSq = Infinity;
            let closestEntryIndex = -1;
            let exactMatchFound = false;

            // Guard against empty palette
            if (!Array.isArray(paletteList) || paletteList.length === 0) {
                console.warn("Attempted to find color in an empty palette.");
                return -1;
            }

            for (let i = 0; i < paletteList.length; i++) {
                const currentPaletteColor = paletteList[i];
                const deltaR = queryColor.red - currentPaletteColor.red;
                const deltaG = queryColor.green - currentPaletteColor.green;
                const deltaB = queryColor.blue - currentPaletteColor.blue;

                const currentDistanceSq = (deltaR * deltaR) + (deltaG * deltaG) + (deltaB * deltaB);

                if (currentDistanceSq === 0) {
                    exactMatchFound = true;
                    closestEntryIndex = i;
                    break; // Exact match, no need to search further
                }

                if (currentDistanceSq < minimumDistanceSq) {
                    minimumDistanceSq = currentDistanceSq;
                    closestEntryIndex = i;
                }
            }
            return closestEntryIndex;
        }

        // --- Median Cut Quantization components ---

        // Represents a 3D color cube (or "volume") in RGB space.
        class ColorVolume {
            constructor(containedColors) {
                if (!Array.isArray(containedColors) || containedColors.length === 0) {
                    throw new Error("ColorVolume must be initialized with an array of colors.");
                }
                this.colorsInCube = containedColors;

                // Determine the min/max for each color channel within this cube.
                let minR = 255, maxR = 0;
                let minG = 255, maxG = 0;
                let minB = 255, maxB = 0;

                for (let i = 0; i < containedColors.length; i++) {
                    const c = containedColors[i];
                    minR = Math.min(minR, c.red);
                    maxR = Math.max(maxR, c.red);
                    minG = Math.min(minG, c.green);
                    maxG = Math.max(maxG, c.green);
                    minB = Math.min(minB, c.blue);
                    maxB = Math.max(maxB, c.blue);
                }

                this.minRed = minR;
                this.maxRed = maxR;
                this.minGreen = minG;
                this.maxGreen = maxG;
                this.minBlue = minB;
                this.maxBlue = maxB;
            }

            // Divides this color volume into two smaller volumes.
            splitVolume() {
                const dominantAxis = this.getLargestColorRangeAxis();
                const medianValue = this.findMedianAlongAxis(dominantAxis);
                return this.divideByMedian(dominantAxis, medianValue);
            }

            // Splits the current color volume based on a median value along a specific axis.
            divideByMedian(splitAxis, medianPoint) {
                const firstHalf = [];
                const secondHalf = [];

                for (let i = 0; i < this.colorsInCube.length; i++) {
                    const currentColor = this.colorsInCube[i];
                    if (currentColor[splitAxis] < medianPoint) {
                        firstHalf.push(currentColor);
                    } else {
                        secondHalf.push(currentColor);
                    }
                }

                // Ensure both halves have colors to avoid empty cubes.
                if (firstHalf.length > 0 && secondHalf.length > 0) {
                    return [
                        new ColorVolume(firstHalf),
                        new ColorVolume(secondHalf)
                    ];
                } else {
                    return []; // Cannot split effectively
                }
            }

            // Finds the median color value along a specified RGB axis within this cube.
            findMedianAlongAxis(axisName) {
                const axisValues = [];
                for (let i = 0, len = this.colorsInCube.length; i < len; ++i) {
                    axisValues.push(this.colorsInCube[i][axisName]);
                }
                // Use findKthSmallest (Quickselect) to find the median value efficiently.
                // k is length / 2 + 1 for 1-based indexing of kth element.
                return findKthSmallest(axisValues, 0, axisValues.length - 1, Math.floor(axisValues.length / 2) + 1);
            }

            // Determines which color axis (R, G, B) has the largest range.
            getLargestColorRangeAxis() {
                const rangeR = this.maxRed - this.minRed;
                const rangeG = this.maxGreen - this.minGreen;
                const rangeB = this.maxBlue - this.minBlue;

                if (rangeR >= rangeG && rangeR >= rangeB) {
                    return "red";
                } else if (rangeG >= rangeR && rangeG >= rangeB) {
                    return "green";
                } else {
                    return "blue";
                }
            }

            // Returns the total number of colors contained in this volume.
            getColorCount() {
                return this.colorsInCube.length;
            }

            // Calculates the average color of all colors within this volume.
            getAverageColor() {
                let sumR = 0;
                let sumG = 0;
                let sumB = 0;
                const count = this.colorsInCube.length;

                for (let i = 0; i < count; i++) {
                    const c = this.colorsInCube[i];
                    sumR += c.red;
                    sumG += c.green;
                    sumB += c.blue;
                }

                return {
                    red: Math.floor(sumR / count),
                    green: Math.floor(sumG / count),
                    blue: Math.floor(sumB / count)
                };
            }
        }

        // Implements the Median Cut algorithm for color quantization.
        class PaletteOptimizer {
            /**
             * @param {ImageData} inputImageData - Raw image data (from CanvasRenderingContext2D.getImageData).
             * @param {number} targetPaletteSize - Desired number of colors in the output palette (max 256).
             */
            constructor(inputImageData, targetPaletteSize) {
                this.sourceImageData = inputImageData;
                this.maxAllowedColors = targetPaletteSize || 255;
                this.generatedPalette = [];
                this.colorMappingCache = Object.create(null); // Cache for RGB -> palette index
            }

            /**
             * Processes the image to generate an optimized color palette.
             * @returns {number[]} A flat array of RGB values for the generated palette.
             */
            generatePalette() {
                const uniqueColors = this._extractUniqueColors(this.sourceImageData);
                const colorVolumes = this._performMedianCut(uniqueColors, this.maxAllowedColors);

                // Create the final palette from the average colors of the volumes.
                const finalPalette = [];
                const flatPaletteData = [];
                for (let i = 0; i < colorVolumes.length; i++) {
                    const avgColor = colorVolumes[i].getAverageColor();
                    finalPalette.push(avgColor);
                    flatPaletteData.push(avgColor.red, avgColor.green, avgColor.blue);

                    // Populate the color mapping cache for direct pixel mapping.
                    for (let j = 0; j < colorVolumes[i].colorsInCube.length; j++) {
                        const originalColor = colorVolumes[i].colorsInCube[j];
                        const rgbKey = this._getColorKey(originalColor.red, originalColor.green, originalColor.blue);
                        this.colorMappingCache[rgbKey] = i;
                    }
                }

                this.generatedPalette = finalPalette;
                return flatPaletteData;
            }

            /**
             * Maps an RGB color to its closest index in the generated palette.
             * @param {number} r - Red component (0-255).
             * @param {number} g - Green component (0-255).
             * @param {number} b - Blue component (0-255).
             * @returns {number} The index in the generated palette.
             */
            mapColorToIndex(r, g, b) {
                const rgbKey = this._getColorKey(r, g, b);
                if (rgbKey in this.colorMappingCache) {
                    return this.colorMappingCache[rgbKey];
                }

                // If not in cache, find the closest color and cache it.
                const closestIdx = findNearestPaletteColorIndex({ red: r, green: g, blue: b }, this.generatedPalette);
                this.colorMappingCache[rgbKey] = closestIdx;
                return closestIdx;
            }

            // Private helper to extract unique colors from ImageData.
            _extractUniqueColors(imgData) {
                const uniqueColorSet = new Set(); // Use a Set to store unique RGB keys
                const extractedColors = [];
                const pixelData = imgData.data;
                const totalPixels = imgData.width * imgData.height;

                for (let i = 0; i < totalPixels; ++i) {
                    const offset = i * 4;
                    const r = pixelData[offset + 0];
                    const g = pixelData[offset + 1];
                    const b = pixelData[offset + 2];
                    // const a = pixelData[offset + 3]; // Alpha channel ignored for GIF palette

                    const colorKey = this._getColorKey(r, g, b);

                    if (!uniqueColorSet.has(colorKey)) {
                        uniqueColorSet.add(colorKey);
                        extractedColors.push({ red: r, green: g, blue: b });
                    }
                }
                return extractedColors;
            }

            // Private helper for generating a unique string key for an RGB color.
            _getColorKey(r, g, b) {
                // Combine into a single integer, then convert to hex string for compactness.
                // Padding ensures consistent length for keys.
                return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
            }

            // Private method to apply the median cut algorithm.
            _performMedianCut(initialColors, desiredSize) {
                if (initialColors.length === 0) return [];
                let activeCubes = [new ColorVolume(initialColors)];

                // Continue splitting until we have enough cubes or can't split further.
                while (activeCubes.length < desiredSize && activeCubes.some(cube => cube.getColorCount() > 1)) {
                    // Find the largest cube to split, preferring cubes with more colors.
                    activeCubes.sort((a, b) => b.getColorCount() - a.getColorCount());
                    const cubeToSplit = activeCubes.shift(); // Take the largest cube

                    // If the cube can be split, add its two new sub-cubes.
                    const newCubes = cubeToSplit.splitVolume();
                    if (newCubes.length === 2) {
                        activeCubes.push(newCubes[0], newCubes[1]);
                    } else {
                        // If a cube cannot be split (e.g., all colors are identical), add it back.
                        activeCubes.push(cubeToSplit);
                    }
                    // Sort by color count again to ensure largest is at front for next iteration
                    activeCubes.sort((a, b) => b.getColorCount() - a.getColorCount());
                }
                return activeCubes;
            }
        }
        imgProc.PaletteOptimizer = PaletteOptimizer;

    })(nsScope.imgProc || (nsScope.imgProc = {}));
    const imgProc = nsScope.imgProc;
})(graphicsUtil || (graphicsUtil = {}));