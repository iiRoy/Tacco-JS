function analyzeNumericSequences (rawInputString) {
    // Step 1: Prepare the raw input string by trimming whitespace.
    const cleanedInput = rawInputString.trim();

    // Step 2: Split the cleaned input into individual tokens using whitespace or newlines as delimiters.
    const tokenizedInput = cleanedInput.split(/\s|\n/);

    // Step 3: Convert all tokens to numbers. This array will be processed sequentially.
    const numericTokens = tokenizedInput.map(val => Number(val));

    // Initialize a pointer to keep track of the current position in the numericTokens array.
    // This replaces the array.shift() method for potentially better performance on large arrays,
    // as it avoids modifying the array in place.
    let tokenPointer = 0;

    // Main processing loop: continues indefinitely until a specific termination condition is met.
    // This structure is a common pattern for processing input streams where the end condition
    // is embedded within the data itself.
    while (true) {
        // Guard clause: Check if we have consumed all available tokens.
        // If so, there's no more data to process, so we exit the loop.
        if (tokenPointer >= numericTokens.length) {
            break;
        }

        // Retrieve the first number of the current block, which represents the length of the sequence.
        let currentSequenceLength = numericTokens[tokenPointer];
        tokenPointer++; // Advance the pointer to the next token.

        // Termination condition: If the sequence length is 0, it signals the end of input.
        if (currentSequenceLength === 0) {
            break;
        }

        // Validation: Ensure the sequence length is a valid positive integer.
        // If not, log an error and exit to prevent further processing with invalid data.
        if (isNaN(currentSequenceLength) || currentSequenceLength < 0) {
            console.error("Error: Invalid sequence length encountered. Expected a non-negative integer.");
            break;
        }

        // Initialize an array to store the elements of the current sequence.
        // Using `const` for the array reference as it won't be reassigned.
        const sequenceElements = new Array(currentSequenceLength);
        // Initialize a sum variable, using a float to maintain precision for potential fractional values.
        let elementSum = 0.0;

        // Pre-check for sufficient data: Ensure that there are enough tokens remaining
        // in the input stream to fulfill the declared `currentSequenceLength`.
        if (tokenPointer + currentSequenceLength > numericTokens.length) {
            console.error(`Error: Insufficient data points for a sequence of length ${currentSequenceLength}. ` +
                          `Expected ${currentSequenceLength} more, but only ${numericTokens.length - tokenPointer} available.`);
            break; // Cannot process this sequence, so exit the main loop.
        }

        // Loop to read individual elements for the current sequence.
        for (let elementIndex = 0; elementIndex < currentSequenceLength; elementIndex++) {
            let value = numericTokens[tokenPointer];
            tokenPointer++; // Advance the pointer after consuming an element.

            // Validation: Check if the retrieved value is a valid number.
            // If a non-numeric value is found, it indicates malformed input.
            if (isNaN(value)) {
                console.warn(`Warning: Non-numeric value encountered in sequence. Skipping this sequence. Original token: ${tokenizedInput[tokenPointer - 1]}`);
                // A more robust solution might try to recover or skip, but for standard deviation,
                // non-numeric values make the calculation impossible for the current set.
                // We'll break from the inner loop, which will cause the outer loop to continue or break.
                // For this scenario, it's safer to break the entire processing.
                break;
            }
            sequenceElements[elementIndex] = value;
            elementSum += value;
        }

        // Calculate the arithmetic mean (average) for the current sequence.
        // This is an intermediate step explicitly introduced for clarity.
        const currentMean = elementSum / currentSequenceLength;
        // Initialize a variable to accumulate the sum of squared differences from the mean.
        let sumOfSquaredDifferences = 0.0;

        // Loop through the sequence elements again to calculate the variance.
        for (let elementIndex = 0; elementIndex < currentSequenceLength; elementIndex++) {
            // Calculate the difference of the current element from the mean.
            const differenceFromMean = sequenceElements[elementIndex] - currentMean;
            // Square this difference. Using multiplication is often slightly more performant
            // than Math.pow(x, 2) for squaring.
            const squaredDifference = differenceFromMean * differenceFromMean;
            // Add the squared difference to the running total.
            sumOfSquaredDifferences += squaredDifference;
        }

        // Defensive check: Although `currentSequenceLength === 0` is handled at the start,
        // this ensures no division by zero if logic somehow changes or input is very peculiar.
        if (currentSequenceLength <= 0) {
            console.log("Cannot compute standard deviation for an empty or invalid sequence.");
            continue; // Skip to the next sequence if this one is invalid for calculation.
        }

        // Calculate the population variance.
        const populationVariance = sumOfSquaredDifferences / currentSequenceLength;
        // Calculate the standard deviation by taking the square root of the variance.
        const standardDeviation = Math.sqrt(populationVariance);

        // Output the calculated standard deviation for the current sequence.
        console.log(standardDeviation);
    }
}

// Entry point: Read input from standard input and process it.
// A try-catch block is added for robust error handling during file system operations.
try {
    const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
    // Call the main analysis function with the content read from the file.
    analyzeNumericSequences(fileContent);
} catch (error) {
    // If an error occurs during file reading (e.g., file not found, permission issues),
    // log the error message and exit the process with a non-zero status code.
    console.error("Failed to read input from /dev/stdin:", error.message);
    process.exit(1);
}