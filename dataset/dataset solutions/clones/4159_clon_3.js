const inputBuffer = []; // A buffer to store incoming lines from standard input.
const ioHandler = require('readline'); // Module for handling line-by-line input.

// Establish an interface for processing standard input and output streams.
const streamProcessor = ioHandler.createInterface({
    input: process.stdin,  // Read from standard input.
    output: process.stdout // Write to standard output (not used for this problem, but required by interface).
});

// Register an event listener for each line received.
streamProcessor.on('line', (currentLineContent) => {
    // Add the trimmed line content to our buffer. Trimming removes leading/trailing whitespace.
    inputBuffer.push(currentLineContent.trim());
});

// Register an event listener for when the input stream is closed.
streamProcessor.on('close', () => {
    // --- Comprehensive Input Validation and Parsing ---

    // Ensure that at least two lines of input were provided.
    if (inputBuffer.length < 2) {
        console.error("Fatal Error: Insufficient input. Expected at least two lines for processing.");
        process.exit(1); // Terminate with an error code.
    }

    // Parse the first line, which is expected to be the total count of elements.
    // Although 'totalElementsCount' is not directly used for array bounds in this specific logic,
    // it's good practice to parse and validate it if it's part of the input specification.
    const totalElementsCountStr = inputBuffer[0];
    const totalElementsCount = Number(totalElementsCountStr);

    // Validate if the first line successfully parsed into a non-negative integer.
    if (isNaN(totalElementsCount) || !Number.isInteger(totalElementsCount) || totalElementsCount < 0) {
        console.error(`Fatal Error: The first line ('${totalElementsCountStr}') must be a non-negative integer.`);
        process.exit(1);
    }

    // Process the second line, which contains the space-separated numeric sequence.
    const numericSequenceStr = inputBuffer[1];
    const numericSequence = numericSequenceStr.split(" ").map(strVal => {
        const parsedNum = Number(strVal);
        // Validate each element in the sequence.
        if (isNaN(parsedNum)) {
            console.error(`Fatal Error: Non-numeric value detected in sequence: '${strVal}'. All elements must be numbers.`);
            process.exit(1);
        }
        return parsedNum;
    });

    // Optional: A more robust check would compare totalElementsCount with numericSequence.length,
    // but the problem logic directly uses the array's actual content.
    // if (totalElementsCount !== numericSequence.length) {
    //     console.warn(`Warning: Declared element count (${totalElementsCount}) does not match actual sequence length (${numericSequence.length}). Processing actual sequence length.`);
    // }

    // --- Frequency Calculation using a Map ---
    // A Map is used for frequency counting as it handles numerical keys more directly and offers better performance for frequent lookups.
    const frequencyMap = new Map();
    for (const currentNum of numericSequence) {
        // Increment the count for the current number. If the number is not yet in the map, initialize its count to 0 first.
        frequencyMap.set(currentNum, (frequencyMap.get(currentNum) || 0) + 1);
    }

    // --- Result Computation Logic ---
    let finalResult = 0; // Initialize the mutable variable for the final aggregated result.

    /**
     * Helper function to determine the "mismatch" value for a given number and its count.
     * This encapsulates the core logic of the problem.
     * @param {number} key - The unique number itself.
     * @param {number} count - The frequency of that number in the input sequence.
     * @returns {number} The calculated mismatch value.
     */
    const calculateMismatchContribution = (key, count) => {
        // If the number (key) equals its count, it's a perfect match (e.g., three '3's).
        if (key === count) {
            return 0; // No mismatch contribution.
        } else if (key < count) {
            // If the number's count is greater than the number itself (e.g., two '1's),
            // the excess items contribute to the mismatch.
            return count - key;
        } else { // key > count
            // If the number's count is less than the number itself (e.g., one '3'),
            // all occurrences contribute to the mismatch as they cannot form a complete group.
            return count;
        }
    };

    // Iterate through each unique number and its frequency stored in the map.
    for (const [currentKeyAsNumber, occurrenceCount] of frequencyMap.entries()) {
        // Calculate the mismatch for the current number using the helper function.
        const currentMismatchValue = calculateMismatchContribution(currentKeyAsNumber, occurrenceCount);
        // Accumulate the mismatch value into the final result.
        finalResult += currentMismatchValue;
    }

    // Output the final computed result to standard output.
    console.log(finalResult);
});

// Optional: Add a general error handler for the readline interface itself,
// to catch any issues not related to input content parsing.
streamProcessor.on('error', (err) => {
    console.error(`Readline Interface Error: ${err.message}`);
    process.exit(1);
});