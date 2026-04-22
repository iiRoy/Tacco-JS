/*
 * This JavaScript module processes grid-based input.
 * Its purpose is to compute a specific metric related to seating arrangements.
 */
function ProcessInputData(rawDataContent) {
  // Normalize the input string by removing leading/trailing whitespace
  // and then splitting it into an array of lines.
  let processedLines = rawDataContent.trim().split("\n");

  // The first line contains the dimension of the square grid.
  const gridDimension = parseInt(processedLines[0], 10);

  // The second line contains a space-separated sequence of seat identifiers.
  // These are parsed into an array of numbers.
  let seatPermutation = processedLines[1].split(" ").map((valStr) => parseInt(valStr, 10));

  // Initialize a two-dimensional array to represent the seating layout.
  // This structure will hold seat numbers or a zero if a seat is considered 'removed'.
  let seatingLayout = new Array(gridDimension);

  // A cumulative counter for the 'unfavorable' condition.
  let totalUnfavorableInstances = 0;

  // Populate each row of the seating layout with new arrays.
  for (let rIdx = 0; rIdx < gridDimension; rIdx++) {
    seatingLayout[rIdx] = new Array(gridDimension);
  }

  // A lookup table (map) to quickly find the (row, column) coordinates
  // for any given seat number. Keys are seat numbers (as strings), values are [row, col].
  let coordinateMapping = {};

  // First pass: Fill the seating layout with sequential seat numbers
  // and simultaneously populate the coordinate lookup map.
  for (let currentR = 1; currentR <= gridDimension; currentR++) {
    for (let currentC = 1; currentC <= gridDimension; currentC++) {
      // Calculate a unique seat number for the current 1-based (row, column) position.
      let calculatedSeatNumber = (currentR - 1) * gridDimension + 1 + (currentC - 1);

      // Assign this seat number to its corresponding 0-based position in the grid.
      seatingLayout[currentR - 1][currentC - 1] = calculatedSeatNumber;

      // Convert the seat number to a string to use as a key in the map.
      let seatIdentifierKey = calculatedSeatNumber.toString(10);

      // Store the 1-based (row, column) coordinates for this seat number.
      coordinateMapping[seatIdentifierKey] = [currentR, currentC];
    }
  }

  // Second pass: Iterate through the grid positions, processing seats
  // according to the permutation sequence.
  for (let currentR = 1; currentR <= gridDimension; currentR++) {
    for (let currentC = 1; currentC <= gridDimension; currentC++) {
      // Determine the 0-based index in the permutation array for the current grid position.
      let permIndex = (currentR - 1) * gridDimension + (currentC - 1);

      // Retrieve the seat number that is to be 'removed' at this step
      // from the pre-defined permutation sequence.
      let seatToRemove = seatPermutation[permIndex];

      // Use the lookup map to find the actual 1-based (row, column)
      // of the seat identified by 'seatToRemove'.
      let actualSeatRow = coordinateMapping[seatToRemove][0];
      let actualSeatCol = coordinateMapping[seatToRemove][1];

      // Mark this seat as 'removed' in the seating layout by setting its value to 0.
      seatingLayout[actualSeatRow - 1][actualSeatCol - 1] = 0;

      // Check if the removed seat is located on any of the grid's borders.
      if (actualSeatRow === 1 || actualSeatCol === 1 || actualSeatRow === gridDimension || actualSeatCol === gridDimension) {
        // Border seats do not contribute to the unfavorable count, so add zero.
        totalUnfavorableInstances += 0;
        continue; // Proceed to the next seat in the sequence.
      } else {
        // For non-border seats, calculate the number of available (non-zero)
        // seats in each of the four cardinal directions.

        let verticalUpCount = 0;     // Count of available seats in the 'up' direction (decreasing row index).
        let verticalDownCount = 0;   // Count of available seats in the 'down' direction (increasing row index).
        let horizontalLeftCount = 0; // Count of available seats in the 'left' direction (decreasing column index).
        let horizontalRightCount = 0; // Count of available seats in the 'right' direction (increasing column index).

        // Scan vertically upwards from the current seat's row (exclusive), towards row 1.
        for (let rScan = actualSeatRow - 1; rScan > 0; rScan--) {
          if (seatingLayout[rScan - 1][actualSeatCol - 1] !== 0) {
            verticalUpCount++;
          }
        }

        // Scan vertically downwards from the current seat's row (exclusive), towards the last row.
        for (let rScan = actualSeatRow + 1; rScan <= gridDimension; rScan++) {
          if (seatingLayout[rScan - 1][actualSeatCol - 1] !== 0) {
            verticalDownCount++;
          }
        }

        // Scan horizontally to the left from the current seat's column (exclusive), towards column 1.
        for (let cScan = actualSeatCol - 1; cScan > 0; cScan--) { // cScan is 1-based column
          if (seatingLayout[actualSeatRow - 1][cScan - 1] !== 0) {
            horizontalLeftCount++;
          }
        }

        // Scan horizontally to the right from the current seat's column (exclusive), towards the last column.
        for (let cScan = actualSeatCol + 1; cScan <= gridDimension; cScan++) { // cScan is 1-based column
          if (seatingLayout[actualSeatRow - 1][cScan - 1] !== 0) {
            horizontalRightCount++;
          }
        }

        // Add the minimum count found among the four directions to the total unfavorable instances.
        totalUnfavorableInstances += Math.min(verticalUpCount, verticalDownCount, horizontalLeftCount, horizontalRightCount);
      }
    }
  }

  // Print the final calculated count of unfavorable instances to the console.
  console.log(totalUnfavorableInstances);
}

// Read the entire content from standard input synchronously using Node.js filesystem module.
// The content is expected to be UTF-8 encoded.
// Then, pass this raw content to the main processing function.
ProcessInputData(require("node:fs").readFileSync("/dev/stdin", "utf-8"));