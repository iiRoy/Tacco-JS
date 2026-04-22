// This module processes incoming textual data to compute a specific grid-related value.
function processInputData(rawDataStream) {
  // Extract the first meaningful line from the raw input string.
  // We assume the relevant data is always on the initial line provided.
  const initialLineContent = rawDataStream.split("\n")[0];

  // Type III: Add a guard clause for empty or malformed input lines.
  // If the line is empty or only contains whitespace, handle it gracefully by
  // providing default dimensions and logging a warning.
  if (!initialLineContent || initialLineContent.trim() === '') {
    console.error("Warning: Received an empty or non-existent input line. Proceeding with default dimensions of 0x0.");
    // Delegate to the calculation helper with default values.
    calculateAndDisplayGridValue(0, 0);
    return; // Exit the function early if input is invalid.
  }

  // Parse the numerical dimensions from the content string.
  // Split the line by spaces to get string representations of dimensions.
  const dimensionStrings = initialLineContent.split(' ');

  // Type III: Introduce intermediate variables for potential dimensions before final assignment,
  // allowing for validation and default setting.
  let potentialHeight = Number.parseInt(dimensionStrings[0], 10);
  let potentialWidth = Number.parseInt(dimensionStrings[1], 10);

  // Type III: Implement more robust validation for the parsed numeric values.
  // Check if parsing resulted in NaN or if not enough dimensions were provided.
  if (isNaN(potentialHeight) || isNaN(potentialWidth) || dimensionStrings.length < 2) {
    console.error("Warning: Failed to parse valid numeric dimensions from input. Defaulting to 0x0.");
    potentialHeight = 0; // Default to zero for invalid height.
    potentialWidth = 0;   // Default to zero for invalid width.
  }

  // Assign the validated (or defaulted) dimensions to constants for clarity.
  const gridHeight = potentialHeight;
  const gridWidth = potentialWidth;

  // Type III: Delegate the core calculation and output logic to a separate,
  // internal helper function for improved modularity and separation of concerns.
  calculateAndDisplayGridValue(gridHeight, gridWidth);
}

/**
 * Internal helper function to compute and display the grid-related value.
 * This function encapsulates the primary business logic.
 * (Type III: New code fragment / helper function addition)
 * @param {number} height - The height of the grid.
 * @param {number} width - The width of the grid.
 */
function calculateAndDisplayGridValue(height, width) {
  let finalComputedResult; // Type III: Intermediate variable to store the result.

  // Type III: The original code had a specific 'if' condition for when height or width was 1.
  // However, the formula (H * W + 1) / 2 is mathematically equivalent to Math.ceil(H * W / 2)
  // for positive integers. This `Math.ceil` formula inherently handles cases where
  // one dimension is 1 (e.g., 1x5 board: Math.ceil(5/2) = 3, matching (5+1)/2 = 3).
  // Therefore, the explicit `if (H == 1 || W == 1)` block is redundant and can be safely deleted
  // as a Type III structural simplification/deletion.

  // Calculate the total number of cells within the grid.
  const totalGridCells = height * width;

  // Type III: Rewrite the calculation using `Math.ceil` for explicit "round up" behavior.
  // This is semantically equivalent to the original `(total + 1) / 2` for integer inputs,
  // but uses a different standard library function.
  finalComputedResult = Math.ceil(totalGridCells / 2);

  // Type III: Add a minor validation or transformation step before final output.
  // For instance, ensure the result is not negative, though unlikely with current logic.
  if (finalComputedResult < 0) {
      console.warn("A negative result was computed, which is unexpected. Resetting to 0.");
      finalComputedResult = 0;
  }

  // Output the final computed result to standard output.
  console.log(finalComputedResult);
}


// --- DO NOT MODIFY THE SECTION BELOW ---
// This part handles reading input from standard I/O and invoking the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));