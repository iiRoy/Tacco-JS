var createInputReader = (function() {
    function readerFactory(inputString) {
        return new InputProcessor(inputString);
    }

    function InputProcessor(rawInput) {
        this._sourceLines = rawInput.trim().split("\n");
        this._currentLinePointer = 0;
        this._currentLineTokens = null; // Stores tokens for the current line, consumed by extractToken
    }

    InputProcessor.prototype.extractToken = function(asNumber) {
        if (!this._currentLineTokens || this._currentLineTokens.length === 0) {
            // If current line tokens are exhausted or not initialized, load the next line
            if (this._currentLinePointer >= this._sourceLines.length) {
                return undefined; // No more input
            }
            this._currentLineTokens = this._sourceLines[this._currentLinePointer++].trim().split(" ").reverse();
        }
        const token = this._currentLineTokens.pop();
        return asNumber ? +token : token;
    };

    InputProcessor.prototype.extractLine = function(asNumber) {
        if (this._currentLinePointer >= this._sourceLines.length) {
            return undefined; // No more input
        }
        const lineStr = this._sourceLines[this._currentLinePointer++];
        this._currentLineTokens = null; // Invalidate current tokens for extractToken
        const tokens = lineStr.trim().split(" ");
        return asNumber ? tokens.map(val => +val) : tokens;
    };

    InputProcessor.prototype.extractMatrix = function(rowCount, asNumber) {
        return Array.from({
            length: rowCount
        }, () => this.extractLine(asNumber));
    };

    InputProcessor.prototype.extractRows = function(rowCount, asNumber) {
        return Array.from({
            length: rowCount
        }, () => {
            if (this._currentLinePointer >= this._sourceLines.length) {
                return undefined; // No more input
            }
            const lineStr = this._sourceLines[this._currentLinePointer++];
            this._currentLineTokens = null; // Invalidate current tokens for extractToken
            return asNumber ? +lineStr : lineStr;
        });
    };

    return readerFactory;
})();

var inputSource = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createNestedArray(initialFillValue, ...dimensionSizes) {
    const buildRecursive = (dims) => {
        if (dims.length === 0) {
            return initialFillValue;
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array.from({
            length: currentDimSize
        }, () => buildRecursive(remainingDims));
    };
    return buildRecursive(dimensionSizes);
}

function findInsertionPoint(sortedCollection, targetValue, startIndex, endIndex) {
    if (startIndex >= endIndex) {
        return sortedCollection[startIndex] < targetValue ? endIndex : startIndex;
    }
    const midPoint = Math.floor((startIndex + endIndex) / 2);
    if (sortedCollection[midPoint] < targetValue) {
        return findInsertionPoint(sortedCollection, targetValue, midPoint + 1, endIndex);
    } else {
        return findInsertionPoint(sortedCollection, targetValue, startIndex, midPoint);
    }
}

// Helper for core skipping logic
function calculateSkippedSequence(startPosition, totalElements, sequenceData, indexLookup) {
    const collectedElements = [];
    let currentScanPosition = startPosition;

    while (currentScanPosition < totalElements) {
        const currentElement = sequenceData[currentScanPosition];
        const elementIndices = indexLookup.get(currentElement);

        let nextOccurrenceIndex = findInsertionPoint(elementIndices, currentScanPosition + 1, 0, elementIndices.length);

        if (nextOccurrenceIndex < elementIndices.length) {
            currentScanPosition = elementIndices[nextOccurrenceIndex];
        } else {
            collectedElements.push(currentElement);
        }
        currentScanPosition++;
    }
    return collectedElements;
}


processDataFlow();

function processDataFlow() {
    var totalElements = inputSource.extractToken(true);
    var maxIterations = inputSource.extractToken(true);
    var dataArray = inputSource.extractLine(true);

    var elementIndexMap = new Map();
    for (var idx = 0; idx < totalElements; idx++) {
        const currentElementValue = dataArray[idx];
        if (elementIndexMap.has(currentElementValue)) {
            elementIndexMap.get(currentElementValue).push(idx);
        } else {
            elementIndexMap.set(currentElementValue, [idx]);
        }
    }

    var finalResultSequence = [];
    let currentPosition = 0;
    while (currentPosition < totalElements) {
        const currentElementValue = dataArray[currentPosition];
        const elementIndices = elementIndexMap.get(currentElementValue);
        const searchResultIndex = findInsertionPoint(elementIndices, currentPosition + 1, 0, elementIndices.length);

        if (searchResultIndex !== elementIndices.length) {
            currentPosition = elementIndices[searchResultIndex];
        } else {
            finalResultSequence.push(currentElementValue);
        }
        currentPosition++;
    }

    if (maxIterations === 1 || finalResultSequence.length === 0) {
        if (finalResultSequence.length) console.log(finalResultSequence.join(" "));
        return;
    }

    var uniquePatternElements = new Set();
    uniquePatternElements.add(finalResultSequence[0]);
    var patternStartValues = [, finalResultSequence[0]]; // Index 0 is null to align with original's first[1] usage

    let iterationCounter = 1; // Corresponds to original 'i'
    while (iterationCounter < maxIterations) {
        if (finalResultSequence.length === 0) {
            break;
        }

        const currentPatternStarter = patternStartValues[iterationCounter];
        const starterIndices = elementIndexMap.get(currentPatternStarter);
        const firstStarterIndex = findInsertionPoint(starterIndices, 0, 0, starterIndices.length);
        let scanStartPos = starterIndices[firstStarterIndex] + 1;

        const nextResultSequence = [];
        let patternDiscoveryFlag = false; // Corresponds to original 'f'

        let innerScanPosition = scanStartPos;
        while (innerScanPosition < totalElements) {
            const element = dataArray[innerScanPosition];
            const indices = elementIndexMap.get(element);
            const nextIdxInIndices = findInsertionPoint(indices, innerScanPosition + 1, 0, indices.length);

            if (nextIdxInIndices < indices.length) {
                innerScanPosition = indices[nextIdxInIndices];
                patternDiscoveryFlag = false;
            } else {
                nextResultSequence.push(element);
                if (patternDiscoveryFlag) {
                    if (!uniquePatternElements.has(element)) {
                        iterationCounter++; // Original 'i++'
                        if (iterationCounter >= maxIterations) break; // Check if we exceeded k
                        patternStartValues.push(element);
                        uniquePatternElements.add(element);
                    } else {
                        patternDiscoveryFlag = false;
                    }
                }
                if (nextResultSequence.length === 1) {
                    uniquePatternElements.add(element);
                    patternStartValues.push(element);
                    patternDiscoveryFlag = true;
                }
            }
            innerScanPosition++;
        }
        finalResultSequence = nextResultSequence;
        iterationCounter++; // Original 'i++' at end of outer loop
    }

    if (finalResultSequence.length === 0) {
        iterationCounter++; // Original: if(ans.length === 0)i++;
    }

    var remainingIterations = maxIterations % iterationCounter;
    if (remainingIterations === 0) {
        if (finalResultSequence.length) console.log(finalResultSequence.join(" "));
        return;
    }

    let finalScanStartPosition;
    if (remainingIterations === 1) {
        finalScanStartPosition = 0;
    } else {
        const targetStarter = patternStartValues[remainingIterations - 1];
        const starterIndices = elementIndexMap.get(targetStarter);
        const firstStarterIndex = findInsertionPoint(starterIndices, 0, 0, starterIndices.length);
        finalScanStartPosition = starterIndices[firstStarterIndex] + 1;
    }

    finalResultSequence = calculateSkippedSequence(finalScanStartPosition, totalElements, dataArray, elementIndexMap);

    if (finalResultSequence.length) console.log(finalResultSequence.join(" "));
}
