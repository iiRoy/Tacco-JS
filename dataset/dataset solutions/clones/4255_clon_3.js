(function() {
    'use strict';

    // A dynamic collection to store each segment of input data received.
    let receivedInputSegments = [];

    // Assign standard I/O streams to local constants for clarity and potential reuse.
    const standardInputChannel = process.stdin;
    const standardOutputChannel = process.stdout;

    // Initialize an interface for reading input line by line.
    const inputProcessingInterface = require('readline').createInterface({
        input: standardInputChannel,
        output: standardOutputChannel
    });

    // Attach an event handler for each new line of data received.
    inputProcessingInterface.on('line', (currentLineOfText) => {
        // Add the trimmed line to our collection of input segments.
        receivedInputSegments.push(currentLineOfText.trim());
    });

    /**
     * Computes the largest perfect square that is less than or equal to a given numeric limit.
     *
     * @param {number} numericBoundary The upper limit for the perfect square.
     * @returns {number} The largest perfect square not exceeding numericBoundary, or 0 if input is invalid.
     */
    function calculateMaximalPerfectSquare(numericBoundary) {
        // Validate input type and value.
        if (typeof numericBoundary !== 'number' || isNaN(numericBoundary) || numericBoundary < 0) {
            console.error("Input for maximal perfect square calculation must be a non-negative number.");
            return 0; // Return zero for invalid or negative inputs, as squares are non-negative.
        }

        let largestSquareFound = 0;
        let baseNumberCandidate = 0;

        // Optimize the search range: we only need to check base numbers up to the square root of the boundary.
        const effectiveUpperBaseLimit = Math.floor(Math.sqrt(numericBoundary));

        // Iterate upwards, checking each potential base number.
        while (baseNumberCandidate <= effectiveUpperBaseLimit) {
            const currentSquaredValue = baseNumberCandidate * baseNumberCandidate;

            // Since we're iterating in ascending order, the last valid square will be the largest.
            // We can directly assign it, or add an explicit check for clarity.
            if (currentSquaredValue <= numericBoundary) {
                largestSquareFound = currentSquaredValue;
            } else {
                // If the current square exceeds the boundary, all subsequent squares will also exceed it.
                break;
            }
            baseNumberCandidate++; // Advance to the next integer base.
        }
        return largestSquareFound;
    }

    // Set up an event handler for when the standard input stream signals its completion.
    standardInputChannel.on('end', () => {

        // Pre-check: Ensure that some input data was actually collected.
        if (receivedInputSegments.length === 0) {
            console.warn("No data segments were provided via standard input. Operation aborted.");
            return;
        }

        // Extract the initial input string that should contain our primary number.
        const rawNumericString = receivedInputSegments[0];
        // Attempt to convert the string to an integer, specifying radix 10 for robustness.
        const parsedNumericLimit = parseInt(rawNumericString, 10);

        // Validate the parsing outcome.
        if (isNaN(parsedNumericLimit)) {
            console.error(`Parsing error: The input value '${rawNumericString}' could not be interpreted as a valid integer.`);
            return;
        }

        // Apply a specific handling for negative input values.
        if (parsedNumericLimit < 0) {
            // For this specific algorithm, a negative input implies a result of 0
            // because perfect squares are non-negative.
            standardOutputChannel.write(`Note: Negative input (${parsedNumericLimit}) provided. Resulting square is 0.\n`);
            standardOutputChannel.write("0\n"); // Output 0 explicitly for negative input.
            return;
        }

        // Execute the main computation using the parsed numeric limit.
        const finalCalculatedValue = calculateMaximalPerfectSquare(parsedNumericLimit);

        // Output the final result to the standard output stream, followed by a newline.
        standardOutputChannel.write(`${finalCalculatedValue}\n`);
    });

    // Add an error listener for the standard input stream to catch and report potential issues.
    standardInputChannel.on('error', (ioError) => {
        console.error('An unexpected error occurred during input stream processing:', ioError);
    });

})();