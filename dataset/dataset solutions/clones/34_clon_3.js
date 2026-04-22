const DIGIT_LOWER_BOUND = 0; // Defines the smallest possible value for a single digit
const DIGIT_UPPER_BOUND = 9; // Defines the largest possible value for a single digit

// Activates the standard input stream to begin receiving data.
process.stdin.resume();

// Configures the standard input stream to decode incoming bytes as UTF-8 characters.
process.stdin.setEncoding('utf8');

// Attaches an event listener to the 'data' event of the standard input stream.
// This function will be executed whenever a chunk of data is received.
process.stdin.on("data", (incomingRawData) => {
    // Process the raw input data:
    // 1. Convert the data chunk to a string.
    // 2. Remove any leading/trailing whitespace (e.g., extra newlines).
    // 3. Split the string into an array of individual lines based on newline characters.
    // 4. Filter out any empty string entries that might result from extra newlines.
    // 5. Convert each valid string entry into a numerical target value.
    const numericTargetValues = incomingRawData
        .toString()
        .trim()
        .split('\n')
        .filter(lineContent => lineContent.length > 0) // Exclude empty lines
        .map(stringRepresentation => Number(stringRepresentation)); // Convert to number type

    // Iterate through each numerical target value extracted from the input.
    for (let currentTargetIndex = 0; currentTargetIndex < numericTargetValues.length; currentTargetIndex++) {
        let currentTargetSum = numericTargetValues[currentTargetIndex];

        // --- Input Validation and Guard Clause ---
        // Check if the current target sum is a valid number and falls within the possible range.
        // The minimum possible sum of four digits (0-0-0-0) is 0.
        // The maximum possible sum of four digits (9-9-9-9) is 36.
        if (isNaN(currentTargetSum) || currentTargetSum < 0 || currentTargetSum > DIGIT_UPPER_BOUND * 4) {
            console.error(`Warning: Skipping invalid target sum '${numericTargetValues[currentTargetIndex]}' at input position ${currentTargetIndex}.`);
            continue; // Skip this invalid entry and proceed to the next one.
        }

        let totalValidCombinations = 0; // Initialize a counter for combinations for the current target sum.

        // --- Core Logic: Nested Loops for Combination Counting ---
        // These four nested loops systematically iterate through all possible combinations
        // of four single-digit numbers (from DIGIT_LOWER_BOUND to DIGIT_UPPER_BOUND).

        // Loop for the first digit (A)
        for (let digitA = DIGIT_LOWER_BOUND; digitA <= DIGIT_UPPER_BOUND; digitA++) {
            // Loop for the second digit (B)
            for (let digitB = DIGIT_LOWER_BOUND; digitB <= DIGIT_UPPER_BOUND; digitB++) {
                // Loop for the third digit (C)
                for (let digitC = DIGIT_LOWER_BOUND; digitC <= DIGIT_UPPER_BOUND; digitC++) {
                    // Loop for the fourth digit (D)
                    for (let digitD = DIGIT_LOWER_BOUND; digitD <= DIGIT_UPPER_BOUND; digitD++) {
                        // Check if the sum of the four current digits equals the target sum.
                        if (digitA + digitB + digitC + digitD === currentTargetSum) {
                            totalValidCombinations++; // Increment the counter if a match is found.
                        }
                    }
                }
            }
        }
        // After checking all combinations for the current target sum,
        // print the total number of matching combinations to standard output.
        console.log(totalValidCombinations);
    }
});