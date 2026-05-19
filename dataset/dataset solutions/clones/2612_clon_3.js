var InputReaderFactory = (function () {
    const convertToNumber = (str) => Number(str);

    function createReader(sourceString) {
        return new InputReader(sourceString);
    }

    function InputReader(sourceString) {
        this._sourceLines = sourceString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    InputReader.prototype._ensureLineTokens = function () {
        if (typeof this._sourceLines[this._currentLineIndex] === "string") {
            this._sourceLines[this._currentLineIndex] = this._sourceLines[this._currentLineIndex].split(" ").reverse();
        }
    };

    InputReader.prototype.readNumber = function (asString) {
        this._ensureLineTokens();
        var currentLineTokens = this._sourceLines[this._currentLineIndex];
        var resultToken = currentLineTokens.pop();

        if (currentLineTokens.length === 0) {
            this._currentLineIndex++;
        }
        return asString ? resultToken : convertToNumber(resultToken);
    };

    InputReader.prototype.readLineNumbers = function (asStrings) {
        var currentLineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
        return asStrings ? currentLineTokens : currentLineTokens.map(convertToNumber);
    };

    InputReader.prototype.readMatrixNumbers = function (rowCount, asStrings) {
        var startIdx = this._currentLineIndex;
        this._currentLineIndex += rowCount;
        var rawRows = this._sourceLines.slice(startIdx, this._currentLineIndex).map(line => line.split(" "));
        return asStrings ? rawRows : rawRows.map(row => row.map(convertToNumber));
    };

    InputReader.prototype.readRawNumbers = function (count, asStrings) {
        var startIdx = this._currentLineIndex;
        this._currentLineIndex += count;
        var rawValues = this._sourceLines.slice(startIdx, this._currentLineIndex);
        return asStrings ? rawValues : rawValues.map(convertToNumber);
    };

    return createReader;
})();

var inputProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    var dimensions = arguments,
        dimCount = dimensions.length,
        arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

var allPoints = [];

console.log(executeMainLogic());

function executeMainLogic() {
    const initialItemCount = inputProcessor.readNumber();
    for (let loopIndex = 0; loopIndex < initialItemCount; loopIndex++) {
        const currentCoordA = inputProcessor.readNumber();
        const currentCoordB = inputProcessor.readNumber();

        if (currentCoordA !== 0 || currentCoordB !== 0) {
            allPoints.push({ x: currentCoordA, y: currentCoordB });
        }
    }

    const actualPointCount = allPoints.length;
    let maxSquaredDistance = 0;

    const MIN_COORD_BOUND = -1000000;
    const MAX_COORD_BOUND = 1000000;
    const STEP_SIZE = 20;

    const boundaryConditions = [
        { h: MIN_COORD_BOUND, w: null },
        { h: MAX_COORD_BOUND, w: null },
        { h: null, w: MAX_COORD_BOUND },
        { h: null, w: MIN_COORD_BOUND }
    ];

    for (let currentIterCoord = MIN_COORD_BOUND; currentIterCoord <= MAX_COORD_BOUND; currentIterCoord += STEP_SIZE) {
        for (const condition of boundaryConditions) {
            const hComponent = condition.h === null ? currentIterCoord : condition.h;
            const wComponent = condition.w === null ? currentIterCoord : condition.w;

            const currentSquaredDistance = calculateSquaredMagnitude(hComponent, wComponent, actualPointCount);
            if (maxSquaredDistance < currentSquaredDistance) {
                maxSquaredDistance = currentSquaredDistance;
            }
        }
    }
    return Math.sqrt(maxSquaredDistance);
}

function calculateSquaredMagnitude(hComponent, wComponent, pointCount) {
    let totalXSum = 0;
    let totalYSum = 0;

    for (let loopIndex = 0; loopIndex < pointCount; loopIndex++) {
        const currentPoint = allPoints[loopIndex];
        const xVal = currentPoint.x;
        const yVal = currentPoint.y;

        const isConditionMet = (xVal * wComponent + yVal * hComponent) > 0;

        if (isConditionMet) {
            totalXSum += xVal;
            totalYSum += yVal;
        }
    }
    return totalXSum * totalXSum + totalYSum * totalYSum;
}
