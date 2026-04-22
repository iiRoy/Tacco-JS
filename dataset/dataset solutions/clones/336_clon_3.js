// This module handles standard input parsing and initiates a grid path simulation.
let rawDataBuffer = ''; // Accumulates incoming data chunks from standard input.

// Main entry point for the simulation logic after input is fully received.
function initiateGridPathSimulation(inputLineSegments) {
  // Declare simulation-specific variables using modern JavaScript keywords.
  let currentSegmentIndex = 0; // Index to iterate through the input line segments.
  const totalSegments = inputLineSegments.length; // Total number of segments provided.

  // Loop through each pair of width/height definitions and their corresponding grid data.
  while (currentSegmentIndex < totalSegments) {
    const currentLineParts = inputLineSegments[currentSegmentIndex].split(' ');
    currentSegmentIndex++; // Advance segment index for the next iteration.

    // Basic validation for input format. Ensure at least two parts (width and height).
    if (currentLineParts.length < 2) {
      // console.error("Skipping malformed input line:", inputLineSegments[currentSegmentIndex - 1]);
      continue; // Skip to the next input block if format is incorrect.
    }

    // Parse grid dimensions. Using Number() for conversion, assuming clean integer input.
    const gridWidth = Number(currentLineParts[0]);
    const gridHeight = Number(currentLineParts[1]);

    // Termination condition for the entire simulation process.
    if (gridWidth === 0 && gridHeight === 0) {
      break; // Exit the main processing loop if the sentinel value is encountered.
    }

    // Initialize data structures for the current grid simulation.
    const simulationGrid = []; // Stores the character map of the grid, row by row.
    const visitedPathCoordinates = new Set(); // Tracks visited (y, x) coordinates to detect loops efficiently.

    // Populate the simulation grid with 'gridHeight' number of lines.
    // We must ensure there are enough lines available in the input.
    for (let gridRowIndex = 0; gridRowIndex < gridHeight; gridRowIndex++) {
      if (currentSegmentIndex >= totalSegments) {
        // If we run out of input segments before populating the full grid,
        // this indicates incomplete input for the current simulation block.
        // console.error("Not enough grid lines provided for H:", gridHeight, "at segment index:", currentSegmentIndex);
        break; // Exit grid population loop.
      }
      simulationGrid[gridRowIndex] = inputLineSegments[currentSegmentIndex];
      currentSegmentIndex++; // Advance for the next grid row.
    }

    // If the grid was not fully populated due to insufficient input, skip this simulation block.
    if (simulationGrid.length < gridHeight) {
      continue;
    }

    // Initialize agent's starting position and state within the grid.
    let currentYPosition = 0; // Vertical coordinate, starting at the top.
    let currentXPosition = 0; // Horizontal coordinate, starting at the left.
    let pathCyclical = false; // Flag to indicate if a cycle (loop) is detected during movement.

    // Simulate movement on the grid until an exit point ('.') is reached or a loop is found.
    // Added boundary checks to prevent 'undefined' access when querying grid cells.
    while (
      currentYPosition >= 0 && currentYPosition < gridHeight &&
      currentXPosition >= 0 && currentXPosition < gridWidth
    ) {
      // Retrieve the symbol at the agent's current position.
      const currentCellSymbol = simulationGrid[currentYPosition].charAt(currentXPosition);

      // If the current cell is the designated exit point, terminate this specific simulation.
      if (currentCellSymbol === '.') {
        break;
      }

      // Generate a unique string key for the current coordinates to track visited cells in the Set.
      const currentCoordKey = `${currentYPosition},${currentXPosition}`;

      // Check if this coordinate has been visited before in the current path.
      if (visitedPathCoordinates.has(currentCoordKey)) {
        pathCyclical = true; // A loop has been detected, the agent is revisiting a cell.
        break; // Exit the movement simulation.
      }

      // Mark the current cell as visited to detect future cycles.
      visitedPathCoordinates.add(currentCoordKey);

      // Determine the next movement based on the current cell's symbol.
      // Using an if-else if structure instead of a switch statement for variation.
      if (currentCellSymbol === '>') {
        currentXPosition += 1; // Move right.
      } else if (currentCellSymbol === '<') {
        currentXPosition -= 1; // Move left.
      } else if (currentCellSymbol === 'v') {
        currentYPosition += 1; // Move down.
      } else if (currentCellSymbol === '^') {
        currentYPosition -= 1; // Move up.
      } else {
        // Handle unexpected or invalid symbols gracefully.
        // For this clone, we'll just break as it's an unrecognized instruction.
        // console.warn("Unrecognized grid symbol encountered:", currentCellSymbol, "at", currentCoordKey);
        break;
      }
    }

    // Output the result of the current grid simulation.
    if (pathCyclical) {
      console.log('LOOP'); // Report a detected cycle.
    } else {
      // Output the final coordinates (X Y) if no loop was found and an exit was reached or bounds exceeded.
      console.log(`${currentXPosition} ${currentYPosition}`);
    }
  }
}

// Event listeners for standard input to read all data provided to the script.
process.stdin.resume(); // Ensures the process stays active to receive all input.
process.stdin.setEncoding('utf8'); // Specifies the character encoding for incoming data.

// When data chunks are received, append them to the rawDataBuffer.
process.stdin.on('data', function(incomingChunk) {
  rawDataBuffer += incomingChunk;
});

// Once all input data has been received (stream 'end' event), process it.
process.stdin.on('end', function() {
  // Split the accumulated data into an array of lines, ready for parsing.
  const processedInputLines = rawDataBuffer.split('\n');
  // Call the main simulation function with the parsed input array.
  initiateGridPathSimulation(processedInputLines);
});