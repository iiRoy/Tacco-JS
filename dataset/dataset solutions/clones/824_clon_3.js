// This script processes numerical inputs from standard input to determine
// how many ways each positive integer can be expressed as a sum of at least
// two consecutive positive integers. It terminates processing upon
// encountering a non-positive integer or invalid input.

var processInputValues = function() {
    // Define the smallest possible length for a sequence of consecutive integers.
    const MINIMUM_SEQUENCE_LENGTH = 2; 

    // Main loop to continuously read and process input values.
    while (true) {
        let incomingLineData = fetchNextInputLine();
        
        // If there's no more input, exit the processing loop.
        if (incomingLineData === null) { 
            break;
        }

        // Convert the input string to an integer. Base 10 is explicitly specified.
        let targetSumValue = parseInt(incomingLineData, 10);

        // Validate the input: terminate if it's not a number, or if it's zero/negative.
        // The original code used `!n` which handles 0 and NaN similarly.
        if (isNaN(targetSumValue) || targetSumValue <= 0) {
            break;
        }

        let validDecompositionCount = 0; // Counter for successful decompositions.
        let currentSequenceLength = MINIMUM_SEQUENCE_LENGTH; // Start with a sequence of two integers.

        // Inner loop to iterate through possible sequence lengths (i.e., 'i' in the original problem).
        // The formula for the sum of 'L' consecutive integers starting with 'S' is:
        // Sum = L * S + L * (L - 1) / 2
        // We are looking for 'S' (the starting integer) to be positive, so S >= 1.
        // This implies: (targetSumValue - L * (L - 1) / 2) / L >= 1
        // Which simplifies to: (targetSumValue - L * (L - 1) / 2) >= L
        while (true) {
            // Calculate the sum of the first (currentSequenceLength - 1) integers.
            let sumOfInitialSequenceTerms = (currentSequenceLength * (currentSequenceLength - 1)) / 2;
            
            // Calculate the adjusted sum, which must be divisible by currentSequenceLength.
            let remainderForStartValue = targetSumValue - sumOfInitialSequenceTerms;

            // If the remainder is less than the current sequence length, it means the
            // starting integer 'S' would be less than 1. Since increasing
            // currentSequenceLength further would only make remainderForStartValue smaller,
            // we can confidently terminate this inner loop.
            if (remainderForStartValue < currentSequenceLength) {
                break;
            }

            // If the remainder is perfectly divisible by currentSequenceLength,
            // it means we found a valid starting integer 'S' (S = remainderForStartValue / currentSequenceLength).
            // This indicates a valid decomposition.
            if (remainderForStartValue % currentSequenceLength === 0) {
                validDecompositionCount++;
            }
            
            // Move to the next possible sequence length.
            currentSequenceLength++; 
        }
        // Output the total count of valid decompositions for the current input number.
        outputResult(validDecompositionCount); 
    }
};

// --- Standard Input/Output Abstraction Layer ---
// This module provides `outputResult` and `fetchNextInputLine` functions,
// dynamically adapting to either a Node.js environment or a V8 standalone shell (like 'd8').

if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // --- Node.js Specific I/O Implementation ---
    // In Node.js, input is stream-based and asynchronous.

    // Function to write results to standard output, appending a newline.
    const outputResult = function(dataToWrite) {
        process.stdout.write(String(dataToWrite) + '\n');
    };

    let bufferedInputLines = []; // Stores complete lines read from stdin.
    let lineIndexCursor = 0;     // Pointer to the next line to be fetched.
    let partialInputBuffer = ""; // Holds incomplete line fragments from stream chunks.

    /**
     * Processes incoming data chunks from stdin, splitting them into lines.
     * Complete lines are added to `bufferedInputLines`, and any incomplete
     * line fragment is stored in `partialInputBuffer`.
     * @param {string} dataChunk - The string data received from the input stream.
     */
    const processBufferedData = (dataChunk) => {
        // Concatenate any previous partial buffer with the new chunk, then split by newline.
        const incomingLineSegments = (partialInputBuffer + dataChunk).split("\n");
        // The last segment might be incomplete; store it back into the partial buffer.
        partialInputBuffer = incomingLineSegments.pop(); 

        // Iterate through all complete line segments.
        for (let segmentIndex = 0; segmentIndex < incomingLineSegments.length; segmentIndex++) {
            const currentLine = incomingLineSegments[segmentIndex].trim(); // Trim whitespace.
            // Only add non-empty lines to the buffer.
            if (currentLine.length > 0) { 
                bufferedInputLines.push(currentLine);
            }
        }
    };

    // Set up the standard input stream.
    const inputSourceStream = process.openStdin();
    inputSourceStream.setEncoding('utf8'); // Ensure proper character encoding.

    // Register event listener for incoming data chunks.
    inputSourceStream.on('data', processBufferedData);

    // Register event listener for when the input stream ends.
    inputSourceStream.on('end', () => {
        // If there's any remaining data in the partial buffer, process it as a final complete line.
        if (partialInputBuffer.length > 0) {
            // Append a newline to ensure it's treated as a complete line for splitting.
            const finalSegments = (partialInputBuffer + "\n").split("\n");
            finalSegments.pop(); // Remove the empty string resulting from the appended newline.
            for (let segmentIndex = 0; segmentIndex < finalSegments.length; segmentIndex++) {
                const currentLine = finalSegments[segmentIndex].trim();
                if (currentLine.length > 0) {
                    bufferedInputLines.push(currentLine);
                }
            }
            partialInputBuffer = ""; // Clear the partial buffer after final processing.
        }
        // Once all input has been buffered, initiate the main processing logic.
        processInputValues(); 
    });

    /**
     * Retrieves the next available line from the buffered input.
     * @returns {string|null} The next line as a string, or null if no more lines are available.
     */
    const fetchNextInputLine = function() {
        if (lineIndexCursor < bufferedInputLines.length) {
            return bufferedInputLines[lineIndexCursor++];
        }
        return null; // Signal that the input buffer is exhausted.
    };

} else {
    // --- V8 Standalone Shell Specific I/O Implementation ---
    // Assumes 'print' and 'readline' are globally provided by the V8 environment.

    // Directly use the global 'print' function for output.
    const outputResult = print; 
    // Directly use the global 'readline' function for input.
    const fetchNextInputLine = readline; 

    // In V8 shells, 'readline' is synchronous, so the main processing
    // can begin immediately after defining the I/O functions.
    processInputValues();
}