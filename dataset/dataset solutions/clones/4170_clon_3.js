const fileProcessor = require('fs'); // Import the file system utility module for input operations.

/**
 * A utility function to determine the count of factors of 2 in a positive integer.
 * This is equivalent to finding how many times a number can be consecutively divided by 2
 * before it becomes an odd number.
 *
 * @param {number} numericalValue - The integer value to analyze.
 * @returns {number} The count of times the number can be divided by 2, or a sentinel value
 *                   (e.g., 101) if the input is invalid or cannot be processed as a positive integer.
 */
function determineTwoFactorCount(numericalValue) {
    // Robust input validation: Ensure the input is a valid, positive integer.
    // If the input is not a number, not an integer, or is zero/negative,
    // it cannot be meaningfully processed in this context (e.g., 0 would cause an infinite loop).
    // We return a sentinel value (101) which is greater than the original problem's implied maximum of 100,
    // ensuring it won't be chosen as the minimum unless all inputs are invalid.
    if (typeof numericalValue !== 'number' || !Number.isInteger(numericalValue) || numericalValue <= 0) {
        return 101; // Sentinel value indicating an unprocessable input.
    }

    let temporaryNumber = numericalValue;
    let currentFactorCount = 0;

    // Utilize bitwise operations for efficiency and as a structural change.
    // (temporaryNumber & 1) === 0 checks if the least significant bit is 0, which means the number is even.
    while ((temporaryNumber & 1) === 0) {
        temporaryNumber >>= 1; // Bitwise right shift is equivalent to integer division by 2.
        currentFactorCount++; // Increment the counter for each successful division by 2.
    }
    return currentFactorCount;
}

/**
 * The main processing routine that handles the input data for the challenge.
 * It parses the input, calculates the minimum number of times any element in a sequence
 * can be divided by 2, and then prints the result.
 *
 * @param {string} rawDataContent - The raw string content read from the input source.
 */
function processInputData(rawDataContent) {
    // Initial validation: Check if the input data is present and correctly formatted as a string.
    if (!rawDataContent || typeof rawDataContent !== 'string' || rawDataContent.trim() === '') {
        console.error("Error: Input data is empty or invalid. Please provide valid string input.");
        return; // Terminate execution if input is unusable.
    }

    // Split the entire input content into individual lines, removing leading/trailing whitespace.
    const linesOfInput = rawDataContent.trim().split('\n');

    // Ensure there are at least two lines for the problem (count and then the numbers).
    if (linesOfInput.length < 2) {
        console.error("Error: Insufficient input lines provided. Expected at least two lines: element count and number sequence.");
        return;
    }

    // Parse the total count of elements from the first line.
    // Use radix 10 explicitly for parseInt for best practice.
    const totalElementsCount = parseInt(linesOfInput[0].trim(), 10);

    // Validate the parsed element count. It must be a positive integer.
    if (isNaN(totalElementsCount) || totalElementsCount <= 0) {
        console.error("Error: Invalid or non-positive element count detected in the first line.");
        return;
    }

    // Process the sequence of numbers from the second line.
    // Split by space and then remove any empty strings that might result from extra spaces.
    const numericSequenceStrings = linesOfInput[1].trim().split(' ').filter(s => s !== '');

    // Add a warning if the actual number of elements found doesn't match the declared count.
    // This is a Type III addition for robustness, as the original code would just proceed.
    if (numericSequenceStrings.length !== totalElementsCount) {
        console.warn(`Warning: Declared ${totalElementsCount} elements, but found ${numericSequenceStrings.length} in the sequence. Proceeding with available elements.`);
    }

    // Convert the array of string representations of numbers into an array of actual numbers.
    // Filter out any entries that failed to parse into a valid number (NaN).
    const integerArray = numericSequenceStrings
        .map(str => parseInt(str, 10))
        .filter(num => !isNaN(num));

    // If, after parsing and filtering, the array of numbers is empty, there's nothing to process.
    if (integerArray.length === 0) {
        console.log(0); // In this scenario, 0 divisions is the only logical outcome.
        return;
    }

    // Initialize the minimum count of divisions by 2.
    // Using Infinity ensures that the first valid `currentNumberTwoFactors` will correctly set the minimum.
    let minimumTwoDivisions = Infinity;

    // Iterate through each number in the processed array to find the minimum two-factor count.
    for (let currentIdx = 0; currentIdx < integerArray.length; currentIdx++) {
        const currentNumber = integerArray[currentIdx];
        // Call the helper function to calculate factors of 2 for the current number.
        const currentNumberTwoFactors = determineTwoFactorCount(currentNumber);

        // Update the overall minimum if the current number has fewer factors of 2.
        if (currentNumberTwoFactors < minimumTwoDivisions) {
            minimumTwoDivisions = currentNumberTwoFactors;
        }
    }

    // Output the final minimum count of divisions by 2.
    // If `minimumTwoDivisions` is still `Infinity`, it implies all numbers were invalid or zero (handled by 101).
    // In such a case, output 0 as a sensible default for no valid operations.
    if (minimumTwoDivisions === Infinity || minimumTwoDivisions === 101) {
        console.log(0);
    } else {
        console.log(minimumTwoDivisions);
    }
}

// Declare a global variable to store the content read from standard input.
let programInputContent = '';

// Attempt to read the program's input from the standard input stream (/dev/stdin).
// A try-catch block is added for robust error handling during file system operations (Type III addition).
try {
    programInputContent = fileProcessor.readFileSync('/dev/stdin', 'utf8');
} catch (error) {
    console.error(`Fatal Error: Could not read input from /dev/stdin. Please ensure the input file exists and is accessible. Details: ${error.message}`);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
}

// Execute the main data processing function with the content obtained from the input.
processInputData(programInputContent);