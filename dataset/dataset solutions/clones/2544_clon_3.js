const processMatrixGeneration = (sourceText) => {
  // Use "let" for variables that might be reassigned or for loop counters
  // Renamed 'input' to 'sourceText' for clarity
  const lineSegments = sourceText.split("\n");

  // Add a guard clause for empty or invalid input
  if (!lineSegments || lineSegments.length === 0) {
    // In a real application, this might throw an error or log to stderr
    console.error("Input data is empty or invalid. Exiting.");
    return;
  }

  // Extract and parse the first line containing dimensions
  // Renamed 'temp' to 'lineSegments', 'hwab' to 'dimensionValues'
  const rawDimensionString = lineSegments.shift();
  if (!rawDimensionString) { // Another guard for empty first line
    console.error("Dimension string is missing. Exiting.");
    return;
  }

  // Using Number constructor as a shorthand for parseInt
  const dimensionValues = rawDimensionString.split(" ").map(Number);

  // Validate the number of parameters and check for NaN values
  if (dimensionValues.length !== 4 || dimensionValues.some(isNaN)) {
    console.error("Invalid dimension parameters provided. Expected 4 numbers.");
    return;
  }

  // Destructure for better readability, renamed variables
  const [heightVal, widthVal, onesWidth, onesHeight] = dimensionValues;

  // Add validation for positive dimensions
  if (heightVal <= 0 || widthVal <= 0 || onesWidth < 0 || onesHeight < 0) {
    console.log("Input dimensions must be positive, block sizes non-negative.");
    console.log("No"); // Output "No" as per problem context for invalid states
    return;
  }

  // --- Handle special cases first with early returns ---

  // Case 1: The '1' block height (onesHeight) is zero
  if (onesHeight === 0) {
    // Generate the row pattern: 'onesWidth' ones followed by zeros
    const initialOnesSegment = '1'.repeat(onesWidth);
    const trailingZerosSegment = '0'.repeat(widthVal - onesWidth);
    const completeRowPattern = initialOnesSegment + trailingZerosSegment;

    // Print this pattern for all rows
    for (let rowIndex = 0; rowIndex < heightVal; ++rowIndex) {
      console.log(completeRowPattern);
    }
    return; // Exit function after handling this case
  }

  // Case 2: The '1' block width (onesWidth) is zero
  else if (onesWidth === 0) {
    const allZerosRow = '0'.repeat(widthVal);
    const allOnesRow = '1'.repeat(widthVal);

    // Print all-zeros for 'onesHeight' rows, then all-ones for the rest
    for (let rowIndex = 0; rowIndex < heightVal; ++rowIndex) {
      if (rowIndex < onesHeight) {
        console.log(allZerosRow);
      } else {
        console.log(allOnesRow);
      }
    }
    return; // Exit function
  }

  // Case 3: Check for fundamental incompatibility (h * a !== w * b)
  // This condition means a periodic pattern cannot be formed
  else if (heightVal * onesWidth !== widthVal * onesHeight) {
    console.log("No");
    return; // Exit function
  }

  // --- General case: h * a === w * b and a, b > 0 ---

  // Helper function to construct a single row based on the complex logic
  const constructMatrixRow = (
    currentRowIndex,
    totalColumns,
    blockWidth,
    blockHeight,
    isWidthDivisibleByBlockWidth
  ) => {
    // Initialize an array of characters, then join at the end for efficiency
    // This is a structural change from direct string concatenation
    const rowCharacters = Array(totalColumns).fill('0');

    if (isWidthDivisibleByBlockWidth) {
      // Subcase A: Total width is a multiple of block width (simpler pattern)
      const currentBlockGroupIndex = Math.floor(currentRowIndex / blockHeight);
      const startColumnPosition = currentBlockGroupIndex * blockWidth;
      // Ensure the end position doesn't exceed the total width
      const endColumnPosition = Math.min(
        (currentBlockGroupIndex + 1) * blockWidth,
        totalColumns
      );

      // Fill the '1's in the calculated range
      for (let col = startColumnPosition; col < endColumnPosition; ++col) {
        rowCharacters[col] = '1';
      }
    } else {
      // Subcase B: Total width is NOT a multiple of block width (wrapping pattern)
      const columnShiftOffset = (currentRowIndex * blockWidth) % totalColumns;
      const effectiveBlockEnd = columnShiftOffset + blockWidth;

      if (effectiveBlockEnd > totalColumns) {
        // The block of '1's wraps around the end of the row
        // Part 1: from the offset to the end of the row
        for (let col = columnShiftOffset; col < totalColumns; ++col) {
          rowCharacters[col] = '1';
        }
        // Part 2: from the beginning of the row up to the wrapped-around end
        for (let col = 0; col < effectiveBlockEnd % totalColumns; ++col) {
          rowCharacters[col] = '1';
        }
      } else {
        // The block of '1's does not wrap around
        for (let col = columnShiftOffset; col < effectiveBlockEnd; ++col) {
          rowCharacters[col] = '1';
        }
      }
    }
    return rowCharacters.join('');
  };

  // Determine if matrix width is divisible by 'onesWidth' once
  const widthIsMultipleOfOnesWidth = (widthVal % onesWidth === 0);

  // Iterate through each row to generate and print the pattern
  for (let currentOutputRowIndex = 0; currentOutputRowIndex < heightVal; ++currentOutputRowIndex) {
    const outputLineString = constructMatrixRow(
      currentOutputRowIndex,
      widthVal,
      onesWidth,
      onesHeight,
      widthIsMultipleOfOnesWidth
    );
    console.log(outputLineString);
  }
};

// Standard input reading mechanism, remains largely unchanged as it's environment-specific
processMatrixGeneration(require("fs").readFileSync("/dev/stdin", "utf8"));