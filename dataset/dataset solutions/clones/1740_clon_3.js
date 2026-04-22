// This module processes a single character provided as a command-line argument.
// Its primary function is to ascertain if the character is initially uppercase or lowercase.

// Retrieve the input string from the command-line arguments.
// The expected character is typically at index 2 of process.argv.
const cmdLineArg = process.argv[2];

// Perform initial validation: Check if an argument was actually provided.
// If not, output an error message and terminate the script.
if (!cmdLineArg || cmdLineArg.length === 0) {
    console.error("Error: A single character input is required to determine its case.");
    process.exit(1); // Indicate an abnormal termination.
}

// Extract the very first character from the provided argument.
// This ensures that only the initial character is analyzed,
// even if a longer string was mistakenly passed.
const charForAnalysis = cmdLineArg.substring(0, 1);

// Generate an uppercase version of the character for comparison purposes.
const capitalizedVersion = charForAnalysis.toUpperCase();

// Declare a mutable variable to store the final outcome of the case check.
// It will hold 'A' for uppercase or 'a' for lowercase.
let caseIdentifierOutput = '';

// The core logic: Compare the original character with its capitalized form.
// If they are identical, the original character was already uppercase.
// Otherwise, it implies the original character was lowercase.
if (charForAnalysis === capitalizedVersion) {
    caseIdentifierOutput = 'A'; // Signifies an input character that was already uppercase.
} else {
    caseIdentifierOutput = 'a'; // Signifies an input character that was lowercase.
}

// Display the determined case identifier to the standard output.
console.log(caseIdentifierOutput);