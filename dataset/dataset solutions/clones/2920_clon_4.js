const createInputProcessor = (inputSource) => {
    let currentInputLines = inputSource.trim().split('\n');
    let lineCursor = 0;
    let currentLineTokensReversed = null;

    const ensureActiveLineTokens = () => {
        if (currentLineTokensReversed === null || currentLineTokensReversed.length === 0) {
            if (lineCursor >= currentInputLines.length) {
                return false;
            }
            currentLineTokensReversed = currentInputLines[lineCursor].split(' ').reverse();
        }
        return true;
    };

    const advanceLineCursor = () => {
        lineCursor++;
        currentLineTokensReversed = null; // Invalidate cached tokens for the previous line
    };

    const extractSingleValue = (stringFormat) => {
        if (!ensureActiveLineTokens()) {
            return undefined;
        }
        const extractedValue = currentLineTokensReversed.pop();
        if (currentLineTokensReversed.length === 0) {
            advanceLineCursor();
        }
        return stringFormat ? extractedValue : Number(extractedValue);
    };

    const extractWholeLine = (stringArrayFormat) => {
        if (lineCursor >= currentInputLines.length) return undefined;
        const lineContent = currentInputLines[lineCursor];
        advanceLineCursor();
        const tokens = lineContent.split(' ');
        return stringArrayFormat ? tokens : tokens.map(Number);
    };

    const extractMultiLineMatrix = (count, stringMatrixFormat) => {
        const resultMatrix = [];
        for (let i = 0; i < count; i++) {
            if (lineCursor >= currentInputLines.length) break;
            const lineContent = currentInputLines[lineCursor];
            advanceLineCursor();
            const tokens = lineContent.split(' ');
            resultMatrix.push(stringMatrixFormat ? tokens : tokens.map(Number));
        }
        return resultMatrix;
    };

    const extractMultiLineVector = (count, stringVectorFormat) => {
        const resultVector = [];
        for (let i = 0; i < count; i++) {
            if (lineCursor >= currentInputLines.length) break;
            const lineContent = currentInputLines[lineCursor];
            advanceLineCursor();
            resultVector.push(stringVectorFormat ? lineContent : Number(lineContent));
        }
        return resultVector;
    };

    return {
        value: extractSingleValue,
        line: extractWholeLine,
        matrix: extractMultiLineMatrix,
        vector: extractMultiLineVector,
    };
};

const locateFirstGreaterOrEqual = (dataCollection, startIndex, endIndex, targetValue) => {
    if (startIndex >= endIndex) {
        return dataCollection[startIndex] < targetValue ? endIndex : startIndex;
    }
    const midPoint = Math.floor((startIndex + endIndex) / 2);
    if (dataCollection[midPoint] < targetValue) {
        return locateFirstGreaterOrEqual(dataCollection, midPoint + 1, endIndex, targetValue);
    } else {
        return locateFirstGreaterOrEqual(dataCollection, startIndex, midPoint, targetValue);
    }
};

class IntervalDataStructure {
    constructor(totalElements) {
        let currentPowerOfTwo = 1;
        while (currentPowerOfTwo < totalElements) {
            currentPowerOfTwo *= 2;
        }
        this._storageArray = Array(2 * currentPowerOfTwo - 1).fill(Infinity);
        this._leafCapacity = currentPowerOfTwo;
    }

    queryAtPoint(pointIndex) {
        let currentArrayIndex = pointIndex + this._leafCapacity - 1;
        let minimumValueFound = Infinity;

        const traverseUpwards = (idx, currentMin) => {
            if (idx < 0) return currentMin;
            const nodeValue = this._storageArray[idx];
            const newMin = Math.min(currentMin, nodeValue);
            return traverseUpwards(Math.floor((idx - 1) / 2), newMin);
        };

        minimumValueFound = traverseUpwards(currentArrayIndex, Infinity);

        return minimumValueFound === Infinity ? -1 : minimumValueFound;
    }

    assignRangeValue(rangeBeginning, rangeEnding, assignedValue) {
        const recursiveAssignment = (queryStart, queryEnd, nodeStart, nodeEnd, nodeIdx) => {
            if (queryStart === nodeStart && queryEnd === nodeEnd) {
                this._storageArray[nodeIdx] = assignedValue;
                return;
            }

            const midNodePoint = Math.floor((nodeStart + nodeEnd) / 2);

            const leftChildIndex = 2 * nodeIdx + 1;
            const rightChildIndex = 2 * nodeIdx + 2;

            if (queryEnd <= midNodePoint) {
                recursiveAssignment(queryStart, queryEnd, nodeStart, midNodePoint, leftChildIndex);
            } else if (queryStart >= midNodePoint) {
                recursiveAssignment(queryStart, queryEnd, midNodePoint, nodeEnd, rightChildIndex);
            } else {
                recursiveAssignment(queryStart, midNodePoint, nodeStart, midNodePoint, leftChildIndex);
                recursiveAssignment(midNodePoint, queryEnd, midNodePoint, nodeEnd, rightChildIndex);
            }
        };
        recursiveAssignment(rangeBeginning, rangeEnding, 0, this._leafCapacity, 0);
    }
}

const performCalculations = () => {
    const inputReader = createInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const N_val = inputReader.value();
    const Q_val = inputReader.value();

    const dataRows = inputReader.matrix(N_val);
    const queryPoints = inputReader.vector(Q_val);

    const treeStructure = new IntervalDataStructure(Q_val);

    const descendingThirdElementSort = (entryA, entryB) => entryB[2] - entryA[2];
    dataRows.sort(descendingThirdElementSort);

    dataRows.forEach(currentDataEntry => {
        const [firstElem, secondElem, thirdElem] = currentDataEntry;

        if (secondElem - thirdElem - 1 < queryPoints[0]) {
            return;
        }

        const rangeStartLimit = locateFirstGreaterOrEqual(queryPoints, 0, Q_val, firstElem - thirdElem);
        const rangeEndLimit = locateFirstGreaterOrEqual(queryPoints, rangeStartLimit, Q_val, secondElem - thirdElem);

        treeStructure.assignRangeValue(rangeStartLimit, rangeEndLimit, thirdElem);
    });

    const finalOutput = Array.from({ length: Q_val }, (_, index) =>
        treeStructure.queryAtPoint(index)
    );

    return finalOutput.join("\n");
};

console.log(performCalculations());