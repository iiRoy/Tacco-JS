(function(fileSystemModule) {
  // Define constants for the building's structural dimensions.
  // These represent the number of buildings, floors per building, and rooms per floor.
  const TOTAL_BUILDINGS = 4;
  const LEVELS_PER_BUILDING = 3;
  const UNITS_PER_LEVEL = 10;

  /**
   * Creates a new array of a specified length, with all elements initialized to zero.
   * This utility function is crucial for setting up numerical grids or containers.
   *
   * @param {number} desiredLength - The target length for the new array.
   * @returns {number[]} A fresh array filled with zeros. Returns an empty array if length is non-positive.
   */
  const initializeNumericContainer = (desiredLength) => {
    // Implement a basic validation for the input length.
    if (desiredLength <= 0) {
      console.warn("Attempted to create an array with non-positive length. Returning empty array.");
      return [];
    }
    // Using Array.from with a callback for a cleaner and more functional initialization.
    return Array.from({ length: desiredLength }, () => 0);
  };

  /**
   * Processes a series of occupancy adjustments and applies them to a given 3D building grid.
   * Each adjustment record details a specific building, floor, room, and the value to add.
   *
   * @param {Array<Array<Array<number>>>} buildingGrid - The mutable 3D array representing the building layout.
   * @param {Array<Array<number>>} occupancyAdjustments - An array of records; each record should be [building_idx, floor_idx, room_idx, delta_value].
   * @returns {Array<Array<Array<number>>>} The modified building grid after applying all valid adjustments.
   */
  const applyOccupancyChanges = (buildingGrid, occupancyAdjustments) => {
    // Introduce a guard clause for scenarios where no adjustments are provided.
    if (!occupancyAdjustments || occupancyAdjustments.length === 0) {
      console.info("No occupancy adjustment records were supplied. Building grid remains unchanged.");
      return buildingGrid;
    }

    // Iterate over each adjustment record. Using forEach as we're performing side effects
    // (modifying `buildingGrid`) and not generating a new array.
    occupancyAdjustments.forEach(currentRecord => {
      // Validate the structure of the current record. It must contain at least 4 numerical elements.
      if (currentRecord.length < 4 || !currentRecord.every(val => typeof val === 'number')) {
        console.error(`Skipping malformed or incomplete record: ${currentRecord}. Expected [b, f, r, val].`);
        return; // Move to the next record if invalid.
      }

      // Extract and convert 1-based indices from the record to 0-based for array access.
      const targetBuildingIndex = currentRecord[0] - 1;
      const targetFloorIndex = currentRecord[1] - 1;
      const targetRoomIndex = currentRecord[2] - 1;
      const adjustmentValue = currentRecord[3];

      // Perform boundary checks to ensure indices are within the valid range of the building grid.
      if (
        targetBuildingIndex < 0 || targetBuildingIndex >= TOTAL_BUILDINGS ||
        targetFloorIndex < 0 || targetFloorIndex >= LEVELS_PER_BUILDING ||
        targetRoomIndex < 0 || targetRoomIndex >= UNITS_PER_LEVEL
      ) {
        console.warn(`Occupancy record with out-of-bounds indices detected: B:${currentRecord[0]}, F:${currentRecord[1]}, R:${currentRecord[2]}. Skipping this adjustment.`);
        return; // Skip this record if indices are invalid.
      }

      // Apply the numerical adjustment to the specified room in the grid.
      buildingGrid[targetBuildingIndex][targetFloorIndex][targetRoomIndex] += adjustmentValue;
    });

    // Return the updated building grid.
    return buildingGrid;
  };

  /**
   * Parses a single string line into an array of numbers.
   * This is a reusable helper for input processing.
   *
   * @param {string} lineContent - The string line to parse.
   * @returns {number[]} An array of numbers extracted from the line.
   */
  const convertLineToNumericArray = (lineContent) => {
    return lineContent.split(' ').map(Number);
  };

  /**
   * Renders the final state of the building grid to the console in a structured format.
   * This function enhances readability compared to a raw array dump.
   *
   * @param {Array<Array<Array<number>>>} finalGridState - The 3D array representing the building's final state.
   */
  const renderBuildingReport = (finalGridState) => {
    let reportLines = []; // Accumulate output lines in an array for efficient string concatenation.

    for (let b = 0; b < TOTAL_BUILDINGS; b++) {
      // Add a distinct separator between each building's report, except for the first one.
      if (b > 0) {
        reportLines.push('####################'); // A visual separator.
      }
      for (let f = 0; f < LEVELS_PER_BUILDING; f++) {
        // Join the room occupancy values for the current floor with spaces.
        reportLines.push(finalGridState[b][f].join(' '));
      }
    }
    // Output the entire formatted report.
    console.log(reportLines.join('\n'));
  };

  // --- Core Application Logic ---

  // Safely read the entire content from standard input using the provided fileSystemModule.
  const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

  // Pre-process the raw input: trim whitespace and split into individual lines.
  const inputContentLines = rawInputData.trim().split('\n');

  // Transform each content line into an array of numbers using our helper function.
  const processedInputRecords = inputContentLines.map(convertLineToNumericArray);

  // The first record is commonly metadata (like a count of subsequent records) and is not used
  // in the original problem's logic, so we explicitly remove and discard it.
  const initialMetaData = processedInputRecords.shift();
  // Optional: console.log(`Discarded initial metadata/count: ${initialMetaData}`);

  // Construct the 3D building grid, initialized with all room occupancies at zero.
  // This involves nested mapping with our initialization utility.
  const mainBuildingStructure = initializeNumericContainer(TOTAL_BUILDINGS).map(() =>
    initializeNumericContainer(LEVELS_PER_BUILDING).map(() =>
      initializeNumericContainer(UNITS_PER_LEVEL)
    )
  );

  // Execute the process of updating the building structure with all parsed occupancy changes.
  const resultantBuildingState = applyOccupancyChanges(mainBuildingStructure, processedInputRecords);

  // Present the final state of the building in a readable format.
  renderBuildingReport(resultantBuildingState);

})(require('fs')); // Inject the 'fs' (file system) module into the IIFE for controlled access.