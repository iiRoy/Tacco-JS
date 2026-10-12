(function(inputData) {
  // This function processes input data to solve a jewel collection puzzle.
  // The input consists of multiple test cases, each describing jewel locations
  // and a series of movements.

  // Split the raw input string into an array of lines, removing any leading/trailing whitespace.
  let inputRows = inputData.trim().split('\n');

  // Loop indefinitely to process multiple test cases until a termination signal is found.
  while (true) {
    // Get the next line from the input array.
    let currentLine = inputRows.shift();

    // Check if the current line is the termination signal ('0').
    if (currentLine === '0') {
      // If '0' is encountered, break out of the main processing loop.
      break;
    }

    // Convert the current line to a number, representing the count of jewels for this test case.
    const numJewels = Number(currentLine);

    // Initialize an empty object to store the locations of the jewels.
    // The key will be a string representation of coordinates (e.g., "X Y"), and the value will be 1 (indicating presence).
    const gemLocations = {};

    // Read and store the coordinates for each jewel.
    for (let idx = 0; idx < numJewels; idx++) {
      // Each jewel's location is read from a new line and stored in the gemLocations object.
      gemLocations[inputRows.shift().trim()] = 1;
    }

    // Read the next line, which specifies the total number of movement operations.
    const numMoves = Number(inputRows.shift().trim());

    // Initialize the starting position of the explorer.
    // The problem statement implies a fixed starting point (10, 10).
    let currentX = 10,
      currentY = 10;

    // Define a mapping for direction characters to their corresponding X and Y coordinate changes.
    const directionVectors = {
      'N': [0, 1], // North: X stays, Y increases
      'S': [0, -1], // South: X stays, Y decreases
      'E': [1, 0], // East: X increases, Y stays
      'W': [-1, 0] // West: X decreases, Y stays
    };

    // Initialize a counter for the number of jewels successfully collected.
    let gemsCollected = 0;

    // Iterate through each movement operation.
    for (let moveIdx = 0; moveIdx < numMoves; moveIdx++) {
      // Read the next line, which contains the movement command (e.g., "N 5").
      // Split it into direction and number of steps.
      const operationParts = inputRows.shift().trim().split(' ');
      const moveDirection = operationParts[0]; // The direction character (N, S, E, W)
      const numSteps = Number(operationParts[1]); // The number of steps to take in that direction

      // Execute each individual step of the current movement command.
      for (let stepCounter = 0; stepCounter < numSteps; stepCounter++) {
        // Update the current X and Y coordinates based on the direction vector.
        currentX += directionVectors[moveDirection][0];
        currentY += directionVectors[moveDirection][1];

        // Create a unique string key for the current position.
        const locationKey = [currentX, currentY].join(' ');

        // Check if there is a jewel at the current location and if it hasn't been collected yet.
        if (gemLocations[locationKey]) {
          // If a jewel is found, increment the collected count.
          gemsCollected += 1;
          // Mark the jewel as collected by changing its value to 0.
          gemLocations[locationKey] = 0;
        }
      }
    }

    // After all movements for the current test case, determine if all required jewels were collected.
    // Output "Yes" if the number of collected gems equals the total number of moves (which implies all target gems were collected),
    // otherwise output "No".
    console.log(gemsCollected === numMoves ? 'Yes' : 'No');
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
