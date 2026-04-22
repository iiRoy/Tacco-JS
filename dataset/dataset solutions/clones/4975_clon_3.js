/**
 * Calculates the total sum of all possible numerical interpretations of a digit string.
 * This involves considering every combination of placing addition operators or concatenating digits
 * between the original digits.
 *
 * For instance, if the input is "123":
 * - "1" + "2" + "3" yields 1 + 2 + 3 = 6
 * - "1" + "23" yields 1 + 23 = 24
 * - "12" + "3" yields 12 + 3 = 15
 * The final result is the sum of these possibilities: 6 + 24 + 15 = 45.
 *
 * @param {string} rawInput A string that is expected to contain only digits.
 * @returns {void} This function prints the computed final sum to the standard output.
 */
function computeSegmentedSum(rawInput) {
    // Validate the input to ensure it's a non-empty string.
    if (typeof rawInput !== 'string' || rawInput.length === 0) {
        console.error("Error: Input must be a non-empty string for processing.");
        return; // Exit early if input is invalid.
    }

    // Process the input string: remove leading/trailing whitespace and split into individual characters.
    const digitCharacters = rawInput.trim().split('');
    const numberOfDigits = digitCharacters.length;

    // Handle edge cases for very short inputs explicitly.
    if (numberOfDigits === 0) {
        console.log(0); // An empty string or string with only whitespace results in 0.
        return;
    }
    if (numberOfDigits === 1) {
        // If there's only one digit, there's only one possible sum, which is that digit itself.
        console.log(Number(digitCharacters[0]));
        return;
    }

    let finalAccumulatedResult = 0; // Initialize the variable to store the cumulative sum of all combinations.

    // The core logic uses bit manipulation to generate all possible ways to split the number.
    // There are (numberOfDigits - 1) potential places where an operator (addition or concatenation) can be placed.
    // Each place can either be a '+' or a concatenation, leading to 2^(numberOfDigits - 1) combinations.
    const totalCombinationPatterns = 1 << (numberOfDigits - 1);

    // Iterate through each unique pattern representing a combination of additions and concatenations.
    for (let patternIterator = 0; patternIterator < totalCombinationPatterns; patternIterator++) {
        let currentNumberSegments = []; // This array will hold the numeric string parts for the current pattern.
        let temporarySegmentBuilder = digitCharacters[0]; // Start building the first segment with the first digit.

        // Iterate through the potential split points, which are between consecutive digits.
        for (let splitIndex = 0; splitIndex < numberOfDigits - 1; splitIndex++) {
            const nextCharacter = digitCharacters[splitIndex + 1]; // Get the digit immediately after the current split point.

            // Check the 'splitIndex'-th bit of the 'patternIterator'.
            // If the bit is set (1), it signifies an addition operator at this position.
            // If the bit is not set (0), it signifies concatenation.
            if ((patternIterator >> splitIndex) & 1) { // Using right-shift and bitwise AND for bit checking.
                currentNumberSegments.push(temporarySegmentBuilder); // The current segment is complete, add it to the list.
                temporarySegmentBuilder = nextCharacter; // Start a new segment with the next digit.
            } else {
                temporarySegmentBuilder += nextCharacter; // Concatenate the next digit to the current segment.
            }
        }
        // After the loop, the very last segment built by temporarySegmentBuilder needs to be added.
        currentNumberSegments.push(temporarySegmentBuilder);

        // Calculate the sum for the current combination of segments.
        // The reduce method is used to sum up the numerical values of the string segments.
        const sumOfCurrentCombination = currentNumberSegments.reduce((accumulator, segmentString) => {
            // Convert each segment string to a number using the global Number() function.
            return accumulator + Number(segmentString);
        }, 0); // The initial value for the accumulator is set to 0.

        // Add the sum of the current combination to the grand total.
        finalAccumulatedResult += sumOfCurrentCombination;
    }

    // Output the final computed result.
    console.log(finalAccumulatedResult);
}

/**
 * Handles the retrieval of input data and then initiates the sum computation.
 * This function encapsulates input reading logic, making the main computation function cleaner.
 */
function retrieveInputAndExecute() {
    let acquiredInputData = '';
    try {
        // Attempt to read input from standard input, typical for competitive programming environments.
        acquiredInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    } catch (fileReadError) {
        // If reading from /dev/stdin fails (e.g., during local testing or different environment),
        // log an error and provide a default test input to allow the program to run.
        console.error("Failed to read input from /dev/stdin:", fileReadError.message);
        acquiredInputData = "987"; // Default input for local testing/fallback.
        console.warn(`Proceeding with a default test input: "${acquiredInputData}"`);
    }

    // Call the main computation function with the acquired input.
    computeSegmentedSum(acquiredInputData);
}

// Execute the input retrieval and processing pipeline.
retrieveInputAndExecute();