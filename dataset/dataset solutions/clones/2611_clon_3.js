const InputReaderFactory = (function () {
    const parseNumericValue = (value) => +value;

    class InputReader {
        constructor(sourceString) {
            this._sourceLines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        readNextToken(asString = false) {
            let currentLineContent = this._sourceLines[this._currentLineIndex];
            if (typeof currentLineContent === "string") {
                this._sourceLines[this._currentLineIndex] = currentLineContent.split(" ").reverse();
            }
            const token = this._sourceLines[this._currentLineIndex].pop();

            if (!this._sourceLines[this._currentLineIndex].length) {
                this._currentLineIndex++;
            }
            return asString ? token : parseNumericValue(token);
        }

        readLineTokens(asString = false) {
            const lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
            return asString ? lineTokens : lineTokens.map(parseNumericValue);
        }

        readMatrix(numRows, asString = false) {
            const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows)
                                                .map(line => line.split(" "));
            this._currentLineIndex += numRows;
            return asString ? matrixRows : matrixRows.map(row => row.map(parseNumericValue));
        }

        readLinesAsNumbers(numLines, asString = false) {
            const lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numLines);
            this._currentLineIndex += numLines;
            return asString ? lines : lines.map(parseNumericValue);
        }
    }

    return function createReader(sourceString) {
        return new InputReader(sourceString);
    };
})();

const inputData = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayCreationString = `Array(args[${--argCount}]).fill(0).map(x=>{return ${initialValue};})`;
    while (--argCount) {
        arrayCreationString = `Array(args[${argCount}]).fill(0).map(x=>${arrayCreationString})`;
    }
    return eval(arrayCreationString);
}

let numPoints;
let pointXCoords = [];
let pointYCoords = [];
let pointAngles = [];
const numIterations = 10000;

console.log(calculateMaxVectorMagnitude());

function calculateMaxVectorMagnitude() {
    let initialPointCount = inputData.readNextToken();

    const tempXCoords = [];
    const tempYCoords = [];
    const tempAngles = [];

    for (let iterIndex = 0; iterIndex < initialPointCount; iterIndex++) {
        const currentX = inputData.readNextToken();
        const currentY = inputData.readNextToken();

        if (currentX === 0 && currentY === 0) {
            continue;
        }

        tempXCoords.push(currentX);
        tempYCoords.push(currentY);
        tempAngles.push(calculateAngleInDegrees(currentX, currentY));
    }

    pointXCoords = tempXCoords;
    pointYCoords = tempYCoords;
    pointAngles = tempAngles;

    numPoints = pointXCoords.length;
    let maxSquaredMagnitude = 0;

    const isWithinAngularRange = (currentScanAngle, pointAngle) => {
        const lowerBound = currentScanAngle - 90;
        const upperBound = currentScanAngle + 90;
        const extendedUpperBound = currentScanAngle + 270;

        return (pointAngle > lowerBound && pointAngle < upperBound) || (pointAngle > extendedUpperBound);
    };

    for (let iterIndex = 0; iterIndex < numIterations; iterIndex++) {
        const currentScanAngleDegree = (iterIndex + 0.5) / numIterations * 360;
        let totalXComponent = 0;
        let totalYComponent = 0;

        for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
            const currentPointAngle = pointAngles[pointIndex];
            if (isWithinAngularRange(currentScanAngleDegree, currentPointAngle)) {
                totalXComponent += pointXCoords[pointIndex];
                totalYComponent += pointYCoords[pointIndex];
            }
        }

        const currentSquaredMagnitude = totalXComponent * totalXComponent + totalYComponent * totalYComponent;
        if (maxSquaredMagnitude < currentSquaredMagnitude) {
            maxSquaredMagnitude = currentSquaredMagnitude;
        }
    }
    return Math.sqrt(maxSquaredMagnitude);
}

function calculateAngleInDegrees(xCoord, yCoord) {
    if (xCoord === 0) {
        return yCoord > 0 ? 90 : 270;
    }
    if (yCoord === 0) {
        return xCoord > 0 ? 0 : 180;
    }

    const ratio = yCoord / xCoord;
    let rawAngle = Math.atan(ratio) / Math.PI * 180;

    if (xCoord < 0) {
        rawAngle += 180;
    }
    if (rawAngle < 0) {
        rawAngle += 360;
    }

    if (rawAngle < 0 || rawAngle >= 360) throw (1);
    return rawAngle;
}
