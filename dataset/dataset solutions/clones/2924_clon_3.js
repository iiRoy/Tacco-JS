const InputDataParser = (function() {
    function createInputParser(rawInputString) {
        return new InputSourceHandler(rawInputString);
    }

    function InputSourceHandler(initialContent) {
        this._linesBuffer = initialContent.trim().split("\n");
        this._currentLinePointer = 0;
        this._activeLineTokensStack = [];
    }

    InputSourceHandler.prototype = {
        constructor: InputSourceHandler,

        readNextToken: function(returnAsText = false) {
            if (this._currentLinePointer >= this._linesBuffer.length) {
                console.warn("InputDataParser: Attempted to read beyond end of input.");
                return undefined;
            }

            if (this._activeLineTokensStack.length === 0) {
                const lineContent = this._linesBuffer[this._currentLinePointer];
                this._activeLineTokensStack = lineContent.split(" ").reverse();
            }

            const extractedToken = this._activeLineTokensStack.pop();

            if (this._activeLineTokensStack.length === 0) {
                this._currentLinePointer++;
            }

            return returnAsText ? extractedToken : Number(extractedToken);
        },

        readTokensFromLine: function(keepStrings = false) {
            if (this._currentLinePointer >= this._linesBuffer.length) {
                console.warn("InputDataParser: Attempted to read line beyond end of input.");
                return [];
            }
            this._activeLineTokensStack = [];
            
            const currentLine = this._linesBuffer[this._currentLinePointer++];
            const tokens = currentLine.split(" ");
            return keepStrings ? tokens : tokens.map(tokenStr => Number(tokenStr));
        },

        readNumericMatrix: function(numLinesToRead, preserveStringFormat = false) {
            const availableLines = this._linesBuffer.length - this._currentLinePointer;
            const actualLinesToRead = Math.min(numLinesToRead, availableLines);

            if (actualLinesToRead <= 0) {
                console.warn("InputDataParser: No lines available to read for matrix.");
                return [];
            }
            this._activeLineTokensStack = [];

            const matrixRows = this._linesBuffer.slice(this._currentLinePointer, this._currentLinePointer + actualLinesToRead)
                                              .map(line => line.split(" "));
            this._currentLinePointer += actualLinesToRead;

            return preserveStringFormat ? matrixRows : matrixRows.map(row => row.map(str => Number(str)));
        },

        fetchRawLines: function(count, convertNumeric = false) {
            const available = this._linesBuffer.length - this._currentLinePointer;
            const actualCount = Math.min(count, available);

            if (actualCount <= 0) {
                console.warn("InputDataParser: No raw lines available to fetch.");
                return [];
            }
            this._activeLineTokensStack = [];

            const fetchedLines = this._linesBuffer.slice(this._currentLinePointer, this._currentLinePointer + actualCount);
            this._currentLinePointer += actualCount;

            return convertNumeric ? fetchedLines.map(line => Number(line)) : fetchedLines;
        },

        hasMoreLines: function() {
            return this._currentLinePointer < this._linesBuffer.length;
        }
    };

    return createInputParser;
})();

let inputDataFeed;
try {
    inputDataFeed = InputDataParser(require("fs").readFileSync("/dev/stdin", "utf8"));
} catch (error) {
    console.error("Error reading from /dev/stdin:", error.message);
    inputDataFeed = InputDataParser("");
}

function createNestingArray(initialFillValue, ...arrayDimensions) {
    if (!arrayDimensions.every(dim => Number.isInteger(dim) && dim >= 0)) {
        console.error("createNestingArray: Invalid array dimensions provided. Must be non-negative integers.");
        return [];
    }

    if (arrayDimensions.length === 0) {
        return initialFillValue;
    }

    const buildDimension = (currentDimensionIndex) => {
        const currentSize = arrayDimensions[currentDimensionIndex];

        if (currentDimensionIndex === arrayDimensions.length - 1) {
            return Array(currentSize).fill(initialFillValue);
        } else {
            return Array(currentSize).fill(null).map(() => buildDimension(currentDimensionIndex + 1));
        }
    };

    return buildDimension(0);
}

console.log(executeProblemSolver());

function executeProblemSolver() {
    const collectionSize = inputDataFeed.readNextToken();
    const numericCollection = inputDataFeed.readTokensFromLine();

    let globalMaximumSum = 0;

    if (collectionSize < 3) {
        return 0;
    }

    const midpointExclusive = Math.floor(collectionSize / 2);

    for (let currentStep = 1; currentStep < midpointExclusive; ++currentStep) {
        const pathVisitedIndices = new Set();
        let pathAccumulatedSum = 0;

        for (let currentPosition = currentStep; currentPosition < collectionSize - 1; currentPosition += currentStep) {
            const partnerPosition = collectionSize - 1 - currentPosition;

            if (pathVisitedIndices.has(currentPosition) ||
                pathVisitedIndices.has(partnerPosition) ||
                currentPosition === partnerPosition) {
                break;
            }

            const valueAtCurrentPos = numericCollection[currentPosition];
            const valueAtPartnerPos = numericCollection[partnerPosition];

            pathAccumulatedSum += (valueAtCurrentPos + valueAtPartnerPos);

            globalMaximumSum = Math.max(globalMaximumSum, pathAccumulatedSum);

            pathVisitedIndices.add(currentPosition);
            pathVisitedIndices.add(partnerPosition);
        }
    }

    return globalMaximumSum;
}