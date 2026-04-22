function ProcessInput(rawData) {
  // Cleanse and segment the incoming textual data
  rawData = rawData.trim().split('\n');

  // Extract the grid dimension from the first line
  const gridSize = parseInt(rawData[0], 10);

  // Parse the sequence of operations from the second line
  const sequenceOrder = rawData[1].split(' ').map((valStr) => parseInt(valStr, 10));

  // Initialize a 2D array to represent the seating arrangement
  const seatGrid = new Array(gridSize);
  // Initialize a counter for 'unfavorable' placements
  let unfavorableCount = 0;

  // Allocate inner arrays for the 2D grid
  for (let rowIdx = 0; rowIdx < gridSize; rowIdx++) {
    seatGrid[rowIdx] = new Array(gridSize);
  }

  // Create a mapping from seat number to its (row, column) coordinates
  const positionMap = {};

  // Populate the initial seat grid with sequential numbers
  // and store their coordinates in the map
  for (let currentR = 1; currentR <= gridSize; currentR++) {
    for (let currentC = 1; currentC <= gridSize; currentC++) {
      // Calculate the unique seat identifier
      const seatNumber = (currentR - 1) * gridSize + 1 + (currentC - 1);
      // Assign the seat number to its grid position (0-indexed)
      seatGrid[currentR - 1][currentC - 1] = seatNumber;
      // Convert the number to a string for map key
      const numStr = seatNumber.toString(10);
      // Store the 1-indexed coordinates for this seat number
      positionMap[numStr] = [currentR, currentC];
    }
  }

  // Process each seat in the grid based on the sequence order
  for (let currentR = 1; currentR <= gridSize; currentR++) {
    for (let currentC = 1; currentC <= gridSize; currentC++) {
      // Calculate the 0-indexed position in the flat sequence array
      const arrayIndex = (currentR - 1) * gridSize + (currentC - 1);
      // Retrieve the seat value from the predefined sequence
      const currentSeatVal = sequenceOrder[arrayIndex];
      // Get the 1-indexed coordinates of this seat from the map
      const [targetR, targetC] = positionMap[currentSeatVal.toString()];

      // Mark the current seat as 'vacated' (0) in the grid
      seatGrid[targetR - 1][targetC - 1] = 0;

      // Check if the current seat is on the border of the grid
      if (targetR === 1 || targetC === 1 || targetR === gridSize || targetC === gridSize) {
        // Border seats always have 0 unfavorable count (no 'inner' neighbors)
        unfavorableCount += 0;
        continue; // Move to the next seat in the sequence
      } else {
        // If not on the border, calculate available neighbors
        let countLeft = 0;
        let countRight = 0;
        let countUp = 0;
        let countDown = 0;

        // Count available seats to the left (decreasing row index)
        for (let tempR = targetR - 1; tempR > 0; tempR--) {
          if (seatGrid[tempR - 1][targetC - 1] !== 0) countLeft++;
        }
        // Count available seats to the right (increasing row index)
        for (let tempR2 = targetR + 1; tempR2 <= gridSize; tempR2++) {
          if (seatGrid[tempR2 - 1][targetC - 1] !== 0) countRight++;
        }
        // Count available seats upwards (decreasing column index)
        for (let tempC = targetC - 1; tempC > 0; tempC--) {
          if (seatGrid[targetR - 1][tempC - 1] !== 0) countUp++;
        }
        // Count available seats downwards (increasing column index)
        for (let tempC2 = targetC + 1; tempC2 <= gridSize; tempC2++) {
          if (seatGrid[targetR - 1][tempC2 - 1] !== 0) countDown++;
        }

        // Add the minimum count of available neighbors to the total unfavorable count
        unfavorableCount += Math.min(countLeft, countRight, countUp, countDown);
      }
    }
  }

  // Output the final calculated unfavorable count
  console.log(unfavorableCount);
}

// Invoke the main processing function with data read from standard input
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));