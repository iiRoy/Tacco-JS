/*
 * This JavaScript code implements a Breadth-First Search (BFS) algorithm
 * to find the shortest path in a grid, with specific movement rules.
 *
 * It reads grid dimensions, start/end coordinates, and the grid layout
 * from standard input.
 *
 * The grid can contain obstacles ('@') and allows movement up to 'k' steps
 * in cardinal directions (horizontal/vertical) per turn.
 *
 * The goal is to find the minimum number of turns to reach the target.
 */

/**
 * A generator function to iteratively read tokens from standard input.
 * It reads the entire input, trims it, and splits it by newlines or spaces.
 * @returns {Generator<string>} A generator yielding input tokens.
 */
function* stdinIter() {
  /*
   * Read all content from /dev/stdin synchronously.
   * Decode it as UTF-8.
   * Remove leading/trailing whitespace.
   * Split the string into an array of tokens using
   * either newline characters or spaces as delimiters.
   */
  const t = require("fs")
    .readFileSync("/dev/stdin", "utf-8")
    .trim()
    .split(/\n|\s/);
  // Yield each token from the array
  yield* t;
}

/**
 * Reads a specified number of tokens from the input iterator.
 * @param {number} t - The number of tokens to read.
 * @param {object} e - Optional context object containing the iterator.
 * @returns {Array<string>} An array of the read tokens.
 */
function readMany(t, e) {
  /*
   * Initialize the iterator.
   * If 'e' is provided and has 'iter', use it.
   * Otherwise, if 'this' has 'iter', use it.
   * If neither, create a new stdinIter and store it on 'this.iter'.
   */
  const i = e || this.iter || (this.iter = stdinIter());

  // Initialize an empty array to store the read tokens.
  const n = [];

  // Loop 't' times to read the desired number of tokens.
  for (let e = 0; e < t; e += 1) {
    // Get the next value from the iterator and push it to the array.
    n.push(i.next().value);
  }

  // Return the array of collected tokens.
  return n;
}

// Main execution block wrapped in an Immediately Invoked Function Expression (IIFE).
(() => {
  // Read grid dimensions (height, width) and max steps 'k'.
  // Parse them as integers.
  const [h, w, k] = readMany(3).map((it) => parseInt(it));

  // Read start coordinates (x1, y1) and end coordinates (x2, y2).
  // Subtract 1 to convert from 1-based indexing to 0-based array indexing.
  const [x1, y1, x2, y2] = readMany(4).map((it) => parseInt(it) - 1);

  // Initialize the game map.
  // This map stores the grid layout, e.g., obstacles.
  const map = [];
  for (let i = 0; i < h; i += 1) {
    // Read one line of input for each row of the map.
    // Split the line into individual characters.
    const line = readMany(1)[0].split("");
    // Push a new array containing the characters of the line to the map.
    // The spread operator `...` is used to create a shallow copy of the 'line' array.
    map.push([...line]);
  }

  // Initialize the BFS distance map.
  // This map will store the minimum steps to reach each cell.
  const bfsMap = [];
  // Iterate over each row of the grid.
  for (let i = 0; i < h; i += 1) {
    // Initialize an empty array for the current row in the BFS map.
    bfsMap.push([]);
    // Iterate over each column in the current row.
    for (let j = 0; j < w; j += 1) {
      // If the current cell in the original map is an obstacle ('@')...
      if (map[i][j] == "@") {
        // Mark it as unreachable/obstacle in the BFS map with -1.
        bfsMap[i].push(-1);
      } else {
        // Otherwise, mark it as unvisited/reachable with null.
        bfsMap[i].push(null);
      }
    }
  }

  // Set the starting position (x1, y1) in the BFS map to 0 steps.
  bfsMap[x1][y1] = 0;

  // Initialize the BFS queue with the starting coordinates.
  let bfsQueue = [[x1, y1]];

  /**
   * Safely sets a value in the bfsMap, checking for boundary conditions.
   * @param {number} x - The row index.
   * @param {number} y - The column index.
   * @param {*} value - The value to set.
   */
  const safeSet = (x, y, value) => {
    // Check if the coordinates are within the grid boundaries.
    if (x >= 0 && y >= 0 && x < h && y < w) {
      // If within bounds, set the value.
      bfsMap[x][y] = value;
    }
  };

  /**
   * Safely retrieves a value from the bfsMap, handling out-of-bounds access.
   * @param {number} x - The row index.
   * @param {number} y - The column index.
   * @returns {*} The value at (x, y) or undefined if out of bounds.
   */
  const safeGet = (x, y) => {
    // First, check if the row exists.
    const tmp = bfsMap[x];
    // If the row exists, then check if the column exists in that row.
    if (tmp) {
      return tmp[y];
    }
    // If row doesn't exist, implicitly returns undefined.
  };

  /**
   * A helper function to log the current state of the bfsMap for debugging.
   */
  const logMap = () => {
    // Print a blank line for separation.
    console.log();
    // Iterate over each row of the bfsMap.
    for (const m of bfsMap) {
      // Log the current row.
      console.log(m);
    }
  };

  // Main Breadth-First Search (BFS) loop.
  // Continues until the queue is empty or the target is found.
  while (true) {
    // Dequeue the next grid cell to process.
    const currentGrid = bfsQueue.shift();

    // If the queue is empty, break the loop (no path found or all reachable processed).
    if (!currentGrid) {
      break;
    }

    // Destructure the coordinates of the current cell.
    const [x, y] = currentGrid;

    // Calculate the step count for the next reachable cells.
    // It's one more than the current cell's step count.
    const nextStep = safeGet(x, y) + 1;

    // If the current cell is the target cell, we've found the shortest path.
    if (x == x2 && y == y2) {
      break;
    }

    /*
     * Explore possible moves from the current cell.
     * The character can move up to 'k' steps in each of the four cardinal directions.
     * For each direction, iterate from 1 to 'k' steps.
     */

    // --- Explore moving in the positive X direction (downwards) ---
    for (let i = 1; i <= k; i += 1) {
      // Calculate new coordinates.
      const nX = x + i;
      const nY = y;

      // Get the current state of the potential next cell.
      const cellState = safeGet(nX, nY);

      /*
       * If the cell is out of bounds (undefined) or an obstacle (-1),
       * then further steps in this direction are also blocked or out of bounds.
       * So, break this directional loop.
       */
      if (cellState === void 0 || cellState === -1) {
        break;
      }

      // If the cell has not been visited yet (null)...
      if (cellState === null) {
        // Set its step count.
        safeSet(nX, nY, nextStep);
        // Add it to the BFS queue for further exploration.
        bfsQueue.push([nX, nY]);
      }
    }

    // --- Explore moving in the negative X direction (upwards) ---
    for (let i = 1; i <= k; i += 1) {
      const nX = x - i;
      const nY = y;
      const cellState = safeGet(nX, nY);
      if (cellState === void 0 || cellState === -1) {
        break;
      }
      if (cellState === null) {
        safeSet(nX, nY, nextStep);
        bfsQueue.push([nX, nY]);
      }
    }

    // --- Explore moving in the positive Y direction (rightwards) ---
    for (let i = 1; i <= k; i += 1) {
      const nX = x;
      const nY = y + i;
      const cellState = safeGet(nX, nY);
      if (cellState === void 0 || cellState === -1) {
        break;
      }
      if (cellState === null) {
        safeSet(nX, nY, nextStep);
        bfsQueue.push([nX, nY]);
      }
    }

    // --- Explore moving in the negative Y direction (leftwards) ---
    for (let i = 1; i <= k; i += 1) {
      const nX = x;
      const nY = y - i;
      const cellState = safeGet(nX, nY);
      if (cellState === void 0 || cellState === -1) {
        break;
      }
      if (cellState === null) {
        safeSet(nX, nY, nextStep);
        bfsQueue.push([nX, nY]);
      }
    }
  }

  // After the BFS loop completes, check the target cell's value.
  // If the target cell (x2, y2) is still null, it means it was unreachable.
  if (safeGet(x2, y2) == null) {
    // Output -1 to indicate no path found.
    console.log("-1");
  } else {
    // Otherwise, output the minimum number of steps to reach the target.
    console.log(safeGet(x2, y2));
  }
})();
// End of the main program logic.