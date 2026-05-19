const parseNumericString = (inputStr) => {
    return inputStr.split(' ').map(Number);
};

const calculateUniqueCount = (elementsArray) => {
    const uniqueElementsSet = new Set(elementsArray);
    return uniqueElementsSet.size;
};

const processInputData = (rawDataContent) => {
    const allInputLines = rawDataContent.split("\n");

    const firstLineValues = parseNumericString(allInputLines[0]);
    const totalBallQuantity = firstLineValues[0]; // This variable is not used but kept for structural similarity to original parsing.
    const queryOperationCount = firstLineValues[1];

    const ballColorIdentifiers = allInputLines[1].split(' ');

    for (let currentQueryIteration = 0; currentQueryIteration < queryOperationCount; currentQueryIteration++) {
        const queryLineIndex = 2 + currentQueryIteration;
        const currentQueryLine = allInputLines[queryLineIndex];
        const [ queryRangeStart, queryRangeEnd ] = parseNumericString(currentQueryLine);

        const adjustedSliceStart = queryRangeStart - 1;
        const adjustedSliceEnd = queryRangeEnd;

        const segmentToAnalyze = ballColorIdentifiers.slice(adjustedSliceStart, adjustedSliceEnd);
        const uniqueCountInSegment = calculateUniqueCount(segmentToAnalyze);
        
        console.log(uniqueCountInSegment);
    }
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
