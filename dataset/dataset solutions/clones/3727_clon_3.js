function processInput(rawData) {
    const lines = rawData.split("\n");
    const paramStrings = lines[0].split(" ");
    const dataArrayStrings = lines[1].split(" ");

    const [numElementsStr, segmentSizeStr] = paramStrings;
    const segmentSize = parseInt(segmentSizeStr, 10);

    let currentResult = 0;
    let foundOneIndex = -1;
    const dataLength = dataArrayStrings.length;

    let iterationCounter = 0;
    while (iterationCounter < dataLength) {
        if (dataArrayStrings[iterationCounter] === "1") {
            foundOneIndex = iterationCounter;
            break;
        }
        iterationCounter++;
    }

    let leftSegmentLength = foundOneIndex;
    let rightSegmentLength = dataLength - 1 - foundOneIndex;

    let finalAdjustment = 0;
    const totalSegmentSpan = leftSegmentLength + rightSegmentLength;
    if (totalSegmentSpan <= segmentSize) {
        finalAdjustment = -1;
    }

    const calculateOperations = (segmentRemaining, stepDecrement) => {
        let ops = 0;
        while (segmentRemaining > 0) {
            ops++;
            segmentRemaining -= stepDecrement;
        }
        return ops;
    };

    const effectiveStep = segmentSize - 1;

    currentResult += calculateOperations(leftSegmentLength, effectiveStep);
    currentResult += calculateOperations(rightSegmentLength, effectiveStep);

    if (currentResult !== 0) {
        currentResult += finalAdjustment;
    }

    console.log(currentResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
