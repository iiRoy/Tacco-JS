/**
 * This function simulates the movement of an entity within a grid,
 * considering both the entity's own movements and external constraints
 * that reduce its available movement space. The grid is 1-indexed.
 *
 * The core logic tracks a "reachable area" (min/max row/column) for the entity.
 * In each step:
 * 1. The entity attempts to move, which *expands* its reachable area.
 * 2. A check is performed to see if this expanded area goes beyond the overall grid boundaries.
 * 3. External forces *contract* the reachable area.
 * 4. A check is performed to see if the reachable area has collapsed (min > max).
 *
 * If at any point the entity cannot exist within the grid or its reachable area
 * becomes invalid, the simulation fails. Otherwise, it succeeds.
 *
 * @param {string[]} inputDataLines - An array of strings representing the input data.
 *   Expected format:
 *   - Line 1: Grid Height (H)
 *   - Line 2: Grid Width (W)
 *   - Line 3: Number of Steps (N)
 *   - Line 4: Initial Row (sr)
 *   - Line 5: Initial Column (sc)
 *   - Line 6: Player Movement Sequence (S)
 *   - Line 7: Enemy Constraint Sequence (T)
 */
function processGridMovement(inputDataLines) {
  // Helper function to parse and retrieve the next integer from the input array.
  const getNextInteger = () => parseInt(inputDataLines.shift(), 10);

  // Parse grid dimensions and step count
  const gridHeight = getNextInteger();
  const gridWidth = getNextInteger();
  const totalSteps = getNextInteger();

  // Parse initial coordinates for the entity
  const startingRow = getNextInteger();
  const startingCol = getNextInteger();

  // Parse the sequences of player moves and enemy constraints
  const playerActionSequence = inputDataLines.shift();
  const enemyConstraintSequence = inputDataLines.shift();

  // The minimum valid coordinate for any dimension in a 1-indexed grid.
  const minGridCoordinate = 1;

  // Initialize the current reachable area for the entity.
  // Initially, the entity is at a single point, so min and max are the same.
  let currentReachableArea = {
    minColumn: startingCol,
    maxColumn: startingCol,
    minRow: startingRow,
    maxRow: startingRow,
  };

  // Iterate through each step of the simulation.
  for (let stepIndex = 0; stepIndex < totalSteps; ++stepIndex) {
    // --- Step 1: Apply Player's Movement (Expands Reachable Area) ---
    const playerMoveDirection = playerActionSequence.charAt(stepIndex);

    // Update the reachable area based on the player's intended move.
    // Moving expands the range of cells the player *could* be in.
    switch (playerMoveDirection) {
      case 'L': // Player moves Left, so the leftmost boundary extends further left.
        currentReachableArea.minColumn--;
        break;
      case 'R': // Player moves Right, so the rightmost boundary extends further right.
        currentReachableArea.maxColumn++;
        break;
      case 'U': // Player moves Up, so the topmost boundary extends further up.
        currentReachableArea.minRow--;
        break;
      case 'D': // Player moves Down, so the bottommost boundary extends further down.
        currentReachableArea.maxRow++;
        break;
      // Default case handles any unexpected characters, which are ignored for this problem.
      default:
        break;
    }

    // --- Step 2: Check for Grid Boundary Violations after Player Move ---
    // If the expanded reachable area goes outside the overall grid, it's impossible.
    if (
      currentReachableArea.minColumn < minGridCoordinate || // Too far left
      currentReachableArea.maxColumn > gridWidth || // Too far right
      currentReachableArea.minRow < minGridCoordinate || // Too far up
      currentReachableArea.maxRow > gridHeight // Too far down
    ) {
      console.log("NO");
      return; // Exit early as the condition is impossible.
    }

    // --- Step 3: Apply Enemy Constraints (Contracts Reachable Area) ---
    const enemyPushDirection = enemyConstraintSequence.charAt(stepIndex);

    // The enemy pushes from one side, which restricts the reachable area from that side.
    // This effectively "pushes" the opposite boundary inward.
    switch (enemyPushDirection) {
      case 'L': // Enemy pushes from Left, reducing the available space from the right.
        // The right boundary cannot go below the minimum grid coordinate.
        let newMaxColumn = Math.max(minGridCoordinate, currentReachableArea.maxColumn - 1);
        currentReachableArea.maxColumn = newMaxColumn;
        break;
      case 'R': // Enemy pushes from Right, reducing the available space from the left.
        // The left boundary cannot exceed the grid width.
        let newMinColumn = Math.min(gridWidth, currentReachableArea.minColumn + 1);
        currentReachableArea.minColumn = newMinColumn;
        break;
      case 'U': // Enemy pushes from Top, reducing the available space from the bottom.
        // The bottom boundary cannot go below the minimum grid coordinate.
        let newMaxRow = Math.max(minGridCoordinate, currentReachableArea.maxRow - 1);
        currentReachableArea.maxRow = newMaxRow;
        break;
      case 'D': // Enemy pushes from Bottom, reducing the available space from the top.
        // The top boundary cannot exceed the grid height.
        let newMinRow = Math.min(gridHeight, currentReachableArea.minRow + 1);
        currentReachableArea.minRow = newMinRow;
        break;
      default:
        break;
    }

    // --- Step 4: Check for Collapsed Reachable Area after Enemy Push ---
    // If, after the enemy's push, the minimum boundary exceeds the maximum boundary
    // in either dimension, the reachable area has collapsed, making it impossible.
    if (
      currentReachableArea.minColumn > currentReachableArea.maxColumn ||
      currentReachableArea.minRow > currentReachableArea.maxRow
    ) {
      console.log("NO");
      return; // Exit early as the condition is impossible.
    }
  }

  // If the loop completes without an early exit, it means the entity
  // could always find a valid position within the grid.
  console.log("YES");
}

// Read input from standard input, remove leading/trailing whitespace,
// and split into an array by newlines or spaces.
processGridMovement(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));