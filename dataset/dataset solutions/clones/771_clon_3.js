let accumulatedInput = '';

const GRID_DIMENSION = 21;
const GRID_CELL_COUNT = GRID_DIMENSION * GRID_DIMENSION;
const START_X_COORD = 10;
const START_Y_COORD = 10;
const INITIAL_AGENT_POSITION_INDEX = START_X_COORD + START_Y_COORD * GRID_DIMENSION;

const DIRECTION_TO_OFFSET_MAP = {
  'N': -GRID_DIMENSION, // Moving North (up) decreases the Y coordinate, thus decreasing the 1D array index.
  'S': GRID_DIMENSION,  // Moving South (down) increases the Y coordinate, thus increasing the 1D array index.
  'W': -1,              // Moving West (left) decreases the X coordinate, thus decreasing the 1D array index.
  'E': 1                // Moving East (right) increases the X coordinate, thus increasing the 1D array index.
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (inputDataChunk) => {
  accumulatedInput += inputDataChunk;
});

process.stdin.on('end', () => {
  const processedLines = accumulatedInput.trim().split('\n');
  executeGameSimulation(processedLines);
});

/**
 * Orchestrates the processing of multiple game scenarios from raw input lines.
 * Each scenario involves placing gems and then moving an agent to collect them.
 *
 * @param {string[]} inputLineArray An array of strings, where each string is a line from the standard input.
 */
function executeGameSimulation(inputLineArray) {
  if (!inputLineArray || inputLineArray.length === 0) {
    console.error("Simulation Error: No input data provided for game scenarios.");
    return;
  }

  let currentLineIndex = 0; // Pointer to the current line being read from the input array.
  let scenarioCounter = 1; // Tracks the number of distinct game scenarios processed.

  // Loop indefinitely until a specific termination condition is met (number of gems is 0).
  while (true) {
    // Attempt to parse the number of collectibles for the current scenario.
    const numberOfCollectibles = Number(inputLineArray[currentLineIndex++]);

    // Termination condition: If 0 is read or parsing fails, exit the loop.
    if (isNaN(numberOfCollectibles) || numberOfCollectibles === 0) {
      break;
    }

    // Initialize the game grid. Using Uint8Array is efficient for binary states (gem present/absent).
    // All cells are initially 0 (no gem).
    const gameBoardGrid = new Uint8Array(GRID_CELL_COUNT).fill(0);

    // Read and place the initial collectible (gem) positions on the grid.
    for (let gemPlacementIteration = 0; gemPlacementIteration < numberOfCollectibles; gemPlacementIteration++) {
      const gemCoordinatesString = inputLineArray[currentLineIndex++];

      // Basic validation for coordinate string format.
      if (!gemCoordinatesString || !gemCoordinatesString.includes(' ')) {
        console.warn(`Scenario ${scenarioCounter}: Invalid gem coordinate string format: "${gemCoordinatesString}". Skipping gem.`);
        continue;
      }

      const [xCoordStr, yCoordStr] = gemCoordinatesString.split(' ');
      const xPosition = Number(xCoordStr);
      const yPosition = Number(yCoordStr);

      // Validate parsed coordinates against grid boundaries.
      if (isNaN(xPosition) || isNaN(yPosition) ||
          xPosition < 0 || xPosition >= GRID_DIMENSION ||
          yPosition < 0 || yPosition >= GRID_DIMENSION) {
        console.warn(`Scenario ${scenarioCounter}: Gem coordinates (${xPosition}, ${yPosition}) are out of bounds. Skipping gem.`);
        continue;
      }

      // Convert 2D coordinates to a 1D array index.
      const gridCellIndex = xPosition + yPosition * GRID_DIMENSION;
      gameBoardGrid[gridCellIndex] = 1; // Mark the cell as containing a gem.
    }

    // Read the total number of movement instructions for the agent.
    const totalAgentMoves = Number(inputLineArray[currentLineIndex++]);

    // Store the sequence of agent movement instructions.
    const agentPathInstructions = [];
    for (let moveInstructionIteration = 0; moveInstructionIteration < totalAgentMoves; moveInstructionIteration++) {
      const moveSpecificationString = inputLineArray[currentLineIndex++];

      // Basic validation for move instruction string format.
      if (!moveSpecificationString || !moveSpecificationString.includes(' ')) {
        console.warn(`Scenario ${scenarioCounter}: Invalid move instruction string format: "${moveSpecificationString}". Skipping move.`);
        continue;
      }

      const [directionCharacter, stepLengthString] = moveSpecificationString.split(' ');
      const moveStepLength = Number(stepLengthString);

      // Validate the direction character and step length.
      if (!DIRECTION_TO_OFFSET_MAP.hasOwnProperty(directionCharacter) || isNaN(moveStepLength) || moveStepLength < 0) {
        console.warn(`Scenario ${scenarioCounter}: Invalid move instruction details: "${moveSpecificationString}". Skipping move.`);
        continue;
      }

      agentPathInstructions.push({
        direction: directionCharacter,
        distance: moveStepLength
      });
    }

    // Execute the agent's path and determine if all collectibles were acquired.
    const wereAllGemsCollected = verifyAllCollectiblesGathered(gameBoardGrid, agentPathInstructions);

    // Output the result for the current scenario.
    if (wereAllGemsCollected) {
      console.log('Yes');
    } else {
      console.log('No');
    }

    scenarioCounter++; // Prepare for the next scenario.
  }
}

/**
 * Simulates the agent's movement path on the grid, clearing collectibles as it goes,
 * and then checks if any collectibles remain.
 *
 * @param {Uint8Array} currentGridState A 1D array representing the game grid; 1 for gem, 0 for empty.
 * @param {Array<Object>} agentMovementPath An array of movement objects, each containing 'direction' and 'distance'.
 * @returns {boolean} True if no gems remain on the grid after the agent's path, false otherwise.
 */
function verifyAllCollectiblesGathered(currentGridState, agentMovementPath) {
  let agentCurrentGridIndex = INITIAL_AGENT_POSITION_INDEX; // Agent starts at the predefined center position.

  // Process each movement instruction in the sequence.
  for (const singleMoveInstruction of agentMovementPath) {
    const { direction, distance } = singleMoveInstruction;
    const indexOffsetPerStep = DIRECTION_TO_OFFSET_MAP[direction]; // Get the appropriate index change.

    // Execute the move step by step.
    for (let stepCount = 0; stepCount < distance; stepCount++) {
      agentCurrentGridIndex += indexOffsetPerStep;

      // Although the problem constraints typically keep the agent within bounds,
      // a robust system might include boundary checks here. For this specific
      // problem, the agent's path is guaranteed not to go out of the 21x21 grid.
      // Example check:
      // if (agentCurrentGridIndex < 0 || agentCurrentGridIndex >= GRID_CELL_COUNT) {
      //   console.warn("Agent attempted to move out of bounds!");
      //   // Handle error, e.g., clip position, stop, or invalid scenario.
      // }

      // If the agent lands on a cell with a gem, collect it (set to 0).
      if (currentGridState[agentCurrentGridIndex] === 1) {
        currentGridState[agentCurrentGridIndex] = 0;
      }
    }
  }

  // After all moves, iterate through the entire grid to check for any remaining gems.
  for (let cellPosition = 0; cellPosition < GRID_CELL_COUNT; cellPosition++) {
    if (currentGridState[cellPosition] === 1) {
      return false; // An uncollected gem was found.
    }
  }

  return true; // All gems have been collected successfully.
}