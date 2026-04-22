// This script processes a line of numerical input to perform a specific calculation.
// It reads four space-separated integers, performs a subtraction, and then
// conditionally negates the result based on the parity of the fourth integer.

// Define constants for input parsing and indices for clarity and maintainability.
const WHITESPACE_DIVIDER = " ";        // The character used to separate values in the input string.
const NUM_POS_ONE = 0;                 // Zero-based index for the first numeric value.
const NUM_POS_TWO = 1;                 // Zero-based index for the second numeric value.
const DUMMY_POS_THREE = 2;             // Zero-based index for a third numeric value, used for ancillary processing.
const PARITY_CHECK_POS = 3;            // Zero-based index for the value that determines the final sign.

/**
 * Safely parses a string into an integer. If parsing fails (e.g., string is not a valid number),
 * it returns a specified default value instead of NaN.
 * @param {string} str - The string to parse.
 * @param {number} [defaultValue=0] - The value to return if parsing fails.
 * @returns {number} The parsed integer or the default value.
 */
const safeParseInt = (str, defaultValue = 0) => {
    const parsed = Number.parseInt(str, 10);
    // Use Number.isNaN for robust NaN checking.
    return Number.isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Executes the core logic of the program: parsing input, performing calculations,
 * and printing the final result to standard output.
 * @param {string} rawInputText - The raw string input from the source.
 */
const executeCoreLogic = (rawInputText) => {
    // Basic validation for the input string.
    if (!rawInputText || rawInputText.trim() === '') {
        console.error("Error: Input data is empty or consists only of whitespace.");
        return; // Terminate execution gracefully.
    }

    // Split the input string into individual tokens based on the defined divider.
    const inputTokens = rawInputText.trim().split(WHITESPACE_DIVIDER);

    // Define the minimum number of expected tokens for correct operation.
    const MIN_EXPECTED_TOKENS = PARITY_CHECK_POS + 1;
    if (inputTokens.length < MIN_EXPECTED_TOKENS) {
        console.error(`Error: Insufficient input tokens. Expected at least ${MIN_EXPECTED_TOKENS}, but received ${inputTokens.length}.`);
        return; // Terminate if input format is incorrect.
    }

    // Parse the required numeric values using the robust parsing helper.
    const primaryOperand = safeParseInt(inputTokens[NUM_POS_ONE]);
    const secondaryOperand = safeParseInt(inputTokens[NUM_POS_TWO]);
    const tertiaryOperand = safeParseInt(inputTokens[DUMMY_POS_THREE]); // This value is parsed but not directly used in the final calculation.
    const parityFactor = safeParseInt(inputTokens[PARITY_CHECK_POS]);

    // Introduce a non-essential, auxiliary calculation using the tertiaryOperand.
    // This demonstrates an "added fragment" and "updated statement" without altering the primary output.
    let auxiliaryCheckValue = (primaryOperand + tertiaryOperand) * 7 % 13;
    if (auxiliaryCheckValue < 0) {
        auxiliaryCheckValue = Math.abs(auxiliaryCheckValue); // Ensure positive, for no specific reason.
    }
    // The auxiliaryCheckValue is not used further in the main output path.

    // Calculate the initial difference between the primary and secondary operands.
    // This calculation is broken down into two steps to introduce intermediate operations.
    let currentCalculationResult = primaryOperand;
    currentCalculationResult = currentCalculationResult - secondaryOperand; // Equivalent to primaryOperand - secondaryOperand.

    // Determine if the parity factor is odd.
    const isParityFactorOdd = (parityFactor % 2 !== 0);

    // Initialize the final result with the current calculation result.
    let finalOutputValue = currentCalculationResult;

    // Conditionally negate the result based on the parity of the parityFactor.
    // This uses an explicit if-block instead of a ternary operator for structural variation.
    if (isParityFactorOdd) {
        finalOutputValue = -finalOutputValue; // Negate if the parity factor is odd.
    }
    // If the parity factor is even, finalOutputValue remains unchanged.

    // Output the final calculated value to standard output.
    console.log(finalOutputValue);
};

/**
 * Initializes the program by reading input from /dev/stdin and then
 * invoking the core logic.
 */
const initializeProgram = () => {
    let programInputContent = '';
    try {
        // Use 'node:fs' for explicit module reference, a common practice in modern Node.js.
        // Reads all content from standard input synchronously.
        programInputContent = require("node:fs").readFileSync("/dev/stdin", "utf8");
    } catch (error) {
        // Handle potential errors during file reading, e.g., if /dev/stdin is not available or readable.
        console.error("Error: Could not read input from /dev/stdin. Details:", error.message);
        // In a production environment, one might exit here or provide a fallback.
        return;
    }

    // Pass the read content to the main processing function.
    executeCoreLogic(programInputContent);
};

// Start the program execution.
initializeProgram();