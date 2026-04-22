function processInputData(rawData) {
  // Decompose the raw input string into individual lines for processing.
  // This helper array facilitates cleaner access to distinct input segments.
  const inputLines = rawData.split('\n');

  // Attempt to extract the numerical constraint from the first line.
  // We use optional chaining and a default string '0' to guard against
  // potentially malformed or empty input lines before parsing.
  // The base 10 radix is explicitly provided for clarity and safety.
  const truncationThreshold = parseInt(inputLines[0]?.trim() || '0', 10);

  // Retrieve the primary text content from the second line of input.
  // Similar to the above, optional chaining and an empty string default
  // ensure robust handling of missing or blank lines.
  const contentString = inputLines[1]?.trim() || '';

  // Define a constant for the suffix to be appended upon truncation.
  // This improves readability and makes the suffix easily modifiable.
  const truncationEllipsis = '...';

  // Introduce a variable to store the final string segment before output.
  // This allows for a single point of output and cleaner conditional logic.
  let resultingDisplayString;

  // --- Start of Validation and Core Logic ---

  // Basic validation: Ensure the truncation threshold is a non-negative number.
  // If the parsed value is not a number or is negative, an error message is printed,
  // and the function exits early, preventing unexpected behavior.
  if (isNaN(truncationThreshold) || truncationThreshold < 0) {
    console.error("Input Error: The provided truncation limit must be a non-negative integer.");
    return; // Terminate execution for invalid input
  }

  // Evaluate whether the content string's length exceeds the defined threshold.
  // The comparison determines if truncation is necessary.
  if (contentString.length <= truncationThreshold) {
    // If the string's current length is within or equal to the allowed limit,
    // the entire string is used as the final output.
    resultingDisplayString = contentString;
  } else {
    // Should the string be longer than the threshold, it must be truncated.
    // The substring method extracts characters from the beginning up to the limit.
    // A template literal is employed for concise concatenation of the truncated part
    // and the predefined ellipsis suffix.
    resultingDisplayString = `${contentString.substring(0, truncationThreshold)}${truncationEllipsis}`;
  }

  // --- End of Core Logic ---

  // Finally, output the determined string to the standard console.
  // This completes the primary task of displaying the processed text.
  console.log(resultingDisplayString);
}

// The following block is responsible for initiating the program.
// It reads all data from the standard input stream (typically a file or pipe)
// as a UTF-8 encoded string and passes it to our main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));