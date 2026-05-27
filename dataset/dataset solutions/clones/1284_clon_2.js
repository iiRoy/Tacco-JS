(function(inputSource) {
  /**
   * Creates a new array of a specified length, with all elements initialized to zero.
   * @param {number} arrayLength The desired number of elements in the array.
   * @returns {Array<number>} A new array filled with zeros.
   */
  function createZeroFilledArray(arrayLength) {
    let zeroArray = [];
    for (let elementIndex = 0; elementIndex < arrayLength; elementIndex++) {
      zeroArray.push(0);
    }
    return zeroArray;
  }

  /**
   * Applies a series of occupancy changes to a multi-dimensional building structure.
   * Each change entry specifies a 1-indexed location (building, floor, room) and an amount to add.
   *
   * @param {Array<Array<Array<number>>>} buildingLayout A 3D array representing the building's current occupancy.
   * @param {Array<Array<number>>>} occupancyUpdates An array of arrays, where each inner array is
   *   [building_number, floor_number, room_number, change_value].
   * @returns {Array<Array<Array<number>>>} The modified building layout after applying all updates.
   */
  function applyOccupancyUpdates(buildingLayout, occupancyUpdates) {
    occupancyUpdates.map(function(updateEntry) {
      // Adjusting 1-indexed input coordinates to 0-indexed array positions.
      buildingLayout[updateEntry[0] - 1][updateEntry[1] - 1][updateEntry[2] - 1] += updateEntry[3];
      return updateEntry; // The return value of map is not used, but structure is preserved.
    });
    return buildingLayout;
  }

  // Read raw input from the provided source, convert it to a string,
  // remove leading/trailing whitespace, and split it into individual lines.
  const rawInputLines = inputSource.toString().trim().split('\n');

  // Process each line of the raw input: split by space and convert each part to a number.
  const processedNumericData = rawInputLines.map(function(currentLine) {
    return currentLine.split(' ').map(Number);
  });

  // Initialize a 3D array to represent the building structure.
  // It has 4 main sections, each with 3 levels, and each level has 10 units.
  // All units are initially set to zero occupancy.
  const buildingStructure = createZeroFilledArray(4).map(function() {
    return createZeroFilledArray(3).map(function() {
      return createZeroFilledArray(10);
    });
  });

  // Remove the first element from the processed data, as it often contains metadata
  // (e.g., the number of subsequent entries) which is not used in this calculation.
  processedNumericData.shift();

  // Apply the occupancy updates to the initialized building structure
  // and then print the final state of the building to the console.
  console.log(applyOccupancyUpdates(buildingStructure, processedNumericData));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
