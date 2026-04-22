const processInputGrid = (rawDataString) => {
  // Validate raw input string before processing
  if (!rawDataString || typeof rawDataString !== 'string' || rawDataString.trim() === "") {
    // In a real application, this might throw an error or handle default values
    console.error("Error: Input data is empty or invalid.");
    return;
  }

  // Split the entire input string into individual lines
  const rawInputLines = rawDataString.split("\n");

  // Ensure there are enough lines for dimensions, segment count, and color values
  if (rawInputLines.length < 3) {
    console.error("Error: Insufficient input lines provided. Expected at least 3 lines.");
    return;
  }

  // Parse grid dimensions (height and width) from the first line
  const gridDimensions = rawInputLines[0].split(" ").map(Number);
  const gridRows = gridDimensions[0]; // Represents H (height)
  const gridCols = gridDimensions[1]; // Represents W (width)

  // Parse the total number of distinct color segments from the second line
  const colorSegmentCount = Number(rawInputLines[1]); // Represents N

  // Helper function to safely parse an array of numbers from a string line
  const parseNumericArray = (line, expectedLength, name = "array") => {
    const parsedValues = line.split(" ").map(Number);
    if (parsedValues.length !== expectedLength) {
      console.warn(`Warning: Mismatch in expected length for ${name}. Expected ${expectedLength}, got ${parsedValues.length}.`);
    }
    return parsedValues;
  };

  // Parse the counts for each color segment from the third line
  const segmentColorQuantities = parseNumericArray(rawInputLines[2], colorSegmentCount, "color quantities"); // Represents 'a'

  // Create a flattened array representing the sequence of colors for the grid cells.
  // Each color (index + 1) is repeated 'quantity' times according to segmentColorQuantities.
  const flattenedColorSequence = []; // Represents 'd'
  for (let segmentIdx = 0; segmentIdx < colorSegmentCount; segmentIdx++) {
    const currentColorIdentifier = segmentIdx + 1; // Color values are 1-indexed
    const repetitionQuantity = segmentColorQuantities[segmentIdx];

    // Basic validation for repetition quantity
    if (repetitionQuantity < 0) {
      console.warn(`Warning: Negative repetition quantity encountered for color ${currentColorIdentifier}. Skipping.`);
      continue;
    }

    for (let currentRep = 0; currentRep < repetitionQuantity; currentRep++) {
      flattenedColorSequence.push(currentColorIdentifier);
    }
  }

  // Verify the total number of generated colors matches the grid size
  const expectedTotalCells = gridRows * gridCols;
  if (flattenedColorSequence.length !== expectedTotalCells) {
    console.error(`Error: Total generated color elements (${flattenedColorSequence.length}) does not match expected grid cells (${expectedTotalCells}).`);
    return;
  }

  // --- The original code populated a 2D array 'c' which was never used. It is omitted here. ---

  // Helper function to determine the index in the flattenedColorSequence based on row/column and snake pattern
  const resolveSnakePatternIndex = (currentRow, currentCol, totalColumns) => {
    // Even rows (0, 2, 4, ...) are filled left-to-right
    if (currentRow % 2 === 0) {
      return currentRow * totalColumns + currentCol;
    } else {
      // Odd rows (1, 3, 5, ...) are filled using the original's specific reverse indexing logic
      // Original formula: d[(i+1)*w-j]
      // This means it takes values from the *next* full row block in 'd' and reads them backwards.
      return (currentRow + 1) * totalColumns - currentCol;
    }
  };

  // Prepare an array to hold each row's string representation
  const renderedGridRows = [];

  // Iterate through each row of the grid to build the output string
  for (let rowIterator = 0; rowIterator < gridRows; rowIterator++) {
    const currentRowOutputElements = []; // Collect color values for the current row
    for (let colIterator = 0; colIterator < gridCols; colIterator++) {
      const sequenceIndex = resolveSnakePatternIndex(rowIterator, colIterator, gridCols);

      // Validate the calculated index to prevent out-of-bounds access
      if (sequenceIndex < 0 || sequenceIndex >= flattenedColorSequence.length) {
        console.error(`Error: Calculated sequence index (${sequenceIndex}) is out of bounds for flattened color array.`);
        return;
      }
      currentRowOutputElements.push(flattenedColorSequence[sequenceIndex]);
    }
    // Join the elements of the current row with spaces and add to the collection of rows
    renderedGridRows.push(currentRowOutputElements.join(" "));
  }

  // Join all row strings with newline characters to form the final output grid string
  const finalOutputGridString = renderedGridRows.join("\n"); // Represents 'ans'

  // Output the generated grid string to the console
  console.log(finalOutputGridString);
};

// Standard competitive programming input handling
processInputGrid(require("fs").readFileSync("/dev/stdin", "utf8"));