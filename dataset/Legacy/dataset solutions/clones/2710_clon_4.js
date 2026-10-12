class InputProcessor {
    #lineBuffer;
    #currentLinePointer;
    #tokenCache;

    constructor(sourceText) {
        this.#lineBuffer = sourceText.trim().split('\n');
        this.#currentLinePointer = 0;
        this.#tokenCache = [];
    }

    #ensureTokensAvailable() {
        if (this.#tokenCache.length === 0 && this.#currentLinePointer < this.#lineBuffer.length) {
            this.#tokenCache = this.#lineBuffer[this.#currentLinePointer].split(' ');
            this.#currentLinePointer++;
        }
    }

    extractSingleValue(returnAsString = false) {
        this.#ensureTokensAvailable();
        if (this.#tokenCache.length === 0) {
            return undefined;
        }
        const extracted = this.#tokenCache.shift();
        return returnAsString ? extracted : Number(extracted);
    }

    extractFullLine(returnAsStrings = false) {
        if (this.#currentLinePointer >= this.#lineBuffer.length) {
            return undefined;
        }
        const lineContent = this.#lineBuffer[this.#currentLinePointer++];
        const lineTokens = lineContent.split(' ');
        return returnAsStrings ? lineTokens : lineTokens.map(Number);
    }

    extractValueMatrix(rowsToRead, returnAsStrings = false) {
        const resultMatrix = [];
        for (let i = 0; i < rowsToRead; i++) {
            resultMatrix.push(this.extractFullLine(returnAsStrings));
        }
        return resultMatrix;
    }

    extractValueRows(rowsToRead, returnAsStrings = false) {
        const resultRows = [];
        for (let i = 0; i < rowsToRead; i++) {
            const rowContent = this.#lineBuffer[this.#currentLinePointer++];
            resultRows.push(returnAsStrings ? rowContent : Number(rowContent));
        }
        return resultRows;
    }
}

function createNestedArray(initialFillValue, ...dimensions) {
    const buildRecursive = (dimsArray, currentDepth) => {
        if (currentDepth === dimsArray.length - 1) {
            return Array(dimsArray[currentDepth]).fill(initialFillValue);
        }
        return Array(dimsArray[currentDepth]).fill(0).map(() => buildRecursive(dimsArray, currentDepth + 1));
    };
    if (dimensions.length === 0) {
        return initialFillValue;
    }
    return buildRecursive(dimensions, 0);
}

class PathNavigator {
    #stepMagnitude;
    #destinationX;
    #destinationY;
    #currentPositionX;
    #currentPositionY;
    #recordedPath;

    constructor(step, targetX, targetY) {
        this.#stepMagnitude = step;
        this.#destinationX = targetX;
        this.#destinationY = targetY;
        this.#currentPositionX = 0;
        this.#currentPositionY = 0;
        this.#recordedPath = [];
    }

    #calculateCurrentDistance() {
        return Math.abs(this.#currentPositionX - this.#destinationX) + Math.abs(this.#currentPositionY - this.#destinationY);
    }

    #computeNextStepCoordinates() {
        let remainingMovementBudget = this.#stepMagnitude;
        let nextCoordX = this.#currentPositionX;
        let nextCoordY = this.#currentPositionY;

        const deltaX = this.#destinationX - this.#currentPositionX;
        const absoluteDeltaX = Math.abs(deltaX);

        if (deltaX !== 0) {
            if (remainingMovementBudget >= absoluteDeltaX) {
                remainingMovementBudget -= absoluteDeltaX;
                nextCoordX = this.#destinationX;
            } else {
                nextCoordX += Math.sign(deltaX) * remainingMovementBudget;
                remainingMovementBudget = 0;
            }
        }

        if (remainingMovementBudget > 0) {
            if (this.#destinationY < this.#currentPositionY) {
                nextCoordY -= remainingMovementBudget;
            } else {
                nextCoordY += remainingMovementBudget;
            }
        }
        return { x: nextCoordX, y: nextCoordY };
    }

    #determineAdjustedTarget(currentX, currentY, targetX, targetY, stepVal, adjustmentVal) {
        let temporaryTargetX = targetX;
        let temporaryTargetY = targetY;

        if (Math.abs(currentX - targetX) >= Math.abs(currentY - targetY)) {
            temporaryTargetY = (currentY < targetY) ? (currentY - adjustmentVal) : (currentY + adjustmentVal);
            temporaryTargetX = (currentX < targetX) ? (currentX + stepVal - adjustmentVal) : (currentX - stepVal + adjustmentVal);
        } else {
            temporaryTargetX = (currentX < targetX) ? (currentX - adjustmentVal) : (currentX + adjustmentVal);
            temporaryTargetY = (currentY < targetY) ? (currentY + stepVal - adjustmentVal) : (currentY - stepVal + adjustmentVal);
        }
        return { x: temporaryTargetX, y: temporaryTargetY };
    }

    findPath() {
        if (this.#destinationX === 0 && this.#destinationY === 0) {
            return "0";
        }
        if (this.#stepMagnitude % 2 === 0 && (this.#destinationX + this.#destinationY) % 2 !== 0) {
            return "-1";
        }

        const doubleStepMagnitude = this.#stepMagnitude * 2;
        let currentPathDistance = this.#calculateCurrentDistance();

        while (currentPathDistance > doubleStepMagnitude || currentPathDistance % 2 !== 0) {
            const { x, y } = this.#computeNextStepCoordinates();
            this.#currentPositionX = x;
            this.#currentPositionY = y;
            this.#recordedPath.push(`${this.#currentPositionX} ${this.#currentPositionY}`);
            currentPathDistance = this.#calculateCurrentDistance();
        }

        if (currentPathDistance % this.#stepMagnitude === 0) {
            while (this.#calculateCurrentDistance() > 0) {
                const { x, y } = this.#computeNextStepCoordinates();
                this.#currentPositionX = x;
                this.#currentPositionY = y;
                this.#recordedPath.push(`${this.#currentPositionX} ${this.#currentPositionY}`);
            }
        } else {
            const originalDestinationX = this.#destinationX;
            const originalDestinationY = this.#destinationY;

            const distanceToOriginalDestination = Math.abs(this.#currentPositionX - originalDestinationX) + Math.abs(this.#currentPositionY - originalDestinationY);
            const adjustmentFactor = (doubleStepMagnitude - distanceToOriginalDestination) / 2;

            const { x: tempTargetX1, y: tempTargetY1 } = this.#determineAdjustedTarget(
                this.#currentPositionX, this.#currentPositionY, this.#destinationX, this.#destinationY, this.#stepMagnitude, adjustmentFactor
            );

            this.#destinationX = tempTargetX1;
            this.#destinationY = tempTargetY1;

            const { x: nextX1, y: nextY1 } = this.#computeNextStepCoordinates();
            this.#currentPositionX = nextX1;
            this.#currentPositionY = nextY1;
            this.#recordedPath.push(`${this.#currentPositionX} ${this.#currentPositionY}`);

            this.#destinationX = originalDestinationX;
            this.#destinationY = originalDestinationY;

            const { x: nextX2, y: nextY2 } = this.#computeNextStepCoordinates();
            this.#currentPositionX = nextX2;
            this.#currentPositionY = nextY2;
            this.#recordedPath.push(`${this.#currentPositionX} ${this.#currentPositionY}`);
        }

        return `${this.#recordedPath.length}\n${this.#recordedPath.join("\n")}`;
    }
}

const inputReader = new InputProcessor(require("fs").readFileSync("/dev/stdin","utf8"));
const K_VAL = inputReader.extractSingleValue();
const X_COORD = inputReader.extractSingleValue();
const Y_COORD = inputReader.extractSingleValue();

const pathSolver = new PathNavigator(K_VAL, X_COORD, Y_COORD);
console.log(pathSolver.findPath());
