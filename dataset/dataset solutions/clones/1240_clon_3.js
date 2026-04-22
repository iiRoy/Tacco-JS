// This JavaScript program is designed to read three integer values from standard input,
// representing a lower bound, an upper bound, and a target dividend.
// It then calculates and displays the total count of numbers within the inclusive
// range [lowerBound, upperBound] that are perfect divisors of the target dividend.

// Activate the standard input stream to begin listening for data.
process.stdin.resume();

// Configure the encoding for incoming data from the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');

// A buffer to accumulate all received data from stdin.
// Input might arrive in multiple chunks, so it's safer to gather it all.
let accumulatedInputBuffer = '';

// Register an event listener for when data chunks are received on stdin.
process.stdin.on('data', (incomingDataSegment) => {
    // Append the current data segment to our buffer.
    accumulatedInputBuffer += incomingDataSegment;
});

// Register an event listener for when the standard input stream signals its end (no more data).
process.stdin.on('end', () => {
    /**
     * Parses and validates a string of space-separated numbers.
     * @param {string} rawInputString The raw string received from stdin.
     * @returns {{lowerBound: number, upperBound: number, dividend: number}} An object containing the parsed numeric values.
     * @throws {Error} If input is invalid (e.g., wrong count, non-numeric, illogical range).
     */
    const parseAndValidateNumericInputs = (rawInputString) => {
        // Clean up whitespace and split the input string into individual number strings.
        const stringFragments = rawInputString.trim().split(/\s+/);

        // Ensure that exactly three numerical values were provided.
        if (stringFragments.length !== 3) {
            throw new Error(`Input Error: Expected 3 numbers (start, end, target), but received ${stringFragments.length}.`);
        }

        // Convert string fragments to numbers, validating each conversion.
        const numericalElements = stringFragments.map((fragment, index) => {
            const parsedNum = Number(fragment);
            if (isNaN(parsedNum)) {
                throw new Error(`Input Error: Value at position ${index + 1} ("${fragment}") is not a valid number.`);
            }
            return parsedNum;
        });

        // Destructure the validated numbers into descriptive variables.
        const [lowerBound, upperBound, dividend] = numericalElements;

        // Perform a logical check on the range boundaries.
        if (lowerBound > upperBound) {
            throw new Error(`Input Error: The starting range boundary (${lowerBound}) cannot be greater than the ending boundary (${upperBound}).`);
        }

        return { lowerBound, upperBound, dividend };
    };

    /**
     * Computes the count of numbers within a given range that perfectly divide a target number.
     * @param {number} rangeStart The inclusive lower bound of the range.
     * @param {number} rangeEnd The inclusive upper bound of the range.
     * @param {number} targetDividend The number to be divided.
     * @returns {number} The total count of divisors found in the range.
     */
    const calculateDivisorOccurrencesInRange = (rangeStart, rangeEnd, targetDividend) => {
        let successfulDivisorCount = 0; // Initialize a tally for qualifying numbers.

        // Iterate through each integer from the start of the range up to and including the end.
        for (let currentInteger = rangeStart; currentInteger <= rangeEnd; currentInteger++) {
            // A number cannot be divided by zero, so skip if currentInteger is zero.
            // This also handles cases where the range might include 0 (though uncommon for such problems).
            if (currentInteger === 0) {
                continue;
            }

            // Check if the target dividend is perfectly divisible by the current integer.
            // The modulo operator (%) returns 0 if there is no remainder.
            if ((targetDividend % currentInteger) === 0) {
                successfulDivisorCount++; // Increment the counter if it's a divisor.
            }
        }
        return successfulDivisorCount; // Return the final tally.
    };

    try {
        // Attempt to parse and validate the accumulated input data.
        const { lowerBound, upperBound, dividend } = parseAndValidateNumericInputs(accumulatedInputBuffer);

        // Execute the core logic to find the count of divisors.
        const finalResultTally = calculateDivisorOccurrencesInRange(lowerBound, upperBound, dividend);

        // Output the final computed result in a user-friendly format.
        console.log(`For the range [${lowerBound}, ${upperBound}] and target ${dividend}, found ${finalResultTally} numbers that are divisors.`);

    } catch (operationError) {
        // If any error occurred during parsing or validation, log it and exit with an error code.
        console.error(`Processing Aborted: ${operationError.message}`);
        process.exit(1); // Indicate an abnormal termination.
    }
});

// Add an error listener for the stdin stream itself, for robustness.
process.stdin.on('error', (streamError) => {
    console.error('An unexpected error occurred with the standard input stream:', streamError.message);
    process.exit(1); // Exit due to critical input stream error.
});