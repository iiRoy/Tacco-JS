class InputProcessor {
    #lineIterator;
    #currentLineTokens;

    constructor(rawInputContent) {
        this.#lineIterator = rawInputContent.trim().split('\n')[Symbol.iterator]();
        this.#currentLineTokens = null;
    }

    #ensureLineTokens() {
        if (!this.#currentLineTokens || this.#currentLineTokens.length === 0) {
            const nextLineResult = this.#lineIterator.next();
            if (nextLineResult.done) {
                throw new Error("Input exhausted unexpectedly.");
            }
            this.#currentLineTokens = nextLineResult.value.split(' ');
        }
    }

    retrieveNextToken(asString = false) {
        this.#ensureLineTokens();
        const tokenValue = this.#currentLineTokens.shift();
        return asString ? tokenValue : Number(tokenValue);
    }
}

const inputSource = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

function buildNestedArray(dimensions, initialElement) {
    const recursiveBuilder = (currentDims, depth) => {
        if (depth === currentDims.length - 1) {
            return Array.from({ length: currentDims[depth] }, () => {
                return Array.isArray(initialElement) ? [...initialElement] : initialElement;
            });
        } else {
            return Array.from({ length: currentDims[depth] }, () => recursiveBuilder(currentDims, depth + 1));
        }
    };
    return recursiveBuilder(dimensions, 0);
}

const boundaryRanges = buildNestedArray([6], []);
const significantPoints = new Set([0]);

function findMaximum(...values) {
    let resultAccumulator = values[0];
    for (let i = 1; i < values.length; i++) {
        const currentValue = values[i];
        if (isNaN(currentValue)) continue;
        if (isNaN(resultAccumulator) || currentValue > resultAccumulator) {
            resultAccumulator = currentValue;
        }
    }
    return resultAccumulator;
}

function findMinimum(...values) {
    let resultAccumulator = values[0];
    for (let i = 1; i < values.length; i++) {
        const currentValue = values[i];
        if (isNaN(currentValue)) continue;
        if (isNaN(resultAccumulator) || currentValue < resultAccumulator) {
            resultAccumulator = currentValue;
        }
    }
    return resultAccumulator;
}

function updateCoordinateRange(indexIdentifier, coordinateValue) {
    const targetRange = boundaryRanges[indexIdentifier];
    if (targetRange.length > 0) {
        targetRange[0] = Math.min(targetRange[0], coordinateValue);
        targetRange[1] = Math.max(targetRange[1], coordinateValue);
    } else {
        targetRange.push(coordinateValue, coordinateValue);
    }
}

function addDerivedPoints(valA, valB, valC) {
    [
        Math.max(0, (valC - valB) || 0),
        Math.max(0, ((valC - valA) / 2) || 0),
        Math.max(0, (valB - valA) || 0)
    ].forEach(point => significantPoints.add(point));
}

function executeCalculation() {
    const numberOfEntries = inputSource.retrieveNextToken();

    const directionDispatch = {
        "U": (xVal, yVal) => {
            updateCoordinateRange(0, yVal);
            updateCoordinateRange(5, xVal);
        },
        "R": (xVal, yVal) => {
            updateCoordinateRange(1, xVal);
            updateCoordinateRange(4, yVal);
        },
        "D": (xVal, yVal) => {
            updateCoordinateRange(2, yVal);
            updateCoordinateRange(5, xVal);
        },
        "L": (xVal, yVal) => {
            updateCoordinateRange(3, xVal);
            updateCoordinateRange(4, yVal);
        }
    };

    Array.from({ length: numberOfEntries }).forEach(() => {
        const currentX = inputSource.retrieveNextToken();
        const currentY = inputSource.retrieveNextToken();
        const directionIndicator = inputSource.retrieveNextToken(true);
        directionDispatch[directionIndicator](currentX, currentY);
    });

    addDerivedPoints(boundaryRanges[0][1], boundaryRanges[4][1], boundaryRanges[2][1]);
    addDerivedPoints(-boundaryRanges[2][0], -boundaryRanges[4][0], -boundaryRanges[0][0]);
    addDerivedPoints(boundaryRanges[1][1], boundaryRanges[5][1], boundaryRanges[3][1]);
    addDerivedPoints(-boundaryRanges[3][0], -boundaryRanges[5][0], -boundaryRanges[1][0]);

    return Array.from(significantPoints).reduce((minimumArea, currentOffset) => {
        const upperYBound = findMaximum(boundaryRanges[0][1] + currentOffset, boundaryRanges[2][1] - currentOffset, boundaryRanges[4][1]);
        const lowerYBound = findMinimum(boundaryRanges[0][0] + currentOffset, boundaryRanges[2][0] - currentOffset, boundaryRanges[4][0]);
        const rightXBound = findMaximum(boundaryRanges[1][1] + currentOffset, boundaryRanges[3][1] - currentOffset, boundaryRanges[5][1]);
        const leftXBound = findMinimum(boundaryRanges[1][0] + currentOffset, boundaryRanges[3][0] - currentOffset, boundaryRanges[5][0]);

        const calculatedArea = (upperYBound - lowerYBound) * (rightXBound - leftXBound);
        return Math.min(minimumArea, calculatedArea);
    }, Infinity);
}

console.log(executeCalculation());
