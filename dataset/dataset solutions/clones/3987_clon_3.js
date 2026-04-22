// This module provides a set of utility functions to handle input/output operations
// and perform specific data transformations required for algorithmic tasks.

// --- Core I/O Utilities ---

// Reads the entire content from standard input (`/dev/stdin`).
// It is configured to read as UTF-8 text and any leading/trailing whitespace is removed.
// Includes error handling to gracefully manage potential issues during file system access.
function retrieveStandardInputData() {
    try {
        const fileSystem = require("fs");
        const rawBuffer = fileSystem.readFileSync("/dev/stdin", "utf8");
        return rawBuffer.trim(); // Remove any surrounding whitespace like newlines.
    } catch (ioError) {
        // If there's an error reading stdin, log it and return an empty string to prevent crashes.
        console.error(`ERROR: Failed to access standard input: ${ioError.message}`);
        return "";
    }
}

// Outputs a given message or result to standard output (`console.log`).
// This function serves as the primary mechanism for displaying results to the user.
function emitStandardOutput(messageContent) {
    console.log(messageContent);
}

// Outputs an error message to standard error (`console.error`).
// This is used for reporting diagnostic information or critical failures
// without interfering with the main program output stream.
function logDiagnosticError(errorMessage) {
    console.error(`DIAGNOSTIC: ${errorMessage}`);
}

// --- Data Transformation Helper ---

// Defines a set of symbolic constants for various data transformation modes.
// Using an object for modes makes the code more readable and less prone to magic number errors.
const TRANSFORMATION_SCHEMES = Object.freeze({
    // Returns the input string exactly as it was received.
    NO_TRANSFORMATION: "identity",
    // Splits the input string into an array of individual characters.
    STRING_TO_CHAR_ARRAY: "toCharArray",
    // Splits the input string by spaces and attempts to convert each segment into a number.
    SPACE_DELIMITED_NUMERIC_ARRAY: "splitSpaceToNumbers",
});

// A versatile function designed to transform a source string based on a specified scheme.
// It acts as a central dispatcher for common input parsing patterns.
// Only includes schemes directly utilized by the main application logic.
function applyStringTransformation(sourceString, transformationScheme) {
    if (typeof sourceString !== 'string') {
        logDiagnosticError(`Input for transformation must be a string. Received: ${typeof sourceString}`);
        return null; // Or throw an error, depending on desired robustness.
    }

    switch (transformationScheme) {
        case TRANSFORMATION_SCHEMES.NO_TRANSFORMATION:
            return sourceString;
        case TRANSFORMATION_SCHEMES.STRING_TO_CHAR_ARRAY:
            return sourceString.split("");
        case TRANSFORMATION_SCHEMES.SPACE_DELIMITED_NUMERIC_ARRAY:
            // Filters out empty strings that might result from multiple spaces.
            return sourceString.split(" ").filter(s => s !== '').map(Number);
        default:
            logDiagnosticError(`Unrecognized transformation scheme: '${transformationScheme}'`);
            return null;
    }
}

// --- Algorithmic Logic Components ---

// Determines if a given integer is a 5-digit palindrome.
// A palindrome reads the same forwards and backwards.
// This function specifically validates numbers within the 5-digit range (10000-99999).
function checkIsNumericPalindrome(candidateValue) {
    // Convert the numeric value to its string representation for digit access.
    const stringRepresentation = String(candidateValue);
    const numberOfDigits = stringRepresentation.length;

    // Pre-condition check: The problem context implies 5-digit numbers.
    // Numbers outside this range are explicitly not considered 5-digit palindromes.
    if (numberOfDigits !== 5) {
        return false;
    }

    // For a 5-digit number (e.g., d1 d2 d3 d4 d5), it's a palindrome if:
    // d1 == d5 (first digit matches last digit)
    // AND d2 == d4 (second digit matches fourth digit)
    const digit1 = stringRepresentation[0];
    const digit2 = stringRepresentation[1];
    const digit4 = stringRepresentation[3];
    const digit5 = stringRepresentation[4];

    return (digit1 === digit5) && (digit2 === digit4);
}

// --- Main Program Execution Flow ---

// This function encapsulates the primary business logic of the application.
// It receives the raw input, parses it, performs computations, and dispatches the result.
function executeMainApplication(initialDataPayload) {
    let lowerRangeBoundary;
    let upperRangeBoundary;
    let countedPalindromes = 0; // Accumulator for the total count of palindromes.

    try {
        // Parse the input string, expecting two space-separated numbers.
        // E.g., "10000 99999" will yield [10000, 99999].
        const parsedNumericBounds = applyStringTransformation(
            initialDataPayload,
            TRANSFORMATION_SCHEMES.SPACE_DELIMITED_NUMERIC_ARRAY
        );

        // Input validation: Ensure exactly two numeric components were parsed.
        if (!parsedNumericBounds || parsedNumericBounds.length !== 2) {
            logDiagnosticError("Input format invalid: Expected exactly two space-separated numbers.");
            return; // Exit if input is malformed.
        }

        lowerRangeBoundary = parsedNumericBounds[0];
        upperRangeBoundary = parsedNumericBounds[1];

        // Validate that the parsed components are indeed finite numbers.
        if (!Number.isFinite(lowerRangeBoundary) || !Number.isFinite(upperRangeBoundary)) {
            logDiagnosticError("Input value invalid: Range boundaries must be finite numbers.");
            return;
        }

        // Validate logical order of range boundaries.
        if (lowerRangeBoundary > upperRangeBoundary) {
            logDiagnosticError("Range order invalid: Lower boundary cannot exceed upper boundary.");
            return;
        }

        // Iterate through each number within the established range (inclusive).
        for (let currentCandidate = lowerRangeBoundary; currentCandidate <= upperRangeBoundary; currentCandidate++) {
            // Utilize the dedicated helper to check for the palindrome property.
            if (checkIsNumericPalindrome(currentCandidate)) {
                countedPalindromes++; // Increment the counter if the condition is met.
            }
        }

        // Present the final tally of palindromes found to the standard output.
        emitStandardOutput(countedPalindromes);

    } catch (runtimeError) {
        // Catch any unforeseen exceptions that occur during the main execution block.
        logDiagnosticError(`An unexpected runtime error occurred: ${runtimeError.message}`);
    }
}

// --- Program Entry Point ---

// This block serves as the entry point for the entire application.
// It first retrieves the necessary input and then invokes the main processing logic.
const acquiredRawInput = retrieveStandardInputData();
executeMainApplication(acquiredRawInput);