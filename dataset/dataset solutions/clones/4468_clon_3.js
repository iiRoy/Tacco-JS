"use strict"; // Enforcing stricter parsing and error handling in code.

// Helper function to calculate the Greatest Common Divisor (GCD) of two numbers iteratively.
// This implements the Euclidean algorithm without recursion.
const determineGreatestCommonDivisor = (firstOperand, secondOperand) => {
    // Ensure operands are non-negative for standard GCD definition.
    // Although JavaScript's modulo operator handles negative numbers differently,
    // the Euclidean algorithm typically uses positive integers.
    let currentA = Math.abs(firstOperand);
    let currentB = Math.abs(secondOperand);

    // Loop until one of the numbers becomes zero.
    // The GCD is the non-zero number at the end.
    while (currentA !== 0) {
        // Store the current value of currentA temporarily.
        const temporaryRemainder = currentA;
        // Update currentA to be the remainder of currentB divided by currentA.
        currentA = currentB % currentA;
        // Update currentB to be the value previously held by currentA.
        currentB = temporaryRemainder;
    }
    // When currentA is 0, currentB holds the GCD.
    return currentB;
};

// Function to compute the GCD for an entire list of numeric values.
// It leverages the 'determineGreatestCommonDivisor' helper.
const computeOverallDivisor = (inputNumericList) => {
    // Perform initial validation on the input list.
    if (!Array.isArray(inputNumericList) || inputNumericList.length === 0) {
        // For an empty or invalid list, a common divisor cannot be meaningfully determined.
        // Returning 0 or 1, or throwing an error, depends on specific requirements.
        // For this problem context, input is expected to be non-empty.
        // A single element's GCD with itself is the element itself.
        if (inputNumericList && inputNumericList.length === 1) {
            return Math.abs(inputNumericList[0]);
        }
        console.error("Warning: Attempted to compute GCD for an empty or invalid list.");
        return 0; // Defaulting to 0 for safety in unexpected scenarios.
    }

    // Utilize the 'reduce' method to apply the GCD operation cumulatively across the array.
    // The accumulator starts with the first element, and then each subsequent element
    // is processed with the current accumulated GCD.
    const finalCalculatedGcd = inputNumericList.reduce((accumulatorValue, currentValue) => {
        // Apply the iterative GCD function to find the GCD of the accumulated value
        // and the current array element.
        return determineGreatestCommonDivisor(accumulatorValue, currentValue);
    });

    return finalCalculatedGcd;
};

// Helper function to standardize output messages.
const displayResult = (isOutcomePossible) => {
    if (isOutcomePossible) {
        console.log("POSSIBLE");
    } else {
        console.log("IMPOSSIBLE");
    }
};

// Main function to process the input, perform calculations, and determine the final outcome.
const processInputAndDetermineOutcome = (rawInputString) => {
    // Initial validation for the raw input string.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        displayResult(false); // Input is empty or not a string.
        return;
    }

    try {
        // Step 1: Prepare the input data.
        // Remove leading/trailing whitespace and split the string into individual lines.
        const inputLines = rawInputString.trim().split("\n");

        // Validate that we have at least two lines of input as expected.
        if (inputLines.length < 2) {
            displayResult(false); // Insufficient number of input lines.
            return;
        }

        // Step 2: Parse parameters from the first line.
        // Split the first line by spaces. The first number (N) is not used, so we discard it.
        // We are interested in the second number, K.
        const firstLineParts = inputLines[0].split(" ");
        if (firstLineParts.length < 2) {
            displayResult(false); // First line is malformed.
            return;
        }

        // Parse the target value K (requiredDivisor).
        const targetValueK = parseInt(firstLineParts[1].trim(), 10); // Use radix 10 for safety.
        // Validate K: must be a positive integer.
        if (isNaN(targetValueK) || targetValueK <= 0) {
            displayResult(false); // K is not a valid positive integer.
            return;
        }

        // Step 3: Parse the numeric array from the second line.
        // Split the second line by spaces, then filter out any empty strings
        // that might result from multiple consecutive spaces.
        const stringNumbersForArray = inputLines[1].split(" ").filter(segment => segment.length > 0);
        // Map the string representations to actual integer numbers.
        const parsedNumericCollection = stringNumbersForArray.map(numStr => parseInt(numStr.trim(), 10));

        // Validate the parsed numeric collection.
        if (parsedNumericCollection.some(isNaN) || parsedNumericCollection.length === 0) {
            displayResult(false); // The list contains non-numeric values or is empty.
            return;
        }

        // Step 4: Sort the collection and find the maximum value.
        // Sort the array in descending order to easily access the maximum element at index 0.
        const descendingSortedCollection = parsedNumericCollection.sort((valueA, valueB) => {
            // For descending order, if valueB is greater, it comes first.
            return valueB - valueA;
        });

        // The maximum value in the list is the first element after descending sort.
        const maximumObservedValue = descendingSortedCollection[0];

        // Step 5: Calculate the overall GCD of the entire numeric collection.
        const calculatedOverallGcd = computeOverallDivisor(descendingSortedCollection);

        // Step 6: Apply problem-specific conditions to determine possibility.

        // Condition 1: The target value K must not exceed the maximum element in the list.
        // If K is larger than any number in the list, it's impossible to reach it.
        if (maximumObservedValue < targetValueK) {
            displayResult(false);
            return; // Exit early as it's impossible.
        }

        // Condition 2: The target value K must be perfectly divisible by the overall GCD of the list.
        // If K is not a multiple of the GCD, it's impossible to reach K.
        const isTargetValueAchievable = (targetValueK % calculatedOverallGcd === 0);
        displayResult(isTargetValueAchievable);

    } catch (processingError) {
        // Catch and report any unexpected errors during the input processing.
        console.error("An unhandled error occurred during execution:", processingError.message);
        displayResult(false); // Indicate failure due to an internal error.
    }
};

// Entry point for script execution.
// This part reads input from standard input (e.g., via a pipe or redirected file).
// Using a more descriptive variable for the file system module.
const fileSystemModule = require('fs');
const collectedInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Invoke the primary processing function with the input data.
processInputAndDetermineOutcome(collectedInputData);