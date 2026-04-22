function analyzeSequenceData(sourceInputText) {
  // Validate the incoming input to ensure it's a non-empty string.
  if (typeof sourceInputText !== 'string' || sourceInputText.trim().length === 0) {
    console.error("Error: Input data is empty or invalid.");
    return; // Terminate execution for invalid input.
  }

  // Split the entire input content into an array of individual lines.
  const contentLines = sourceInputText.split('\n');

  // The first line often contains metadata, like an expected count 'N'.
  // While parsed, this specific implementation does not directly utilize 'initialCount'
  // for the subsequent unique element calculation, but it's part of the input structure.
  const initialCount = parseInt(contentLines[0].trim(), 10);
  // Optional: Add a check for initialCount validity if it were to be used later.
  // if (isNaN(initialCount)) { /* handle error or default */ }

  // Verify that a second line containing the actual sequence exists.
  if (contentLines.length < 2 || contentLines[1].trim().length === 0) {
    console.error("Error: Sequence data line is missing or empty.");
    console.log(0); // If no sequence, count of unique items is 0.
    return;
  }

  // Extract the second line, which holds the space-separated numeric sequence.
  const sequenceLineContent = contentLines[1].trim();

  // Split the sequence line by any whitespace character(s) and filter out empty strings
  // that might result from multiple consecutive spaces.
  const stringElements = sequenceLineContent.split(/\s+/).filter(Boolean);

  // If, after splitting and filtering, there are no elements, the sequence is empty.
  if (stringElements.length === 0) {
    console.log(0); // No elements means no unique elements.
    return;
  }

  // Convert all string elements into numerical values.
  // Additionally, filter out any results that are not valid numbers (NaN).
  const numericValues = stringElements.map(Number).filter(val => !isNaN(val));

  // Sort the numerical values in ascending order.
  // This step is not strictly required for finding unique elements but ensures consistency
  // and might be useful for other processing steps.
  numericValues.sort((firstNum, secondNum) => firstNum - secondNum);

  // Utilize a JavaScript Set to efficiently obtain only the unique numerical values.
  // Sets inherently store only unique items.
  const uniqueNumericSet = new Set(numericValues);

  // Convert the Set of unique numbers back into an array to easily determine its length.
  const finalUniqueArray = Array.from(uniqueNumericSet);

  // Calculate the total number of unique elements found.
  const totalUniqueCount = finalUniqueArray.length;

  let computedOutcome;
  // Apply the specific conditional logic for the output:
  // If the count of unique elements is odd, the result is the count itself.
  // If the count is even, the result is the count minus one.
  if (totalUniqueCount % 2 !== 0) { // Checks if 'totalUniqueCount' is odd
    computedOutcome = totalUniqueCount;
  } else { // 'totalUniqueCount' is even
    computedOutcome = totalUniqueCount - 1;
  }

  // Print the final calculated outcome to the console.
  console.log(computedOutcome);
}

// Standard entry point for competitive programming environments:
// Reads all input from /dev/stdin and passes it to the main processing function.
try {
  // Attempt to load the 'fs' module for file system operations.
  const fileSystemHandler = require("fs");
  // Read the entire content of the standard input asynchronously.
  const inputContentFromStdin = fileSystemHandler.readFileSync("/dev/stdin", "utf8");
  // Invoke the analysis function with the obtained input.
  analyzeSequenceData(inputContentFromStdin);
} catch (ioError) {
  // Log an error if reading from standard input fails, e.g., file not found or permission issues.
  console.error("An error occurred while reading from standard input:", ioError.message);
  // Depending on requirements, could also exit the process or provide a fallback.
}