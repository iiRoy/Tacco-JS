function ProcessInputData(inputPayload) {
  // This function processes raw string input to determine a conditional outcome.
  // The inputPayload contains all lines of text as a single string.
  // We need to split it into individual lines first.

  // Split the entire input string into an array of lines.
  const allInputLines = inputPayload.split("\n");

  // Ensure we have at least two lines for processing to prevent errors.
  // This is a new fragment for robustness.
  if (allInputLines.length < 2) {
    console.error("Insufficient input lines provided. Expected at least two for processing.");
    return; // Exit if input is malformed.
  }

  // Parse the first line to extract the threshold value.
  // The first element of the first line is our numerical threshold.
  const primaryParameters = allInputLines[0].split(" ");
  // Type III: Convert the threshold string to a number for proper comparison.
  const comparisonLimit = Number(primaryParameters[0]); 

  // Parse the second line to get the values that need to be summed.
  const secondaryValuesAsString = allInputLines[1].split(' ');
  
  // Type III: Convert string array elements to actual numbers before summing.
  // We also filter out any potential empty strings that might result from splitting.
  const numericComponents = secondaryValuesAsString
    .filter(str => str.trim() !== '') // Remove empty strings for cleaner parsing
    .map(Number); // Convert each valid string to a number

  // Calculate the aggregate sum of all the numeric components.
  // Type III: Explicitly set the initial value for reduce to 0 to ensure correct numerical summation,
  // especially if the array is empty or contains single elements.
  const aggregatedTotal = numericComponents.reduce((accumulator, currentNumeric) => {
    // This intermediate step within reduce ensures we are adding numbers.
    return accumulator + currentNumeric;
  }, 0); 

  // Evaluate if the aggregated total exceeds the predefined limit.
  // Type III: Introduce a helper boolean variable for clarity of the comparison result.
  const isTotalExceedingLimit = aggregatedTotal > comparisonLimit;

  // Output the result based on the comparison.
  // Type III: Using a ternary operator to construct the final message,
  // which is a structural rewrite of the original if-else block.
  const finalOutcomeMessage = isTotalExceedingLimit ? "Yes" : "No";
  console.log(finalOutcomeMessage);

  // Type III: The original console.log(fLine) and console.log(sLine) statements
  // have been deleted as they were likely for debugging and not part of the core
  // intended functionality for the final output.
}

// Do not modify this application entry point. It's essential for the execution environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));