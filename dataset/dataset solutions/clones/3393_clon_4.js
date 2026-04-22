const makeInputReader = (entireSourceContent) => {
    const rawLineBuffer = entireSourceContent.trim().split('\n');
    let linePointer = 0;
    let currentSegmentBuffer = []; // Stores tokens for the current line, processed right-to-left
    let segmentConsumedFlag = true; // Indicates if current line's segments are exhausted for `fetchSingle`

    const ensureSegmentsAvailable = () => {
        if (currentSegmentBuffer.length === 0 && !segmentConsumedFlag) {
            segmentConsumedFlag = true; // Mark current line as fully processed by `fetchSingle`
        }

        if (segmentConsumedFlag && linePointer < rawLineBuffer.length) {
            currentSegmentBuffer = rawLineBuffer[linePointer].split(/\s+/).filter(Boolean); // Filter empty strings
            currentSegmentBuffer.reverse(); // Mimic original's right-to-left popping
            linePointer++;
            segmentConsumedFlag = false;
        }
        return currentSegmentBuffer.length > 0;
    };

    const fetchSingleSegment = (returnAsString = false) => {
        // Corresponds to original GET.a()
        if (!ensureSegmentsAvailable()) {
            return undefined; // No more input
        }
        const segmentValue = currentSegmentBuffer.pop();
        if (currentSegmentBuffer.length === 0) {
            segmentConsumedFlag = true; // Current line's segments exhausted for this method
        }
        return returnAsString ? segmentValue : Number(segmentValue);
    };

    const fetchAllSegmentsInLine = (returnAsString = false) => {
        // Corresponds to original GET.l()
        // It always consumes a *new* line, regardless of `currentSegmentBuffer` state.
        if (linePointer >= rawLineBuffer.length) {
            return undefined; // No more lines
        }
        const wholeLine = rawLineBuffer[linePointer++];
        const segments = wholeLine.split(/\s+/).filter(Boolean);

        // Reset state for `fetchSingleSegment` as a new line was consumed directly
        currentSegmentBuffer = [];
        segmentConsumedFlag = true;

        return returnAsString ? segments : segments.map(Number);
    };

    const fetchSegmentGrid = (rowsToRead, returnAsString = false) => {
        // Corresponds to original GET.m()
        const acquiredGrid = [];
        for (let i = 0; i < rowsToRead; i++) {
            if (linePointer >= rawLineBuffer.length) {
                return undefined; // Not enough lines
            }
            const lineData = rawLineBuffer[linePointer++];
            const lineSegments = lineData.split(/\s+/).filter(Boolean);
            acquiredGrid.push(returnAsString ? lineSegments : lineSegments.map(Number));
        }

        // Reset state for `fetchSingleSegment`
        currentSegmentBuffer = [];
        segmentConsumedFlag = true;
        return acquiredGrid;
    };

    const fetchRawLines = (linesCount, returnAsString = false) => {
        // Corresponds to original GET.r()
        const rawLines = [];
        for (let i = 0; i < linesCount; i++) {
            if (linePointer >= rawLineBuffer.length) {
                return undefined;
            }
            const lineContent = rawLineBuffer[linePointer++];
            rawLines.push(returnAsString ? lineContent : Number(lineContent));
        }

        // Reset state for `fetchSingleSegment`
        currentSegmentBuffer = [];
        segmentConsumedFlag = true;
        return rawLines;
    };

    return {
        grabOne: fetchSingleSegment,
        grabLine: fetchAllSegmentsInLine,
        grabGrid: fetchSegmentGrid,
        grabChunks: fetchRawLines
    };
};

const performCalculations = (inputSource) => {
    const totalItems = inputSource.grabOne();
    const itemCollection = inputSource.grabLine();

    const itemFrequencies = new Map();
    itemCollection.forEach(value => {
        itemFrequencies.set(value, (itemFrequencies.get(value) || 0) + 1);
    });

    itemCollection.sort((val1, val2) => val2 - val1); // Sort descending

    // Pre-generate powers of two up to a relevant maximum
    const powerSeries = [];
    let currentPowerVal = 2; // Start from 2^1
    const maxPossibleSum = 2 * 10**9 + 1; // Assuming max item value around 10^9
    while (currentPowerVal <= maxPossibleSum) {
        powerSeries.push(currentPowerVal);
        currentPowerVal *= 2;
    }

    let finalPairCount = 0;

    itemCollection.forEach(currentItem => {
        if ((itemFrequencies.get(currentItem) || 0) === 0) {
            return; // This item has already been used up
        }

        // Find the smallest power of two (P) that is >= currentItem
        const targetPowerForSum = powerSeries.find(p => p >= currentItem);

        if (targetPowerForSum === undefined) {
             // currentItem is too large for any precomputed power, or an edge case
             return;
        }

        const requiredPartner = targetPowerForSum - currentItem;

        // Decrement currentItem's count as it's being considered for a pair
        itemFrequencies.set(currentItem, itemFrequencies.get(currentItem) - 1);

        // Check if the required partner exists and has a positive count
        if (itemFrequencies.get(requiredPartner) > 0) {
            itemFrequencies.set(requiredPartner, itemFrequencies.get(requiredPartner) - 1);
            finalPairCount++;
        }
    });

    return finalPairCount;
};

const inputReaderInstance = makeInputReader(require("fs").readFileSync("/dev/stdin","utf8"));

console.log(performCalculations(inputReaderInstance));