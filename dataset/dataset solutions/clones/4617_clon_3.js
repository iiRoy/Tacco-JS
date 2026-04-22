// This JavaScript module provides a specialized function to process textual data,
// primarily designed to extract and combine initial characters from specific
// components of a given input string. It aims for robustness and clarity.

/**
 * Analyzes an incoming string, extracts its first three space-separated segments,
 * and then generates an abbreviation by capitalizing the first character of each segment.
 *
 * This function handles various input conditions, including invalid types, empty strings,
 * and strings with fewer than the expected number of segments, providing graceful fallbacks.
 *
 * @param {string} sourceDataStream - The raw string content that needs to be processed.
 *                                    Expected to contain at least three words separated by spaces.
 * @returns {string} A three-character uppercase abbreviation formed from the initial
 *                   characters of the first three segments. Returns an empty string
 *                   if the input is invalid or cannot yield a complete abbreviation.
 */
function processTextualContent(sourceDataStream) {
  // Step 1: Validate the input type. Ensuring 'sourceDataStream' is a string prevents
  // runtime errors from subsequent string operations (e.g., .trim(), .split()).
  if (typeof sourceDataStream !== 'string') {
    // Log an error for debugging purposes and return an empty string to signify failure.
    console.error("Input type error: 'sourceDataStream' must be a string. Received:", typeof sourceDataStream);
    return ""; // Return an empty string as a safe default for invalid input.
  }

  // Step 2: Define a constant for the delimiter. Using a constant improves readability
  // and makes it easier to change the splitting logic if requirements evolve.
  const WHITESPACE_DELIMITER = ' ';

  // Step 3: Pre-process the input string. Trimming leading and trailing whitespace
  // ensures that the split operation yields clean segments and avoids issues with
  // empty strings at the beginning or end of the array if the input has extra spaces.
  const normalizedText = sourceDataStream.trim();

  // Step 4: Handle cases where the input becomes empty after trimming.
  // If there's no content, no segments can be extracted.
  if (normalizedText.length === 0) {
    // console.info("Info: Processed an empty string after trimming."); // Optional: for verbose logging
    return "";
  }

  // Step 5: Split the normalized text into an array of segments using the defined delimiter.
  // This operation is performed only once for efficiency.
  const contentParts = normalizedText.split(WHITESPACE_DELIMITER);

  // Step 6: Validate the number of segments. The original logic implicitly expects at least
  // three segments. If fewer are present, direct access (e.g., contentParts[2]) would
  // result in 'undefined', leading to errors if string methods are called on it.
  if (contentParts.length < 3) {
    // A warning indicates that the input didn't fully meet expectations, but we'll
    // still attempt to process what's available gracefully.
    console.warn(`Warning: Expected at least 3 segments, but found only ${contentParts.length}.`);
    // The following logic handles missing parts by using empty strings as fallbacks.
  }

  // Step 7: Extract the first character from each of the first three potential segments.
  // We use the logical OR operator (|| '') to provide an empty string fallback
  // if a segment at a given index does not exist (e.g., contentParts[1] is undefined).
  // Then, .substring(0, 1) safely gets the first character (or an empty string if the segment is empty).
  // Finally, .toLocaleUpperCase() ensures consistent casing for the abbreviation.
  const firstCharOfPart1 = (contentParts[0] || '').substring(0, 1).toLocaleUpperCase();
  const firstCharOfPart2 = (contentParts[1] || '').substring(0, 1).toLocaleUpperCase();
  const firstCharOfPart3 = (contentParts[2] || '').substring(0, 1).toLocaleUpperCase();

  // Step 8: Concatenate the extracted capitalized characters to form the final abbreviation.
  // Template literals (` `) are a modern and readable way to build strings.
  const finalAbbreviation = `${firstCharOfPart1}${firstCharOfPart2}${firstCharOfPart3}`;

  // Step 9: Output the generated abbreviation to the standard console.
  // This mimics the original functionality of directly printing the result.
  console.log(finalAbbreviation);

  // Step 10: Return the result. Explicitly returning the value makes the function
  // more versatile and testable, allowing its output to be used elsewhere.
  return finalAbbreviation;
}


// This block handles the execution flow when the script is run.
// It's responsible for reading input from the environment and invoking the processing logic.
try {
  // Utilize Node.js's built-in 'fs' module to read synchronous file content.
  // '/dev/stdin' is a common path on Unix-like systems for standard input.
  // 'utf8' encoding ensures correct interpretation of text characters.
  const rawInputFromStdin = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

  // Call the main processing function with the data obtained from standard input.
  processTextualContent(rawInputFromStdin);

} catch (executionError) {
  // If any error occurs during input reading or initial function execution,
  // catch it here to prevent the program from crashing unexpectedly.
  console.error("Runtime Exception: Failed to execute script due to an error.", executionError.message);
  // Exiting with a non-zero code typically indicates an error condition to the operating system.
  process.exit(1);
}