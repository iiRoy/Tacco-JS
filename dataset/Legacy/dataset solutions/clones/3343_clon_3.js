var InputParserFactory = (function() {
    function parseNumericValue(valueString) {
        return +valueString;
    }

    function createParser(sourceContent) {
        return new InputParser(sourceContent);
    }

    function InputParser(rawSource) {
        this._sourceLines = rawSource.trim().split("\n");
        this._currentLineIndex = 0;
        this._lineWordCache = new Map();
    }

    InputParser.prototype.readNumber = function(asString) {
        const currentLineIdx = this._currentLineIndex;
        let wordsOnLine;

        if (this._lineWordCache.has(currentLineIdx)) {
            wordsOnLine = this._lineWordCache.get(currentLineIdx);
        } else {
            const lineContent = this._sourceLines[currentLineIdx];
            wordsOnLine = lineContent.split(" ").reverse();
            this._lineWordCache.set(currentLineIdx, wordsOnLine);
        }

        const extractedWord = wordsOnLine.pop();

        if (!wordsOnLine.length) {
            this._currentLineIndex++;
            this._lineWordCache.delete(currentLineIdx);
        }

        return asString ? extractedWord : parseNumericValue(extractedWord);
    };

    InputParser.prototype.readLineNumbers = function(asStrings) {
        const lineContent = this._sourceLines[this._currentLineIndex++];
        const words = lineContent.split(" ");
        return asStrings ? words : words.map(parseNumericValue);
    };

    InputParser.prototype.readMatrixNumbers = function(rowCount, asStrings) {
        const startIdx = this._currentLineIndex;
        const endIdx = startIdx + rowCount;
        this._currentLineIndex = endIdx;

        const matrixRows = this._sourceLines.slice(startIdx, endIdx);
        return asStrings ?
            matrixRows.map(line => line.split(" ")) :
            matrixRows.map(line => line.split(" ").map(parseNumericValue));
    };

    InputParser.prototype.readLinesAsNumbers = function(rowCount, asStrings) {
        const startIdx = this._currentLineIndex;
        const endIdx = startIdx + rowCount;
        this._currentLineIndex = endIdx;

        const lines = this._sourceLines.slice(startIdx, endIdx);
        return asStrings ? lines : lines.map(parseNumericValue);
    };

    return createParser;
})();

var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function initializeMultiDimArray(initialValue, ...dimensions) {
    const createFilledArray = (size, filler) => {
        const arr = new Array(size);
        for (let i = 0; i < size; i++) {
            arr[i] = typeof filler === 'function' ? filler() : filler;
        }
        return arr;
    };

    const buildArrayRecursive = (dimIndex) => {
        if (dimIndex === dimensions.length - 1) {
            return createFilledArray(dimensions[dimIndex], initialValue);
        } else {
            return createFilledArray(dimensions[dimIndex], () => buildArrayRecursive(dimIndex + 1));
        }
    };

    if (dimensions.length === 0) {
        return initialValue;
    }

    return buildArrayRecursive(0);
}

console.log(executeMainLogic());

function executeMainLogic() {
    var arraySize = inputReader.readNumber();
    var initialValues = inputReader.readLineNumbers();
    return calculateMinimumCost(arraySize, initialValues);
}

function calculateMinimumCost(arraySize, initialValues) {
    const N = arraySize;

    var segmentCosts = initializeMultiDimArray(0, N, N);

    for (let i = 0; i < N; i++) {
        segmentCosts[0][i] = initialValues[i];
    }

    for (let segmentLength = 1; segmentLength < N; segmentLength++) {
        const maxStartIndex = N - segmentLength;
        for (let startIndex = 0; startIndex < maxStartIndex; startIndex++) {
            const previousSegmentCost = segmentCosts[segmentLength - 1][startIndex];
            const currentElementCost = segmentCosts[0][segmentLength + startIndex];
            segmentCosts[segmentLength][startIndex] = previousSegmentCost + currentElementCost;
        }
    }

    var minCostDP = initializeMultiDimArray(1e15, N, N);

    for (let j = 0; j < N; j++) {
        minCostDP[0][j] = 0;
    }

    for (let currentSegmentLength = 1; currentSegmentLength < N; currentSegmentLength++) {
        const maxSegmentStartIndex = N - currentSegmentLength;
        for (let segmentStartIndex = 0; segmentStartIndex < maxSegmentStartIndex; segmentStartIndex++) {
            const mergeCost = segmentCosts[currentSegmentLength][segmentStartIndex];

            for (let splitPointLength = 1; splitPointLength <= currentSegmentLength; splitPointLength++) {
                const leftSubSegmentLength = currentSegmentLength - splitPointLength;
                const leftSubSegmentStart = segmentStartIndex;

                const rightSubSegmentLength = splitPointLength - 1;
                const rightSubSegmentStart = segmentStartIndex + leftSubSegmentLength + 1;

                const currentCalculatedCost =
                    minCostDP[leftSubSegmentLength][leftSubSegmentStart] +
                    minCostDP[rightSubSegmentLength][rightSubSegmentStart] +
                    mergeCost;

                if (currentCalculatedCost < minCostDP[currentSegmentLength][segmentStartIndex]) {
                    minCostDP[currentSegmentLength][segmentStartIndex] = currentCalculatedCost;
                }
            }
        }
    }

    return minCostDP[N - 1][0];
}
