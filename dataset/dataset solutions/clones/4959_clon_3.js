const fileSystemModule = require("fs"); // Import the file system module for input operations

// Constants for character ASCII values and alphabet size, improving readability
const ALPHABET_SPAN = 26;
const ASCII_LOWER_A = 'a'.charCodeAt(0);
const ASCII_LOWER_Z = 'z'.charCodeAt(0);
// This constant represents the 'pivot' for calculating the cost to reach 'a'
// For example, 'z' (122) costs 1 point (123 - 122), 'y' (121) costs 2 points (123 - 121), etc.
// 'a' (97) costs 26 points (123 - 97) in this specific transformation logic.
const WRAP_POINT_FOR_A_CONVERSION = ASCII_LOWER_Z + 1; // Effectively 123

// Read raw input from standard input, decode as UTF-8, remove leading/trailing whitespace, and split into lines
const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
const inputDataLines = rawInputContent.trim().split("\n");

// Extract the original message string and the transformation budget from input lines
let originalInputString = inputDataLines[0];
let remainingShiftBudget = Number.parseInt(inputDataLines[1], 10); // Parse integer with explicit radix

// --- Input Validation and Guard Clauses ---
// If the input string is empty or undefined, output an empty line and exit.
if (!originalInputString || originalInputString.length === 0) {
  console.log("");
  return;
}

// Ensure the budget is a non-negative number. If not, set to 0 to prevent issues.
if (isNaN(remainingShiftBudget) || remainingShiftBudget < 0) {
  remainingShiftBudget = 0;
}

// Array to build the new string efficiently, by pushing characters and then joining
const processedCharacters = [];
const stringLength = originalInputString.length;

// Iterate through each character of the input string
for (let charPosition = 0; charPosition < stringLength; charPosition++) {
  const currentCharacter = originalInputString[charPosition];
  let currentAsciiValue = currentCharacter.charCodeAt(0);

  // Determine if the current character is the very last one in the string
  const isFinalCharacter = (charPosition === stringLength - 1);

  // Logic branches based on whether it's the last character or an intermediate one
  if (isFinalCharacter) {
    // For the last character, apply the remaining transformation budget as a Caesar shift.
    // The shift amount is modulo 26 to ensure it wraps around the alphabet.
    const finalShiftAmount = remainingShiftBudget % ALPHABET_SPAN;

    // Calculate the new ASCII value:
    // 1. Shift to 0-25 range (relative to 'a').
    // 2. Add the effective shift amount.
    // 3. Apply modulo 26 to handle wrap-around within the alphabet.
    // 4. Shift back to 'a'-'z' ASCII range.
    currentAsciiValue = ((currentAsciiValue - ASCII_LOWER_A + finalShiftAmount) % ALPHABET_SPAN) + ASCII_LOWER_A;

    // Add the transformed character to our result array
    processedCharacters.push(String.fromCharCode(currentAsciiValue));
  } else {
    // For all other characters (not the last one), attempt to convert them to 'a'.
    // The cost to convert a character to 'a' is defined as:
    // 'z' costs 1, 'y' costs 2, ..., 'b' costs 25, 'a' costs 26.
    const costToTransformToA = WRAP_POINT_FOR_A_CONVERSION - currentAsciiValue;

    // Only perform the transformation if the character is not already 'a' (to avoid
    // spending 26 points uselessly for 'a' -> 'a') AND if enough budget is available.
    if (currentCharacter !== 'a' && remainingShiftBudget >= costToTransformToA) {
      remainingShiftBudget -= costToTransformToA; // Deduct the cost from the budget
      processedCharacters.push('a');             // Transform to 'a'
    } else {
      // If not enough budget, or the character is already 'a', keep the original character.
      processedCharacters.push(currentCharacter);
    }
  }
}

// Join all processed characters from the array to form the final output string
console.log(processedCharacters.join(''));