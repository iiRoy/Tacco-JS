var inputLines = [];

var ioHandler = require('readline');
var inputReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (receivedLine) {
    inputLines.push(receivedLine);
});

inputReader.on('close', function () {
    // Helper function to parse initial configuration parameters
    const parseInitialConfig = (configLine) => {
        const configParts = configLine.split(" ");
        return {
            totalElements: Number(configParts[0]),
            maxFlips: Number(configParts[1])
        };
    };

    const initialConfig = parseInitialConfig(inputLines.shift());
    const totalElements = initialConfig.totalElements;
    const maxFlips = initialConfig.maxFlips;

    const elementChars = inputLines[0].split("");

    // Helper function to generate segment lengths (alternating 1s and 0s)
    const generateSegmentLengths = (charArray, arrayLength) => {
        const segmentLengths = [];
        let currentSegmentType = 1; // Start by looking for '1's
        let currentSegmentCount = 0;

        for (let charIndex = 0; charIndex < arrayLength; charIndex++) {
            if (parseInt(charArray[charIndex]) === currentSegmentType) {
                currentSegmentCount++;
            } else {
                segmentLengths.push(currentSegmentCount);
                currentSegmentType ^= 1; // Toggle between 0 and 1
                currentSegmentCount = 1;
            }
        }

        // Add the last segment's count if it's not zero
        if (currentSegmentCount !== 0) {
            segmentLengths.push(currentSegmentCount);
        }

        // Ensure the segmentLengths array always has an odd number of elements.
        // This is crucial for the sliding window logic to correctly identify '1' segments.
        // If the last segment was '1' and the array length is even, append a zero-length '0' segment.
        if (segmentLengths.length % 2 === 0) {
            segmentLengths.push(0);
        }
        return segmentLengths;
    };

    const segmentLengths = generateSegmentLengths(elementChars, totalElements);

    let maxConsecutiveOnes = 1; // Preserve original initialization for edge cases like N=0, K=0
    let currentWindowSum = 0;
    const windowSegmentCount = 2 * maxFlips + 1; // Number of segments in the window (K 0s + K+1 1s)

    // Calculate the sum for the initial window, starting at the first '1' segment (index 0)
    for (let windowOffset = 0; windowOffset < windowSegmentCount; windowOffset++) {
        // The original code relies on implicit NaN propagation if Nums[index] is undefined.
        // We replicate this behavior by not adding explicit bounds checks here.
        currentWindowSum += segmentLengths[windowOffset];
    }
    if (maxConsecutiveOnes < currentWindowSum) {
        maxConsecutiveOnes = currentWindowSum;
    }

    // Slide the window across subsequent '1' segments (indices 2, 4, ...)
    // The window shifts by two segments at a time (one '1' segment and one '0' segment).
    for (let segmentIndex = 2; segmentIndex < segmentLengths.length; segmentIndex += 2) {
        // Subtract segments leaving the window
        currentWindowSum -= segmentLengths[segmentIndex - 2];
        currentWindowSum -= segmentLengths[segmentIndex - 1];

        // Add segments entering the window
        const newSegmentIndex1 = segmentIndex + windowSegmentCount - 2;
        const newSegmentIndex2 = segmentIndex + windowSegmentCount - 1;

        // Replicate original behavior: if index is out of bounds, adding undefined results in NaN.
        currentWindowSum += segmentLengths[newSegmentIndex1];
        currentWindowSum += segmentLengths[newSegmentIndex2];

        if (maxConsecutiveOnes < currentWindowSum) {
            maxConsecutiveOnes = currentWindowSum;
        }
    }

    console.log(maxConsecutiveOnes);
});
