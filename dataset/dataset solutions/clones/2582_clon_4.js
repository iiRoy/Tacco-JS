const parseInputData = (rawTextContent) => {
    const textLines = rawTextContent.split('\n');
    const [lengthStr, opsCountStr] = textLines[0].split(' ');
    const charSequence = textLines[1];
    return {
        totalSequenceLength: Number.parseInt(lengthStr, 10),
        operationIterations: Number.parseInt(opsCountStr, 10),
        inputString: charSequence,
    };
};

const generateSegmentArray = (sourceString) => {
    if (!sourceString) {
        return [];
    }
    const segmentAccumulator = [];
    let currentSegmentLength = 0;
    let lastEncounteredChar = '';

    for (const character of sourceString) {
        if (character !== lastEncounteredChar && lastEncounteredChar !== '') {
            segmentAccumulator.push(currentSegmentLength);
            currentSegmentLength = 0;
        }
        currentSegmentLength++;
        lastEncounteredChar = character;
    }
    if (currentSegmentLength > 0) {
        segmentAccumulator.push(currentSegmentLength);
    }
    return segmentAccumulator;
};

const computeFirstThreeSum = (segmentCollection) => {
    let sumValue = 0;
    if (segmentCollection.length > 0) sumValue += Math.abs(segmentCollection[0]);
    if (segmentCollection.length > 1) sumValue += Math.abs(segmentCollection[1]);
    if (segmentCollection.length > 2) sumValue += Math.abs(segmentCollection[2]);
    return sumValue;
};

const applyMergeOperations = (initialSegments, numOperations) => {
    return Array.from({ length: numOperations }).reduce((currentSegmentsState) => {
        const mergeResult = computeFirstThreeSum(currentSegmentsState);
        return [mergeResult, ...currentSegmentsState.slice(3)];
    }, [...initialSegments]);
};

const executeProgram = (programInput) => {
    const { totalSequenceLength, operationIterations, inputString } = parseInputData(programInput);
    const initialSegmentList = generateSegmentArray(inputString);

    if (initialSegmentList.length <= 2) {
        return totalSequenceLength - 1;
    }

    const finalSegmentList = applyMergeOperations(initialSegmentList, operationIterations);

    return totalSequenceLength - finalSegmentList.length;
};

const runMain = (sourceReader) => {
    const programResult = executeProgram(sourceReader);
    console.log(programResult);
};

runMain(require("fs").readFileSync("/dev/stdin", "utf8"));
