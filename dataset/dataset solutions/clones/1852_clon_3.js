function processInputData(sourceData) {
  // The primary function for handling and processing the provided textual information.
  // It expects a multi-line string where the first line is a numeric limit
  // and the second line is the text to potentially truncate.

  // Split the raw input string into an array of individual lines.
  const dataLines = sourceData.split('\n');

  // Implement a basic validation check: ensure there are enough lines for processing.
  // If the input array has fewer than two elements, it indicates malformed data.
  if (dataLines.length < 2) {
    console.error("Input processing error: Expected at least two lines of data but received fewer.");
    // Early exit to prevent further errors with array indexing.
    return;
  }

  // Utilize array destructuring to extract the first two lines into distinct variables.
  const [lengthSpecification, contentString] = dataLines;

  // Convert the string representation of the length limit into an integer.
  // The unary plus operator is used here for concise type conversion.
  let truncationBoundary = +lengthSpecification;

  // Further validation: check if the parsed length is a valid non-negative number.
  // If it's not a number or is negative, log an error and stop.
  if (Number.isNaN(truncationBoundary) || truncationBoundary < 0) {
    console.error("Input processing error: The specified length boundary is invalid. It must be a non-negative numerical value.");
    return;
  }

  // Define a constant for the ellipsis string to be appended upon truncation.
  const ellipsisMark = '...';

  // Introduce a local helper function to encapsulate the string truncation logic.
  // This improves modularity and readability by separating concerns.
  const applyConditionalTruncation = (textValue, limitValue, suffixText) => {
    // Compare the length of the string with the provided limit.
    if (textValue.length > limitValue) {
      // If the string exceeds the limit, truncate it and append the suffix.
      // Using substring is an alternative to slice for this purpose.
      return textValue.substring(0, limitValue) + suffixText;
    } else {
      // Otherwise, return the original string without any modifications.
      return textValue;
    }
  };

  // Declare a variable to store the computed result before outputting it.
  let finalRenderedText;

  // Invoke the helper function with the extracted data and store its return value.
  finalRenderedText = applyConditionalTruncation(contentString, truncationBoundary, ellipsisMark);

  // Output the final processed string to the console.
  // Using console.info as an alternative to console.log.
  console.info(finalRenderedText);
}

// This block handles the execution environment, specifically for Node.js.
// It ensures that the 'processInputData' function is called when the script is run directly
// and reads input from standard input, mirroring typical competitive programming setups.
if (typeof require !== 'undefined' && require.main === module) {
  try {
    // Dynamically import the 'fs' (file system) module.
    const fileSystemModule = require('fs');
    // Read all data from standard input (/dev/stdin) synchronously as a UTF-8 string.
    const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    // Call the main processing function with the content from standard input.
    processInputData(standardInputContent);
  } catch (executionError) {
    // Catch and log any errors that occur during file reading or processing.
    console.error("Execution handler error: Could not read from standard input or process data.", executionError.message);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
  }
}