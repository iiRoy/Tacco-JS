let dataStreamManager;
let lineIndexTracker = 0;
let totalLineCount = 0;
let inputLineBuffer = [];

const prepareInputService = (linesProvided) => {
    inputLineBuffer = linesProvided;
    totalLineCount = linesProvided.length;
    lineIndexTracker = 0;
    dataStreamManager = {
        retrieveNextItem: () => {
            if (lineIndexTracker < totalLineCount) {
                return inputLineBuffer[lineIndexTracker++];
            } else {
                throw new Error("Input consumption exceeded available data.");
            }
        },
        hasMoreItems: () => lineIndexTracker < totalLineCount
    };
};

const extractIntegerDatum = () => {
    return parseInt(dataStreamManager.retrieveNextItem(), 10);
};

const parseCharacterSequence = () => {
    return dataStreamManager.retrieveNextItem().split('');
};

const deliverOutputResult = (computedValue) => {
    console.log(computedValue);
};

const processStringPatterns = () => {
    const ignoredInputSize = extractIntegerDatum();
    const initialStringArray = parseCharacterSequence();
    let maximumPatternMatch = 0;

    for (let currentSuffixStart = 0; currentSuffixStart < initialStringArray.length; currentSuffixStart++) {
        const activeSegment = initialStringArray.slice(currentSuffixStart);

        if (activeSegment.length === 0) continue;

        const segmentComparisonData = generatePrefixOverlapArray(activeSegment);

        const midPointThreshold = activeSegment.length / 2;
        let segmentHighestMatch = 0;

        for (let positionIterator = activeSegment.length - 1; positionIterator >= Math.floor(midPointThreshold); positionIterator--) {
            segmentHighestMatch = Math.max(segmentHighestMatch, segmentComparisonData[positionIterator]);
        }
        
        maximumPatternMatch = Math.max(maximumPatternMatch, segmentHighestMatch);
    }

    deliverOutputResult(maximumPatternMatch);
};

const generatePrefixOverlapArray = (sequenceToAnalyze) => {
    const sequenceDimension = sequenceToAnalyze.length;
    const overlapLengths = new Array(sequenceDimension).fill(0);
    overlapLengths[0] = sequenceDimension;

    let currentScanPoint = 1;
    let extentOfCurrentOverlap = 0;

    while (currentScanPoint < sequenceDimension) {
        while ((currentScanPoint + extentOfCurrentOverlap) < sequenceDimension &&
               (sequenceToAnalyze[extentOfCurrentOverlap] === sequenceToAnalyze[currentScanPoint + extentOfCurrentOverlap])) {
            extentOfCurrentOverlap++;
        }
        overlapLengths[currentScanPoint] = extentOfCurrentOverlap;

        if (extentOfCurrentOverlap === 0) {
            currentScanPoint++;
            continue;
        }

        let copyOffsetIndex = 1;
        while ((currentScanPoint + copyOffsetIndex) < sequenceDimension &&
               (copyOffsetIndex + overlapLengths[copyOffsetIndex] < extentOfCurrentOverlap)) {
            overlapLengths[currentScanPoint + copyOffsetIndex] = overlapLengths[copyOffsetIndex];
            copyOffsetIndex++;
        }

        currentScanPoint += copyOffsetIndex;
        extentOfCurrentOverlap -= copyOffsetIndex;
    }
    return overlapLengths;
};

read.on('close', function(){
  prepareInputService(inLine);
  console.error("\n");
  var start = Date.now();
  processStringPatterns();
  var end = Date.now() - start;
  myerr("time : " + end + "ms");
  myerr("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});