// This module encapsulates the logic for processing numerical input and deriving a specific computed value.

const performCalculation = (sourceDataString) => {
    // --- Input Validation and Parsing ---
    // Ensure the input string is valid and not empty.
    if (typeof sourceDataString !== 'string' || sourceDataString.trim().length === 0) {
        console.error("Error: Received invalid or empty input data. Cannot proceed with computation.");
        return; // Exit if input is bad
    }

    // Split the entire input content into individual lines.
    const allInputLines = sourceDataString.trim().split("\n");

    // We expect at least one line containing the primary parameters.
    if (allInputLines.length === 0) {
        console.error("Error: No data lines found in the provided input. Aborting calculation.");
        return;
    }

    // Extract the tokens from the very first line of input.
    const initialParameterTokens = allInputLines[0].split(" ");

    // Parse the numerical parameters. Using unary plus for concise type conversion.
    // 'N' from the original code is now 'mainCardinalValue'.
    const mainCardinalValue = +initialParameterTokens[0];
    // 'K' from the original code is now 'moduloDivisor'.
    const moduloDivisor = +initialParameterTokens[1];

    // Validate that the parsed values are indeed numbers.
    if (isNaN(mainCardinalValue) || isNaN(moduloDivisor)) {
        console.error("Error: Input parameters could not be parsed as valid numbers. Check input format.");
        return;
    }
    // Guard against division by zero, which would lead to undefined behavior or errors.
    if (moduloDivisor === 0) {
        console.error("Error: The modulo divisor cannot be zero. Calculation is impossible.");
        return;
    }

    // --- Core Calculation Logic ---
    /**
     * @description A utility function to compute the cube of a given number.
     * @param {number} baseVal - The number to be cubed.
     * @returns {number} The cube of the input number.
     */
    const computeValueCubed = (baseVal) => {
        // Using the exponentiation operator for clarity and conciseness.
        return baseVal ** 3;
    };

    // Initialize a variable to accumulate the final result.
    let cumulativeResult = 0;

    // Calculate the first component based on integer division (floor).
    // This part is always included in the final sum.
    const firstIntegerQuotient = Math.floor(mainCardinalValue / moduloDivisor);
    cumulativeResult += computeValueCubed(firstIntegerQuotient);

    // Determine if the 'moduloDivisor' is an even number.
    // Using a bitwise AND operation (equivalent to modulo 2 check) for parity.
    const isDivisorEven = (moduloDivisor & 1) === 0;

    // --- Conditional Second Component Calculation ---
    if (isDivisorEven) {
        // If the divisor is even, a second term needs to be added.
        // Introduce an intermediate variable for half of the divisor.
        const halfTheDivisor = moduloDivisor / 2;

        // Construct the adjusted numerator for the second floor division.
        const adjustedNumeratorForSecondTerm = mainCardinalValue + halfTheDivisor;

        // Calculate the second integer quotient.
        const secondIntegerQuotient = Math.floor(adjustedNumeratorForSecondTerm / moduloDivisor);

        // Add the cube of this second quotient to the cumulative result.
        cumulativeResult += computeValueCubed(secondIntegerQuotient);
    }
    // If 'moduloDivisor' is odd, no additional term is added, and 'cumulativeResult' remains as is.

    // --- Output Final Result ---
    console.log(cumulativeResult);
};

// --- Execution Entry Point ---
// Read data from standard input asynchronously and then trigger the calculation.
try {
    const inputContentFromFile = require("fs").readFileSync("/dev/stdin", "utf8");
    performCalculation(inputContentFromFile);
} catch (fileReadError) {
    // Handle potential errors during file reading (e.g., file not found, permission issues).
    console.error("An error occurred while attempting to read from /dev/stdin:", fileReadError.message);
    // Optionally, exit the process with an error code.
    process.exit(1);
}