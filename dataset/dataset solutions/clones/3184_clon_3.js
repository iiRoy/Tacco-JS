// This function serves as the primary entry point for processing input data.
// It takes a raw string, parses numerical values, and performs a calculation based on divisibility.
function processInputData(inputDataString) {
    // Define a constant for the string delimiter used to separate numerical values.
    const VALUE_DELIMITER = " ";
    let computedResult; // This variable will store the final outcome of the calculation.

    // --- Input Validation and Pre-processing ---

    // Ensure the input string is valid and not empty or just whitespace.
    if (typeof inputDataString !== 'string' || inputDataString.trim().length === 0) {
        console.error("Error: Input data is empty or not a valid string. Please provide numerical data.");
        return; // Terminate execution if input is invalid.
    }

    // Split the cleaned input string into an array of string segments.
    const stringSegments = inputDataString.trim().split(VALUE_DELIMITER);

    // Validate that at least two numerical values are provided for the operation.
    if (stringSegments.length < 2) {
        console.error("Error: Insufficient numerical values provided. Expected at least two numbers.");
        return;
    }

    // --- Helper for Robust Integer Parsing ---

    // Defines a utility function to safely parse a string segment into an integer.
    // It includes error handling for non-numeric inputs.
    const parseSegmentToInteger = (segmentValue) => {
        const parsedNumber = parseInt(segmentValue, 10);
        // Check if the parsing resulted in a valid number.
        if (isNaN(parsedNumber)) {
            throw new Error(`Invalid number format encountered: "${segmentValue}". All inputs must be integers.`);
        }
        return parsedNumber;
    };

    let numericOperands; // Array to hold the parsed integer values.
    try {
        // Convert all string segments into integers using the helper function.
        // This leverages the Array.prototype.map method for transformation.
        numericOperands = stringSegments.map(parseSegmentToInteger);
    } catch (parsingError) {
        console.error(`Data Parsing Error: ${parsingError.message}`);
        return; // Exit if any parsing failure occurs.
    }

    // --- Core Logic Execution ---

    // Extract the primary values for the calculation.
    const firstValue = numericOperands[0];
    const secondValue = numericOperands[1];

    // Defines a helper function to check if a dividend is perfectly divisible by a divisor.
    const isPerfectlyDivisible = (dividend, divisor) => {
        // Note: In JavaScript, X % 0 results in NaN. NaN === 0 is false.
        // This behavior aligns with the original code's implicit handling for divisor being 0.
        return dividend % divisor === 0;
    };

    // Determine the type of arithmetic operation based on the divisibility condition.
    if (isPerfectlyDivisible(secondValue, firstValue)) {
        // If the second value is evenly divisible by the first, perform addition.
        computedResult = secondValue + firstValue;
    } else {
        // Otherwise, if not perfectly divisible, perform subtraction.
        computedResult = secondValue - firstValue;
    }

    // --- Output Generation ---

    // Display the final calculated result to the console.
    console.log(computedResult);
}

// The following line is responsible for reading input from standard input
// and invoking the main processing function. This part is typically
// environment-specific and should not be modified for problem submissions.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));