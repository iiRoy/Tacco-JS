executionEnvironment.stdin.resume();

executionEnvironment.stdin.configureEncoding('utf8');

// Establish a handler for incoming data chunks from the standard input stream.
executionEnvironment.stdin.attachListener('data', function(dataBlock) {
    // Convert the data chunk to a string, remove leading/trailing whitespace, and split by newlines.
    const rawLines = dataBlock.toString().trim().split('\n');

    // Input validation: Ensure there's at least one non-empty line.
    if (rawLines.length === 0 || rawLines[0].trim().length === 0) {
        console.error('Error: No meaningful input detected. Please provide a number.');
        executionEnvironment.exit(1); // Terminate with an error code.
        return;
    }

    const initialInputString = rawLines[0].trim();
    let parsedUpperLimit = parseInt(initialInputString, 10);

    // Further validation: Check if the parsed input is a valid positive integer.
    if (isNaN(parsedUpperLimit) || parsedUpperLimit < 1 || !Number.isInteger(parsedUpperLimit)) {
        console.warn(`Warning: '${initialInputString}' is not a valid positive integer. Proceeding with a default limit of 10.`);
        parsedUpperLimit = 10; // Assign a fallback value if input is invalid.
    }

    // Encapsulate the primary logic within a self-executing function to manage scope.
    const finalOutputString = (function(maxVal) {
        /**
         * Determines if a given number satisfies specific criteria:
         * 1. It is perfectly divisible by three.
         * 2. Its string representation includes the digit '3'.
         * @param {number} currentVal The number to evaluate.
         * @returns {boolean} True if the number meets the criteria, otherwise false.
         */
        const checkSpecialCondition = function(currentVal) {
            const isMultipleOfThree = (currentVal % 3 === 0);
            const containsThreeDigit = String(currentVal).includes('3');

            return isMultipleOfThree || containsThreeDigit;
        };

        // Generate a sequence of numbers from 1 up to the maximum value,
        // then filter them using the defined special condition.
        const qualifiedNumbers = buildSequentialList(1, maxVal)
            .filter(checkSpecialCondition);

        // Concatenate the filtered numbers into a single space-separated string.
        return qualifiedNumbers.join(' ');

    }(parsedUpperLimit)); // Pass the validated upper limit to the IIFE.

    // Output the final processed string. If no numbers matched, an empty string will be displayed.
    console.info('Processed Result:', finalOutputString);

    /**
     * Constructs an array of integers within a specified inclusive range.
     * Includes robust validation for the range parameters.
     * @param {number} lowerBoundary The starting integer for the sequence.
     * @param {number} upperBoundary The ending integer for the sequence.
     * @returns {number[]} An array containing the sequence of integers, or an empty array if the range is invalid.
     */
    function buildSequentialList(lowerBoundary, upperBoundary) {
        const generatedElements = [];
        // Validate that both boundaries are integers and the lower boundary does not exceed the upper.
        if (!Number.isInteger(lowerBoundary) || !Number.isInteger(upperBoundary) || lowerBoundary > upperBoundary) {
            console.error(`Error: Invalid range boundaries provided [${lowerBoundary}, ${upperBoundary}]. Returning an empty list.`);
            return generatedElements;
        }

        // Iterate from the lower to the upper boundary, adding each integer to the list.
        for (let currentCounter = lowerBoundary; currentCounter <= upperBoundary; ++currentCounter) {
            generatedElements.push(currentCounter);
        }
        return generatedElements;
    }
});

// Add an additional listener to catch potential errors during standard input operations.
executionEnvironment.stdin.attachListener('error', (err) => {
    console.error('An unexpected error occurred with the input stream:', err);
    executionEnvironment.exit(1); // Exit with a non-zero code to indicate failure.
});