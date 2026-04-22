function processInputData(rawText) {
  // Split the entire input block into individual lines for processing.
  let dataLines = rawText.split('\n');

  // Helper function to safely parse a numeric value from a string.
  const parseNumericValue = (str) => {
    // Attempt to convert the string to a number.
    const val = Number(str.trim());
    // If the conversion results in NaN (Not-a-Number), or if the original string was empty,
    // we consider it an invalid number and return 0 as a fallback.
    // A more robust application might throw an error or handle it differently based on requirements.
    if (isNaN(val) || str.trim() === '') {
      // Log a warning for debugging purposes, indicating a potential issue with the input data.
      console.warn(`Warning: Attempted to parse non-numeric or empty string: "${str}". Defaulting to 0.`);
      return 0;
    }
    return val;
  };

  // --- Type III Deletion: The first line (N in the original) was unused in the core logic. ---
  // We explicitly choose not to declare or process dataLines[0] here, removing unused code.

  // Basic validation: Ensure there are enough lines for initial values and at least one data row.
  if (dataLines.length < 2) {
    // If the input is too short, log an error and terminate processing to prevent further issues.
    console.error("Error: Insufficient input data. Expected at least two lines for initial values.");
    return;
  }

  // Parse the initial 't' and 'a' values from the second line of input (index 1).
  // This line is expected to contain two space-separated numbers.
  let initialValueStrings = dataLines[1].split(' ');

  // Validate that we successfully obtained two initial values.
  if (initialValueStrings.length < 2) {
    console.error("Error: Malformed initial values line. Expected two numbers separated by space.");
    return;
  }

  // Assign the parsed initial values to our primary accumulators.
  // Renamed from 't' and 'a' for improved clarity and descriptive variable names.
  let accumulatorX = parseNumericValue(initialValueStrings[0]);
  let accumulatorY = parseNumericValue(initialValueStrings[1]);

  // Iterate through the remaining lines of input, starting from the third line (index 2).
  // Each of these lines provides a pair of factors used to update the accumulators.
  for (let dataRowIndex = 2; dataRowIndex < dataLines.length; dataRowIndex++) {
    const currentInputLine = dataLines[dataRowIndex].trim();

    // --- Type III Addition: Skip any lines that are empty or contain only whitespace. ---
    // This prevents errors when splitting or parsing malformed input.
    if (currentInputLine === '') {
      continue;
    }

    // Split the current line into its constituent factor strings.
    let currentFactorStrings = currentInputLine.split(' ');

    // Ensure that this line also provides two factors for calculation.
    if (currentFactorStrings.length < 2) {
      console.warn(`Warning: Skipping malformed data line at index ${dataRowIndex + 1}. Expected two factors.`);
      continue;
    }

    // Parse the factor strings into numeric values using our helper function.
    const factorX = parseNumericValue(currentFactorStrings[0]);
    const factorY = parseNumericValue(currentFactorStrings[1]);

    // --- Type III Addition: Guard against division by zero. ---
    // If either factor is zero, the calculation for the multiplier would yield Infinity or NaN,
    // which is usually an undesirable state. We'll skip this line's calculation in such cases.
    if (factorX === 0 || factorY === 0) {
      console.warn(`Warning: Factors cannot be zero for calculation on line ${dataRowIndex + 1}. Skipping update.`);
      continue;
    }

    // Calculate the minimum required ratio for both accumulators based on their current values and factors.
    // Introducing intermediate variables (Type III Addition) for better readability of the core logic.
    const ratioNeededForX = accumulatorX / factorX;
    const ratioNeededForY = accumulatorY / factorY;

    // Determine the overall scaling multiplier.
    // This multiplier must be an integer (using Math.ceil) and large enough to satisfy both ratios.
    const scalingMultiplier = Math.ceil(Math.max(ratioNeededForX, ratioNeededForY));

    // Apply the calculated scaling multiplier to update both accumulators to their new values.
    accumulatorX = factorX * scalingMultiplier;
    accumulatorY = factorY * scalingMultiplier;
  }

  // Output the final sum of the two accumulators.
  // This is the primary result expected from the original problem's logic.
  console.log(accumulatorX + accumulatorY);
}

// This section handles reading from standard input and invoking the main processing logic.
// It is part of the typical execution environment for competitive programming and should remain unchanged
// to ensure compatibility with how input is provided. The 'utf8' encoding ensures correct character interpretation.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));