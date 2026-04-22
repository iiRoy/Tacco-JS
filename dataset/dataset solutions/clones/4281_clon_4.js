const detectPattern = (inputString) => {
    const soughtSequence = "AC";
    const sequenceLen = soughtSequence.length;
    const peripheryAllowance = 3; // Number of characters allowed on either side
    const minimumPossibleWindow = sequenceLen; // Min window size is "AC" itself (2)
    const maximumPossibleWindow = sequenceLen + (2 * peripheryAllowance); // Max window size (3+AC+3 = 8)

    // Helper to verify a substring segment
    const checkSegment = (segmentContent) => {
        const foundAt = segmentContent.indexOf(soughtSequence);
        if (foundAt === -1) {
            return false;
        }
        const leftCount = foundAt;
        const rightCount = segmentContent.length - (foundAt + sequenceLen);
        return leftCount <= peripheryAllowance && rightCount <= peripheryAllowance;
    };

    // Iterate through all valid window sizes
    const windowSizes = Array.from({ length: maximumPossibleWindow - minimumPossibleWindow + 1 },
        (_, i) => minimumPossibleWindow + i);

    const matchExists = windowSizes.some(currentSize => {
        // Iterate through all possible starting positions for the current window size
        const maxStartPos = inputString.length - currentSize;
        if (maxStartPos < 0) {
            return false; // String is too short for this window size
        }
        const startPositions = Array.from({ length: maxStartPos + 1 }, (_, i) => i);

        return startPositions.some(currentStart => {
            const currentSubsegment = inputString.slice(currentStart, currentStart + currentSize);
            return checkSegment(currentSubsegment);
        });
    });

    return matchExists ? "Yes" : "No";
};

// This function directly mirrors the signature of the original 'Main' function
const performAnalysis = (sourceData) => {
    const sanitizedData = sourceData.trim();
    console.log(detectPattern(sanitizedData));
};

// This line mimics the original's execution
performAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));