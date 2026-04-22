// This script simulates a basic pathfinding scenario on a grid.
// It determines the minimum "warp" operations needed to reach a target location.

/**
 * Robustly parses a string into an integer.
 * If the string cannot be converted, it returns a specified default value.
 * @param {string} incomingString - The string value intended to be an integer.
 * @param {number} [fallbackValue=0] - The value to return if parsing fails.
 * @returns {number} The successfully parsed integer or the fallback value.
 */
const stringToInteger = (incomingString, fallbackValue = 0) => {
  const numericVal = Number(incomingString);
  return Number.isNaN(numericVal) ? fallbackValue : numericVal;
};

// Define a set of configuration constants for the simulation environment.
const GRID_PATH_ELEMENT = "."; // Represents an open, traversable path segment.
const GRID_WALL_ELEMENT = "#"; // Represents an impassable barrier on the grid.
const WARP_DISTANCE_THRESHOLD = 2; // Maximum Chebyshev distance for a "teleport" to activate.
const MAX_EXECUTION_STEPS = 10000; // A safety limit for the main simulation loop to prevent infinite runs.

function executeGridTraversal(rawInputData) {
  // First, normalize the input by trimming any surrounding whitespace.
  const cleanedInput = rawInputData.trim();
  // Then, split the input string into an array of individual text lines.
  const inputLineArray = cleanedInput.split("\n");

  // Perform an initial check to ensure there's enough data for basic setup.
  if (inputLineArray.length < 4) {
    // console.error("Input data is incomplete; expected at least 4 lines for configuration.");
    return; // Exit if critical data is missing.
  }

  // Parse the grid dimensions from the very first line of input.
  const [yDimensionString, xDimensionString] = inputLineArray[0].split(" ");
  const gridHeight = stringToInteger(yDimensionString);
  const gridWidth = stringToInteger(xDimensionString);

  // Parse the starting coordinates for the player character from the second line.
  const [initialYString, initialXString] = inputLineArray[1].split(" ");
  let playerCurrentY = stringToInteger(initialYString) - 1; // Adjust to 0-indexed system.
  let playerCurrentX = stringToInteger(initialXString) - 1; // Adjust to 0-indexed system.

  // Parse the target (goal) coordinates from the third line.
  const [destinationYString, destinationXString] = inputLineArray[2].split(" ");
  const targetY = stringToInteger(destinationYString) - 1; // Adjust to 0-indexed system.
  const targetX = stringToInteger(destinationXString) - 1; // Adjust to 0-indexed system.

  // Construct the actual game grid from the remaining lines of input data.
  // This loop ensures the grid matches the declared height and handles potential input shortages.
  const simulationGrid = [];
  for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    const dataLineIndex = rowIndex + 3; // Grid data starts from the 4th line (index 3).
    if (dataLineIndex < inputLineArray.length) {
      simulationGrid.push(inputLineArray[dataLineIndex].split(""));
    } else {
      // If input lines are fewer than expected, pad the grid with wall elements.
      simulationGrid.push(Array(gridWidth).fill(GRID_WALL_ELEMENT));
    }
  }

  // A final validation step to ensure the parsed grid's dimensions match the declared ones.
  if (simulationGrid.length !== gridHeight || simulationGrid.some(row => row.length !== gridWidth)) {
    // console.error("Mismatch: Declared grid dimensions do not align with the actual parsed grid data.");
    return; // Exit if there's a structural inconsistency.
  }

  // Initialize a counter for the number of "teleport" operations performed.
  let numberOfTeleports = 0;
  // Initialize a counter for the total number of simulation steps executed.
  let totalSimulationSteps = 0;

  /**
   * Generates a human-readable string representation of the current grid state.
   * This function is primarily for internal debugging or visual output.
   * @param {Array<Array<string>>} gridView - The 2D array representing the grid's current layout.
   * @returns {string} A multi-line string depicting the grid.
   */
  const constructGridDisplay = (gridView) => {
    let graphicalOutput = "";
    for (let r = 0; r < gridView.length; r++) {
      graphicalOutput += gridView[r].join("") + "\n";
    }
    return graphicalOutput;
  };

  /**
   * Computes the absolute difference between two numerical values.
   * @param {number} valueA - The first number.
   * @param {number} valueB - The second number.
   * @returns {number} The positive difference between valueA and valueB.
   */
  const calculateDelta = (valueA, valueB) => {
    return Math.abs(valueA - valueB);
  };

  /**
   * Executes a single step of player movement or a "teleport" action.
   * This function encapsulates the core movement logic of the simulation.
   */
  const performPlayerAction = () => {
    totalSimulationSteps++; // Record this action attempt.

    let moveOccurred = false; // Flag to track if a direct movement was made.

    // Attempt to move right: if targetX is greater, and the path to the right is clear and within bounds.
    if (targetX > playerCurrentX &&
      playerCurrentX + 1 < gridWidth &&
      simulationGrid[playerCurrentY][playerCurrentX + 1] === GRID_PATH_ELEMENT) {
      playerCurrentX++;
      moveOccurred = true;
    }
    // If no rightward move, attempt to move down: if targetY is greater, and the path below is clear and within bounds.
    else if (targetY > playerCurrentY &&
      playerCurrentY + 1 < gridHeight &&
      simulationGrid[playerCurrentY + 1][playerCurrentX] === GRID_PATH_ELEMENT) {
      playerCurrentY++;
      moveOccurred = true;
    }

    // If no direct path movement was possible, evaluate for a "teleport" opportunity.
    if (!moveOccurred) {
      const yDifference = calculateDelta(targetY, playerCurrentY);
      const xDifference = calculateDelta(targetX, playerCurrentX);

      // A teleport occurs if the player is within the defined warp distance threshold (Chebyshev distance).
      if (yDifference <= WARP_DISTANCE_THRESHOLD && xDifference <= WARP_DISTANCE_THRESHOLD) {
        playerCurrentY = targetY; // Instantly move player to the target's Y coordinate.
        playerCurrentX = targetX; // Instantly move player to the target's X coordinate.
        numberOfTeleports++; // Increment the teleport counter.
      }
      // If neither a direct move nor a teleport happens, the player remains stationary for this step.
      // This scenario is implicitly handled by the MAX_EXECUTION_STEPS to prevent infinite loops.
    }
    // The original visualization call from the 'move' function has been removed as it was not essential for the final output.
  };

  // The primary simulation loop: continues until the player reaches the target
  // or the maximum allowed simulation steps are exceeded (as a safety measure).
  while ((playerCurrentY !== targetY || playerCurrentX !== targetX) && totalSimulationSteps < MAX_EXECUTION_STEPS) {
    performPlayerAction();
  }

  // Output the final tally of "teleport" actions to the console.
  console.log(numberOfTeleports);

  // An optional warning message if the simulation terminated due to reaching the step limit.
  if (totalSimulationSteps >= MAX_EXECUTION_STEPS && (playerCurrentY !== targetY || playerCurrentX !== targetX)) {
    // console.warn("Simulation halted: maximum execution steps reached before the goal was achieved.");
  }
}

// Invoke the main simulation function, reading input from standard input.
executeGridTraversal(require("fs").readFileSync("/dev/stdin", "utf8"));