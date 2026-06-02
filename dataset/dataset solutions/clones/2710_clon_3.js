class InputReader {
    constructor(inputString) {
        this._inputLines = inputString.trim().split("\n");
        this._currentLineIndex = 0;
    }

    readNextToken(returnRawString) {
        let currentLineTokens = this._inputLines[this._currentLineIndex];
        if (typeof currentLineTokens === "string") {
            this._inputLines[this._currentLineIndex] = currentLineTokens.split(" ").reverse();
            currentLineTokens = this._inputLines[this._currentLineIndex];
        }
        const resultToken = currentLineTokens.pop();
        if (!currentLineTokens.length) {
            this._currentLineIndex++;
        }
        return returnRawString ? resultToken : Number.parseInt(resultToken, 10);
    }

    readTokensAsList(returnRawStrings) {
        const lineTokens = this._inputLines[this._currentLineIndex++].split(" ");
        return returnRawStrings ? lineTokens : lineTokens.map(val => Number.parseInt(val, 10));
    }

    readMatrixOfTokens(numRows, returnRawStrings) {
        const matrixRows = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(line => line.split(" "));
        return returnRawStrings ? matrixRows : matrixRows.map(row => row.map(val => Number.parseInt(val, 10)));
    }

    readLinesAsList(numLines, returnRawStrings) {
        const rawLines = this._inputLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        return returnRawStrings ? rawLines : rawLines.map(line => Number.parseInt(line, 10));
    }
}

const createInputReader = (inputString) => new InputReader(inputString);

var inputData = createInputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    var dimensions = arguments,
        dimCount = dimensions.length,
        arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

var stepSize, targetX, targetY, currentX = 0, currentY = 0;

const getAbs = Math.abs;

function checkInitialConditions(tx, ty, ss) {
    if (tx === 0 && ty === 0) {
        return 0;
    }
    const isStepSizeEven = (ss % 2 === 0);
    const isTargetSumOdd = ((tx + ty) % 2 !== 0);
    if (isStepSizeEven && isTargetSumOdd) {
        return -1;
    }
    return null;
}

console.log(solveProblem());

function solveProblem() {
    stepSize = inputData.readNextToken();
    targetX = inputData.readNextToken();
    targetY = inputData.readNextToken();

    const initialResult = checkInitialConditions(targetX, targetY, stepSize);
    if (initialResult !== null) {
        return initialResult;
    }

    const pathSteps = [];
    const doubleStepSize = stepSize * 2;
    let manhattanDistance = calculateManhattanDistance();

    while (manhattanDistance > doubleStepSize || manhattanDistance % 2 !== 0) {
        pathSteps.push(moveTowardsTarget());
        manhattanDistance = calculateManhattanDistance();
    }

    if (manhattanDistance % stepSize === 0) {
        while (calculateManhattanDistance() > 0) {
            pathSteps.push(moveTowardsTarget());
        }
    } else {
        const originalTargetX = targetX;
        const originalTargetY = targetY;

        const absDiffX = getAbs(currentX - targetX);
        const absDiffY = getAbs(currentY - targetY);
        const adjustmentValue = (doubleStepSize - absDiffX - absDiffY) / 2;

        function applyCoordinateAdjustment(isXDominant) {
            if (isXDominant) {
                if (currentY < targetY) {
                    targetY = currentY - adjustmentValue;
                } else {
                    targetY = currentY + adjustmentValue;
                }

                if (currentX < targetX) {
                    targetX = currentX + stepSize - adjustmentValue;
                } else {
                    targetX = currentX - stepSize + adjustmentValue;
                }
            } else {
                if (currentX < targetX) {
                    targetX = currentX - adjustmentValue;
                } else {
                    targetX = currentX + adjustmentValue;
                }

                if (currentY < targetY) {
                    targetY = currentY + stepSize - adjustmentValue;
                } else {
                    targetY = currentY - stepSize + adjustmentValue;
                }
            }
        }

        applyCoordinateAdjustment(absDiffX >= absDiffY);

        pathSteps.push(moveTowardsTarget());
        targetX = originalTargetX;
        targetY = originalTargetY;
        pathSteps.push(moveTowardsTarget());
    }
    console.log(pathSteps.length);
    return pathSteps.join("\n");
}

function calculateManhattanDistance() {
    return getAbs(currentX - targetX) + getAbs(currentY - targetY);
}

function moveTowardsTarget() {
    let remainingStep = stepSize;
    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;

    if (deltaX !== 0) {
        const absDeltaX = getAbs(deltaX);
        if (remainingStep >= absDeltaX) {
            remainingStep -= absDeltaX;
            currentX = targetX;
        } else {
            currentX += (deltaX > 0 ? remainingStep : -remainingStep);
            remainingStep = 0;
        }
    }

    if (remainingStep > 0) {
        currentY += (targetY < currentY ? -remainingStep : remainingStep);
    }
    return currentX + " " + currentY;
}
