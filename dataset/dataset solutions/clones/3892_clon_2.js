'use strict';

/**
 * This function processes the incoming data to determine a specific condition.
 * It's designed to read numerical values and apply a logical check.
 * @param {string} sourceContent The raw text string containing all input data.
 */
const handleInputProcessing = (sourceContent) => {
    // First, split the entire content into individual lines.
    // Then, for each line, split it further by spaces to get distinct parts.
    const processedSegments = sourceContent
        .split('\n')
        .map(segmentItem => segmentItem.split(' '));

    // Extract the first numerical value from the first line of segments.
    // Ensure it's parsed as an integer with base 10.
    const initialLimit = parseInt(processedSegments[0][0], 10);

    // Extract the second numerical value from the first line.
    // This value represents an extension or addition to the initial limit.
    const additionalRange = parseInt(processedSegments[0][1], 10);

    // Extract the third numerical value from the first line.
    // This is the target value we need to check against the calculated range.
    const desiredPoint = parseInt(processedSegments[0][2], 10);

    // Perform the core logical check:
    // Is the desired point greater than or equal to the initial limit?
    // AND is the desired point less than or equal to the sum of initial limit and additional range?
    if (initialLimit <= desiredPoint && (initialLimit + additionalRange) >= desiredPoint) {
        // If both conditions are met, output a positive confirmation.
        console.log('YES');
    }

    // Otherwise, if the conditions are not met, output a negative confirmation.
    else {
        console.log('NO');
    }
};

// Execute the main processing function.
// It reads the entire content of the standard input file (typically /dev/stdin)
// as a UTF-8 encoded string and passes it to the handler.
handleInputProcessing(
    require('fs').readFileSync('/dev/stdin', 'utf8')
);