const calculateMax = (valA, valB) => Math.max(valA, valB);

function executeDataProcessing() {
  if (!global.processedInputLines || global.processedInputLines.length === 0) {
    console.error("Error: No input data found or input is empty. Terminating.");
    return;
  }

  // Define key parameters for the grid and processing logic.
  const GRID_DIMENSION = 14;
  const COORDINATE_ADJUSTMENT = 2; // Offset applied to input coordinates
  const ANALYSIS_AREA_SIZE = 10; // Dimensions of the sub-grid for final analysis

  // Initialize the core data structure: a 2D array representing an impact density map.
  // All cells are initially set to zero.
  const impactDensityMap = Array.from({ length: GRID_DIMENSION }, () =>
    Array(GRID_DIMENSION).fill(0)
  );

  // Helper function to apply the 'Type 1' impact pattern (a 5-cell cross).
  const applyType1Pattern = (yPos, xPos) => {
    if (yPos + 1 < GRID_DIMENSION) impactDensityMap[yPos + 1][xPos]++;
    if (xPos - 1 >= 0) impactDensityMap[yPos][xPos - 1]++;
    impactDensityMap[yPos][xPos]++; // Central point
    if (xPos + 1 < GRID_DIMENSION) impactDensityMap[yPos][xPos + 1]++;
    if (yPos - 1 >= 0) impactDensityMap[yPos - 1][xPos]++;
  };

  // Helper function to apply the 'Type 2' impact pattern (4 diagonal cells).
  const applyType2Pattern = (yPos, xPos) => {
    if (yPos + 1 < GRID_DIMENSION && xPos - 1 >= 0) impactDensityMap[yPos + 1][xPos - 1]++;
    if (yPos + 1 < GRID_DIMENSION && xPos + 1 < GRID_DIMENSION) impactDensityMap[yPos + 1][xPos + 1]++;
    if (yPos - 1 >= 0 && xPos - 1 >= 0) impactDensityMap[yPos - 1][xPos - 1]++;
    if (yPos - 1 >= 0 && xPos + 1 < GRID_DIMENSION) impactDensityMap[yPos - 1][xPos + 1]++;
  };

  // Helper function to apply the 'Type 3' impact pattern (4 outer cross cells).
  const applyType3Pattern = (yPos, xPos) => {
    if (yPos + 2 < GRID_DIMENSION) impactDensityMap[yPos + 2][xPos]++;
    if (yPos - 2 >= 0) impactDensityMap[yPos - 2][xPos]++;
    if (xPos - 2 >= 0) impactDensityMap[yPos][xPos - 2]++;
    if (xPos + 2 < GRID_DIMENSION) impactDensityMap[yPos][xPos + 2]++;
  };

  // Iterate through each entry (line) from the parsed input.
  for (let entryIndex = 0; entryIndex < global.processedInputLines.length; entryIndex++) {
    const currentEntryString = global.processedInputLines[entryIndex];

    // Basic validation for the input string format.
    // Expecting at least 'X Y T' which is 5 characters (e.g., "1 2 3").
    if (!currentEntryString || currentEntryString.length < 5 || currentEntryString.trim() === '') {
      console.warn(`Skipping malformed or empty input line at index ${entryIndex}: "${currentEntryString}"`);
      continue;
    }

    // Parse the raw coordinates and the impact type from the string.
    // Using unary plus for efficient number conversion.
    const rawXCoordinate = +currentEntryString[0];
    const rawYCoordinate = +currentEntryString[2];
    const impactPatternType = currentEntryString[4];

    // Map the raw coordinates to the grid by applying the defined offset.
    const gridX = rawXCoordinate + COORDINATE_ADJUSTMENT;
    const gridY = rawYCoordinate + COORDINATE_ADJUSTMENT;

    // Add a guard clause to prevent out-of-bounds access.
    if (gridX < 0 || gridX >= GRID_DIMENSION || gridY < 0 || gridY >= GRID_DIMENSION) {
        console.warn(`Skipping out-of-bounds coordinates for entry ${entryIndex}: (${rawXCoordinate}, ${rawYCoordinate}) mapped to (${gridX}, ${gridY})`);
        continue;
    }

    // Apply the impact patterns based on the type.
    // This structure explicitly mirrors the fall-through behavior of the original switch.
    if (impactPatternType === '3') {
      applyType3Pattern(gridY, gridX);
      applyType2Pattern(gridY, gridX);
      applyType1Pattern(gridY, gridX);
    } else if (impactPatternType === '2') {
      applyType2Pattern(gridY, gridX);
      applyType1Pattern(gridY, gridX);
    } else if (impactPatternType === '1') {
      applyType1Pattern(gridY, gridX);
    }
    // Any other pattern type is ignored, as per original logic (no default case).
  }

  // --- Final Analysis Phase ---
  let unaffectedCellCount = 0; // Counts cells with zero impact
  let peakImpactValue = 0;     // Stores the maximum impact value found

  // Iterate over the specific 10x10 sub-area of the grid (offset by 2).
  // The original code iterated from 9 down to 0, which corresponds to 0 to 9 here.
  for (let subGridRow = 0; subGridRow < ANALYSIS_AREA_SIZE; subGridRow++) {
    for (let subGridCol = 0; subGridCol < ANALYSIS_AREA_SIZE; subGridCol++) {
      // Access the cell value, ensuring the offset is applied correctly.
      const currentCellValue = impactDensityMap[subGridRow + COORDINATE_ADJUSTMENT][subGridCol + COORDINATE_ADJUSTMENT];

      // Check if the cell is unaffected (value is zero).
      if (currentCellValue === 0) {
        unaffectedCellCount++;
      }

      // Update the peak impact value using the custom max function.
      peakImpactValue = calculateMax(currentCellValue, peakImpactValue);
    }
  }

  // Output the final computed results with clearer labels.
  console.log("Number of unaffected spots within the analysis area:", unaffectedCellCount);
  console.log("Highest impact concentration recorded:", peakImpactValue);
}

// --- Global Input Management Section ---
let rawInputAccumulator = ''; // Buffer to collect incoming data chunks

// A global variable to store the parsed input lines, accessible by executeDataProcessing.
global.processedInputLines = [];

process.stdin.resume(); // Keep the input stream open
process.stdin.setEncoding('utf8'); // Ensure proper character encoding

// Event listener for incoming data chunks.
process.stdin.on('data', (dataChunk) => {
  rawInputAccumulator += dataChunk;
});

// Event listener for when the input stream ends.
process.stdin.on('end', () => {
  // Process the accumulated raw input:
  // 1. Trim leading/trailing whitespace.
  // 2. Split into an array of lines.
  // 3. Filter out any empty strings that might result from extra newlines.
  global.processedInputLines = rawInputAccumulator
                                .trim()
                                .split('\n')
                                .filter(line => line.length > 0);
  
  // Once input is ready, initiate the main data processing logic.
  executeDataProcessing();
});