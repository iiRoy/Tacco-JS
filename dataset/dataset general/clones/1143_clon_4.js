const pixelStreamForge = (function () {

    // --- Bit Stream Assembler (replacing GifCompressedCodesToByteArrayConverter) ---
    function createBitAssembler() {
        let currentByteCollector = [];
        let partialBitAccumulator = 0;
        let bitsInPartialAccumulator = 0;

        function contributeCode(valueToPack, bitCount) {
            let remainingBits = bitCount;
            while (remainingBits > 0) {
                if (bitsInPartialAccumulator === 8) {
                    currentByteCollector.push(partialBitAccumulator);
                    partialBitAccumulator = 0;
                    bitsInPartialAccumulator = 0;
                }

                const bitsToTransfer = Math.min(remainingBits, 8 - bitsInPartialAccumulator);
                const shiftedSegment = (valueToPack & ((1 << bitsToTransfer) - 1)) << bitsInPartialAccumulator;
                partialBitAccumulator |= shiftedSegment;

                bitsInPartialAccumulator += bitsToTransfer;
                valueToPack >>= bitsToTransfer;
                remainingBits -= bitsToTransfer;
            }
        }

        function finalizeAndRetrieve() {
            if (bitsInPartialAccumulator > 0) {
                currentByteCollector.push(partialBitAccumulator);
            }
            const finalBytes = currentByteCollector;
            currentByteCollector = []; // Reset for reuse
            partialBitAccumulator = 0;
            bitsInPartialAccumulator = 0;
            return new Uint8Array(finalBytes);
        }

        return { contributeCode, finalizeAndRetrieve };
    }

    // --- LZW Encoding (replacing compressWithLZW) ---
    function applyLZWEncoding(sourceIndices, initialCodeSize) {
        const codeForClear = 1 << initialCodeSize;
        const codeForEnd = codeForClear + 1;

        let dictionaryMap = new Map(); // Maps 'sequence,string' -> code
        let nextAvailableCodeId;
        let currentOutputCodeLength;

        function resetEncodingMechanism() {
            nextAvailableCodeId = codeForEnd + 1;
            currentOutputCodeLength = initialCodeSize + 1;
            dictionaryMap.clear();
            for (let i = 0; i < codeForClear; ++i) {
                dictionaryMap.set(String(i), i);
            }
        }

        const encodedOutputSequence = [];
        resetEncodingMechanism();
        encodedOutputSequence.push([codeForClear, currentOutputCodeLength]);

        let currentSequenceBuffer = []; // Stores numeric pixel indices

        for (const indexValue of sourceIndices) {
            const potentialNextSequence = [...currentSequenceBuffer, indexValue];
            const potentialNextSequenceKey = potentialNextSequence.join(',');

            if (dictionaryMap.has(potentialNextSequenceKey)) {
                currentSequenceBuffer = potentialNextSequence;
            } else {
                const currentSequenceKey = currentSequenceBuffer.join(',');
                encodedOutputSequence.push([dictionaryMap.get(currentSequenceKey), currentOutputCodeLength]);

                if (nextAvailableCodeId <= 4095) { // Max LZW code is 4095
                    dictionaryMap.set(potentialNextSequenceKey, nextAvailableCodeId);
                    if (nextAvailableCodeId === (1 << currentOutputCodeLength)) {
                        currentOutputCodeLength++;
                    }
                    nextAvailableCodeId++;
                } else {
                    encodedOutputSequence.push([codeForClear, currentOutputCodeLength]);
                    resetEncodingMechanism();
                    dictionaryMap.set(String(indexValue), indexValue); // Add current index after reset
                }
                currentSequenceBuffer = [indexValue];
            }
        }

        if (currentSequenceBuffer.length > 0) {
            encodedOutputSequence.push([dictionaryMap.get(currentSequenceBuffer.join(',')), currentOutputCodeLength]);
        }

        encodedOutputSequence.push([codeForEnd, currentOutputCodeLength]);

        return encodedOutputSequence; // Array of [code, bitLength] pairs
    }

    // --- Color Quantization Helpers (replacing swap, partition, selectKthElem) ---
    function exchangeArrayElements(arr, idx1, idx2) {
        const temp = arr[idx1];
        arr[idx1] = arr[idx2];
        arr[idx2] = temp;
    }

    function segmentArrayAroundPivot(arr, startIdx, endIdx, pivotIdx) {
        const pivotVal = arr[pivotIdx];
        exchangeArrayElements(arr, pivotIdx, endIdx); // Move pivot to end
        let storePosition = startIdx;
        for (let i = startIdx; i < endIdx; ++i) {
            if (arr[i] <= pivotVal) {
                exchangeArrayElements(arr, storePosition, i);
                storePosition++;
            }
        }
        exchangeArrayElements(arr, endIdx, storePosition); // Move pivot to its final place
        return storePosition;
    }

    function locateNthValue(arr, startIdx, endIdx, targetN) {
        while (true) {
            const chosenPivotIdx = Math.floor((startIdx + endIdx) / 2);
            const newPivotPosition = segmentArrayAroundPivot(arr, startIdx, endIdx, chosenPivotIdx);
            const pivotRelativeRank = newPivotPosition - startIdx + 1;

            if (targetN === pivotRelativeRank) {
                return arr[newPivotPosition];
            } else if (targetN < pivotRelativeRank) {
                endIdx = newPivotPosition - 1;
            } else {
                targetN -= pivotRelativeRank;
                startIdx = newPivotPosition + 1;
            }
        }
    }

    // --- Color Region Management (replacing ColorCube) ---
    function createShadeRegion(colorListInt) { // colorListInt is array of 0xRRGGBB integers
        let minimumR = 255, maximumR = 0;
        let minimumG = 255, maximumG = 0;
        let minimumB = 255, maximumB = 0;

        for (const cVal of colorListInt) {
            const r = (cVal >> 16) & 0xFF;
            const g = (cVal >> 8) & 0xFF;
            const b = cVal & 0xFF;
            if (r < minimumR) minimumR = r;
            if (r > maximumR) maximumR = r;
            if (g < minimumG) minimumG = g;
            if (g > maximumG) maximumG = g;
            if (b < minimumB) minimumB = b;
            if (b > maximumB) maximumB = b;
        }

        return {
            memberColors: colorListInt,
            minimumR, maximumR, minimumG, maximumG, minimumB, maximumB,

            determineDominantAxis: function() {
                const diffRed = (this.maximumR - this.minimumR);
                const diffGreen = (this.maximumG - this.minimumG);
                const diffBlue = (this.maximumB - this.minimumB);
                if (diffGreen >= diffBlue) {
                    return (diffRed >= diffGreen) ? 'red' : 'green';
                } else {
                    return (diffRed >= diffBlue) ? 'red' : 'blue';
                }
            },

            findMedianValueForAxis: function(axis) {
                const axisValues = this.memberColors.map(cVal => {
                    if (axis === 'red') return (cVal >> 16) & 0xFF;
                    if (axis === 'green') return (cVal >> 8) & 0xFF;
                    if (axis === 'blue') return cVal & 0xFF;
                    return 0; // Fallback
                });
                return locateNthValue([...axisValues], 0, axisValues.length - 1, Math.floor(axisValues.length / 2) + 1);
            },

            splitRegionByAxisAndValue: function(axis, splitValue) {
                const lowerSegment = [];
                const upperSegment = [];
                for (const cVal of this.memberColors) {
                    let dimensionValue;
                    if (axis === 'red') dimensionValue = (cVal >> 16) & 0xFF;
                    else if (axis === 'green') dimensionValue = (cVal >> 8) & 0xFF;
                    else dimensionValue = cVal & 0xFF;

                    if (dimensionValue < splitValue) {
                        lowerSegment.push(cVal);
                    } else {
                        upperSegment.push(cVal);
                    }
                }
                if (lowerSegment.length > 0 && upperSegment.length > 0) {
                    return [createShadeRegion(lowerSegment), createShadeRegion(upperSegment)];
                }
                return [];
            },

            calculateAverageColor: function() {
                let sumR = 0, sumG = 0, sumB = 0;
                for (const cVal of this.memberColors) {
                    sumR += (cVal >> 16) & 0xFF;
                    sumG += (cVal >> 8) & 0xFF;
                    sumB += cVal & 0xFF;
                }
                const count = this.memberColors.length;
                return ((Math.floor(sumR / count) << 16) | (Math.floor(sumG / count) << 8) | Math.floor(sumB / count));
            }
        };
    }

    // --- Adaptive Palette Generation (replacing MedianCutColorReducer) ---
    function generateAdaptivePalette(sourceImageData, maximumPaletteEntries) {
        const distinctColorsSet = new Set();
        const totalPixels = sourceImageData.width * sourceImageData.height;
        for (let i = 0; i < totalPixels; ++i) {
            const r = sourceImageData.data[i * 4];
            const g = sourceImageData.data[i * 4 + 1];
            const b = sourceImageData.data[i * 4 + 2];
            distinctColorsSet.add((r << 16) | (g << 8) | b);
        }
        const initialColorList = Array.from(distinctColorsSet);

        let regionQueue = [createShadeRegion(initialColorList)];
        let finalRegions = [];

        while (regionQueue.length > 0 && finalRegions.length + regionQueue.length < maximumPaletteEntries) {
            const currentRegion = regionQueue.shift();
            const splitResult = currentRegion.splitRegionByAxisAndValue(
                currentRegion.determineDominantAxis(),
                currentRegion.findMedianValueForAxis(currentRegion.determineDominantAxis())
            );

            if (splitResult.length === 2) {
                regionQueue.push(splitResult[0], splitResult[1]);
            } else {
                finalRegions.push(currentRegion);
            }
            regionQueue.sort((a, b) => b.memberColors.length - a.memberColors.length);
        }
        finalRegions = finalRegions.concat(regionQueue);

        if (finalRegions.length > maximumPaletteEntries) {
            finalRegions = finalRegions.slice(0, maximumPaletteEntries);
        }

        const computedPalette = finalRegions.map(region => region.calculateAverageColor());
        const paletteByteData = [];
        for (const cVal of computedPalette) {
            paletteByteData.push((cVal >> 16) & 0xFF, (cVal >> 8) & 0xFF, cVal & 0xFF);
        }

        const originalColorToPaletteIndexCache = new Map();

        function findClosestPaletteIndex(targetColorInt, paletteArrayInt) {
            let minSqDistance = Infinity;
            let closestIdx = -1;
            const r1 = (targetColorInt >> 16) & 0xFF;
            const g1 = (targetColorInt >> 8) & 0xFF;
            const b1 = targetColorInt & 0xFF;

            for (let i = 0; i < paletteArrayInt.length; ++i) {
                const pColor = paletteArrayInt[i];
                const r2 = (pColor >> 16) & 0xFF;
                const g2 = (pColor >> 8) & 0xFF;
                const b2 = pColor & 0xFF;
                const distSq = (r1 - r2)**2 + (g1 - g2)**2 + (b1 - b2)**2;
                if (distSq === 0) return i;
                if (distSq < minSqDistance) {
                    minSqDistance = distSq;
                    closestIdx = i;
                }
            }
            return closestIdx;
        }

        function obtainMappedPaletteIndex(red, green, blue) {
            const rgbInt = (red << 16) | (green << 8) | blue;
            if (originalColorToPaletteIndexCache.has(rgbInt)) {
                return originalColorToPaletteIndexCache.get(rgbInt);
            }
            const index = findClosestPaletteIndex(rgbInt, computedPalette);
            originalColorToPaletteIndexCache.set(rgbInt, index);
            return index;
        }

        finalRegions.forEach((region, idx) => {
            const regionAverageColor = region.calculateAverageColor();
            const paletteEntryIndex = computedPalette.indexOf(regionAverageColor);
            if (paletteEntryIndex !== -1) {
                for (const memberColor of region.memberColors) {
                    if (!originalColorToPaletteIndexCache.has(memberColor)) {
                        originalColorToPaletteIndexCache.set(memberColor, paletteEntryIndex);
                    }
                }
            }
        });

        return {
            paletteByteData,
            pixelToPaletteIndexMapper: obtainMappedPaletteIndex
        };
    }

    // --- GIF Stream Construction (replacing GifWriter methods) ---
    function createByteStreamAccumulator() {
        let internalBuffer = [];

        function pushValue(val) {
            if (Array.isArray(val) || val instanceof Uint8Array) {
                internalBuffer.push(...val);
            } else {
                internalBuffer.push(val);
            }
        }

        function pushWord(val) {
            internalBuffer.push(val & 0xFF, (val >> 8) & 0xFF);
        }

        function getAsUint8Array() {
            const finalArray = new Uint8Array(internalBuffer);
            internalBuffer = []; // Reset
            return finalArray;
        }

        return { pushValue, pushWord, getAsUint8Array };
    }

    function writeDataSubBlocks(builder, dataBytes) {
        let currentPosition = 0;
        const maxSubBlockSize = 255;
        while (currentPosition < dataBytes.length) {
            const subBlockLen = Math.min(maxSubBlockSize, dataBytes.length - currentPosition);
            builder.pushValue(subBlockLen);
            builder.pushValue(dataBytes.slice(currentPosition, currentPosition + subBlockLen));
            currentPosition += subBlockLen;
        }
    }

    function injectColorTable(builder, tableData, exponentSize) {
        builder.pushValue(tableData);
        const requiredTableLength = 3 * (1 << (exponentSize + 1));
        const paddingRequired = requiredTableLength - tableData.length;
        for (let i = 0; i < paddingRequired; ++i) {
            builder.pushValue(0);
        }
    }

    function derivePaletteExponent(colorCount) {
        if (colorCount === 0) return 0;
        let exp = 0;
        let val = 2;
        while (val < colorCount) {
            exp++;
            val <<= 1;
        }
        return exp;
    }

    function emitFileSignature(builder) {
        builder.pushValue([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
    }

    function describeLogicalCanvas(builder, canvasWidth, canvasHeight, globalPaletteByteData, backgroundIndex, pixelAspect) {
        const hasGlobalPalette = globalPaletteByteData && globalPaletteByteData.length > 0;
        const globalPaletteExp = hasGlobalPalette ? derivePaletteExponent(globalPaletteByteData.length / 3) : 0;
        
        builder.pushWord(canvasWidth);
        builder.pushWord(canvasHeight);
        
        const packedFieldByte = (hasGlobalPalette ? 0x80 : 0x00) | 0x70 | (0x00) | globalPaletteExp; // 0x70 = 01110000 (8 bits per color, not sorted)
        builder.pushValue(packedFieldByte);

        builder.pushValue(backgroundIndex);
        builder.pushValue(pixelAspect);

        if (hasGlobalPalette) {
            injectColorTable(builder, globalPaletteByteData, globalPaletteExp);
        }
    }

    function writeGraphicControl(builder, frameSettings) {
        const delayInCentiseconds = Math.round((frameSettings.frameDelayMilliseconds || 0) / 10);
        const dispositionMethod = frameSettings.disposalOption || 2;
        const transparencyEnabled = frameSettings.transparentColorIndex !== undefined && frameSettings.transparentColorIndex >= 0;
        const transparencyIndex = transparencyEnabled ? (frameSettings.transparentColorIndex & 0xFF) : 0;
        
        builder.pushValue([0x21, 0xF9, 0x04]); // Extension Introducer, GCE Label, Block Size

        const packedField = (0x00 << 5) | (dispositionMethod << 2) | (0x00 << 1) | (transparencyEnabled ? 0x01 : 0x00);
        builder.pushValue(packedField);
        
        builder.pushWord(delayInCentiseconds);
        builder.pushValue(transparencyIndex);
        builder.pushValue(0x00); // Block Terminator
    }

    function renderImageDescriptor(builder, posX, posY, imgW, imgH, localPaletteByteData) {
        const hasLocalPalette = localPaletteByteData && localPaletteByteData.length > 0;
        const localPaletteExp = hasLocalPalette ? derivePaletteExponent(localPaletteByteData.length / 3) : 0;

        builder.pushValue(0x2C); // Image Separator
        builder.pushWord(posX);
        builder.pushWord(posY);
        builder.pushWord(imgW);
        builder.pushWord(imgH);

        const packedField = (hasLocalPalette ? 0x80 : 0x00) | (0x00 << 6) | (0x00 << 5) | (0x00 << 3) | localPaletteExp;
        builder.pushValue(packedField);
    }

    function insertImagePixelIndices(builder, pixelIndices, baseLzwCodeSize) {
        const effectiveLzwCodeSize = baseLzwCodeSize === 1 ? 2 : baseLzwCodeSize;
        builder.pushValue(effectiveLzwCodeSize);

        const lzwEncodedBitPairs = applyLZWEncoding(pixelIndices, effectiveLzwCodeSize);
        const bitStreamComposer = createBitAssembler();
        for (const [code, length] of lzwEncodedBitPairs) {
            bitStreamComposer.contributeCode(code, length);
        }
        const compressedPixelBytes = bitStreamComposer.finalizeAndRetrieve();
        
        writeDataSubBlocks(builder, compressedPixelBytes);
        builder.pushValue(0x00); // Block Terminator
    }

    function addLoopControlExtension(builder, loopCount) {
        builder.pushValue([
            0x21, // Extension Introducer
            0xFF, // Application Extension Label
            0x0B, // Block Size (11 bytes)
            0x4E, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2E, 0x30, // "NETSCAPE2.0"
            0x03, // Sub-block Size (3 bytes)
            0x01, // Loop Sub-block ID
            (loopCount & 0xFF), // Loop Count LSB
            ((loopCount >> 8) & 0xFF), // Loop Count MSB
            0x00 // Block Terminator
        ]);
    }

    function finalizeFileStream(builder) {
        builder.pushValue(0x3B); // GIF Trailer
    }

    // --- Main GIF Composition Function (replacing GifWriter class) ---
    function assembleAnimatedVisual(animationFrames, globalVisualOptions) {
        const streamBuilder = createByteStreamAccumulator();

        emitFileSignature(streamBuilder);

        let globalPaletteDataBytes = null;
        let globalPixelIndexMapper = null;
        if (globalVisualOptions.globalSourceImageData) {
            const { paletteByteData, pixelToPaletteIndexMapper } = generateAdaptivePalette(globalVisualOptions.globalSourceImageData, 256);
            globalPaletteDataBytes = paletteByteData;
            globalPixelIndexMapper = pixelToPaletteIndexMapper;
        }

        describeLogicalCanvas(
            streamBuilder,
            globalVisualOptions.canvasWidth,
            globalVisualOptions.canvasHeight,
            globalPaletteDataBytes,
            globalVisualOptions.backgroundPaletteIndex || 0,
            globalVisualOptions.pixelAspectRatio || 0
        );

        if (globalVisualOptions.loopRepetitions !== undefined && globalVisualOptions.loopRepetitions >= 0) {
            addLoopControlExtension(streamBuilder, globalVisualOptions.loopRepetitions);
        }

        for (const frame of animationFrames) {
            let framePixelIndices = frame.preIndexedPixelData; // { width, height, data: [indices] }
            let framePaletteDetails = { paletteBytes: null, pixelMapper: globalPixelIndexMapper };

            if (frame.useLocalPalette && frame.sourceImageData) {
                const { paletteByteData, pixelToPaletteIndexMapper } = generateAdaptivePalette(frame.sourceImageData, 256);
                framePaletteDetails = { paletteBytes: paletteByteData, pixelMapper: pixelToPaletteIndexMapper };
                
                const mappedData = [];
                const imgRawData = frame.sourceImageData.data;
                const totalImagePixels = frame.sourceImageData.width * frame.sourceImageData.height;
                for (let i = 0; i < totalImagePixels; ++i) {
                    mappedData.push(pixelToPaletteIndexMapper(
                        imgRawData[i * 4],
                        imgRawData[i * 4 + 1],
                        imgRawData[i * 4 + 2]
                    ));
                }
                framePixelIndices = {
                    width: frame.sourceImageData.width,
                    height: frame.sourceImageData.height,
                    data: mappedData
                };
            } else if (globalPixelIndexMapper && frame.sourceImageData) {
                const mappedData = [];
                const imgRawData = frame.sourceImageData.data;
                const totalImagePixels = frame.sourceImageData.width * frame.sourceImageData.height;
                for (let i = 0; i < totalImagePixels; ++i) {
                    mappedData.push(globalPixelIndexMapper(
                        imgRawData[i * 4],
                        imgRawData[i * 4 + 1],
                        imgRawData[i * 4 + 2]
                    ));
                }
                framePixelIndices = {
                    width: frame.sourceImageData.width,
                    height: frame.sourceImageData.height,
                    data: mappedData
                };
            }

            const { width, height, data: indices } = framePixelIndices;
            const { pixelMapper, paletteBytes } = framePaletteDetails;

            if (frame.options.frameDelayMilliseconds !== undefined || frame.options.disposalOption !== undefined || frame.options.transparentColorIndex !== undefined) {
                writeGraphicControl(streamBuilder, frame.options);
            }

            const frameLocalPaletteUsed = frame.useLocalPalette && paletteBytes && paletteBytes.length > 0;
            const effectivePaletteExp = frameLocalPaletteUsed ? derivePaletteExponent(paletteBytes.length / 3) : (globalPaletteDataBytes ? derivePaletteExponent(globalPaletteDataBytes.length / 3) : 0);


            renderImageDescriptor(
                streamBuilder,
                frame.options.leftPosition || 0,
                frame.options.topPosition || 0,
                width,
                height,
                frameLocalPaletteUsed ? paletteBytes : null
            );

            if (frameLocalPaletteUsed) {
                injectColorTable(streamBuilder, paletteBytes, effectivePaletteExp);
            }

            insertImagePixelIndices(streamBuilder, indices, effectivePaletteExp + 1);
        }

        finalizeFileStream(streamBuilder);

        return streamBuilder.getAsUint8Array();
    }

    return {
        assembleAnimatedVisual
    };
})();