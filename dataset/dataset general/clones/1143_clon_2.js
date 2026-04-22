var dynamicCode;
(function (dynamicCode) {
    (function (picture) {
        var PaletteMappedPicture = (function () {
            function PaletteMappedPicture(dimensions, pixelIndexes, colorMap) {
                this.horzExtent = dimensions.width;
                this.vertExtent = dimensions.height;
                this.pixelIndexes = pixelIndexes;
                this.colorMap = colorMap;
            }
            return PaletteMappedPicture;
        })();
        picture.PaletteMappedPicture = PaletteMappedPicture;        
        var LzwByteAssembler = (function () {
            function LzwByteAssembler() {
                this._outputBuffer = [];
                this._remainingBitsCount = 0;
                this._currentValue = 0;
            }
            LzwByteAssembler.prototype.appendCode = function (symbol, bitLength) {
                while(bitLength > 0) {
                    this._currentValue = ((symbol << this._remainingBitsCount) & 255) + this._currentValue;
                    if(bitLength + this._remainingBitsCount >= 8) {
                        this._outputBuffer.push(this._currentValue);
                        bitLength = bitLength - (8 - this._remainingBitsCount);
                        symbol = (symbol >> (8 - this._remainingBitsCount));
                        this._currentValue = 0;
                        this._remainingBitsCount = 0;
                    } else {
                        this._remainingBitsCount = bitLength + this._remainingBitsCount;
                        bitLength = 0;
                    }
                }
            };
            LzwByteAssembler.prototype.finalizeStream = function () {
                this.appendCode(0, 8);
                this._remainingBitsCount = 0;
                this._currentValue = 0;
                var finalBytes = this._outputBuffer;
                this._outputBuffer = [];
                return finalBytes;
            };
            return LzwByteAssembler;
        })();        
        function encodeLzwData(inputSymbols, initialBitSize) {
            var bytePacker = new LzwByteAssembler();
            var resetSignal = (1 << initialBitSize);
            var terminatorSignal = resetSignal + 1;
            var nextDictionaryEntry;
            var currentCodeBitLength;
            var codeDictionary;
            function initializeEncoderState() {
                nextDictionaryEntry = terminatorSignal + 1;
                currentCodeBitLength = initialBitSize + 1;
                codeDictionary = Object.create(null);
            }
            initializeEncoderState();
            bytePacker.appendCode(resetSignal, currentCodeBitLength);
            var combinedSymbolKey = "";
            for(var idx = 0, total = inputSymbols.length; idx < total; ++idx) {
                var currentSymbol = inputSymbols[idx];
                var symbolKey = String.fromCharCode(currentSymbol);
                if(!(symbolKey in codeDictionary)) {
                    codeDictionary[symbolKey] = currentSymbol;
                }
                var previousKey = combinedSymbolKey;
                combinedSymbolKey += symbolKey;
                if(!(combinedSymbolKey in codeDictionary)) {
                    bytePacker.appendCode(codeDictionary[previousKey], currentCodeBitLength);
                    if(nextDictionaryEntry <= 4095) {
                        codeDictionary[combinedSymbolKey] = nextDictionaryEntry;
                        if(nextDictionaryEntry === (1 << currentCodeBitLength)) {
                            currentCodeBitLength++;
                        }
                        nextDictionaryEntry++;
                    } else {
                        bytePacker.appendCode(resetSignal, currentCodeBitLength);
                        initializeEncoderState();
                        codeDictionary[symbolKey] = currentSymbol;
                    }
                    combinedSymbolKey = symbolKey;
                }
            }
            bytePacker.appendCode(codeDictionary[combinedSymbolKey], currentCodeBitLength);
            bytePacker.appendCode(terminatorSignal, currentCodeBitLength);
            return bytePacker.finalizeStream();
        }
        var AnimatedImageComposer = (function () {
            function AnimatedImageComposer(dataSink) {
                this._outputSink = dataSink;
            }
            AnimatedImageComposer.prototype._writeTwoBytes = function (value) {
                this._outputSink.writeBytes([
                    value & 255, 
                    (value >> 8) & 255
                ]);
            };
            AnimatedImageComposer.prototype._outputDataBlocks = function (blockData) {
                var sinkRef = this._outputSink;
                var currentOffset = 0;
                var blockEndIndex;
                while(currentOffset < (blockEndIndex = Math.min(blockData.length, currentOffset + 254))) {
                    var chunk = blockData.slice(currentOffset, blockEndIndex);
                    sinkRef.writeByte(chunk.length);
                    sinkRef.writeBytes(chunk);
                    currentOffset = blockEndIndex;
                }
            };
            AnimatedImageComposer.prototype._outputBlockEnd = function () {
                this._outputSink.writeByte(0);
            };
            AnimatedImageComposer.prototype.composeHeader = function () {
                var sinkRef = this._outputSink;
                sinkRef.writeBytes([
                    71, 
                    73, 
                    70
                ]);
                sinkRef.writeBytes([
                    56, 
                    57, 
                    97
                ]);
            };
            AnimatedImageComposer.prototype.composeTrailer = function () {
                this._outputSink.writeByte(59);
            };
            AnimatedImageComposer.prototype.composeScreenDescriptor = function (canvasSize, configParams) {
                if(!configParams) {
                    configParams = {
                    };
                }
                var colorTableSizeExp = "sizeOfColorTable" in configParams ? configParams.sizeOfColorTable : configParams.colorTableData ? this._calculateColorTableSize(configParams.colorTableData) : 7;
                var backgroundColorIndex = ("bgColorIndex" in configParams ? configParams.bgColorIndex : 0);
                var pixelAspectRatio = ("pxAspectRatio" in configParams ? configParams.pxAspectRatio : 0);
                this._outputScreenDescriptor(canvasSize, !!configParams.colorTableData, !!configParams.colorTableSortFlag, colorTableSizeExp, backgroundColorIndex, pixelAspectRatio);
                if(!!configParams.colorTableData) {
                    this._outputColorTable(configParams.colorTableData, colorTableSizeExp);
                }
            };
            AnimatedImageComposer.prototype._calculateColorTableSize = function (paletteEntries) {
                var entryCount = paletteEntries.length / 3;
                var sizeExponent = 0;
                var powerOfTwo = 2;
                while(powerOfTwo < entryCount) {
                    sizeExponent++;
                    powerOfTwo = powerOfTwo << 1;
                }
                return sizeExponent;
            };
            AnimatedImageComposer.prototype._outputScreenDescriptor = function (canvasSize, globalColorTablePresent, sortedTableFlag, colorTableSizeExp, backgroundColorIndex, pixelAspectRatio) {
                var sinkRef = this._outputSink;
                this._writeTwoBytes(canvasSize.width);
                this._writeTwoBytes(canvasSize.height);
                sinkRef.writeByte((globalColorTablePresent ? 128 : 0) | 112 | (sortedTableFlag ? 8 : 0) | colorTableSizeExp);
                sinkRef.writeByte(backgroundColorIndex);
                sinkRef.writeByte(pixelAspectRatio);
            };
            AnimatedImageComposer.prototype.composeTableBasedImage = function (pixelMappedImage, configParams) {
                if(!configParams) {
                    configParams = {
                    };
                }
                var localColorTablePresent = true;
                var localColorTableSizeExp = this._calculateColorTableSize(pixelMappedImage.colorMap);
                this._outputImageDescriptor(pixelMappedImage, localColorTablePresent, localColorTableSizeExp, configParams);
                if(localColorTablePresent) {
                    this._outputColorTable(pixelMappedImage.colorMap, (localColorTablePresent ? localColorTableSizeExp : 0));
                }
                this._outputImageData(pixelMappedImage.pixelIndexes, localColorTableSizeExp + 1);
            };
            AnimatedImageComposer.prototype.composeGraphicControlledImage = function (pixelMappedImage, graphicControlOptions) {
                this._outputGraphicControlExtension(graphicControlOptions);
                this.composeTableBasedImage(pixelMappedImage, graphicControlOptions);
            };
            AnimatedImageComposer.prototype._outputImageDescriptor = function (pixelMappedImage, localColorTablePresent, localColorTableSizeExp, opts) {
                var sinkRef = this._outputSink;
                sinkRef.writeByte(44);
                var leftPos = ("leftPosition" in opts ? opts.leftPosition : 0);
                this._writeTwoBytes(leftPos);
                var topPos = ("topPosition" in opts ? opts.topPosition : 0);
                this._writeTwoBytes(topPos);
                this._writeTwoBytes(pixelMappedImage.horzExtent);
                this._writeTwoBytes(pixelMappedImage.vertExtent);
                sinkRef.writeByte((localColorTablePresent ? 128 : 0) | 0 | 0 | 0 | localColorTableSizeExp);
            };
            AnimatedImageComposer.prototype._outputImageData = function (blockData, lzwCodeBits) {
                var sinkRef = this._outputSink;
                if(lzwCodeBits === 1) {
                    lzwCodeBits = 2;
                }
                var encodedBytes = encodeLzwData(blockData, lzwCodeBits);
                sinkRef.writeByte(lzwCodeBits);
                this._outputDataBlocks(encodedBytes);
                this._outputBlockEnd();
            };
            AnimatedImageComposer.prototype._outputColorTable = function (paletteEntries, colorTableSizeExp) {
                var sinkRef = this._outputSink;
                sinkRef.writeBytes(paletteEntries);
                var remainingBytesCount = (3 * Math.pow(2, colorTableSizeExp + 1)) - paletteEntries.length;
                var paddingBytes = [];
                while(--remainingBytesCount >= 0) {
                    paddingBytes.push(0);
                }
                sinkRef.writeBytes(paddingBytes);
            };
            AnimatedImageComposer.prototype._outputGraphicControlExtension = function (configParams) {
                if(!configParams) {
                    configParams = {
                    };
                }
                var sinkRef = this._outputSink;
                var delayInCentiseconds = Math.round((configParams.delayTimeInMS || 0) / 10);
                var disposalMode = ("disposalMethod" in configParams ? configParams.disposalMethod : 2);
                var transparencyIndex;
                var hasTransparency;
                if(configParams.transparentColorIndex >= 0) {
                    transparencyIndex = configParams.transparentColorIndex & 255;
                    hasTransparency = 1;
                } else {
                    transparencyIndex = 0;
                    hasTransparency = 0;
                }
                sinkRef.writeBytes([
                    33, 
                    249, 
                    4
                ]);
                sinkRef.writeByte(0 | (disposalMode << 2) | 0 | hasTransparency);
                this._writeTwoBytes(delayInCentiseconds);
                sinkRef.writeByte(transparencyIndex);
                sinkRef.writeByte(0);
            };
            AnimatedImageComposer.prototype.composeLoopExtension = function (iterationCount) {
                this._outputSink.writeBytes([
                    33, 
                    255, 
                    11, 
                    78, 
                    69, 
                    84, 
                    83, 
                    67, 
                    65, 
                    80, 
                    69, 
                    50, 
                    46, 
                    48, 
                    3, 
                    1, 
                    (iterationCount & 255), 
                    ((iterationCount >> 8) & 255), 
                    0, 
                    
                ]);
            };
            return AnimatedImageComposer;
        })();
        picture.AnimatedImageComposer = AnimatedImageComposer;        
    })(dynamicCode.picture || (dynamicCode.picture = {}));
    var picture = dynamicCode.picture;
})(dynamicCode || (dynamicCode = {}));
var dynamicCode;
(function (dynamicCode) {
    (function (picture) {
        function exchangeElements(dataArray, indexA, indexB) {
            var temporaryValue = dataArray[indexA];
            dataArray[indexA] = dataArray[indexB];
            dataArray[indexB] = temporaryValue;
        }
        function divideAndConquer(inputList, startIdx, endIdx, pivotPosition) {
            var comparisonValue = inputList[pivotPosition];
            exchangeElements(inputList, pivotPosition, endIdx);
            var storePosition = startIdx;
            for(var currentScan = startIdx; currentScan < endIdx; ++currentScan) {
                if(inputList[currentScan] <= comparisonValue) {
                    exchangeElements(inputList, storePosition, currentScan);
                    storePosition = storePosition + 1;
                }
            }
            exchangeElements(inputList, endIdx, storePosition);
            return storePosition;
        }
        function findKthElement(searchList, startIdx, endIdx, targetK) {
            while(true) {
                var pivotPosition = Math.floor((endIdx + startIdx) / 2);
                var newPivotPosition = divideAndConquer(searchList, startIdx, endIdx, pivotPosition);
                var pivotDistance = newPivotPosition - startIdx + 1;
                if(targetK === pivotDistance) {
                    return searchList[newPivotPosition];
                } else if(targetK < pivotDistance) {
                    endIdx = newPivotPosition - 1;
                } else {
                    targetK = targetK - pivotDistance;
                    startIdx = newPivotPosition + 1;
                }
            }
        }
        function locateNearestColor(queryColor, colorCollection) {
            var foundIndex = locateNearestColorIndex(queryColor, colorCollection);
            return colorCollection[foundIndex];
        }
        function locateNearestColorIndex(queryColor, colorCollection) {
            var minDistance = 0;
            var exactMatch = false;
            var exactMatchIndex = -1;
            var nearestIndex = -1;
            var currentIdx = 0;
            colorCollection.forEach(function (paletteColor, idx) {
                var distanceSquared = Math.floor(Math.pow(queryColor.red - paletteColor.red, 2) + Math.pow(queryColor.green - paletteColor.green, 2) + Math.pow(queryColor.blue - paletteColor.blue, 2));
                if(distanceSquared == 0) {
                    exactMatch = true;
                    exactMatchIndex = idx;
                    nearestIndex = idx;
                } else if(minDistance == 0 || distanceSquared < minDistance) {
                    nearestIndex = idx;
                    minDistance = distanceSquared;
                }
            });
            return (exactMatch ? exactMatchIndex : nearestIndex);
        }
        var ColorRegion = (function () {
            function ColorRegion(containedColors) {
                this.containedColors = containedColors;
                var minRed = 255;
                var maxRed = 0;
                var minGreen = 255;
                var maxGreen = 0;
                var minBlue = 255;
                var maxBlue = 0;
                containedColors.forEach(function (individualColor) {
                    if(individualColor.red < minRed) {
                        minRed = individualColor.red;
                    }
                    if(individualColor.red > maxRed) {
                        maxRed = individualColor.red;
                    }
                    if(individualColor.green < minGreen) {
                        minGreen = individualColor.green;
                    }
                    if(individualColor.green > maxGreen) {
                        maxGreen = individualColor.green;
                    }
                    if(individualColor.blue < minBlue) {
                        minBlue = individualColor.blue;
                    }
                    if(individualColor.blue > maxBlue) {
                        maxBlue = individualColor.blue;
                    }
                });
                this._minRedVal = minRed;
                this._maxRedVal = maxRed;
                this._minGreenVal = minGreen;
                this._maxGreenVal = maxGreen;
                this._minBlueVal = minBlue;
                this._maxBlueVal = maxBlue;
            }
            ColorRegion.prototype.splitRegion = function () {
                var splitAxis = this.getLargestAxis();
                var medianValue = this.calculateMedian(splitAxis);
                var resultCubes = this.splitByAxisAndMedian(splitAxis, medianValue);
                return resultCubes;
            };
            ColorRegion.prototype.splitByAxisAndMedian = function (targetAxis, median) {
                var firstHalf = [];
                var secondHalf = [];
                this.containedColors.forEach(function (colorToCategorize) {
                    if(colorToCategorize[targetAxis] < median) {
                        firstHalf.push(colorToCategorize);
                    } else {
                        secondHalf.push(colorToCategorize);
                    }
                });
                if(firstHalf.length > 0 && secondHalf.length > 0) {
                    return [
                        new ColorRegion(firstHalf), 
                        new ColorRegion(secondHalf)
                    ];
                } else {
                    return [];
                }
            };
            ColorRegion.prototype.calculateMedian = function (targetAxis) {
                var axisValues = [];
                var currentColors = this.containedColors;
                for(var idx = 0, count = currentColors.length; idx < count; ++idx) {
                    axisValues.push(currentColors[idx][targetAxis]);
                }
                var calculatedMedian = findKthElement(axisValues, 0, axisValues.length - 1, Math.floor(axisValues.length / 2) + 1);
                return calculatedMedian;
            };
            ColorRegion.prototype.getLargestAxis = function () {
                var redRange = (this._maxRedVal - this._minRedVal) * 1.0;
                var greenRange = (this._maxGreenVal - this._minGreenVal) * 0.8;
                var blueRange = (this._maxBlueVal - this._minBlueVal) * 0.5;
                if(greenRange >= blueRange) {
                    if(redRange >= greenRange) {
                        return "red";
                    } else {
                        return "green";
                    }
                } else {
                    if(redRange >= blueRange) {
                        return "red";
                    } else {
                        return "blue";
                    }
                }
            };
            ColorRegion.prototype.getColorCount = function () {
                return this.containedColors.length;
            };
            ColorRegion.prototype.computeAverageColor = function () {
                var totalRed = 0;
                var totalGreen = 0;
                var totalBlue = 0;
                this.containedColors.forEach(function (c) {
                    totalRed += c.red;
                    totalGreen += c.green;
                    totalBlue += c.blue;
                });
                var numEntries = this.containedColors.length;
                return {
                    red: Math.floor(totalRed / numEntries),
                    green: Math.floor(totalGreen / numEntries),
                    blue: Math.floor(totalBlue / numEntries)
                };
            };
            return ColorRegion;
        })();        
        var AdaptivePaletteGenerator = (function () {
            function AdaptivePaletteGenerator(sourceImageData, maximumPaletteEntries) {
                this._inputImageInfo = sourceImageData;
                this._maxEntries = maximumPaletteEntries || 255;
            }
            AdaptivePaletteGenerator.prototype.generatePalette = function () {
                var sourceImageData = this._inputImageInfo;
                var maxEntriesAllowed = this._maxEntries;
                var uniqueColors = this._extractUniqueColors(sourceImageData);
                var colorCubes = this._medianCut(uniqueColors, maxEntriesAllowed);
                var finalPalette = [];
                var colorToIndexMapping = Object.create(null);
                colorCubes.forEach(function (currentCube, paletteIndex) {
                    finalPalette.push(currentCube.computeAverageColor());
                    currentCube.containedColors.forEach(function (c) {
                        var colorHex = ((c.red << 16) | (c.green << 8) | (c.blue << 0)).toString(16);
                        while(6 - colorHex.length) {
                            colorHex = "0" + colorHex;
                        }
                        colorToIndexMapping[colorHex] = paletteIndex;
                    });
                });
                this._generatedPalette = finalPalette;
                this._colorLookupTable = colorToIndexMapping;
                var paletteEntries = [];
                finalPalette.forEach(function (color) {
                    paletteEntries.push(color.red);
                    paletteEntries.push(color.green);
                    paletteEntries.push(color.blue);
                });
                return paletteEntries;
            };
            AdaptivePaletteGenerator.prototype.getMappedIndex = function (redComp, greenComp, blueComp) {
                var colorHex = ((redComp << 16) | (greenComp << 8) | (blueComp << 0)).toString(16);
                while(6 - colorHex.length) {
                    colorHex = "0" + colorHex;
                }
                if(!(colorHex in this._colorLookupTable)) {
                    this._colorLookupTable[colorHex] = locateNearestColorIndex({
                        red: redComp,
                        green: greenComp,
                        blue: blueComp
                    }, this._generatedPalette);
                }
                return this._colorLookupTable[colorHex];
            };
            AdaptivePaletteGenerator.prototype._extractUniqueColors = function (sourceImageData) {
                var totalPixels = sourceImageData.width * sourceImageData.height;
                var seenColors = {
                };
                var uniqueColors = [];
                for(var pixelIndex = 0; pixelIndex < totalPixels; ++pixelIndex) {
                    var redComp = sourceImageData.data[pixelIndex * 4 + 0];
                    var greenComp = sourceImageData.data[pixelIndex * 4 + 1];
                    var blueComp = sourceImageData.data[pixelIndex * 4 + 2];
                    var colorHex = ((redComp << 16) | (greenComp << 8) | (blueComp << 0)).toString(16);
                    while(6 - colorHex.length) {
                        colorHex = "0" + colorHex;
                    }
                    if(!seenColors[colorHex]) {
                        seenColors[colorHex] = true;
                        uniqueColors.push({
                            red: redComp,
                            green: greenComp,
                            blue: blueComp
                        });
                    }
                }
                return uniqueColors;
            };
            AdaptivePaletteGenerator.prototype._medianCut = function (uniqueColors, maxEntriesAllowed) {
                var regions = [];
                regions.push(new ColorRegion(uniqueColors));
                var currentRegion;
                while(regions.length < maxEntriesAllowed && (currentRegion = this._findSplittableRegion(regions))) {
                    var splitResults = currentRegion.splitRegion();
                    if(splitResults.length === 2) {
                        regions.splice(regions.indexOf(currentRegion), 1);
                        regions.push(splitResults[0], splitResults[1]);
                    } else if(splitResults.length === 1) {
                        // This case implies a split attempt didn't really divide, e.g., all colors were on one side of median
                        // If it can't split further, we should stop trying to split this specific cube
                        // For the purpose of Type II, we keep the logic the same as original which doesn't explicitly handle this edge case,
                        // but rather relies on findSplittableRegion to eventually not find one if all are single colors or unsplittable.
                    }
                }
                return regions;
            };
            AdaptivePaletteGenerator.prototype._findSplittableRegion = function (regions) {
                // Prioritize larger cubes for splitting
                // Original code doesn't explicitly sort or prioritize, just picks one to split.
                // To maintain structural similarity, we'll iterate and find one that isn't a single color.
                for (var i = 0; i < regions.length; i++) {
                    if (regions[i].getColorCount() > 1) {
                        return regions[i];
                    }
                }
                return null; // No splittable regions found
            };
            return AdaptivePaletteGenerator;
        })();
        picture.AdaptivePaletteGenerator = AdaptivePaletteGenerator;
        var QuantizedImageProcessor = (function () {
            function QuantizedImageProcessor(sourceImageData, maximumPaletteEntries, transparentColor) {
                this._inputImageInfo = sourceImageData;
                this._transparencyColor = transparentColor;
                this._paletteMaker = new AdaptivePaletteGenerator(sourceImageData, maximumPaletteEntries);
            }
            QuantizedImageProcessor.prototype.performQuantization = function () {
                var paletteEntries = this._paletteMaker.generatePalette();
                var pixelMappedData = [];
                var transparentColorIndex = -1;
                if (this._transparencyColor) {
                    transparentColorIndex = locateNearestColorIndex(this._transparencyColor, this._paletteMaker._generatedPalette);
                }
                var totalPixels = this._inputImageInfo.width * this._inputImageInfo.height;
                for(var pixelIdx = 0; pixelIdx < totalPixels; ++pixelIdx) {
                    var r = this._inputImageInfo.data[pixelIdx * 4 + 0];
                    var g = this._inputImageInfo.data[pixelIdx * 4 + 1];
                    var b = this._inputImageInfo.data[pixelIdx * 4 + 2];
                    var a = this._inputImageInfo.data[pixelIdx * 4 + 3];
                    if (this._transparencyColor && r === this._transparencyColor.red && g === this._transparencyColor.green && b === this._transparencyColor.blue && a === 0) {
                        pixelMappedData.push(transparentColorIndex);
                    } else {
                        pixelMappedData.push(this._paletteMaker.getMappedIndex(r, g, b));
                    }
                }
                return new PaletteMappedPicture({
                    width: this._inputImageInfo.width,
                    height: this._inputImageInfo.height
                }, pixelMappedData, paletteEntries);
            };
            return QuantizedImageProcessor;
        })();
        picture.QuantizedImageProcessor = QuantizedImageProcessor;
    })(dynamicCode.picture || (dynamicCode.picture = {}));
    var picture = dynamicCode.picture;
})(dynamicCode || (dynamicCode = {}));