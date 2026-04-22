// This JavaScript module provides a solution to calculate the number of distinct paths
// through a specific type of grid, often referred to as an Amida lottery or ladder.
// The calculation involves dynamic programming and adheres to specific rules for ladder configurations.

/**
 * Computes the total number of ways to reach a specific target column at a given height
 * in an Amida-style grid, respecting certain ladder placement rules.
 *
 * @param {string} rawData - A space-separated string containing three integers:
 *                           gridHeight (H), gridWidth (W), and targetColumn (K).
 * @returns {number} The total count of valid paths to the target column, modulo a prime.
 */
function ComputeSolution(rawData) {
  // Parse the input string into an array of numerical values.
  // Each string segment is converted to an integer using parseInt.
  const parsedValues = rawData.split(" ").map(numStr => parseInt(numStr, 10));

  // Destructure the parsed values into meaningful variables for grid dimensions.
  const gridHeight = parsedValues[0];      // Represents the total height (H) of the grid.
  const gridWidth = parsedValues[1];       // Represents the total width (W) of the grid.
  const targetColumn = parsedValues[2];    // Represents the 1-indexed target column (K).

  // A large prime number used as a modulus to prevent integer overflow in calculations.
  const primeModulus = 1_000_000_007;

  // Edge case: If the grid width is 1, there's only one possible path.
  if (gridWidth === 1) return 1;

  // --- Ladder Configuration Generation ---
  // Generate a list of all valid horizontal ladder rung configurations for each level.
  // A configuration is valid if no two adjacent rungs exist (represented by "11").
  const permissibleLadderConfigs = new Array(Math.pow(2, gridWidth - 1)) // Total possible configurations for W-1 gaps.
    .fill(0)                                 // Initialize array elements (values are not important here).
    .map((_unused, index) => index)          // Map to their integer indices (0 to 2^(W-1)-1).
    .map(configIndex => configIndex.toString(2)) // Convert each index to its binary string representation.
    .filter(binaryString => !/11/.test(binaryString)) // Filter out invalid configurations (containing "11").
    // Pad with leading zeros to ensure consistent length for string manipulation.
    .map(shortString => "0000000" + shortString)
    // Trim the padded string to match the required length (gridWidth - 1 bits).
    .map(paddedString => paddedString.slice(1 - gridWidth))
    // Add a '0' at both ends of the binary string. This simplifies boundary checks
    // when checking for '10', '01', or '00' patterns at grid edges.
    .map(finalString => "0" + finalString + "0");

  // --- Dynamic Programming Table Initialization ---
  // `waysToReach` is a 2D array where `waysToReach[r][c]` stores the number of ways
  // to reach cell (r, c) from the starting point.
  let waysToReach = new Array(gridHeight + 1);
  for (let rowIdx = 0; rowIdx <= gridHeight; rowIdx++) {
    waysToReach[rowIdx] = new Array(gridWidth).fill(0);
  }

  // Base case: There is exactly one way to be at the starting position (0, 0).
  waysToReach[0][0] = 1;

  // --- Dynamic Programming Calculation ---
  // Iterate through each level (row) of the grid, starting from the first level.
  for (let currentLevel = 1; currentLevel <= gridHeight; currentLevel++) {
    // For each level, apply every valid ladder configuration.
    permissibleLadderConfigs.forEach(function(currentConfig) {
      // For each configuration, calculate the ways to reach each column in the current level.
      for (let currentPos = 0; currentPos < gridWidth; currentPos++) {
        // Define a lookup object for state transitions based on rung patterns.
        // "10": Rung on the left, means coming from the left column.
        // "01": Rung on the right, means coming from the right column.
        // "00": No rung, means coming from the same column.
        const transitionMap = {
          "10": () => waysToReach[currentLevel][currentPos] += waysToReach[currentLevel - 1][currentPos - 1],
          "01": () => waysToReach[currentLevel][currentPos] += waysToReach[currentLevel - 1][currentPos + 1],
          "00": () => waysToReach[currentLevel][currentPos] += waysToReach[currentLevel - 1][currentPos]
        };

        // Execute the appropriate transition function based on the two-bit pattern
        // formed by the current position and its right neighbor in the configuration.
        transitionMap[currentConfig[currentPos] + currentConfig[currentPos + 1]]();

        // Apply the prime modulus to the result to keep the number within limits.
        waysToReach[currentLevel][currentPos] %= primeModulus;
      }
    });
  }

  // The final answer is the number of ways to reach the `targetColumn` at the `gridHeight`.
  // Note: `targetColumn` is 1-indexed, so we use `targetColumn - 1` for 0-indexed array access.
  return waysToReach[gridHeight][targetColumn - 1];
}

// Environment check: If running in a Node.js-like environment, read input from stdin.
if (typeof module !== 'undefined' && module.exports) {
  // Alias the global 'require' function to 'nodeModuleLoader' to adhere to renaming rules.
  const nodeModuleLoader = require;
  const fileSystemModule = nodeModuleLoader("fs"); // Load the file system module.
  const encodingType = "utf8";                     // Define the character encoding for input.

  // Read the entire content of standard input, then compute and print the solution.
  const inputData = fileSystemModule.readFileSync("/dev/stdin", encodingType);
  console.info(ComputeSolution(inputData));
}