class DataStreamProcessor {
    constructor(sourceContent) {
        this.sourceLines = sourceContent.trim().split('\n');
        this.currentLinePointer = 0;
        this.currentLineTokens = [];
        this.currentTokenPointer = 0;
    }

    _advanceLineIfTokensExhausted() {
        if (this.currentTokenPointer >= this.currentLineTokens.length) {
            if (this.currentLinePointer >= this.sourceLines.length) {
                throw new Error("Input stream exhausted.");
            }
            this.currentLineTokens = this.sourceLines[this.currentLinePointer++].split(' ');
            this.currentTokenPointer = 0;
        }
    }

    fetchToken(returnAsString = false) {
        this._advanceLineIfTokensExhausted();
        const tokenValue = this.currentLineTokens[this.currentTokenPointer++];
        return returnAsString ? tokenValue : Number(tokenValue);
    }

    fetchLine(returnAsString = false) {
        if (this.currentLinePointer >= this.sourceLines.length) {
            throw new Error("Input stream exhausted.");
        }
        this.currentLineTokens = [];
        this.currentTokenPointer = 0;

        const lineContent = this.sourceLines[this.currentLinePointer++];
        const lineTokens = lineContent.split(' ');
        return returnAsString ? lineTokens : lineTokens.map(Number);
    }

    fetchMatrix(rowCount, returnAsString = false) {
        const resultMatrix = [];
        for (let idx = 0; idx < rowCount; idx++) {
            resultMatrix.push(this.fetchLine(returnAsString));
        }
        return resultMatrix;
    }

    fetchRawLines(lineCount, returnAsString = false) {
        if (this.currentLinePointer + lineCount > this.sourceLines.length) {
            throw new Error("Not enough lines available in input stream.");
        }
        const slicedLines = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer + lineCount);
        this.currentLinePointer += lineCount;
        return returnAsString ? slicedLines : slicedLines.map(val => Number(val.trim()));
    }
}

const createStreamReader = (inputString) => new DataStreamProcessor(inputString);

function generateMultiDimensionalArray(initialFillValue, ...dimensions) {
    const constructArray = (dims) => {
        if (dims.length === 0) {
            return initialFillValue;
        }
        const currentDimensionSize = dims[0];
        const remainingDimensions = dims.slice(1);
        return Array.from({ length: currentDimensionSize }, () => constructArray(remainingDimensions));
    };
    return constructArray(dimensions);
}

const dataInput = createStreamReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculateSumOfSquares(hCoordinate, wCoordinate, pointCollection) {
    const { sumOfX, sumOfY } = pointCollection.reduce((accumulator, currentPoint) => {
        const [pointX, pointY] = currentPoint;
        if (pointX * wCoordinate + pointY * hCoordinate > 0) {
            accumulator.sumOfX += pointX;
            accumulator.sumOfY += pointY;
        }
        return accumulator;
    }, { sumOfX: 0, sumOfY: 0 });
    return sumOfX * sumOfX + sumOfY * sumOfY;
}

function executeOptimization() {
    const initialPointCount = dataInput.fetchToken();
    const collectedPoints = [];

    for (let k = 0; k < initialPointCount; k++) {
        const currentX = dataInput.fetchToken();
        const currentY = dataInput.fetchToken();
        if (currentX !== 0 || currentY !== 0) {
            collectedPoints.push([currentX, currentY]);
        }
    }

    let maximumSquareDistance = 0;

    const coordinateRangeStart = -1000000;
    const coordinateRangeEnd = 1000000;
    const coordinateStep = 20;

    const iterationCoordinates = Array.from(
        { length: (coordinateRangeEnd - coordinateRangeStart) / coordinateStep + 1 },
        (_, index) => coordinateRangeStart + index * coordinateStep
    );

    const allTestCases = [];
    iterationCoordinates.forEach(iterVal => {
        allTestCases.push([coordinateRangeStart, iterVal]);
        allTestCases.push([coordinateRangeEnd, iterVal]);
        allTestCases.push([iterVal, coordinateRangeEnd]);
        allTestCases.push([iterVal, coordinateRangeStart]);
    });

    maximumSquareDistance = allTestCases.reduce((currentMax, [h, w]) => {
        return Math.max(currentMax, calculateSumOfSquares(h, w, collectedPoints));
    }, 0);

    return Math.sqrt(maximumSquareDistance);
}

console.log(executeOptimization());
