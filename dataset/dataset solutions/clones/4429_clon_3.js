// This module provides a function to generate a specific type of word abbreviation.
// The abbreviation format is inspired by "i18n" (internationalization), where the
// first letter, the count of intermediate letters, and the last letter are combined.

/**
 * Generates an abbreviated form of a given string.
 * The format is: first_character + (count_of_middle_characters) + last_character.
 * For example, "documentation" becomes "d11n".
 * Special handling is applied for very short or invalid input strings.
 *
 * @param {string} sourceString - The original string to be abbreviated.
 * @returns {string} The abbreviated string, or an empty string for invalid inputs.
 */
function generateAbbreviation(sourceString) {
  // Input validation: Ensure the provided argument is a valid string.
  // If it's not a string, or is null/undefined, we output a warning and return an empty string.
  if (typeof sourceString !== 'string' || sourceString === null) {
    console.warn("Input for abbreviation must be a valid string. Received:", sourceString);
    return ""; // Return an empty string for invalid inputs to prevent errors.
  }

  // Determine the total number of characters in the input string.
  const totalCharCount = sourceString.length;

  // Handle edge cases for strings that are too short to have a meaningful "middle" part.
  // This includes empty strings, single-character strings, and two-character strings.
  if (totalCharCount <= 2) {
    // An empty string cannot be abbreviated meaningfully in this format.
    if (totalCharCount === 0) {
      return "";
    }
    // For strings with 1 or 2 characters, the "middle" character count is effectively zero.
    // Example: "a" -> "a0a", "ab" -> "a0b".
    const firstGlyph = sourceString.charAt(0);
    const lastGlyph = sourceString.charAt(totalCharCount - 1);
    // Explicitly convert 0 to a string before concatenation.
    return firstGlyph + String(0) + lastGlyph;
  }

  // --- Core abbreviation logic for strings with more than two characters ---

  // Retrieve the leading character. Array-like indexing is a concise way to do this.
  const leadingCharacter = sourceString[0];

  // Retrieve the trailing character.
  const trailingCharacter = sourceString[totalCharCount - 1];

  // Calculate the number of characters that lie between the first and last characters.
  // This is simply the total length minus the two outer characters.
  const intermediateCharactersCount = totalCharCount - 2;

  // As an intermediate step, we could also extract the central substring,
  // though for the final result, only its length is needed.
  // This demonstrates adding a non-essential fragment.
  const centralSegment = sourceString.substring(1, totalCharCount - 1);
  // Note: centralSegment.length would be identical to intermediateCharactersCount.

  // Construct the final abbreviated string by concatenating the parts.
  // Ensure the numerical count is converted to a string for correct concatenation.
  const constructedAbbreviation = leadingCharacter + String(intermediateCharactersCount) + trailingCharacter;

  return constructedAbbreviation;
}

// This function serves as the primary execution entry point for the script.
// It handles reading input from stdin and orchestrating the abbreviation process.
function executeProgramLogic() {
  // Utilize a try-catch block to gracefully manage potential errors during I/O operations.
  try {
    // Read the entire content of standard input as a UTF-8 encoded string.
    const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Clean the input by removing any leading or trailing whitespace,
    // which might include newline characters from stdin.
    const trimmedInput = rawInputContent.trim();

    // Call our specialized abbreviation function with the cleaned input.
    const finalOutputString = generateAbbreviation(trimmedInput);

    // Print the resulting abbreviation to standard output.
    console.log(finalOutputString);
  } catch (operationError) {
    // If any error occurs (e.g., file system error, invalid input stream),
    // log the error message to standard error and exit with a failure code.
    console.error("An operational error occurred:", operationError.message);
    process.exit(1); // Indicate that the program terminated unsuccessfully.
  }
}

// Initiate the program execution by calling the main logic function.
executeProgramLogic();