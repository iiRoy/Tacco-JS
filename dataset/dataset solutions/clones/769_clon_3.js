(function(inputBuffer) {
  // A utility function to manage reading lines from the pre-processed input buffer.
  // This abstracts away the internal index management and trimming.
  let currentInputIndex = 0;
  const inputDataLines = inputBuffer.trim().split('\n');

  const getNextCleanLineSegment = () => {
    // Return null if there are no more lines to process, indicating end of input.
    if (currentInputIndex >= inputDataLines.length) {
      return null;
    }
    // Increment the index after retrieving the current line to move to the next.
    return inputDataLines[currentInputIndex++].trim();
  };

  // Define the movement vectors for each cardinal direction using a Map.
  // This provides a clear, key-value lookup for coordinate changes (deltaX, deltaY).
  const movementVectors = new Map();
  movementVectors.set('N', [0, 1]);  // North: no change in X, +1 in Y
  movementVectors.set('S', [0, -1]); // South: no change in X, -1 in Y
  movementVectors.set('E', [1, 0]);  // East: +1 in X, no change in Y
  movementVectors.set('W', [-1, 0]); // West: -1 in X, no change in Y

  // The main program loop processes test cases until a '0' is encountered or input runs out.
  // Using a do-while loop for clarity, ensuring at least one iteration if input exists.
  let continueProcessingBlocks = true;
  do {
    const currentLineSegment = getNextCleanLineSegment();

    // Check for the termination condition as specified: '0' or end of input.
    if (currentLineSegment === null || currentLineSegment === '0') {
      continueProcessingBlocks = false; // Signal to stop after this iteration.
      continue; // Jump to the loop condition check.
    }

    // Parse the number of treasure locations for the current test case.
    // Using parseInt with radix 10 for explicit base conversion.
    const numTreasuresExpected = parseInt(currentLineSegment, 10);

    // Implement a basic guard clause for invalid treasure count input.
    if (isNaN(numTreasuresExpected) || numTreasuresExpected < 0) {
        // Log an error and skip this entire block to prevent cascading issues.
        console.error("Error: Invalid number of treasures detected. Skipping current block.");
        // Attempt to consume the expected number of treasure lines and the next line (numMoves)
        // to correctly position the input reader for the next valid block.
        for (let idx = 0; idx < numTreasuresExpected; idx++) { getNextCleanLineSegment(); }
        getNextCleanLineSegment(); // Consume the 'numMoves' line that would follow.
        continue;
    }

    // A Map is used to store treasure locations. Keys are coordinate strings,
    // and values are booleans (true if uncollected, false if collected).
    const treasureLocationMap = new Map();
    for (let treasureIndex = 0; treasureIndex < numTreasuresExpected; treasureIndex++) {
      const locationString = getNextCleanLineSegment();
      if (locationString) { // Ensure the line isn't null before adding.
        treasureLocationMap.set(locationString, true); // Mark as initially present.
      }
    }

    // Read and parse the total number of movement instructions.
    const numMovementInstructionsString = getNextCleanLineSegment();
    const totalMovements = parseInt(numMovementInstructionsString, 10);

    // Another guard clause for invalid movement count.
    if (isNaN(totalMovements) || totalMovements < 0) {
        console.error("Error: Invalid number of movements detected. Skipping current block.");
        // Consume remaining move instruction lines to align input.
        for (let idx = 0; idx < totalMovements; idx++) { getNextCleanLineSegment(); }
        continue;
    }

    // Set the initial coordinates of the explorer.
    // Using named constants for clarity.
    const START_X_COORD = 10;
    const START_Y_COORD = 10;
    let currentXPosition = START_X_COORD;
    let currentYPosition = START_Y_COORD;

    // Counter for treasures successfully collected during this simulation.
    let collectedTreasuresCounter = 0;

    // Process each movement instruction one by one.
    for (let movementIteration = 0; movementIteration < totalMovements; movementIteration++) {
      const rawInstructionLine = getNextCleanLineSegment();
      if (!rawInstructionLine) {
          console.error("Error: Missing movement instruction line. Aborting remaining movements for this block.");
          break; // Stop processing movements for this test case.
      }
      const instructionParts = rawInstructionLine.split(' ');

      const moveDirection = instructionParts[0];
      const numberOfSteps = parseInt(instructionParts[1], 10);

      // Validate the parsed instruction components.
      if (isNaN(numberOfSteps) || numberOfSteps < 0 || !movementVectors.has(moveDirection)) {
        console.warn(`Warning: Malformed instruction "${rawInstructionLine}". Skipping this movement.`);
        continue; // Skip to the next movement instruction.
      }

      // Retrieve the delta values (change in X and Y) for the current direction.
      const [deltaX, deltaY] = movementVectors.get(moveDirection);

      // Simulate each individual step within the current movement instruction.
      for (let stepCounter = 0; stepCounter < numberOfSteps; stepCounter++) {
        // Update the explorer's position.
        currentXPosition += deltaX;
        currentYPosition += deltaY;

        // Construct a unique string key for the current coordinates.
        // Using a template literal for modern string concatenation.
        const currentCoordinateKey = `${currentXPosition} ${currentYPosition}`;

        // Check if there's an uncollected treasure at the current position.
        if (treasureLocationMap.has(currentCoordinateKey) && treasureLocationMap.get(currentCoordinateKey) === true) {
          collectedTreasuresCounter++;
          // Mark the treasure as collected to ensure it's not counted again.
          treasureLocationMap.set(currentCoordinateKey, false);
        }
      }
    }

    // Output the result based on whether all expected treasures were found.
    const finalOutcomeMessage = (collectedTreasuresCounter === numTreasuresExpected) ? 'Yes' : 'No';
    console.log(finalOutcomeMessage);

  } while (continueProcessingBlocks); // Continue as long as there are more blocks to process.

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the entire standard input as a single string.