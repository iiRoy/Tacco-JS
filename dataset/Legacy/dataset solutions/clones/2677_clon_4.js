function processInputData(rawData) {
    const inputParts = rawData.split(" ");
    const targetValue = parseInt(inputParts[0], 10);

    let cumulativeCount = 0;
    let currentRangeStart = 1; // Represents 1, 10, 100, 1000, ...
    let currentRangeEnd = 9;   // Represents 9, 99, 999, 9999, ...
    let isOddDigitLength = true;

    while (currentRangeStart <= targetValue) {
        if (isOddDigitLength) {
            // Calculate the number of elements in the current odd-digit-length range
            // that are less than or equal to targetValue.
            const segmentContribution = Math.min(targetValue, currentRangeEnd) - currentRangeStart + 1;
            cumulativeCount += segmentContribution;
        }

        // Prepare for the next digit length range.
        // Check for potential overflow before multiplying by 10, though not strictly
        // necessary for the given problem constraints (N up to 10^5).
        if (currentRangeStart > Number.MAX_SAFE_INTEGER / 10) {
            break; 
        }

        currentRangeStart *= 10;
        currentRangeEnd = currentRangeEnd * 10 + 9;
        isOddDigitLength = !isOddDigitLength;
    }

    console.log(cumulativeCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
