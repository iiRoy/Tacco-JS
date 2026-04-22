process.stdin.setEncoding('utf8');
process.stdin.resume();

// Listener for incoming data chunks from standard input.
// Each chunk is processed as a distinct segment of input.
process.stdin.on('data', (incomingInputSegment) => {
    // Delegate the processing of this input segment to a dedicated handler.
    handleInputSegmentData(incomingInputSegment);
});

// A constant reference to the standard output function.
// Used for displaying the final computed results.
const displayComputationResult = console.log;

/**
 * Processes a raw segment of input data.
 * This involves splitting the segment into individual lines,
 * filtering out any empty or whitespace-only lines,
 * and then passing the valid lines for core computations.
 * @param {string} rawSegment - The raw string data received from a 'data' event.
 */
function handleInputSegmentData(rawSegment) {
    const LINE_DELIMITER = '\n'; // Defines the character for splitting lines.

    // Split the raw input into an array of potential lines.
    let potentialInputLines = rawSegment.split(LINE_DELIMITER);

    // Filter the lines: keep only those that contain actual content.
    // Lines consisting solely of whitespace or being completely empty are discarded.
    let validContentLines = [];
    for (const individualLine of potentialInputLines) {
        const trimmedLine = individualLine.trim();
        if (trimmedLine !== "") {
            validContentLines.push(trimmedLine);
        }
    }

    // If valid lines are found, initiate the primary numerical computation.
    if (validContentLines.length > 0) {
        executeMainNumericalProcessing(validContentLines);
    }
}

/**
 * Executes the primary numerical algorithm.
 * This involves converting string inputs to numbers,
 * then iteratively processing blocks of these numbers.
 * For each block, it removes the minimum and maximum values,
 * and outputs the rounded average of the remaining elements.
 * @param {string[]} stringRepresentationsOfNumbers - An array of strings expected to be numbers.
 */
function executeMainNumericalProcessing(stringRepresentationsOfNumbers) {
    // Convert all input strings into a queue of actual numbers.
    // Non-numeric strings are skipped to ensure data integrity.
    let numberProcessingQueue = [];
    for (const stringValue of stringRepresentationsOfNumbers) {
        const parsedValue = Number(stringValue);
        if (!isNaN(parsedValue)) { // Ensure the parsed value is a valid number.
            numberProcessingQueue.push(parsedValue);
        }
    }

    // Continue processing as long as there are sufficient numbers in the queue
    // to potentially form a block (at least one for the size, and others for the block itself).
    while (numberProcessingQueue.length > 1) {
        // Extract the first number, which indicates the size of the current block.
        const designatedBlockSize = numberProcessingQueue.shift();

        // Validate the designated block size. It must be a positive integer.
        // If invalid, log an error and halt further processing of this data set.
        if (typeof designatedBlockSize !== 'number' || !Number.isInteger(designatedBlockSize) || designatedBlockSize <= 0) {
            displayComputationResult(`Error: Invalid block size indicator (${designatedBlockSize}) detected. Processing terminated.`);
            numberProcessingQueue.length = 0; // Clear the queue to prevent further errors.
            break; // Exit the main loop.
        }

        // Extract the current block of numbers based on the designated size.
        // `splice` removes these elements directly from the queue.
        const currentNumericalBlock = numberProcessingQueue.splice(0, designatedBlockSize);

        // Guard clause: A block must have at least 3 elements to allow for
        // removal of both min and max and still have elements for averaging.
        if (currentNumericalBlock.length < 3) {
            // Skip this block if it's too small for the required operations.
            continue;
        }

        // Identify and remove the minimum value from the block.
        const smallestValue = Math.min(...currentNumericalBlock);
        const firstMinIndex = currentNumericalBlock.indexOf(smallestValue);
        if (firstMinIndex !== -1) { // Ensure the value was found before attempting to remove.
            currentNumericalBlock.splice(firstMinIndex, 1);
        } else {
            // Log an internal error if min value couldn't be removed, and skip block.
            continue;
        }

        // Identify and remove the maximum value from the *modified* block.
        const largestValue = Math.max(...currentNumericalBlock);
        const firstMaxIndex = currentNumericalBlock.indexOf(largestValue);
        if (firstMaxIndex !== -1) { // Ensure the value was found before attempting to remove.
            currentNumericalBlock.splice(firstMaxIndex, 1);
        } else {
            // Log an internal error if max value couldn't be removed, and skip block.
            continue;
        }

        // Calculate the sum of the remaining numbers in the block.
        // Rewritten from a `reduce` method to an explicit `for...of` loop.
        let aggregatedSum = 0;
        for (const numberValue of currentNumericalBlock) {
            aggregatedSum += numberValue;
        }

        // Calculate the average of the remaining numbers.
        // Guard against division by zero if the block somehow became empty.
        let finalCalculatedAverage = 0;
        if (currentNumericalBlock.length > 0) {
            finalCalculatedAverage = aggregatedSum / currentNumericalBlock.length;
        }

        // Output the rounded average to the console.
        displayComputationResult(Math.round(finalCalculatedAverage));
    }
}