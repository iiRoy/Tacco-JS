const convertStringToNumeric = (stringVal) => {
    // Utilize the unary plus operator for type coercion to number.
    // This method is concise and handles various numeric string formats,
    // converting them to a number or NaN if not a valid number.
    return +stringVal;
};

// The core algorithm's entry point, handling input processing and calculation.
// This function takes raw input text, parses it, performs calculations,
// and outputs the final result.
function executeCalculationRoutine(rawInputText) {
    // Standardize input: ensure it's a string, remove leading/trailing whitespace,
    // and split into individual components using any sequence of whitespace as a delimiter.
    const inputComponents = String(rawInputText).trim().split(/\s+/);

    // Initial validation: Confirm that the expected number of components (N, M, D) are present.
    // If not, log an error and terminate the execution for this input.
    const EXPECTED_COMPONENT_COUNT = 3;
    if (inputComponents.length < EXPECTED_COMPONENT_COUNT) {
        console.error("Error: Insufficient input components. Expected 3 numeric values (N, M, D).");
        return; // Halt execution due to invalid input structure.
    }

    // Parse the input components into their respective numerical variables.
    // N: Represents the primary total quantity.
    const primaryQuantityN = convertStringToNumeric(inputComponents[0]);
    // M: Represents a secondary group or sub-quantity.
    const secondaryQuantityM = convertStringToNumeric(inputComponents[1]);
    // D: Represents a specific threshold or difference value.
    const thresholdValueD = convertStringToNumeric(inputComponents[2]);

    // Robustness check: Ensure all parsed components are valid numbers.
    // If any conversion resulted in NaN (Not-a-Number), it indicates bad input.
    if (isNaN(primaryQuantityN) || isNaN(secondaryQuantityM) || isNaN(thresholdValueD)) {
        console.error("Error: One or more input components are not valid numbers.");
        return; // Halt execution due to invalid numeric input.
    }

    // Critical guard: Prevent division by zero.
    // If 'primaryQuantityN' is zero, the calculation involving N*N in the denominator
    // would lead to an invalid mathematical operation (infinity or NaN).
    if (primaryQuantityN === 0) {
        console.error("Error: The primary quantity (N) cannot be zero for this calculation.");
        console.log(0); // Output a sensible default or error-specific value.
        return;
    }

    // Deconstruct the main calculation into more readable intermediate steps.
    // Step 1: Calculate the effective numerator component (N - D).
    const effectiveNumerator = primaryQuantityN - thresholdValueD;

    // Step 2: Calculate the denominator's squared term (N * N).
    const squaredDenominator = primaryQuantityN * primaryQuantityN;

    // Step 3: Calculate the multiplier from the secondary quantity (M - 1).
    const groupModifier = secondaryQuantityM - 1;

    // Combine the intermediate results to get the base probability.
    let computedResult = (effectiveNumerator * groupModifier) / squaredDenominator;

    // Define a constant for the conditional multiplication factor.
    const CONDITIONAL_FACTOR = 2;

    // Apply a conditional adjustment to the computed result.
    // If the 'thresholdValueD' is not zero, double the 'computedResult'.
    if (thresholdValueD !== 0) {
        computedResult *= CONDITIONAL_FACTOR;
    }

    // Output the final calculated value to the standard console.
    console.log(computedResult);
}

// This block acts as the script's entry point when executed in a Node.js environment.
// It reads input from the standard input stream, which is common in competitive programming.
try {
    const fileSystem = require("fs"); // Import Node.js File System module.
    const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8"); // Read input synchronously.
    executeCalculationRoutine(standardInputContent); // Pass the read content to the main processing function.
} catch (ioError) {
    // Catch and report any errors that occur during file reading (e.g., file not found, permissions).
    console.error("An error occurred while attempting to read from /dev/stdin:", ioError.message);
    // Optionally, provide a fallback or exit the process with an error code.
}

// Note: Several utility functions from the original source (e.g., for array conversion,
// absolute value, min, max) were removed as they were not utilized by the main logic.
// This deletion is a valid Type III clone modification, reducing code clutter.