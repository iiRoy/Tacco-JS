// This script performs a character-by-character comparison
// between a user-provided string and a fixed reference string,
// counting the number of positions where they differ.

// --- Start of Program Execution ---

// Simulate obtaining an input line.
// In a real execution environment (e.g., Node.js), this would involve 'readline' or process.argv.
// For this example, we'll hardcode a sample input string.
const userEntrySequence = "CODEFESTIVAL2017"; // Example: simulating user input

// Define the established baseline string for comparison.
const standardReferenceString = "CODEFESTIVAL2016";

// Transform the user's input string into an array of its constituent characters.
const userCharacters = userEntrySequence.split("");

// Transform the standard reference string into an array of its individual symbols.
const referenceCharacters = standardReferenceString.split("");

// Obtain the total length of the reference string.
// This length will dictate the bounds of our comparison loop.
const comparisonLength = standardReferenceString.length;

// Initialize a variable to accumulate the count of non-matching characters.
let mismatchCounter = 0;

// Iterate through each character position, starting from the first (index 0)
// up to, but not including, the 'comparisonLength'.
for (let currentCharacterIndex = 0; currentCharacterIndex < comparisonLength; currentCharacterIndex++) {
  // Check if the character at the current index in the user's input
  // is different from the character at the same index in the reference string.
  if (userCharacters[currentCharacterIndex] !== referenceCharacters[currentCharacterIndex]) {
    // If a discrepancy is found, increment our mismatch counter.
    mismatchCounter++;
  }
}

// Display the final tally of differing characters to the console output.
console.log(mismatchCounter);

// --- End of Program Execution ---