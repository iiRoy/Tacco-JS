const fileOperations = require("fs");

const standardInputFile = "/dev/stdin";

// Retrieves and parses raw input data from a designated source.
// Reads content, converts to UTF-8, trims whitespace, and splits into an array of lines.
const unprocessedInputData = fileOperations.readFileSync(standardInputFile, "utf8").trim().split("\n");

/**
 * Provides an object-oriented mechanism for iterating through a sequence of data.
 * Facilitates controlled access to elements and maintains internal state.
 */
class SequentialDataReader {
  /**
   * @private
   * @type {string[]} The array holding the data items.
   */
  #storedItems;

  /**
   * @private
   * @type {number} The current position within the data sequence.
   */
  #currentPosition;

  /**
   * @private
   * @type {number} The total number of items available in the sequence.
   */
  #totalItemsCount;

  /**
   * Constructs a new SequentialDataReader instance.
   * @param {string[]} dataSequence - An array of strings to be read sequentially.
   * @throws {TypeError} If the provided dataSequence is not an array.
   */
  constructor(dataSequence) {
    if (!Array.isArray(dataSequence)) {
      throw new TypeError("Data sequence must be an array for SequentialDataReader initialization.");
    }
    this.#storedItems = dataSequence;
    this.#currentPosition = 0;
    this.#totalItemsCount = dataSequence.length;
  }

  /**
   * Determines if there are more unread items in the sequence.
   * @returns {boolean} `true` if more items exist, `false` otherwise.
   */
  hasRemaining() {
    return this.#currentPosition < this.#totalItemsCount;
  }

  /**
   * Retrieves the next item from the sequence and advances the internal pointer.
   * @returns {string} The next available item.
   * @throws {Error} If an attempt is made to read beyond the end of the sequence.
   */
  fetchNext() {
    if (!this.hasRemaining()) {
      throw new Error("DataReadError: Attempted to fetch item beyond sequence end.");
    }
    const itemToProvide = this.#storedItems[this.#currentPosition];
    this.#currentPosition++; // Increment position for the next read
    return itemToProvide;
  }

  /**
   * Allows inspecting the next item without consuming it from the sequence.
   * @returns {string|undefined} The next item if available, otherwise `undefined`.
   */
  peekAhead() {
    if (!this.hasRemaining()) {
      return undefined;
    }
    return this.#storedItems[this.#currentPosition];
  }
}

// Initialize the data stream handler with the pre-processed input.
const streamHandler = new SequentialDataReader(unprocessedInputData);

/**
 * Obtains the subsequent line of input from the global stream handler.
 * @returns {string} The next input line.
 */
function getNextInputLine() {
  return streamHandler.fetchNext();
}

/**
 * Checks for the availability of more input lines in the global stream handler.
 * @returns {boolean} `true` if more lines are present, `false` otherwise.
 */
function checkMoreInput() {
  return streamHandler.hasRemaining();
}

/**
 * Outputs a given message to the standard console.
 * @param {*} messageContent - The data or message to be displayed.
 */
function emitResult(messageContent) {
  console.log(messageContent);
}

/**
 * Logs debugging information or error messages to the standard error console.
 * @param {*} diagnosticMessage - The information to log for diagnostic purposes.
 */
function recordDiagnostic(diagnosticMessage) {
  console.error(diagnosticMessage);
}

// Collection of data transformation methods, indexed by descriptive keys.
const dataProcessors = {
  // Converts string to a base-10 integer.
  PARSE_INTEGER: (value) => Number.parseInt(value, 10),
  // Divides a string into substrings based on space delimiter.
  SEGMENT_BY_SPACE: (value) => value.split(" "),
  // Segments by space, then converts each segment to a numeric type.
  SEGMENT_AND_NUMERIFY: (value) => value.split(" ").map(Number),
  // Breaks a string into an array of individual characters.
  DISSECT_TO_CHARS: (value) => value.split(""),
  // Breaks a string into characters, then converts each character to a number.
  DISSECT_AND_NUMERIFY: (value) => value.split("").map(Number),
  // Combines array elements into a string, separated by a single space.
  CONCAT_WITH_SPACE: (array) => array.join(" "),
  // Combines array elements into a string, separated by newline characters.
  CONCAT_WITH_NEWLINE: (array) => array.join("\n"),
  // Combines array elements into a single string without any separators.
  CONCAT_FLAT: (array) => array.join(""),
  // Returns the input value without modification.
  IDENTITY_TRANSFORM: (value) => value,
};

/**
 * Applies a specified transformation to an input value.
 * Includes error handling and logging for invalid operations.
 * @param {string|string[]} sourceValue - The value to be transformed.
 * @param {string} transformationKey - The key identifying the desired transformation.
 * @returns {*} The transformed value, or the original value if transformation fails or key is unknown.
 */
function applyDataTransformation(sourceValue, transformationKey) {
  // Early exit for non-existent input to prevent errors.
  if (sourceValue === null || sourceValue === undefined) {
    recordDiagnostic("Warning: Input was null/undefined for transformation. Returning as-is.");
    return sourceValue;
  }

  try {
    const processor = dataProcessors[transformationKey];
    if (processor) {
      return processor(sourceValue);
    } else {
      // Log if an unregistered transformation key is used.
      recordDiagnostic(`Notice: Unknown transformation key '${transformationKey}'. Input returned unchanged.`);
      return sourceValue;
    }
  } catch (operationError) {
    recordDiagnostic(`Error during data transformation ('${transformationKey}'): ${operationError.message}`);
    // Fallback to original value if an exception occurs during processing.
    return sourceValue;
  }
}

// Enumeration-like object for referencing transformation types.
const TRANSFORMATION_TYPE = {
  INTEGER: 'PARSE_INTEGER',
  SPLIT_SPACE: 'SEGMENT_BY_SPACE',
  SPLIT_SPACE_TO_NUMS: 'SEGMENT_AND_NUMERIFY',
  SPLIT_CHARS: 'DISSECT_TO_CHARS',
  SPLIT_CHARS_TO_NUMS: 'DISSECT_AND_NUMERIFY',
  JOIN_SPACE: 'CONCAT_WITH_SPACE',
  JOIN_NEWLINE: 'CONCAT_WITH_NEWLINE',
  JOIN_NONE: 'CONCAT_FLAT',
  NO_CHANGE: 'IDENTITY_TRANSFORM'
};

/**
 * Determines if a specific grid cell contains a 'wall' character ('#').
 * Includes boundary checks to prevent errors.
 * @param {Array<Array<string>>} gridMap - The 2D array representing the maze.
 * @param {number} rowIdx - The row index of the cell.
 * @param {number} colIdx - The column index of the cell.
 * @returns {boolean} `true` if the cell is a wall and within bounds, `false` otherwise.
 */
function checkIsWall(gridMap, rowIdx, colIdx) {
    if (rowIdx < 0 || rowIdx >= gridMap.length || colIdx < 0 || colIdx >= gridMap[0].length) {
        return false; // Out of bounds is not considered a wall for pathfinding.
    }
    return gridMap[rowIdx][colIdx] === "#";
}

/**
 * Verifies if a given cell coordinate is within the valid boundaries of the grid.
 * @param {Array<Array<string>>} gridMap - The maze grid.
 * @param {number} rowIdx - Row index.
 * @param {number} colIdx - Column index.
 * @returns {boolean} `true` if the cell is within the grid, `false` otherwise.
 */
function isCoordinateValid(gridMap, rowIdx, colIdx) {
    return rowIdx >= 0 && rowIdx < gridMap.length && colIdx >= 0 && colIdx < gridMap[0].length;
}

/**
 * Main execution function for solving the maze pathfinding problem.
 * Reads maze dimensions, constructs the maze, and attempts to find a valid reverse path.
 */
function solveMazePath() {
  // Fetch and convert the first input line to obtain grid dimensions.
  const dimensionsArray = applyDataTransformation(getNextInputLine(), TRANSFORMATION_TYPE.SPLIT_SPACE_TO_NUMS);

  // Validate the integrity of the dimensions input.
  if (!dimensionsArray || dimensionsArray.length !== 2 || dimensionsArray.some(dim => dim <= 0)) {
    emitResult("Impossible");
    recordDiagnostic("Error: Invalid or incomplete grid dimensions provided. Aborting.");
    return;
  }

  const mazeRows = dimensionsArray[0];
  const mazeCols = dimensionsArray[1];

  // Initialize the 2D array representing the maze layout.
  const mazeLayoutGrid = new Array(mazeRows);
  for (let r = 0; r < mazeRows; r++) {
    mazeLayoutGrid[r] = applyDataTransformation(getNextInputLine(), TRANSFORMATION_TYPE.DISSECT_TO_CHARS);
  }

  // Start pathfinding from the bottom-right corner, moving towards the top-left.
  // This approach marks cells as 'k' (known path) as they are visited in reverse.
  let currentY_position = mazeRows - 1;
  let currentX_position = mazeCols - 1;

  let successfulPathFound = false; // Flag to track if the path reaches the origin successfully.

  // Continue iterating as long as we are within valid grid boundaries.
  while (currentY_position >= 0 && currentX_position >= 0) {
    // Mark the current cell as part of the discovered path.
    mazeLayoutGrid[currentY_position][currentX_position] = "k";

    // Diagnostic log (commented out for production, uncomment for detailed tracing):
    // recordDiagnostic(`Current location: (${currentX_position}, ${currentY_position})`);

    // --- Special handling for the destination cell (0, 0) ---
    if (currentY_position === 0 && currentX_position === 0) {
      // Upon reaching (0,0), check if the forward path could have entered this cell.
      // This implies checking if adjacent cells (0,1) and (1,0) are NOT walls.
      // If either of these is a wall, it suggests an invalid path to (0,0) according to original logic.
      const rightCellIsBlocked = isCoordinateValid(mazeLayoutGrid, 0, 1) && checkIsWall(mazeLayoutGrid, 0, 1);
      const downCellIsBlocked = isCoordinateValid(mazeLayoutGrid, 1, 0) && checkIsWall(mazeLayoutGrid, 1, 0);

      // If either path leading into (0,0) (from right or down) is blocked, it's impossible.
      if (rightCellIsBlocked || downCellIsBlocked) {
        emitResult("Impossible");
        return; // Terminate execution due to impossible path.
      }
      successfulPathFound = true;
      break; // Path found, exit the loop.
    }

    let aMoveWasMade = false; // Flag to ensure progress in each iteration.

    // --- Boundary Case: Currently in the leftmost column (x=0), but not at (0,0) ---
    if (currentX_position === 0) {
      // Requires moving upwards (decrement Y).
      // Condition: cell directly above is a wall AND cell to the right is not a wall AND cell directly below is not a wall.
      const cellAboveIsWall = isCoordinateValid(mazeLayoutGrid, currentY_position - 1, currentX_position) && checkIsWall(mazeLayoutGrid, currentY_position - 1, currentX_position);
      const cellRightIsNotWall = isCoordinateValid(mazeLayoutGrid, currentY_position, currentX_position + 1) && !checkIsWall(mazeLayoutGrid, currentY_position, currentX_position + 1);
      const cellBelowIsNotWall = isCoordinateValid(mazeLayoutGrid, currentY_position + 1, currentX_position) && !checkIsWall(mazeLayoutGrid, currentY_position + 1, currentX_position);

      if (cellAboveIsWall && cellRightIsNotWall && cellBelowIsNotWall) {
        currentY_position--;
        aMoveWasMade = true;
      } else {
        emitResult("Impossible");
        return;
      }
    }
    // --- Boundary Case: Currently in the topmost row (y=0), but not at (0,0) ---
    else if (currentY_position === 0) {
      // Requires moving leftwards (decrement X).
      // Condition: cell directly left is a wall AND cell directly below is not a wall AND cell to the right is not a wall.
      const cellLeftIsWall = isCoordinateValid(mazeLayoutGrid, currentY_position, currentX_position - 1) && checkIsWall(mazeLayoutGrid, currentY_position, currentX_position - 1);
      const cellBelowIsNotWall = isCoordinateValid(mazeLayoutGrid, currentY_position + 1, currentX_position) && !checkIsWall(mazeLayoutGrid, currentY_position + 1, currentX_position);
      const cellRightIsNotWall = isCoordinateValid(mazeLayoutGrid, currentY_position, currentX_position + 1) && !checkIsWall(mazeLayoutGrid, currentY_position, currentX_position + 1);

      if (cellLeftIsWall && cellBelowIsNotWall && cellRightIsNotWall) {
        currentX_position--;
        aMoveWasMade = true;
      } else {
        emitResult("Impossible");
        return;
      }
    }
    // --- Initial Step: At the very start of the reverse path (bottom-right corner) ---
    else if (currentY_position === mazeRows - 1 && currentX_position === mazeCols - 1) {
      // Decision: if cell above is a wall, move up. Otherwise, move left.
      if (checkIsWall(mazeLayoutGrid, currentY_position - 1, currentX_position)) {
        currentY_position--;
      } else {
        currentX_position--;
      }
      aMoveWasMade = true;
    }
    // --- Edge Cases: On the bottommost row (y=H-1) or rightmost column (x=W-1), excluding start/end ---
    else if (currentY_position === mazeRows - 1 || currentX_position === mazeCols - 1) {
      // Complex condition: exactly one of (cell above, cell left) is a wall, and the other is a path ('.').
      const upIsWall = checkIsWall(mazeLayoutGrid, currentY_position - 1, currentX_position);
      const leftIsWall = checkIsWall(mazeLayoutGrid, currentY_position, currentX_position - 1);
      const upIsPath = isCoordinateValid(mazeLayoutGrid, currentY_position - 1, currentX_position) && mazeLayoutGrid[currentY_position - 1][currentX_position] === ".";
      const leftIsPath = isCoordinateValid(mazeLayoutGrid, currentY_position, currentX_position - 1) && mazeLayoutGrid[currentY_position][currentX_position - 1] === ".";

      const exactlyOneBlockedAndOneOpen = (upIsWall && leftIsPath) || (leftIsWall && upIsPath);

      if (exactlyOneBlockedAndOneOpen) {
        if (upIsWall) { // Prefer moving up if the path requires turning from a wall above.
          currentY_position--;
        } else { // Otherwise, move left if the path requires turning from a wall to the left.
          currentX_position--;
        }
        aMoveWasMade = true;
      } else {
        emitResult("Impossible");
        return;
      }
    }
    // --- General Case: Not on any boundary or special start/end points ---
    else {
      // Check if the cell directly below was already visited ('k'), indicating a path from there.
      const cellBelowIsVisited = isCoordinateValid(mazeLayoutGrid, currentY_position + 1, currentX_position) && mazeLayoutGrid[currentY_position + 1][currentX_position] === "k";

      const upIsWall = checkIsWall(mazeLayoutGrid, currentY_position - 1, currentX_position);
      const leftIsWall = checkIsWall(mazeLayoutGrid, currentY_position, currentX_position - 1);
      const upIsPath = isCoordinateValid(mazeLayoutGrid, currentY_position - 1, currentX_position) && mazeLayoutGrid[currentY_position - 1][currentX_position] === ".";
      const leftIsPath = isCoordinateValid(mazeLayoutGrid, currentY_position, currentX_position - 1) && mazeLayoutGrid[currentY_position][currentX_position - 1] === ".";

      const exactlyOneBlockedAndOneOpen = (upIsWall && leftIsPath) || (leftIsWall && upIsPath);

      if (cellBelowIsVisited) {
        // Condition: (exactlyOneBlockedAndOneOpen) AND (cell to the right is NOT a wall).
        const rightIsNotWall = isCoordinateValid(mazeLayoutGrid, currentY_position, currentX_position + 1) && !checkIsWall(mazeLayoutGrid, currentY_position, currentX_position + 1);
        if (exactlyOneBlockedAndOneOpen && rightIsNotWall) {
          if (upIsWall) {
            currentY_position--;
          } else {
            currentX_position--;
          }
          aMoveWasMade = true;
        } else {
          emitResult("Impossible");
          return;
        }
      } else {
        // Condition: (exactlyOneBlockedAndOneOpen) AND (cell directly below is NOT a wall).
        const downIsNotWall = isCoordinateValid(mazeLayoutGrid, currentY_position + 1, currentX_position) && !checkIsWall(mazeLayoutGrid, currentY_position + 1, currentX_position);
        if (exactlyOneBlockedAndOneOpen && downIsNotWall) {
          if (upIsWall) {
            currentY_position--;
          } else {
            currentX_position--;
          }
          aMoveWasMade = true;
        } else {
          emitResult("Impossible");
          return;
        }
      }
    }

    // Safety check: if no move was made in a non-origin cell, it implies a dead end.
    if (!aMoveWasMade && (currentY_position !== 0 || currentX_position !== 0)) {
        recordDiagnostic("Pathfinding halted at an intermediate point without a valid move.");
        emitResult("Impossible");
        return;
    }
  }

  // After the loop, determine the final outcome based on the flag.
  if (successfulPathFound) {
    emitResult("Possible");
  } else {
    // This branch catches scenarios where the loop terminates without reaching (0,0)
    // or without explicitly hitting an "Impossible" condition within the loop.
    emitResult("Impossible");
  }
}

// Initiate the maze solving application.
solveMazePath();