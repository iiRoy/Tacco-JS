function processInputData(rawInputContent) {
    const EMPTY_STRING_VALUE = "";
    const trimmedSourceString = rawInputContent.trim();
    const totalStringLength = trimmedSourceString.length;

    let uniqueSegmentCounter = 0;
    let lastProcessedSegment = EMPTY_STRING_VALUE;
    let currentAccumulatedSegment = EMPTY_STRING_VALUE;
    const segmentTraceLog = [];

    for (let charPosition = 0; charPosition < totalStringLength; charPosition++) {
        const currentChar = trimmedSourceString[charPosition];
        currentAccumulatedSegment = currentAccumulatedSegment + currentChar;

        const isCurrentSegmentRepeated = (currentAccumulatedSegment === lastProcessedSegment);

        if (!isCurrentSegmentRepeated) {
            lastProcessedSegment = currentAccumulatedSegment;
            segmentTraceLog.push(currentAccumulatedSegment);
            currentAccumulatedSegment = EMPTY_STRING_VALUE;
            uniqueSegmentCounter++;
        }
    }

    console.log(uniqueSegmentCounter);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
