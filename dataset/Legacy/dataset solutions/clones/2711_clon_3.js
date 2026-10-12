const InputParserFactory = (function() {
    function createParser(sourceString) {
        return new InputParser(sourceString);
    }

    class InputParser {
        constructor(sourceString) {
            this._sourceLines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _extractAndConvertItem(lineParts, convertToNumber) {
            const item = lineParts.pop();
            return convertToNumber ? Number.parseInt(item, 10) : item;
        }

        readNextItem(returnAsString = false) {
            let currentLineParts = this._sourceLines[this._currentLineIndex];

            if (typeof currentLineParts === "string") {
                currentLineParts = currentLineParts.split(" ").reverse();
                this._sourceLines[this._currentLineIndex] = currentLineParts;
            }

            const itemValue = this._extractAndConvertItem(currentLineParts, !returnAsString);

            if (currentLineParts.length === 0) {
                this._currentLineIndex++;
            }
            return itemValue;
        }

        readLineAsArray(returnAsString = false) {
            const lineContent = this._sourceLines[this._currentLineIndex++];
            const parts = lineContent.split(" ");
            return returnAsString ? parts : parts.map(val => Number.parseInt(val, 10));
        }

        readMatrix(numRows, returnAsString = false) {
            const matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numRows);
            this._currentLineIndex += numRows;
            return returnAsString ? matrixRows.map(row => row.split(" ")) : matrixRows.map(row => row.split(" ").map(val => Number.parseInt(val, 10)));
        }

        readLinesAsNumbers(numLines, returnAsString = false) {
            const linesContent = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex + numLines);
            this._currentLineIndex += numLines;
            return returnAsString ? linesContent : linesContent.map(val => Number.parseInt(val, 10));
        }
    }

    return createParser;
})();

const inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayCreationString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

let stepSize, targetX, targetY, currentX = 0, currentY = 0;

console.log(executeSolution());

function executeSolution() {
    stepSize = inputReader.readNextItem();
    targetX = inputReader.readNextItem();
    targetY = inputReader.readNextItem();

    if (targetX === 0 && targetY === 0) {
        return 0;
    }
    if (stepSize % 2 === 0 && (targetX + targetY) % 2 !== 0) {
        return -1;
    }

    const pathSteps = [];
    let initialManhattanDistance = calculateManhattanDistance(0, 0);

    if (initialManhattanDistance % stepSize !== 0) {
        const distanceRemainder = initialManhattanDistance % stepSize;
        if (distanceRemainder % 2 === 1) {
            const { newX, newY } = takeStep(currentX, currentY, stepSize);
            currentX = newX;
            currentY = newY;
            pathSteps.push(`${currentX} ${currentY}`);
        }

        const { adjustedX, adjustedY } = calculateInitialAdjustment(currentX, currentY, targetX, targetY, stepSize);
        currentX = adjustedX;
        currentY = adjustedY;
        pathSteps.push(`${currentX} ${currentY}`);
    }

    while (calculateManhattanDistance(currentX, currentY) > 0) {
        const { newX, newY } = takeStep(currentX, currentY, stepSize);
        currentX = newX;
        currentY = newY;
        pathSteps.push(`${currentX} ${currentY}`);
    }

    console.log(pathSteps.length);
    return pathSteps.join("\n");
}

function calculateManhattanDistance(coordA, coordB) {
    return Math.abs(coordA - targetX) + Math.abs(coordB - targetY);
}

function getDirectionSign(fromCoord, toCoord) {
    const difference = fromCoord - toCoord;
    if (difference > 0) return 1;
    if (difference < 0) return -1;
    return 0;
}

function calculateInitialAdjustment(currentXPos, currentYPos, targetXPos, targetYPos, stepValue) {
    let remainingDistanceModStep = calculateManhattanDistance(currentXPos, currentYPos) % stepValue / 2;
    const absDiffX = Math.abs(currentXPos - targetXPos);
    const absDiffY = Math.abs(currentYPos - targetYPos);

    if (stepValue % 2 === 0 && absDiffX === absDiffY) {
        remainingDistanceModStep = stepValue - remainingDistanceModStep;
    }

    let nextX = currentXPos;
    let nextY = currentYPos;

    if (absDiffX >= remainingDistanceModStep) {
        if (currentXPos < targetXPos) {
            nextX += remainingDistanceModStep;
        } else {
            nextX -= remainingDistanceModStep;
        }
        if (currentYPos < targetYPos) {
            nextY -= (stepValue - remainingDistanceModStep);
        } else {
            nextY += (stepValue - remainingDistanceModStep);
        }
    } else {
        if (currentYPos < targetYPos) {
            nextY += remainingDistanceModStep;
        } else {
            nextY -= remainingDistanceModStep;
        }
        if (currentXPos < targetXPos) {
            nextX -= (stepValue - remainingDistanceModStep);
        } else {
            nextX += (stepValue - remainingDistanceModStep);
        }
    }
    return { adjustedX: nextX, adjustedY: nextY };
}

function takeStep(currentXPos, currentYPos, stepBudget) {
    let remainingBudget = stepBudget;
    let newX = currentXPos;
    let newY = currentYPos;

    const applyMovement = (currentCoord, targetCoord, budgetToUse) => {
        const diff = targetCoord - currentCoord;
        const absDiff = Math.abs(diff);
        let movedCoord = currentCoord;
        let budgetLeft = budgetToUse;

        if (budgetToUse === 0) {
            return { movedCoord, budgetLeft };
        }

        if (absDiff >= budgetToUse) {
            movedCoord += Math.sign(diff) * budgetToUse;
            budgetLeft = 0;
        } else {
            movedCoord = targetCoord;
            budgetLeft -= absDiff;
        }
        return { movedCoord, budgetLeft };
    };

    if (newX !== targetX) {
        const { movedCoord, budgetLeft } = applyMovement(newX, targetX, remainingBudget);
        newX = movedCoord;
        remainingBudget = budgetLeft;
    }

    if (remainingBudget > 0) {
        const { movedCoord } = applyMovement(newY, targetY, remainingBudget);
        newY = movedCoord;
    }

    return { newX, newY };
}
