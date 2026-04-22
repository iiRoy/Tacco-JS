const incomingDataLines = [];

const standardInputOutput = require('readline');

const inputProcessor = standardInputOutput.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Capture each line of input into a buffer.
inputProcessor.on('line', (receivedLine) => {
    incomingDataLines.push(receivedLine);
});

// Once all input has been received, process it.
inputProcessor.on('close', () => {
    // Extract the initial configuration parameters from the first line.
    // This line typically contains the length of the sequence and the number of allowed modifications.
    const configurationValues = incomingDataLines.shift().split(" ");

    // Parse the total length of the binary sequence.
    const sequenceTotalLength = parseInt(configurationValues[0], 10);
    // Parse the maximum number of zero-blocks that can be 'flipped' to ones.
    const maxZeroBlockFlips = parseInt(configurationValues[1], 10);

    // Basic validation for parsed numbers.
    if (isNaN(sequenceTotalLength) || isNaN(maxZeroBlockFlips) || sequenceTotalLength < 0 || maxZeroBlockFlips < 0) {
        console.error("Error: Input length or flip count is invalid.");
        process.exit(1); // Terminate with an error code.
    }

    // Retrieve the binary string itself.
    // Handle cases where `incomingDataLines[0]` might be undefined if `sequenceTotalLength` is 0.
    const binaryStringSequence = incomingDataLines[0] || "";

    // This array will store the lengths of consecutive blocks of identical characters.
    // For example, "1100010" would result in [2, 3, 1, 1] (two '1's, three '0's, one '1', one '0').
    const consecutiveBlockLengths = [];
    let currentBlockCharacter = 1; // Start by expecting a '1' block.
    let currentBlockSize = 0;     // Counter for the current block's length.

    // Iterate through the binary sequence to populate `consecutiveBlockLengths`.
    for (let charIndex = 0; charIndex < sequenceTotalLength; charIndex++) {
        // Convert the character to a number for comparison.
        if (parseInt(binaryStringSequence[charIndex], 10) === currentBlockCharacter) {
            currentBlockSize++; // Character matches, increment current block's size.
        } else {
            // Character mismatch: the current block has ended.
            consecutiveBlockLengths.push(currentBlockSize); // Store the size of the completed block.
            currentBlockCharacter ^= 1;                     // Toggle the expected character type (0 becomes 1, 1 becomes 0).
            currentBlockSize = 1;                           // Start counting for the new block.
        }
    }

    // After the loop, if there's any pending `currentBlockSize`, add it to the array.
    if (currentBlockSize > 0) {
        consecutiveBlockLengths.push(currentBlockSize);
    }

    // Crucial step: Ensure the `consecutiveBlockLengths` array always has an odd number of elements.
    // This guarantees that blocks representing '1's are always at even indices (0, 2, 4, ...).
    // If the last actual block was a '0' block (making the array length even),
    // we append a '0' (representing an empty '1' block) to maintain this pattern.
    // This simplifies the later sliding window logic.
    if (consecutiveBlockLengths.length % 2 === 0) {
        consecutiveBlockLengths.push(0);
    }
    // If `sequenceTotalLength` was 0, `consecutiveBlockLengths` would be `[]`, then `[0]` after this step.

    let longestOnesSequence = 0; // Stores the maximum length of '1's found.
    let currentSegmentTotal = 0;  // Accumulator for the current window's sum.

    // Calculate the maximum number of segments (blocks) that can be included in one window.
    // Each `maxZeroBlockFlips` allows converting one '0' block.
    // A window with `K` flips covers `K` '0' blocks and `K+1` '1' blocks.
    // Total segments in window = `K + (K+1) = 2K + 1`.
    const slidingWindowBlockLimit = 2 * maxZeroBlockFlips + 1;

    // Iterate through `consecutiveBlockLengths` to find the maximum possible sequence of '1's.
    // We only consider starting points that correspond to '1' blocks (even indices).
    for (let windowStartIndex = 0; windowStartIndex < consecutiveBlockLengths.length; windowStartIndex++) {
        // Proceed only if the current segment is a '1' block (indicated by an even index).
        if (windowStartIndex % 2 === 0) {
            currentSegmentTotal = 0; // Reset sum for the new window.
            
            // Sum up the lengths of segments within the current sliding window.
            // The window extends from `windowStartIndex` up to `windowStartIndex + slidingWindowBlockLimit - 1`.
            for (let segmentOffset = 0; segmentOffset < slidingWindowBlockLimit; segmentOffset++) {
                const absoluteSegmentIndex = windowStartIndex + segmentOffset;
                // Add the segment length. If `absoluteSegmentIndex` goes out of bounds,
                // treat the missing segment as having length 0 (using logical OR `|| 0`).
                currentSegmentTotal += (consecutiveBlockLengths[absoluteSegmentIndex] || 0);
            }
            
            // Update the global maximum if the current window's total is greater.
            if (longestOnesSequence < currentSegmentTotal) {
                longestOnesSequence = currentSegmentTotal;
            }
        }
    }

    // Print the final result: the maximum length of consecutive '1's achievable.
    console.log(longestOnesSequence);
});