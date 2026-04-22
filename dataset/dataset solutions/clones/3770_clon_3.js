// This function processes raw string input, interpreting it as an integer,
// and then calculates a breakdown of that integer into a specific set of denominations.
// The goal is to determine the minimum number of pieces using a particular greedy strategy.
function calculateDenominationBreakdown(inputStringData) {
    // A counter to keep track of the total number of denomination pieces utilized.
    let totalDenominationPieces = 0;

    // First, validate and convert the input string into a numerical value.
    // Ensure the parsed value is a valid non-negative integer.
    const initialNumericValue = Number.parseInt(inputStringData, 10);

    if (Number.isNaN(initialNumericValue) || initialNumericValue < 0) {
        // In case of invalid input, log an error and exit gracefully or with a default.
        console.error("Input processing error: Expected a non-negative integer.");
        return 0; // Returning 0 or throwing an error are both valid handling strategies.
    }

    // This variable will hold the value that still needs to be accounted for.
    let currentRemainingAmount = initialNumericValue;

    // The original code had an outer `while (true)` loop which immediately broke.
    // This structure was redundant, so its contents are directly placed here for efficiency and clarity.

    // Section 1: Prioritize the largest possible power of nine.
    // We iterate to find the single largest power of 9 that fits into the current remaining amount.
    let nineBasePower = 9;
    let highestNinePiece = 0; // Stores the largest power of 9 found so far.

    // Loop to progressively find powers of 9 (9, 81, 729, etc.).
    while (nineBasePower <= currentRemainingAmount) {
        highestNinePiece = nineBasePower; // This power of 9 fits.
        // Check for potential overflow before multiplying to prevent infinite loops or incorrect values
        if (nineBasePower > Number.MAX_SAFE_INTEGER / 9) {
            break; // Stop if the next power would exceed safe integer limits.
        }
        nineBasePower *= 9; // Move to the next higher power of 9.
    }

    // If a power of 9 was found and is greater than zero, apply it.
    if (highestNinePiece > 0) {
        currentRemainingAmount -= highestNinePiece; // Subtract the largest 9-denomination.
        totalDenominationPieces++;                 // Count it as one piece.
    }

    // Section 2: Next, prioritize the largest possible power of six.
    // Similar to powers of nine, find the single largest power of 6 that fits into the *updated* remaining amount.
    let sixBasePower = 6;
    let highestSixPiece = 0; // Stores the largest power of 6 found so far.

    // Loop to progressively find powers of 6 (6, 36, 216, etc.).
    while (sixBasePower <= currentRemainingAmount) {
        highestSixPiece = sixBasePower; // This power of 6 fits.
        // Check for potential overflow before multiplying.
        if (sixBasePower > Number.MAX_SAFE_INTEGER / 6) {
            break; // Stop if the next power would exceed safe integer limits.
        }
        sixBasePower *= 6; // Move to the next higher power of 6.
    }

    // If a power of 6 was found and is greater than zero, apply it.
    if (highestSixPiece > 0) {
        currentRemainingAmount -= highestSixPiece; // Subtract the largest 6-denomination.
        totalDenominationPieces++;                 // Count it as one piece.
    }

    // Section 3: Account for the remaining value using '1' denominations.
    // Any amount still left after applying the largest 9 and 6 denominations
    // must be covered by individual units (denomination of 1).
    totalDenominationPieces += currentRemainingAmount;

    // Output the final calculated count to the console.
    console.log(totalDenominationPieces);

    // Although the original code only logged, returning the result can be useful for testing or chaining.
    return totalDenominationPieces;
}

// This block handles reading input from standard in and invoking the main calculation function.
// It's a common pattern in competitive programming environments.
// The `.trim()` method is added to ensure any trailing newline characters are removed from the input string.
const rawInputFromSystem = require("fs").readFileSync("/dev/stdin", "utf8");
calculateDenominationBreakdown(rawInputFromSystem.trim());