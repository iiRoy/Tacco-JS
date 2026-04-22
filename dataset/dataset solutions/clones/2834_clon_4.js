const createDataInterpreter = (sourceText) => {
    let sourceLines = sourceText.trim().split("\n");
    let currentLinePointer = 0;
    let currentLineTokenBuffer = [];
    let currentLineTokenBufferPointer = 0;

    const pullNextElement = (getStringValue) => {
        if (currentLineTokenBufferPointer >= currentLineTokenBuffer.length) {
            if (currentLinePointer >= sourceLines.length) {
                return undefined;
            }
            const lineToProcess = sourceLines[currentLinePointer];
            currentLineTokenBuffer = lineToProcess.split(" ").reverse();
            currentLineTokenBufferPointer = 0;
            currentLinePointer++;
        }

        const value = currentLineTokenBuffer[currentLineTokenBufferPointer];
        currentLineTokenBufferPointer++;
        return getStringValue ? value : Number(value);
    };

    const fetchEntireLine = (getStringValues) => {
        if (currentLinePointer >= sourceLines.length) {
            return undefined;
        }
        const lineToParse = sourceLines[currentLinePointer];
        currentLinePointer++;
        currentLineTokenBuffer = [];
        currentLineTokenBufferPointer = 0;

        const tokens = lineToParse.split(" ");
        return getStringValues ? tokens : tokens.map(Number);
    };

    const grabMatrixBlock = (numberOfRows, getStringValues) => {
        const matrix = [];
        for (let k = 0; k < numberOfRows; k++) {
            if (currentLinePointer >= sourceLines.length) break;
            const line = sourceLines[currentLinePointer];
            matrix.push(line.split(" "));
            currentLinePointer++;
        }
        currentLineTokenBuffer = [];
        currentLineTokenBufferPointer = 0;
        return getStringValues ? matrix : matrix.map(row => row.map(Number));
    };

    const extractRawSegment = (numberOfRows, getStringValues) => {
        const segment = [];
        for (let k = 0; k < numberOfRows; k++) {
            if (currentLinePointer >= sourceLines.length) break;
            segment.push(sourceLines[currentLinePointer]);
            currentLinePointer++;
        }
        currentLineTokenBuffer = [];
        currentLineTokenBufferPointer = 0;
        return getStringValues ? segment : segment.map(Number);
    };

    return {
        pull: pullNextElement,
        fetchLine: fetchEntireLine,
        grabMatrix: grabMatrixBlock,
        extractRaw: extractRawSegment
    };
};

const multiDimensionalArrayCreator = (fillValue, ...dimensions) => {
    const construct = (dims) => {
        if (dims.length === 0) {
            return fillValue === "[]" ? [] : JSON.parse(fillValue);
        }
        const currentDim = dims[0];
        const remainingDims = dims.slice(1);
        return Array(currentDim).fill(null).map(() => construct(remainingDims));
    };
    return construct(dimensions);
};

const findMaximum = (...values) => {
    let result = values[0];
    for (let k = 1; k < values.length; k++) {
        if (isNaN(values[k])) continue;
        if (isNaN(result) || values[k] > result) {
            result = values[k];
        }
    }
    return result;
};

const findMinimum = (...values) => {
    let result = values[0];
    for (let k = 1; k < values.length; k++) {
        if (isNaN(values[k])) continue;
        if (isNaN(result) || values[k] < result) {
            result = values[k];
        }
    }
    return result;
};

const inputSource = createDataInterpreter(require("fs").readFileSync("/dev/stdin","utf8"));
const boundaryRanges = multiDimensionalArrayCreator("[]", 6);
const candidateValues = new Set([0]);

const updateBoundary = (idx, val) => {
    if (boundaryRanges[idx][0] === undefined) {
        boundaryRanges[idx][0] = boundaryRanges[idx][1] = val;
    } else {
        boundaryRanges[idx][0] = findMinimum(boundaryRanges[idx][0], val);
        boundaryRanges[idx][1] = findMaximum(boundaryRanges[idx][1], val);
    }
};

const generatePotentialOffsets = (v1, v2, v3) => {
    candidateValues.add(findMaximum(0, (v3 - v2) || 0));
    candidateValues.add(findMaximum(0, ((v3 - v1) / 2) || 0));
    candidateValues.add(findMaximum(0, (v2 - v1) || 0));
};

const directionActionMap = {
    "U": [ { targetIndex: 0, coordSelector: (x, y) => y }, { targetIndex: 5, coordSelector: (x, y) => x } ],
    "R": [ { targetIndex: 1, coordSelector: (x, y) => x }, { targetIndex: 4, coordSelector: (x, y) => y } ],
    "D": [ { targetIndex: 2, coordSelector: (x, y) => y }, { targetIndex: 5, coordSelector: (x, y) => x } ],
    "L": [ { targetIndex: 3, coordSelector: (x, y) => x }, { targetIndex: 4, coordSelector: (x, y) => y } ]
};

const executeCalculation = () => {
    const numOps = inputSource.pull();

    Array.from({length: numOps}).forEach(() => {
        const currentX = inputSource.pull();
        const currentY = inputSource.pull();
        const motionDirection = inputSource.pull(true);

        const actions = directionActionMap[motionDirection];
        actions.forEach(action => {
            updateBoundary(action.targetIndex, action.coordSelector(currentX, currentY));
        });
    });

    generatePotentialOffsets(boundaryRanges[0][1], boundaryRanges[4][1], boundaryRanges[2][1]);
    generatePotentialOffsets(-boundaryRanges[2][0], -boundaryRanges[4][0], -boundaryRanges[0][0]);
    generatePotentialOffsets(boundaryRanges[1][1], boundaryRanges[5][1], boundaryRanges[3][1]);
    generatePotentialOffsets(-boundaryRanges[3][0], -boundaryRanges[5][0], -boundaryRanges[1][0]);

    let minimalArea = Infinity;

    Array.from(candidateValues).forEach(offsetVal => {
        const currentU = findMaximum(boundaryRanges[0][1] + offsetVal, boundaryRanges[2][1] - offsetVal, boundaryRanges[4][1]);
        const currentD = findMinimum(boundaryRanges[0][0] + offsetVal, boundaryRanges[2][0] - offsetVal, boundaryRanges[4][0]);
        const currentR = findMaximum(boundaryRanges[1][1] + offsetVal, boundaryRanges[3][1] - offsetVal, boundaryRanges[5][1]);
        const currentL = findMinimum(boundaryRanges[1][0] + offsetVal, boundaryRanges[3][0] - offsetVal, boundaryRanges[5][0]);

        const currentComputedArea = (currentU - currentD) * (currentR - currentL);
        if (currentComputedArea < minimalArea) {
            minimalArea = currentComputedArea;
        }
    });

    return minimalArea;
};

console.log(executeCalculation());