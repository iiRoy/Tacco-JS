const InputReaderFactory = (function () {
    class InputReader {
        constructor(sourceString) {
            this._inputLines = sourceString.trim().split("\n");
            this._currentLineIndex = 0;
        }

        _parseLineParts(lineIndex) {
            let lineContent = this._inputLines[lineIndex];
            if (typeof lineContent === "string") {
                const parts = lineContent.split(" ").reverse();
                this._inputLines[lineIndex] = parts; // Cache the parsed array
                return parts;
            }
            return lineContent; // Already an array
        }

        getVal(returnAsString) {
            const currentLineParts = this._parseLineParts(this._currentLineIndex);
            const extractedValue = currentLineParts.pop();
            if (currentLineParts.length === 0) { // Check if line is exhausted
                this._currentLineIndex++;
            }
            return returnAsString ? extractedValue : +extractedValue;
        }

        getLine(returnAsStrings) {
            const lineContent = this._inputLines[this._currentLineIndex++];
            const lineParts = lineContent.split(" ");
            return returnAsStrings ? lineParts : lineParts.map(val => +val);
        }

        getMatrix(numRows, returnAsStrings) {
            const startIdx = this._currentLineIndex;
            this._currentLineIndex += numRows;
            const matrixRows = this._inputLines.slice(startIdx, this._currentLineIndex).map(row => row.split(" "));
            return returnAsStrings ? matrixRows : matrixRows.map(row => row.map(val => +val));
        }

        getRawLines(numLines, returnAsStrings) {
            const startIdx = this._currentLineIndex;
            this._currentLineIndex += numLines;
            const rawLines = this._inputLines.slice(startIdx, this._currentLineIndex);
            return returnAsStrings ? rawLines : rawLines.map(line => +line);
        }
    }
    return function createReader(sourceString) {
        return new InputReader(sourceString);
    };
})();

const inputProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    return Array(currentDimSize).fill(0).map(() => createMultiDimArray(initialValue, ...remainingDimensions));
}

function findMax(...valuesToCompare) {
    return valuesToCompare.reduce((currentExtreme, val) => {
        if (isNaN(val)) {
            return currentExtreme;
        }
        return currentExtreme > val ? currentExtreme : val;
    }, valuesToCompare[0]);
}

function findMin(...valuesToCompare) {
    return valuesToCompare.reduce((currentExtreme, val) => {
        if (isNaN(val)) {
            return currentExtreme;
        }
        return currentExtreme < val ? currentExtreme : val;
    }, valuesToCompare[0]);
}

const BOUND_U_MIN = 0;
const BOUND_R_MIN = 1;
const BOUND_D_MIN = 2;
const BOUND_L_MIN = 3;
const BOUND_Y_MAX = 4; // Corresponds to original move[4]
const BOUND_X_MAX = 5; // Corresponds to original move[5]

let directionBounds = createMultiDimArray([], 6);

let candidateValues = new Set([0]);

function addCandidateValues(upperBound, midBound, lowerBound) {
    const valA = Math.max(0, (lowerBound - midBound) || 0, ((lowerBound - upperBound) / 2) || 0);
    const valB = Math.max(0, (midBound - upperBound) || 0, ((lowerBound - upperBound) / 2) || 0);
    candidateValues.add(valA);
    candidateValues.add(valB);
}

function updateBounds(boundIndex, coordinateValue) {
    const currentBound = directionBounds[boundIndex];
    if (currentBound.length > 0) {
        currentBound[0] = Math.min(currentBound[0], coordinateValue);
        currentBound[1] = Math.max(currentBound[1], coordinateValue);
    } else {
        currentBound[0] = coordinateValue;
        currentBound[1] = coordinateValue;
    }
}

function calculateMinArea() {
    const numOperations = inputProcessor.getVal();

    const directionHandlers = {
        "U": (x, y) => { updateBounds(BOUND_U_MIN, y); updateBounds(BOUND_X_MAX, x); },
        "R": (x, y) => { updateBounds(BOUND_R_MIN, x); updateBounds(BOUND_Y_MAX, y); },
        "D": (x, y) => { updateBounds(BOUND_D_MIN, y); updateBounds(BOUND_X_MAX, x); },
        "L": (x, y) => { updateBounds(BOUND_L_MIN, x); updateBounds(BOUND_Y_MAX, y); }
    };

    for (let opIndex = 0; opIndex < numOperations; opIndex++) {
        const coordX = inputProcessor.getVal();
        const coordY = inputProcessor.getVal();
        const directionChar = inputProcessor.getVal(true);

        const handler = directionHandlers[directionChar];
        if (handler) {
            handler(coordX, coordY);
        }
    }

    const processBoundSet = (idx1, idx2, idx3, negate = false) => {
        const val1 = directionBounds[idx1][negate ? 0 : 1];
        const val2 = directionBounds[idx2][negate ? 0 : 1];
        const val3 = directionBounds[idx3][negate ? 0 : 1];
        addCandidateValues(negate ? -val1 : val1, negate ? -val2 : val2, negate ? -val3 : val3);
    };

    processBoundSet(BOUND_U_MIN, BOUND_Y_MAX, BOUND_D_MIN);
    processBoundSet(BOUND_D_MIN, BOUND_Y_MAX, BOUND_U_MIN, true);
    processBoundSet(BOUND_R_MIN, BOUND_X_MAX, BOUND_L_MIN);
    processBoundSet(BOUND_L_MIN, BOUND_X_MAX, BOUND_R_MIN, true);

    const INITIAL_MIN_AREA = Number.MAX_SAFE_INTEGER;
    let minAreaResult = INITIAL_MIN_AREA;

    for (const currentOffset of candidateValues) {
        const currentUpper = findMax(
            directionBounds[BOUND_U_MIN][1] + currentOffset,
            directionBounds[BOUND_D_MIN][1] - currentOffset,
            directionBounds[BOUND_Y_MAX][1]
        );
        const currentLower = findMin(
            directionBounds[BOUND_U_MIN][0] + currentOffset,
            directionBounds[BOUND_D_MIN][0] - currentOffset,
            directionBounds[BOUND_Y_MAX][0]
        );
        const currentRight = findMax(
            directionBounds[BOUND_R_MIN][1] + currentOffset,
            directionBounds[BOUND_L_MIN][1] - currentOffset,
            directionBounds[BOUND_X_MAX][1]
        );
        const currentLeft = findMin(
            directionBounds[BOUND_R_MIN][0] + currentOffset,
            directionBounds[BOUND_L_MIN][0] - currentOffset,
            directionBounds[BOUND_X_MAX][0]
        );

        const currentArea = (currentUpper - currentLower) * (currentRight - currentLeft);
        if (currentArea < minAreaResult) {
            minAreaResult = currentArea;
        }
    }
    return minAreaResult;
}

console.log(calculateMinArea());
