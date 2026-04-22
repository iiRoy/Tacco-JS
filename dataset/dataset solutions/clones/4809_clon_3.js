/**
 * Processes raw input data to determine if a sequence of numbers
 * adheres to a specific pattern and calculates a result based on it.
 *
 * This function expects input in two lines:
 * 1. The first line contains a single integer N, representing the total number of elements.
 * 2. The second line contains N space-separated integers.
 *
 * The pattern checks include:
 * - No number appears more than twice.
 * - Specific frequency requirements for 0, odd, and even numbers based on N's parity.
 *
 * @param {string} rawInputData The raw input string from stdin or a similar source.
 */
function ProcessInputSequence(rawInputData) {
    // Split the raw input string into individual lines for processing.
    const inputLines = rawInputData.split("\n");

    // --- Input Validation and Parsing ---
    // Ensure there are at least two lines of input for N and the sequence.
    if (inputLines.length < 2) {
        console.log('0'); // Insufficient input lines provided
        return;
    }

    // Parse the total number of elements (N) from the first line.
    const totalElementsStr = inputLines[0].trim();
    const totalElements = parseInt(totalElementsStr, 10);

    // Validate N: Must be a non-negative integer.
    if (isNaN(totalElements) || totalElements < 0) {
        console.log('0'); // Invalid total elements count (N is not a valid number or is negative)
        return;
    }

    // Parse the sequence of numbers from the second line.
    // Use filter(Boolean) to remove any empty strings resulting from multiple spaces or leading/trailing spaces.
    const sequenceTokens = inputLines[1].trim().split(" ").filter(Boolean);

    // Additional validation: The actual number of elements in the sequence must match N.
    if (sequenceTokens.length !== totalElements) {
        console.log('0'); // Mismatch between declared N and actual number of elements in the sequence
        return;
    }

    // Handle the edge case where N is 0. An empty sequence typically yields 0 for this problem type.
    if (totalElements === 0) {
        console.log('0');
        return;
    }

    // --- Frequency Counting and Initial Validation ---
    // Using a Map for frequency counting allows for arbitrary integer values as keys,
    // which is more robust than a fixed-size array if values can be large or sparse.
    const elementFrequencies = new Map();
    let isSequenceValid = true; // Flag to track overall validity of the sequence

    // Populate the frequency map and check for elements appearing more than twice.
    for (let i = 0; i < sequenceTokens.length; i++) {
        const currentNumericValue = parseInt(sequenceTokens[i], 10);

        // Validate each numeric value: Must be an integer.
        if (isNaN(currentNumericValue) || !Number.isInteger(currentNumericValue)) {
            isSequenceValid = false; // Invalid numeric value encountered (e.g., non-integer, non-numeric)
            break;
        }

        // Increment count for the current value. If not present, default to 0 before incrementing.
        const currentCount = (elementFrequencies.get(currentNumericValue) || 0) + 1;
        elementFrequencies.set(currentNumericValue, currentCount);

        // Check if any element appears more than the allowed maximum (twice).
        if (currentCount > 2) {
            isSequenceValid = false; // Found an element appearing too many times
            break;
        }
    }

    // If initial frequency checks (parsing or count > 2) failed, exit early.
    if (!isSequenceValid) {
        console.log('0');
        return;
    }

    // --- Parity-Based Structural Validation ---
    const isN_Odd = (totalElements % 2 !== 0); // Determine if N (totalElements) is odd

    // Iterate through all possible expected values (from 0 up to N-1) to check their frequencies.
    // The problem typically implies values within this range.
    for (let checkValue = 0; checkValue < totalElements; checkValue++) {
        const isCheckValue_Odd = (checkValue % 2 !== 0); // Determine if the current value is odd
        // Get the actual frequency of the current value. Default to 0 if not found in the map.
        const actualFrequency = elementFrequencies.get(checkValue) || 0;

        // Apply rules based on the parity of N.
        if (isN_Odd) { // Case: N is an odd number
            if (checkValue === 0) {
                // If N is odd, the value 0 must appear exactly once.
                if (actualFrequency !== 1) {
                    isSequenceValid = false;
                    break;
                }
            } else if (isCheckValue_Odd) {
                // If N is odd, other odd values (1, 3, 5, ...) must not appear (frequency 0).
                if (actualFrequency !== 0) {
                    isSequenceValid = false;
                    break;
                }
            } else { // checkValue is even and not 0 (e.g., 2, 4, ...)
                // If N is odd, even values (excluding 0) must appear exactly twice.
                if (actualFrequency !== 2) {
                    isSequenceValid = false;
                    break;
                }
            }
        } else { // Case: N is an even number
            if (checkValue === 0) {
                // If N is even, the value 0 must not appear (frequency 0).
                if (actualFrequency !== 0) {
                    isSequenceValid = false;
                    break;
                }
            } else if (isCheckValue_Odd) {
                // If N is even, odd values (1, 3, 5, ...) must appear exactly twice.
                if (actualFrequency !== 2) {
                    isSequenceValid = false;
                    break;
                }
            } else { // checkValue is even and not 0 (e.g., 2, 4, ...)
                // If N is even, other even values (excluding 0) must not appear (frequency 0).
                if (actualFrequency !== 0) {
                    isSequenceValid = false;
                    break;
                }
            }
        }
    }

    // --- Result Calculation ---
    let finalCalculatedResult = 0;
    if (isSequenceValid) {
        // If all validation checks pass, calculate the final result.
        // The result is (N/2)^2 modulo (10^9 + 7).
        const halfN = Math.floor(totalElements / 2);
        const MODULO_CONSTANT = 10**9 + 7; // Define the modulus as a constant

        // Calculate (halfN * halfN) and then apply the modulo.
        // Using standard number multiplication is fine here as halfN is up to 5*10^4,
        // so halfN*halfN is up to 2.5*10^9, which fits in a standard JS number before modulo.
        finalCalculatedResult = (halfN * halfN) % MODULO_CONSTANT;
    }

    // Output the final calculated value.
    console.log(finalCalculatedResult.toString());
}

// --- Debugging and Execution Environment Setup ---

/**
 * A utility function for debugging the sequence processing in a browser environment.
 * Assumes an HTML input element with id "input" exists, from which it reads test data.
 */
function debugSequenceProcessor() {
	const debugInputValue = document.getElementById("input").value;
	ProcessInputSequence(debugInputValue);
}

// Check if the script is running in a Node.js-like environment (e.g., for competitive programming platforms).
// If so, read input from /dev/stdin and pass it to the main processing function.
if (typeof require !== 'undefined' && require.main === module) {
    const fileSystem = require("fs");
    const standardInputPath = "/dev/stdin";
    const encoding = "utf8";
    try {
        const inputDataFromFile = fileSystem.readFileSync(standardInputPath, encoding);
        ProcessInputSequence(inputDataFromFile);
    } catch (error) {
        // Handle potential errors during file reading (e.g., file not found, permission issues).
        console.error("Error reading input from /dev/stdin:", error.message);
        // In case of an error, output 0 or another designated error value as per problem spec.
        console.log('0');
    }
}