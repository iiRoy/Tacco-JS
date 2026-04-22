function calculateAmidaPaths(inputStringData) {
  // Parse the input string, splitting by space and converting each part to an integer.
  // Using `parseInt` with radix 10 for explicit base conversion.
  const numericInputs = inputStringData.split(" ").map(val => parseInt(val, 10));

  // Assign parsed values to more descriptive variable names.
  const totalHeight = numericInputs[0];
  const gridWidth = numericInputs[1];
  const targetColumnIndex = numericInputs[2]; // This is K from the problem statement (1-indexed).
  const primeModulo = 1000000007; // A large prime number for modulo operations.

  // --- Type III Addition: Input Validation ---
  // Guard clauses for invalid or out-of-bounds inputs.
  // If any dimension is non-positive or target is out of range, there are no valid paths.
  if (totalHeight <= 0 || gridWidth <= 0 || targetColumnIndex <= 0 || targetColumnIndex > gridWidth) {
    return 0; 
  }

  // --- Type III Update: Early Exit Condition ---
  // If the grid has only one column, there's only one path, which is to stay in that column.
  // This is an essential statement, kept but slightly rephrased.
  if (gridWidth === 1) {
    return 1;
  }

  // --- Type III Addition: Helper Function for Modulo Arithmetic ---
  // Encapsulates the modulo addition to keep the main logic cleaner and prevent negative results.
  const addMod = (val1, val2) => (val1 + val2) % primeModulo;

  // --- Type III Rewrite: Generation of Permissible Ladder Configurations ---
  // This section determines all valid patterns of horizontal bars for a single row.
  // A '1' indicates a horizontal bar, '0' indicates no bar.
  // The rule is that no two '1's (adjacent bars) are allowed.
  const maxPossibleBarCombinations = 1 << (gridWidth - 1); // Equivalent to Math.pow(2, gridWidth - 1)
  
  const permissibleLadderConfigs = [];
  // Iterate through all possible binary combinations for (gridWidth - 1) bar positions.
  for (let configIndex = 0; configIndex < maxPossibleBarCombinations; configIndex++) {
    // Convert the current index to its binary string representation.
    // Use `padStart` for a cleaner way to ensure consistent length with leading zeros.
    const binaryConfigRepresentation = configIndex.toString(2).padStart(gridWidth - 1, '0');

    // Filter out configurations that have adjacent horizontal bars ("11").
    if (!binaryConfigRepresentation.includes("11")) {
      // Pad the valid binary configuration with '0's at both ends.
      // This simplifies boundary checks in the DP calculation:
      // '0' at index 0 means no bar to the left of column 0.
      // '0' at index `gridWidth` means no bar to the right of column `gridWidth-1`.
      permissibleLadderConfigs.push("0" + binaryConfigRepresentation + "0");
    }
  }

  // --- Type III Rewrite: Dynamic Programming Grid Initialization ---
  // `pathCountsGrid[row][column]` will store the number of ways to reach `column` after `row` steps.
  // Initialize all cells to 0. `Array.from` is used for a more functional style of initialization.
  const pathCountsGrid = Array.from({ length: totalHeight + 1 }, () => Array(gridWidth).fill(0));

  // Base case: At row 0 (the starting point), there is 1 way to be at column 0.
  // This assumes the journey always starts at the leftmost column.
  pathCountsGrid[0][0] = 1;

  // --- Type III Rewrite: Main DP Calculation Loop ---
  // Iterate through each row from 1 up to the total specified height.
  for (let currentRow = 1; currentRow <= totalHeight; currentRow++) {
    // For each valid ladder configuration identified earlier.
    for (const currentConfigPattern of permissibleLadderConfigs) {
      // For each column in the current row.
      for (let currentColumn = 0; currentColumn < gridWidth; currentColumn++) {
        // Determine movement based on the current ladder configuration.
        // `currentConfigPattern[k]` represents a bar between column `k-1` and `k`.
        // `currentConfigPattern[currentColumn]` checks for a bar between `currentColumn-1` and `currentColumn`.
        // `currentConfigPattern[currentColumn + 1]` checks for a bar between `currentColumn` and `currentColumn+1`.

        const hasBarToLeft = currentConfigPattern[currentColumn] === '1';
        const hasBarToRight = currentConfigPattern[currentColumn + 1] === '1';

        // --- Type III Rewrite: Conditional Logic for Movement ---
        // Replacing the object lookup with explicit if-else if-else for improved readability.
        if (hasBarToLeft) {
          // If there's a bar to the left of `currentColumn`, we must have come from `currentColumn - 1`.
          pathCountsGrid[currentRow][currentColumn] = addMod(
            pathCountsGrid[currentRow][currentColumn],
            pathCountsGrid[currentRow - 1][currentColumn - 1]
          );
        } else if (hasBarToRight) {
          // If there's a bar to the right of `currentColumn`, we must have come from `currentColumn + 1`.
          pathCountsGrid[currentRow][currentColumn] = addMod(
            pathCountsGrid[currentRow][currentColumn],
            pathCountsGrid[currentRow - 1][currentColumn + 1]
          );
        } else {
          // If there are no bars immediately left or right, we must have stayed in `currentColumn`.
          pathCountsGrid[currentRow][currentColumn] = addMod(
            pathCountsGrid[currentRow][currentColumn],
            pathCountsGrid[currentRow - 1][currentColumn]
          );
        }
      }
    }
  }

  // The final result is the number of ways to reach the `targetColumnIndex - 1` (0-indexed)
  // at the `totalHeight` row.
  return pathCountsGrid[totalHeight][targetColumnIndex - 1];
}

// --- Global Execution Block (Type III Addition/Update) ---
// This block handles reading input and printing output, typically for competitive programming environments.
// Added robustness for different execution environments.
if (typeof require !== 'undefined' && require.main === module) {
  const fs = require("fs");
  let programInputData;
  try {
    // Attempt to read from standard input, common in competitive programming.
    programInputData = fs.readFileSync("/dev/stdin", "utf8");
  } catch (e) {
    // --- Type III Addition: Fallback for Local Testing ---
    // If /dev/stdin is not available (e.g., local execution without piping input),
    // a warning is issued, and a default test input is used.
    console.warn("Could not read from /dev/stdin. Using default test input '2 3 2' (H=2, W=3, K=2).");
    programInputData = "2 3 2"; 
  }
  console.log(calculateAmidaPaths(programInputData));
}