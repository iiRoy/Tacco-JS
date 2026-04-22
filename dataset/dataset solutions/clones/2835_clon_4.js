let inputLinesForProcessing;
let currentLinePointer = 0;
let currentLineTokensBuffer = [];

const setupInputProcessor = (rawContent) => {
    inputLinesForProcessing = rawContent.trim().split("\n");
    currentLinePointer = 0;
    currentLineTokensBuffer = [];
};

const extractNextValue = (asString = false) => {
    if (currentLineTokensBuffer.length === 0) {
        if (currentLinePointer >= inputLinesForProcessing.length) {
            throw new Error("Input exhausted.");
        }
        currentLineTokensBuffer = inputLinesForProcessing[currentLinePointer].split(" ");
        currentLinePointer++;
    }
    const extractedToken = currentLineTokensBuffer.shift();
    return asString ? extractedToken : Number(extractedToken);
};

const findOverallMax = (...values) => {
    let resultCandidate = values[0];
    for (let j = 1; j < values.length; j++) {
        if (Number.isFinite(values[j])) {
            if (!Number.isFinite(resultCandidate) || values[j] > resultCandidate) {
                resultCandidate = values[j];
            }
        }
    }
    return resultCandidate;
};

const findOverallMin = (...values) => {
    let resultCandidate = values[0];
    for (let j = 1; j < values.length; j++) {
        if (Number.isFinite(values[j])) {
            if (!Number.isFinite(resultCandidate) || values[j] < resultCandidate) {
                resultCandidate = values[j];
            }
        }
    }
    return resultCandidate;
};

let boundaryDimensions = Array.from({ length: 6 }, () => []);
let distinctThresholds = new Set([0]);

const adjustBoundary = (indexIdentifier, coordinateValue) => {
    if (boundaryDimensions[indexIdentifier].length === 0) {
        boundaryDimensions[indexIdentifier][0] = coordinateValue;
        boundaryDimensions[indexIdentifier][1] = coordinateValue;
    } else {
        boundaryDimensions[indexIdentifier][0] = Math.min(boundaryDimensions[indexIdentifier][0], coordinateValue);
        boundaryDimensions[indexIdentifier][1] = Math.max(boundaryDimensions[indexIdentifier][1], coordinateValue);
    }
};

const sanitizeForMax = val => {
    const num = Number(val);
    return Number.isFinite(num) ? Math.max(0, num) : 0;
};

const deriveAndStoreThresholds = (valOne, valTwo, valThree) => {
    distinctThresholds.add(Math.max(0, sanitizeForMax(valThree - valTwo), sanitizeForMax((valThree - valOne) / 2)));
    distinctThresholds.add(Math.max(0, sanitizeForMax(valTwo - valOne), sanitizeForMax((valThree - valOne) / 2)));
};

const executeProblemSolution = () => {
    const totalOperations = extractNextValue();

    const directionDispatch = {
        "U": (yCoord, xCoord) => { adjustBoundary(0, yCoord); adjustBoundary(5, xCoord); },
        "R": (yCoord, xCoord) => { adjustBoundary(1, xCoord); adjustBoundary(4, yCoord); },
        "D": (yCoord, xCoord) => { adjustBoundary(2, yCoord); adjustBoundary(5, xCoord); },
        "L": (yCoord, xCoord) => { adjustBoundary(3, xCoord); adjustBoundary(4, yCoord); }
    };

    Array.from({ length: totalOperations }).forEach(() => {
        const xInput = extractNextValue();
        const yInput = extractNextValue();
        const directionInput = extractNextValue(true);
        directionDispatch[directionInput](yInput, xInput);
    });

    deriveAndStoreThresholds(boundaryDimensions[0][1], boundaryDimensions[4][1], boundaryDimensions[2][1]);
    deriveAndStoreThresholds(-boundaryDimensions[2][0], -boundaryDimensions[4][0], -boundaryDimensions[0][0]);
    deriveAndStoreThresholds(boundaryDimensions[1][1], boundaryDimensions[5][1], boundaryDimensions[3][1]);
    deriveAndStoreThresholds(-boundaryDimensions[3][0], -boundaryDimensions[5][0], -boundaryDimensions[1][0]);

    let minimumArea = Infinity;

    for (const currentThreshold of distinctThresholds) {
        const topEdge = findOverallMax(boundaryDimensions[0][1] + currentThreshold, boundaryDimensions[2][1] - currentThreshold, boundaryDimensions[4][1]);
        const bottomEdge = findOverallMin(boundaryDimensions[0][0] + currentThreshold, boundaryDimensions[2][0] - currentThreshold, boundaryDimensions[4][0]);
        const rightEdge = findOverallMax(boundaryDimensions[1][1] + currentThreshold, boundaryDimensions[3][1] - currentThreshold, boundaryDimensions[5][1]);
        const leftEdge = findOverallMin(boundaryDimensions[1][0] + currentThreshold, boundaryDimensions[3][0] - currentThreshold, boundaryDimensions[5][0]);

        const calculatedArea = (topEdge - bottomEdge) * (rightEdge - leftEdge);
        if (calculatedArea < minimumArea) {
            minimumArea = calculatedArea;
        }
    }
    return minimumArea;
};

setupInputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
console.log(executeProblemSolution());