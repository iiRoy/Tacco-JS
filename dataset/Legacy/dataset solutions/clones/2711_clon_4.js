class InputProcessor {
    constructor(rawInputContent) {
        this.sourceLines = rawInputContent.trim().split("\n");
        this.currentLinePointer = 0;
        this.currentLineSegments = [];
        this.currentSegmentPointer = 0;
    }

    _ensureSegmentsLoaded() {
        if (this.currentSegmentPointer >= this.currentLineSegments.length) {
            if (this.currentLinePointer >= this.sourceLines.length) {
                throw new Error("Input exhausted.");
            }
            this.currentLineSegments = this.sourceLines[this.currentLinePointer].split(" ");
            this.currentSegmentPointer = 0;
        }
    }

    retrieveNumericSegment() {
        this._ensureSegmentsLoaded();
        const segment = this.currentLineSegments[this.currentSegmentPointer++];
        if (this.currentSegmentPointer >= this.currentLineSegments.length) {
            this.currentLinePointer++;
            this.currentLineSegments = [];
            this.currentSegmentPointer = 0;
        }
        return +segment;
    }

    _advanceLineAndClearSegments() {
        if (this.currentLinePointer >= this.sourceLines.length) {
            throw new Error("Input exhausted.");
        }
        const lineContent = this.sourceLines[this.currentLinePointer];
        this.currentLinePointer++;
        this.currentLineSegments = [];
        this.currentSegmentPointer = 0;
        return lineContent;
    }

    retrieveNumericLine(asStrings = false) {
        const lineContent = this._advanceLineAndClearSegments();
        return asStrings ? lineContent.split(" ") : lineContent.split(" ").map(Number);
    }

    retrieveNumericMatrix(count, asStrings = false) {
        const matrix = [];
        for (let i = 0; i < count; i++) {
            matrix.push(this.retrieveNumericLine(asStrings));
        }
        return matrix;
    }

    retrieveNumericLines(count, asStrings = false) {
        const lines = [];
        for (let i = 0; i < count; i++) {
            const lineContent = this._advanceLineAndClearSegments();
            lines.push(asStrings ? lineContent : +lineContent);
        }
        return lines;
    }
}

const inputReader = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(dimensions, initialValue) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array(currentDimSize).fill(null).map(() => createMultiDimArray(remainingDimensions, initialValue));
}

function calculateManhattanDistance(currentX, currentY, targetX, targetY) {
    return Math.abs(currentX - targetX) + Math.abs(currentY - targetY);
}

function executeStandardStep(currentX, currentY, stepMagnitude, targetX, targetY) {
    let newX = currentX;
    let newY = currentY;
    let remainingMagnitude = stepMagnitude;

    const deltaX = targetX - currentX;
    const deltaY = targetY - currentY;

    const xMovementAmount = Math.min(remainingMagnitude, Math.abs(deltaX));
    newX += (deltaX > 0 ? xMovementAmount : (deltaX < 0 ? -xMovementAmount : 0));
    remainingMagnitude -= xMovementAmount;

    const yMovementAmount = remainingMagnitude;
    newY += (deltaY > 0 ? yMovementAmount : (deltaY < 0 ? -yMovementAmount : 0));

    return [newX, newY];
}

function executeAdjustedStep(currentX, currentY, targetX, targetY, stepMagnitude, splitPoint) {
    let effectiveSplitPoint = splitPoint;
    if (stepMagnitude % 2 === 0 && Math.abs(currentX - targetX) === Math.abs(currentY - targetY)) {
        effectiveSplitPoint = stepMagnitude - splitPoint;
    }

    let nextX = currentX;
    let nextY = currentY;
    const diffX = Math.abs(currentX - targetX);

    if (diffX >= effectiveSplitPoint) {
        nextX += (currentX < targetX ? effectiveSplitPoint : -effectiveSplitPoint);
        nextY += (currentY < targetY ? -(stepMagnitude - effectiveSplitPoint) : (stepMagnitude - effectiveSplitPoint));
    } else {
        nextY += (currentY < targetY ? effectiveSplitPoint : -effectiveSplitPoint);
        nextX += (currentX < targetX ? -(stepMagnitude - effectiveSplitPoint) : (stepMagnitude - effectiveSplitPoint));
    }
    return [nextX, nextY];
}

function* generateMovementPath(initialX, initialY, targetX, targetY, stepMagnitude) {
    let currentX = initialX;
    let currentY = initialY;

    const initialDistance = calculateManhattanDistance(currentX, currentY, targetX, targetY);

    if (initialDistance % stepMagnitude !== 0) {
        const remainder = initialDistance % stepMagnitude;
        if (remainder % 2 === 1) {
            [currentX, currentY] = executeStandardStep(currentX, currentY, stepMagnitude, targetX, targetY);
            yield [currentX, currentY];
        }

        const remainingDistanceAfterFirstMove = calculateManhattanDistance(currentX, currentY, targetX, targetY);
        const adjustedRemainder = remainingDistanceAfterFirstMove % stepMagnitude;
        const halfAdjustedRemainder = adjustedRemainder / 2;

        [currentX, currentY] = executeAdjustedStep(currentX, currentY, targetX, targetY, stepMagnitude, halfAdjustedRemainder);
        yield [currentX, currentY];
    }

    while (calculateManhattanDistance(currentX, currentY, targetX, targetY) > 0) {
        [currentX, currentY] = executeStandardStep(currentX, currentY, stepMagnitude, targetX, targetY);
        yield [currentX, currentY];
    }
}

function processMovement() {
    const stepMagnitude = inputReader.retrieveNumericSegment();
    const targetX = inputReader.retrieveNumericSegment();
    const targetY = inputReader.retrieveNumericSegment();

    if (targetX === 0 && targetY === 0) return "0";
    if (stepMagnitude % 2 === 0 && (targetX + targetY) % 2 !== 0) return "-1";

    const pathCoordinates = [];
    for (const coords of generateMovementPath(0, 0, targetX, targetY, stepMagnitude)) {
        pathCoordinates.push(`${coords[0]} ${coords[1]}`);
    }

    console.log(pathCoordinates.length);
    return pathCoordinates.join("\n");
}

console.log(processMovement());
