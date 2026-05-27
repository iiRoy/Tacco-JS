function ProcessInput(rawData) {
  // Process the raw input string: trim whitespace and split into lines.
  let processedLines = rawData.trim().split("\n");

  // Parse the grid size from the first line.
  let gridSize = parseInt(processedLines[0], 10);

  // Parse the sequence of seat numbers from the second line.
  // Each number represents a seat being removed in that order.
  let seatRemovalOrder = processedLines[1].split(" ").map((strValue) => parseInt(strValue, 10));

  // Initialize a 2D array (grid) to represent the seating arrangement.
  // Each cell will initially hold its seat number, or 0 if empty.
  let seatingArrangement = new Array(gridSize);
  for (let currentGridRow = 0; currentGridRow < gridSize; currentGridRow++) {
    seatingArrangement[currentGridRow] = new Array(gridSize);
  }

  // A counter for the total "dislike" value accumulated.
  let totalDislikeValue = 0;

  // A map to quickly find the 1-based (row, column) coordinates for any given seat number.
  let seatLocationMap = {};

  // Populate the initial seating arrangement and the coordinate map.
  // Seat numbers are 1-indexed, while array indices are 0-indexed.
  for (let rNum = 1; rNum <= gridSize; rNum++) {
    for (let cNum = 1; cNum <= gridSize; cNum++) {
      let currentSeatIdentifier = (rNum - 1) * gridSize + 1 + (cNum - 1);
      seatingArrangement[rNum - 1][cNum - 1] = currentSeatIdentifier;
      seatLocationMap[currentSeatIdentifier] = [rNum, cNum];
    }
  }

  // Iterate through the grid positions, simulating the removal of seats
  // according to the `seatRemovalOrder` array.
  for (let rIter = 1; rIter <= gridSize; rIter++) {
    for (let cIter = 1; cIter <= gridSize; cIter++) {
      // Calculate the 0-based index in the `seatRemovalOrder` array
      // corresponding to the current (rIter, cIter) grid position.
      let orderArrayIndex = (rIter - 1) * gridSize + (cIter - 1);

      // Get the actual seat number that is being removed at this step.
      let seatToRemove = seatRemovalOrder[orderArrayIndex];

      // Retrieve the 1-based row and column of the seat being removed from the map.
      let removedSeatRow = seatLocationMap[seatToRemove][0];
      let removedSeatCol = seatLocationMap[seatToRemove][1];

      // Mark the seat as empty (0) in the seating grid.
      seatingArrangement[removedSeatRow - 1][removedSeatCol - 1] = 0;

      // If the removed seat is on the border of the grid, it does not contribute
      // to the "dislike" value, so we skip further calculations for this seat.
      if (removedSeatRow === 1 || removedSeatCol === 1 || removedSeatRow === gridSize || removedSeatCol === gridSize) {
        continue; // Move to the next seat in the iteration.
      } else {
        // Initialize counters for non-empty seats in each of the four cardinal directions.
        let countOccupiedLeft = 0;
        let countOccupiedRight = 0;
        let countOccupiedUp = 0;
        let countOccupiedDown = 0;

        // Count occupied seats to the "left" (decreasing row index).
        for (let tempRowIndexA = removedSeatRow; tempRowIndexA > 0; tempRowIndexA--) {
          if (seatingArrangement[tempRowIndexA - 1][removedSeatCol - 1] !== 0) {
            countOccupiedLeft++;
          }
        }
        // Count occupied seats to the "right" (increasing row index).
        for (let tempRowIndexB = removedSeatRow; tempRowIndexB <= gridSize; tempRowIndexB++) {
          if (seatingArrangement[tempRowIndexB - 1][removedSeatCol - 1] !== 0) {
            countOccupiedRight++;
          }
        }
        // Count occupied seats "up" (decreasing column index).
        for (let tempColIndexC = removedSeatCol; tempColIndexC > 0; tempColIndexC--) {
          if (seatingArrangement[removedSeatRow - 1][tempColIndexC - 1] !== 0) {
            countOccupiedUp++;
          }
        }
        // Count occupied seats "down" (increasing column index).
        for (let tempColIndexD = removedSeatCol; tempColIndexD <= gridSize; tempColIndexD++) {
          if (seatingArrangement[removedSeatRow - 1][tempColIndexD - 1] !== 0) {
            countOccupiedDown++;
          }
        }

        // Add the minimum of the four counts to the total dislike value.
        totalDislikeValue += Math.min(countOccupiedLeft, countOccupiedRight, countOccupiedUp, countOccupiedDown);
      }
    }
  }

  // Output the final calculated total dislike value.
  console.log(totalDislikeValue);
}

// Read input from standard input using Node.js file system module
// and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
