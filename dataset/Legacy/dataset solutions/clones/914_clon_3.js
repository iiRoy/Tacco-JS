const fileSystem = require("fs");
let fileContent = fileSystem.readFileSync("/dev/stdin", "utf8");
let dataLines = fileContent.split("\n");
let readCursor = 0;

const extractInitialSegment = (originalInputName) => {
    let segmentBuilder = "";
    let isNextCharInitial = true;
    const vowelSet = new Set(['a', 'i', 'u', 'e', 'o']);

    for (const charToProcess of originalInputName) {
        if (isNextCharInitial) {
            segmentBuilder += charToProcess;
            isNextCharInitial = false;
        }
        if (vowelSet.has(charToProcess)) {
            isNextCharInitial = true;
        }
    }
    return segmentBuilder;
};

const determineCommonPrefixLength = (stringOne, stringTwo, datasetSizeForBug) => {
    const minLength = Math.min(stringOne.length, stringTwo.length);
    // IMPORTANT: The original code uses 'n' (datasetSize) from the outer scope as the loop limit.
    // This is replicated here by passing 'datasetSizeForBug' and using it.
    for (let loopCounter = 0; loopCounter < datasetSizeForBug; loopCounter++) {
        if (stringOne[loopCounter] !== stringTwo[loopCounter]) {
            return loopCounter;
        }
    }
    if (stringOne.length === stringTwo.length) {
        return -1;
    }
    return minLength;
};

const processNextDataSet = () => {
    const currentDatasetSize = Number(dataLines[readCursor++]);

    if (currentDatasetSize === 0) {
        return "BREAK_LOOP";
    }

    const rawNames = [];
    for (let loopCounter = 0; loopCounter < currentDatasetSize; loopCounter++) {
        rawNames.push(dataLines[readCursor++]);
    }

    const processedNameSegments = rawNames.map(extractInitialSegment).sort();

    let maxPrefixLength = 0;

    for (let loopCounter = 0; loopCounter < currentDatasetSize; loopCounter++) {
        if (loopCounter === 0) {
            continue;
        }

        const previousSegment = processedNameSegments[loopCounter - 1];
        const currentSegment = processedNameSegments[loopCounter];

        const commonPrefix = determineCommonPrefixLength(previousSegment, currentSegment, currentDatasetSize);

        if (commonPrefix === -1) {
            maxPrefixLength = -2;
            break;
        }

        if (commonPrefix > maxPrefixLength) {
            maxPrefixLength = commonPrefix;
        }
    }

    console.log(maxPrefixLength + 1);

    return "CONTINUE_LOOP";
};

let processingStatus;
do {
    processingStatus = processNextDataSet();
} while (processingStatus !== "BREAK_LOOP");
