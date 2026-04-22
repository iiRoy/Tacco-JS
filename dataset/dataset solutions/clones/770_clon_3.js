let inputBuffer = '';

// Begin listening for data from standard input.
process.stdin.resume();

// Configure input stream to use UTF-8 encoding.
process.stdin.setEncoding('utf8');

// Accumulate all incoming data chunks.
process.stdin.on('data', (dataChunk) => {
  inputBuffer += dataChunk;
});

// Once the entire input stream has ended, process the collected data.
process.stdin.on('end', () => {
  // Split the input into individual lines, removing any leading/trailing whitespace.
  const inputLines = inputBuffer.trim().split('\n');
  
  // Initiate the primary game session handler.
  handleGameSessions(inputLines);
});

// --- Core Configuration Constants for the Game Grid ---
const GRID_SIZE_X = 21;
const GRID_SIZE_Y = 21;
const TOTAL_GRID_CELLS = GRID_SIZE_X * GRID_SIZE_Y;
const INITIAL_COLLECTOR_X = 10;
const INITIAL_COLLECTOR_Y = 10;

// Helper function to map 2D coordinates (x, y) to a 1D array index.
const calculateGridIndex = (xCoord, yCoord) => (yCoord * GRID_SIZE_X) + xCoord;

// Primary function to manage multiple game rounds.
function handleGameSessions(allInputLines) {
  let lineCursor = 0; // Pointer to the current line being read from input.

  // Helper to safely retrieve and advance the input line cursor.
  const fetchNextInputLine = () => allInputLines[lineCursor++];

  let currentSessionGemCount; // Stores the number of gems for the current game session.

  // Loop through game sessions until a gem count of zero is encountered.
  while ((currentSessionGemCount = parseInt(fetchNextInputLine(), 10)) !== 0) {
    // Initialize the game board: a 1D array representing the 21x21 grid.
    // Each cell's value is 0 (empty) initially.
    const gameBoardState = Array.from({ length: TOTAL_GRID_CELLS }, () => 0);

    // Populate the board with gems based on input coordinates.
    for (let gemPlacementIteration = 0; gemPlacementIteration < currentSessionGemCount; gemPlacementIteration++) {
      const coordinateTokens = fetchNextInputLine().split(' ').map(Number);
      const xPosition = coordinateTokens[0];
      const yPosition = coordinateTokens[1];

      // Type III Addition: Basic validation for gem coordinates.
      if (xPosition < 0 || xPosition >= GRID_SIZE_X || yPosition < 0 || yPosition >= GRID_SIZE_Y) {
        // In a real application, one might log an error or throw.
        // For competitive programming, input is usually guaranteed valid.
        // This demonstrates a potential guard clause.
        continue; // Skip invalid gem placement.
      }
      
      // Mark the cell with a gem (value 1).
      gameBoardState[calculateGridIndex(xPosition, yPosition)] = 1;
    }

    // Read the total number of movement instructions for this session.
    const totalMoveInstructions = parseInt(fetchNextInputLine(), 10);
    const movementPathSegments = [];

    // Parse and store each movement instruction.
    for (let moveParsingIteration = 0; moveParsingIteration < totalMoveInstructions; moveParsingIteration++) {
      const moveDetails = fetchNextInputLine().split(' ');
      movementPathSegments.push({
        directionKey: moveDetails[0],
        distanceSteps: parseInt(moveDetails[1], 10)
      });
    }

    // Evaluate the outcome of the collector's path.
    // A shallow copy of the board is passed as the evaluation process modifies it.
    const collectionOutcome = assessGemCollection([...gameBoardState], movementPathSegments);

    // Output the result for the current game session.
    if (collectionOutcome) {
      console.log('Yes'); // All gems were collected.
    } else {
      console.log('No');  // Some gems remain.
    }
  }
}

// Function to simulate the collector's movement and determine if all gems are collected.
// This function modifies the provided boardLayout.
function assessGemCollection(boardLayout, movementSequence) {
  // Determine the collector's initial position on the 1D grid.
  let currentCollectorPosition = calculateGridIndex(INITIAL_COLLECTOR_X, INITIAL_COLLECTOR_Y);

  // Define how each direction affects the 1D grid index.
  const positionalDeltas = {
    'N': -GRID_SIZE_X, // Moving North (up) decreases Y-coordinate, thus reducing index by a full row.
    'S': GRID_SIZE_X,  // Moving South (down) increases Y-coordinate, thus increasing index by a full row.
    'W': -1,           // Moving West (left) decreases X-coordinate, reducing index by 1.
    'E': 1             // Moving East (right) increases X-coordinate, increasing index by 1.
  };

  // Iterate through each movement instruction in the sequence.
  for (const aSingleMove of movementSequence) {
    const deltaForDirection = positionalDeltas[aSingleMove.directionKey];

    // Type III Addition: Guard against undefined/invalid directions.
    if (deltaForDirection === undefined) {
      // If an invalid direction is encountered, skip this move.
      // In competitive programming, inputs are usually well-formed.
      continue;
    }

    // Execute each step of the current move.
    for (let stepCounter = 0; stepCounter < aSingleMove.distanceSteps; stepCounter++) {
      currentCollectorPosition += deltaForDirection;

      // Type III Addition: Check if the collector's position remains within grid boundaries.
      // The original problem implies paths stay within bounds, but this adds robustness.
      if (currentCollectorPosition >= 0 && currentCollectorPosition < TOTAL_GRID_CELLS) {
        boardLayout[currentCollectorPosition] = 0; // "Collect" the gem by clearing the cell.
      } else {
        // If the collector moves off-board, it cannot collect any gems at that position.
        // We could choose to break the step loop, or just let it continue off-board.
        // For this problem, it's safer to just not modify the array at invalid indices.
      }
    }
  }

  // After all movements, check if any gems (cells with value 1) are still present on the board.
  // The Array.prototype.some() method provides a concise way to do this.
  const areAnyGemsRemaining = boardLayout.some(cellContent => cellContent === 1);

  // Return true if NO gems are remaining (i.e., all were collected), false otherwise.
  return !areAnyGemsRemaining;
}