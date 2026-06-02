var createInputReader = (function() {
    class InputProcessor {
        constructor(sourceString) {
            this._lines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _getNextToken(returnRawString) {
            let currentLineContent = this._lines[this._currentLineIndex];

            if (typeof currentLineContent === "string") {
                this._lines[this._currentLineIndex] = currentLineContent.split(" ").reverse();
            }

            const token = this._lines[this._currentLineIndex].pop();

            if (!this._lines[this._currentLineIndex].length) {
                this._currentLineIndex++;
            }
            return returnRawString ? token : Number(token);
        }

        readSingleToken(returnRawString = false) {
            return this._getNextToken(returnRawString);
        }

        readLineTokens(returnRawStrings = false) {
            const lineContent = this._lines[this._currentLineIndex++];
            const tokens = lineContent.split(" ");
            return returnRawStrings ? tokens : tokens.map(val => Number(val));
        }

        readMatrix(numRows, returnRawStrings = false) {
            const matrixRows = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
            return returnRawStrings ?
                matrixRows.map(row => row.split(" ")) :
                matrixRows.map(row => row.split(" ").map(val => Number(val)));
        }

        readRawLines(numRows, returnRawStrings = false) {
            const rawLines = this._lines.slice(this._currentLineIndex, this._currentLineIndex += numRows);
            return returnRawStrings ? rawLines : rawLines.map(val => Number(val));
        }
    }
    return function createReaderInstance(sourceString) {
        return new InputProcessor(sourceString);
    };
})();

function initializeMultiDimArray(initialValue) {
    var dimensions = arguments,
        dimCount = dimensions.length,
        arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

var inputProcessor = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

console.log(processMainLogic());

function processMainLogic() {
    const arraySize = inputProcessor.readSingleToken();
    const dataArray = inputProcessor.readLineTokens();
    let maxSum = 0;

    const halfSize = Math.floor(arraySize / 2);

    for (let step = 1; step < halfSize; step++) {
        const visitedIndices = new Set();
        let currentSum = 0;

        for (let currentIndex = step; currentIndex < arraySize - 1; currentIndex += step) {
            const complementaryIndex = arraySize - currentIndex - 1;

            const isInvalidPair = visitedIndices.has(currentIndex) ||
                                  visitedIndices.has(complementaryIndex) ||
                                  currentIndex === complementaryIndex;
            if (isInvalidPair) {
                break;
            }

            currentSum += dataArray[currentIndex] + dataArray[complementaryIndex];
            maxSum = Math.max(maxSum, currentSum);

            visitedIndices.add(currentIndex);
            visitedIndices.add(complementaryIndex);
        }
    }
    return maxSum;
}
