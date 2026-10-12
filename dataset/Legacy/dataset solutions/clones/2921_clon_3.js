const InputReaderFactory = (() => {
    class InputReader {
        constructor(sourceContent) {
            this._sourceLines = sourceContent.trim().split("\n");
            this._currentLineIndex = 0;
        }

        static _convertArrayToNumbers(stringArray) {
            return stringArray.map(item => +item);
        }

        _prepareCurrentLineTokens() {
            const currentLineData = this._sourceLines[this._currentLineIndex];
            if (typeof currentLineData === "string") {
                this._sourceLines[this._currentLineIndex] = currentLineData.split(" ").reverse();
            }
        }

        readNextToken(returnAsString) {
            this._prepareCurrentLineTokens();
            const lineTokens = this._sourceLines[this._currentLineIndex];
            const tokenValue = lineTokens.pop();

            if (lineTokens.length === 0) {
                this._currentLineIndex++;
            }
            return returnAsString ? tokenValue : +tokenValue;
        }

        readLineTokens(returnAsString) {
            const lineContent = this._sourceLines[this._currentLineIndex++];
            const tokens = lineContent.split(" ");
            return returnAsString ? tokens : InputReader._convertArrayToNumbers(tokens);
        }

        readMatrix(numberOfRows, returnAsString) {
            const rawRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numberOfRows);
            this._currentLineIndex += numberOfRows;
            const parsedRows = rawRows.map(row => row.split(" "));
            return returnAsString ? parsedRows : parsedRows.map(row => InputReader._convertArrayToNumbers(row));
        }

        readLines(numberOfLines, returnAsString) {
            const lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numberOfLines);
            this._currentLineIndex += numberOfLines;
            return returnAsString ? lines : InputReader._convertArrayToNumbers(lines);
        }
    }

    return (source) => new InputReader(source);
})();

const inputHandler = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const dimensions = Array.from(arguments).slice(1);
    let currentDimensionIndex = dimensions.length;

    if (currentDimensionIndex === 0) {
        return initialValue;
    }

    let arrayConstructionExpression = `Array(dimensions[${--currentDimensionIndex}]).fill(0).map(() => { return ${initialValue}; })`;

    while (currentDimensionIndex > 0) {
        --currentDimensionIndex;
        arrayConstructionExpression = `Array(dimensions[${currentDimensionIndex}]).fill(0).map(() => ${arrayConstructionExpression})`;
    }
    return eval(arrayConstructionExpression);
}

console.log(calculateMaxSum());

function calculateMaxSum() {
    const arrayLength = inputHandler.readNextToken();
    const dataArray = inputHandler.readLineTokens();
    let maxSum = 0;

    const halfLength = arrayLength >> 1;

    for (let stepSize = 1; stepSize < halfLength; stepSize++) {
        const visitedIndices = new Set();
        let currentIterationSum = 0;
        const rightBoundaryForLeftIndex = arrayLength - stepSize;

        for (let leftIndex = stepSize; leftIndex < rightBoundaryForLeftIndex; leftIndex += stepSize) {
            const rightIndex = arrayLength - leftIndex - 1;

            const isLeftIndexVisited = visitedIndices.has(leftIndex);
            const isRightIndexVisited = visitedIndices.has(rightIndex);
            const areIndicesIdentical = leftIndex === rightIndex;

            if (isLeftIndexVisited || isRightIndexVisited || areIndicesIdentical) {
                break;
            }

            const valueAtLeft = dataArray[leftIndex];
            const valueAtRight = dataArray[rightIndex];
            currentIterationSum += valueAtLeft + valueAtRight;

            maxSum = Math.max(maxSum, currentIterationSum);

            visitedIndices.add(leftIndex);
            visitedIndices.add(rightIndex);
        }
    }
    return maxSum;
}
