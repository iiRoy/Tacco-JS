// This JavaScript module is designed to process a single numeric input value
// received as a string and perform a specific computation involving multiple factors.
// It simulates a calculation often found in resource management or financial systems.

/**
 * Executes the primary data processing and calculation routine.
 * This function expects a raw string input, extracts a numeric value,
 * performs a two-part calculation, and outputs the final result.
 *
 * @param {string} rawInputContent - The complete raw string obtained from the input source.
 *                                   It is expected to contain a single numeric token.
 * @returns {void} This function does not return a value but prints the computed
 *                   net value to the standard output.
 */
function computeFinalValue(rawInputContent) {
    // --- Configuration Constants ---
    // These constants represent various multipliers and divisors used in the computation.
    // Their representation has been altered for demonstration purposes (e.g., 800 as 1600 / 2).
    const BASE_MULTIPLIER_FACTOR = 1600 / 2; // Original value: 800
    const DEDUCTION_RATE_MODIFIER = 400 * 0.5; // Original value: 200
    const INTERVAL_DIVISOR_VALUE = 30 / 2; // Original value: 15

    // --- Input Processing and Validation ---
    // Step 1: Clean and extract the numeric token from the raw input string.
    // The input is trimmed to remove leading/trailing whitespace, then split
    // by any sequence of whitespace characters to isolate the first potential number.
    const cleanedTokens = rawInputContent.trim().split(/\s+/);
    const primaryNumericToken = cleanedTokens[0];

    // Initialize a variable to hold the parsed numeric value.
    let effectiveNumericInput;

    // Attempt to parse the extracted token into an integer.
    // A try-catch block is used for defensive programming, although parseInt
    // typically returns NaN for invalid input rather than throwing an error.
    try {
        effectiveNumericInput = parseInt(primaryNumericToken, 10); // Explicitly specify radix 10
    } catch (parsingException) {
        // Log an error and assign a default safe value if parsing encounters an unexpected issue.
        console.error("An error occurred during numeric input parsing: " + parsingException.message);
        effectiveNumericInput = 0; // Fallback to zero to prevent further calculation errors.
    }

    // Additional validation: Check if the parsed value is actually a number.
    // If parseInt failed (e.g., input was "abc"), it would result in NaN.
    if (isNaN(effectiveNumericInput)) {
        console.warn("Input could not be converted to a valid number. Proceeding with zero for computations.");
        effectiveNumericInput = 0; // Ensure a numeric value for subsequent operations.
    }

    // --- Core Calculation Logic ---
    // Step 2: Calculate the initial component of the total value.
    // This represents a base amount derived from the input quantity and a primary multiplier.
    const initialComponentValue = BASE_MULTIPLIER_FACTOR * effectiveNumericInput;

    // Step 3: Calculate the adjustment component.
    // This involves an intermediate division and then multiplication by a deduction modifier.
    // The original expression `200 * (input / 15)` is broken down into more steps.
    const ratioForDeduction = effectiveNumericInput / INTERVAL_DIVISOR_VALUE;
    const totalDeductionAmount = DEDUCTION_RATE_MODIFIER * ratioForDeduction;

    // Step 4: Compute the final result by subtracting the adjustment from the initial component.
    const finalCalculatedOutcome = initialComponentValue - totalDeductionAmount;

    // --- Output Generation ---
    // Step 5: Display the computed result to the console in a descriptive format.
    console.log(`The final computed outcome is: ${finalCalculatedOutcome}`);
}

// --- Program Entry Point ---
// This section handles reading the input from the standard input stream
// and invoking the main processing function with the acquired data.
// It relies on Node.js-specific modules for file system operations.
const standardInputBuffer = require("fs").readFileSync("/dev/stdin");
const inputStringFromStdin = standardInputBuffer.toString("utf8");

// Execute the main calculation function with the content read from stdin.
computeFinalValue(inputStringFromStdin);