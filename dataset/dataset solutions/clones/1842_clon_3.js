// Function responsible for orchestrating grid data processing and score calculation.
function processGridData(rawData) {
  // Define constants for clearer code and easier modification.
  const OCCUPIED_CELL_VALUE = 0; // Represents a cell that has been 'removed' or 'taken'.
  const ZERO_INDEX_ADJUSTMENT = 1; // Used for converting between 0-based and 1-based indexing.

  // A small utility function for parsing numeric values from strings.
  const safelyParseNumber = (text) => Number(text);

  // Parse the raw input string into an array of individual lines, removing extra whitespace.
  const inputLines = rawData.trim().split("\n");

  // Extract the grid dimension (N) from the first line of input.
  const gridDimension = safelyParseNumber(inputLines[0]);

  // Implement a basic validation check for the grid dimension (Type III addition).
  if (gridDimension <= 0) {
    console.error("Error: Grid dimension must be a positive integer.");
    // In a real application, you might throw an error or handle it more robustly.
    return;
  }

  // Parse the second line of input into an array of integers,
  // representing the sequence in which elements are processed.
  const elementPlacementSequence = inputLines[1].split(" ").map(safelyParseNumber);

  // Initialize a 2D array to represent the state of the grid.
  // Each cell will initially hold its unique identifier, later set to OCCUPIED_CELL_VALUE.
  const gridOccupancyState = Array.from({ length: gridDimension }, () =>
    Array(gridDimension).fill(0)
  );

  // Create a lookup table (object) to quickly find the 1-based [row, column]
  // coordinates for any given cell identifier (1 to N*N).
  const cellIdToCoordinates = {};

  // Populate the initial grid with sequential identifiers (1 to N*N)
  // and build the coordinate lookup table.
  for (let r = 0; r < gridDimension; r++) {
    for (let c = 0; c < gridDimension; c++) {
      const currentCellIdentifier = r * gridDimension + c + ZERO_INDEX_ADJUSTMENT;
      gridOccupancyState[r][c] = currentCellIdentifier; // Store the identifier in the grid.
      cellIdToCoordinates[currentCellIdentifier.toString()] = [
        r + ZERO_INDEX_ADJUSTMENT, // 1-based row
        c + ZERO_INDEX_ADJUSTMENT, // 1-based column
      ];
    }
  }

  // Initialize a variable to accumulate the total discomfort score.
  let overallDiscomfortScore = 0;

  // Iterate through each element in the predefined placement sequence.
  // This loop structure processes elements one by one as they are 'removed' from the grid.
  for (let sequenceIndex = 0; sequenceIndex < elementPlacementSequence.length; sequenceIndex++) {
    const valueBeingProcessed = elementPlacementSequence[sequenceIndex];

    // Retrieve the original 1-based grid coordinates for the current element.
    const [originalRow1Based, originalCol1Based] =
      cellIdToCoordinates[valueBeingProcessed.toString()];

    // Convert 1-based coordinates to 0-based for array access.
    const currentRow0Based = originalRow1Based - ZERO_INDEX_ADJUSTMENT;
    const currentCol0Based = originalCol1Based - ZERO_INDEX_ADJUSTMENT;

    // Mark the current cell as 'occupied' in the grid state.
    gridOccupancyState[currentRow0Based][currentCol0Based] = OCCUPIED_CELL_VALUE;

    // Determine if the current element is located on any of the grid's borders.
    const isOnBorder =
      originalRow1Based === ZERO_INDEX_ADJUSTMENT ||
      originalCol1Based === ZERO_INDEX_ADJUSTMENT ||
      originalRow1Based === gridDimension ||
      originalCol1Based === gridDimension;

    // If the element is on a border, it does not contribute to the discomfort score.
    // Skip further calculations for this element (Type III: removed `+= 0`).
    if (isOnBorder) {
      continue;
    }

    // Initialize counters for available (non-occupied) cells in each cardinal direction.
    let countNorthAvailable = 0;
    let countSouthAvailable = 0;
    let countWestAvailable = 0;
    let countEastAvailable = 0;

    // Scan cells directly above (North) the current position.
    for (let rScan = currentRow0Based - 1; rScan >= 0; rScan--) {
      if (gridOccupancyState[rScan][currentCol0Based] !== OCCUPIED_CELL_VALUE) {
        countNorthAvailable++;
      }
    }

    // Scan cells directly below (South) the current position.
    for (let rScan = currentRow0Based + 1; rScan < gridDimension; rScan++) {
      if (gridOccupancyState[rScan][currentCol0Based] !== OCCUPIED_CELL_VALUE) {
        countSouthAvailable++;
      }
    }

    // Scan cells directly to the left (West) of the current position.
    for (let cScan = currentCol0Based - 1; cScan >= 0; cScan--) {
      if (gridOccupancyState[currentRow0Based][cScan] !== OCCUPIED_CELL_VALUE) {
        countWestAvailable++;
      }
    }

    // Scan cells directly to the right (East) of the current position.
    for (let cScan = currentCol0Based + 1; cScan < gridDimension; cScan++) {
      if (gridOccupancyState[currentRow0Based][cScan] !== OCCUPIED_CELL_VALUE) {
        countEastAvailable++;
      }
    }

    // Add the minimum count of available cells in any of the four directions
    // to the total discomfort score.
    overallDiscomfortScore += Math.min(
      countNorthAvailable,
      countSouthAvailable,
      countWestAvailable,
      countEastAvailable
    );
  }

  // Output the final calculated overall discomfort score.
  console.log(overallDiscomfortScore);
}

// Execute the grid processing function with input read from standard input.
processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));