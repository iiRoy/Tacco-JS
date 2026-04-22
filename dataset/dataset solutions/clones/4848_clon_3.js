// This JavaScript module is designed to analyze a given textual input
// and produce one of two predefined outcomes based on specific pattern matching rules.
// It focuses on the string's length parity and the equality of its boundary characters.
function AnalyzeStringPattern(sourceInputData) {

  // Step 1: Input Normalization and Validation.
  // Convert the input to a string type defensively, handling potential null/undefined inputs,
  // then remove any leading or trailing whitespace to standardize the data for analysis.
  let cleanedTextContent = String(sourceInputData || '').trim();

  // Intermediate variable to store the final outcome string.
  let finalOutcomeLabel = "";

  // Step 2: Handle Edge Case for Empty Strings.
  // If the string becomes empty after trimming, the original logic would still proceed.
  // For an empty string (length 0), the XOR condition (0 & 1) ^ (undefined === undefined)
  // evaluates to 0 ^ true, which is true. Thus, an empty string results in "First".
  // We explicitly check this to maintain behavior and improve readability.
  if (cleanedTextContent.length === 0) {
    finalOutcomeLabel = "First";
  } else {
    // Step 3: Extract Core Properties for Analysis.
    // Determine the total number of characters in the normalized string.
    const effectiveCharCount = cleanedTextContent.length;

    // Isolate the very first character of the string.
    const firstPositionChar = cleanedTextContent.charAt(0);

    // Isolate the very last character of the string.
    const lastPositionChar = cleanedTextContent.charAt(effectiveCharCount - 1);

    // Step 4: Evaluate Conditional Flags.
    // Check if the character count is an odd number.
    const isTotalLengthOdd = (effectiveCharCount % 2 !== 0);

    // Check if the character at the start is identical to the character at the end.
    const doBoundaryCharsMatch = (firstPositionChar === lastPositionChar);

    // Step 5: Implement Core Decision Logic.
    // The original logic uses a XOR operation: (length_is_odd XOR first_equals_last).
    // This translates to a 'First' outcome if:
    // (length is odd AND boundary characters do NOT match)
    // OR
    // (length is even AND boundary characters DO match).
    if ((isTotalLengthOdd && !doBoundaryCharsMatch) || (!isTotalLengthOdd && doBoundaryCharsMatch)) {
      finalOutcomeLabel = "First";
    } else {
      // Otherwise, if the above condition is false, the outcome is 'Second'.
      // This covers cases where:
      // (length is odd AND boundary characters DO match)
      // OR
      // (length is even AND boundary characters do NOT match).
      finalOutcomeLabel = "Second";
    }
  }

  // Step 6: Output the Determined Result.
  // Display the final label to the standard output.
  console.log(finalOutcomeLabel);
}

// Primary execution block for handling program input.
// This section reads content from standard input, typically used in scripting environments.
try {
  // Dynamically load the Node.js file system module.
  const fileSystemUtility = require("fs");

  // Read the entire content from the standard input stream as a UTF-8 encoded string.
  const inputBufferContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

  // Invoke the main analysis function with the obtained input.
  AnalyzeStringPattern(inputBufferContent);

} catch (processingError) {
  // Catch and report any errors that occur during the input reading or processing phase.
  // This could include file system access issues or incorrect input formats.
  console.error("An operational error occurred:", processingError.message);
  // Optionally, terminate the process with an error code.
  // process.exit(1);
}