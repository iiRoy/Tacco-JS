var InputReader = (function () {
    function createReader(sourceString) {
        return new ReaderInstance(sourceString);
    }

    function ReaderInstance(sourceString) {
        this._sourceLines = sourceString.trim().split("\n");
        this._currentLineIdx = 0;
    }

    ReaderInstance.prototype._prepareLineForPop = function () {
        const currentLine = this._sourceLines[this._currentLineIdx];
        if (typeof currentLine === "string") {
            this._sourceLines[this._currentLineIdx] = currentLine.split(" ").reverse();
        }
    };

    ReaderInstance.prototype.readNextValue = function (asString) {
        this._prepareLineForPop();
        const lineParts = this._sourceLines[this._currentLineIdx];
        const extractedValue = lineParts.pop();

        if (!lineParts.length) {
            this._currentLineIdx++;
        }
        return asString ? extractedValue : Number(extractedValue);
    };

    ReaderInstance.prototype.readLineAsNumbersOrStrings = function (asStrings) {
        const lineContent = this._sourceLines[this._currentLineIdx++];
        const parts = lineContent.split(" ");
        return asStrings ? parts : parts.map(val => Number(val));
    };

    ReaderInstance.prototype.readMatrixAsNumbersOrStrings = function (count, asStrings) {
        const matrixRows = this._sourceLines.slice(this._currentLineIdx, this._currentLineIdx += count);
        const processedMatrix = matrixRows.map(row => row.split(" "));
        return asStrings ? processedMatrix : processedMatrix.map(row => row.map(val => Number(val)));
    };

    ReaderInstance.prototype.readRawLinesAsNumbersOrStrings = function (count, asStrings) {
        const rawLines = this._sourceLines.slice(this._currentLineIdx, this._currentLineIdx += count);
        return asStrings ? rawLines : rawLines.map(val => Number(val));
    };

    return createReader;
})();

var inputData = InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    var args = arguments,
        argCount = args.length,
        expression = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        expression = "Array(args[" + argCount + "]).fill(0).map(x=>" + expression + ")";
    }
    return eval(expression);
}

var numInitialPoints;
var xCoords = [];
var yCoords = [];
var pointAngles = [];

const ANGLE_RESOLUTION_STEPS = 360000;

console.log(calculateMaxDistance());

function calculateMaxDistance() {
    numInitialPoints = inputData.readNextValue();

    const processInputPoint = (xVal, yVal) => {
        if (xVal === 0 && yVal === 0) {
            return;
        }
        xCoords.push(xVal);
        yCoords.push(yVal);
        pointAngles.push(computePolarAngleDegrees(xVal, yVal));
    };

    for (let i = 0; i < numInitialPoints; i++) {
        const currentX = inputData.readNextValue();
        const currentY = inputData.readNextValue();
        processInputPoint(currentX, currentY);
    }

    const actualPointCount = xCoords.length;
    let maxSquaredDistance = 0;

    const FULL_CIRCLE_DEGREES = 360;
    const HALF_CIRCLE_DEGREES = 180;
    const QUARTER_CIRCLE_DEGREES = 90;

    const isAngleWithinArc = (targetAngle, centerAngle) => {
        let angleDifference = targetAngle - centerAngle;

        if (angleDifference > HALF_CIRCLE_DEGREES) {
            angleDifference -= FULL_CIRCLE_DEGREES;
        }
        if (angleDifference <= -HALF_CIRCLE_DEGREES) {
            angleDifference += FULL_CIRCLE_DEGREES;
        }
        
        return Math.abs(angleDifference) < QUARTER_CIRCLE_DEGREES;
    };

    for (let currentStep = 0; currentStep < ANGLE_RESOLUTION_STEPS; currentStep++) {
        const currentAngleDegrees = (currentStep / ANGLE_RESOLUTION_STEPS) * FULL_CIRCLE_DEGREES;

        let tempXSum = 0;
        let tempYSum = 0;

        for (let pointIdx = 0; pointIdx < actualPointCount; pointIdx++) {
            const currentPointAngle = pointAngles[pointIdx];
            
            if (isAngleWithinArc(currentPointAngle, currentAngleDegrees)) {
                tempXSum += xCoords[pointIdx];
                tempYSum += yCoords[pointIdx];
            }
        }

        const currentSquaredDistance = Math.pow(tempXSum, 2) + Math.pow(tempYSum, 2);
        maxSquaredDistance = Math.max(maxSquaredDistance, currentSquaredDistance);
    }
    return Math.sqrt(maxSquaredDistance);
}

function computePolarAngleDegrees(xCoord, yCoord) {
    const DEG_0 = 0;
    const DEG_90 = 90;
    const DEG_180 = 180;
    const DEG_270 = 270;
    const DEG_360 = 360;
    const RAD_TO_DEG_FACTOR = DEG_180 / Math.PI;

    if (xCoord === DEG_0) {
        return yCoord > DEG_0 ? DEG_90 : DEG_270;
    }
    if (yCoord === DEG_0) {
        return xCoord > DEG_0 ? DEG_0 : DEG_180;
    }

    let calculatedAngle = Math.atan2(yCoord, xCoord) * RAD_TO_DEG_FACTOR;

    if (calculatedAngle < DEG_0) {
        calculatedAngle += DEG_360;
    }
    return calculatedAngle;
}
