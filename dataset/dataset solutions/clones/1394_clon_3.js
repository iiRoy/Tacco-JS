// This JavaScript module processes numerical input from standard input (stdin)
// to perform basic arithmetic operations: integer division, remainder, and precise
// floating-point division. It's designed to read a single line containing two
// space-separated numbers.

// Define a constant for the desired precision level for the floating-point result.
// This makes the precision configurable and improves readability compared to a magic number.
const FLOATING_POINT_PRECISION = 8; // Represents the number of decimal places.

/**
 * Handles incoming data chunks from the standard input stream.
 * It expects a string containing two space-separated numbers.
 *
 * @param {Buffer} receivedDataBuffer - The raw data buffer received from stdin.
 */
const handleInputStreamData = function(receivedDataBuffer) {
    // Convert the raw Buffer object to a UTF-8 encoded string.
    // This is a more explicit and robust conversion than simple string concatenation.
    const rawInputString = receivedDataBuffer.toString('utf8');

    // Pre-process the input string:
    // 1. Trim leading/trailing whitespace.
    // 2. Split the string by one or more whitespace characters (regex /\s+/).
    // 3. Filter out any empty strings that might result from multiple spaces or just whitespace.
    const processedTokens = rawInputString.trim().split(/\s+/).filter(Boolean);

    // --- Input Validation: Ensure correct format ---
    // A Type III addition: Guard clause to check for the expected number of inputs.
    if (processedTokens.length !== 2) {
        console.error("INPUT_ERROR: Please provide exactly two numeric values separated by space. Received " + processedTokens.length + " tokens.");
        return; // Exit the handler for invalid input.
    }

    // Parse the extracted tokens into numerical values.
    // Using `Number.parseFloat` for explicit conversion, allowing for decimal inputs.
    // Variable names are changed for clarity (Type II).
    const primaryOperand = Number.parseFloat(processedTokens[0]);
    const secondaryOperand = Number.parseFloat(processedTokens[1]);

    // --- Input Validation: Ensure parsed values are numbers ---
    // A Type III addition: Guard clause for non-numeric inputs.
    if (Number.isNaN(primaryOperand) || Number.isNaN(secondaryOperand)) {
        console.error(`INPUT_ERROR: Could not parse valid numbers from inputs: '${processedTokens[0]}' and '${processedTokens[1]}'.`);
        return; // Exit if parsing fails.
    }

    // --- Arithmetic Operation Validation: Prevent division by zero ---
    // A Type III addition: Guard clause for a common arithmetic error.
    if (secondaryOperand === 0) {
        console.error("ARITHMETIC_ERROR: Division by zero is undefined. The divisor cannot be zero.");
        return; // Exit if attempting division by zero.
    }

    // Perform the arithmetic calculations:
    // 1. Integer Division: Using `Math.trunc()` which truncates towards zero,
    //    directly equivalent to the `|0` bitwise operation for non-negative numbers
    //    and generally a clearer intent for integer division. (Type II/III change)
    const integerResult = Math.trunc(primaryOperand / secondaryOperand);

    // 2. Modulo Remainder: Standard JavaScript modulo operator.
    const remainderResult = primaryOperand % secondaryOperand;

    // 3. Precise Floating-Point Division:
    //    Calculate the division, then format to the specified decimal places using `toFixed()`,
    //    and finally convert the resulting string back to a number using `Number.parseFloat()`.
    //    This is an explicit way to achieve `+(...).toFixed(N)`. (Type II/III change)
    const preciseDecimalResult = Number.parseFloat((primaryOperand / secondaryOperand).toFixed(FLOATING_POINT_PRECISION));

    // --- Output Generation ---
    // A Type III addition: Store results in a structured object for potential future expansion
    // or easier debugging/logging.
    const operationOutputs = {
        integerQuotient: integerResult,
        remainder: remainderResult,
        decimalQuotient: preciseDecimalResult
    };

    // Output the calculated results to the console.
    // The output format is changed for enhanced readability and clarity. (Type II/III change)
    console.log(
        `Operation Results => Integer: ${operationOutputs.integerQuotient} | Remainder: ${operationOutputs.remainder} | Decimal: ${operationOutputs.decimalQuotient}`
    );
};

// Register the `handleInputStreamData` function as an event listener for the 'data' event
// on the standard input stream.
// `global.process.stdin` explicitly references the global process object. (Type II change)
global.process.stdin.on("data", handleInputStreamData);

// Ensure the standard input stream is explicitly resumed to begin emitting 'data' events.
// This is crucial for reading input in non-interactive Node.js scripts. (Type II change)
global.process.stdin.resume();

// End of script.
// Further comments could be added here to explain usage or potential enhancements.