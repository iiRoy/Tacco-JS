function calculateAmidaPaths(inputString) {
  // Parse the input string into numerical values for height, width, and target column.
  // The input is expected to be space-separated numbers.
  const parsedValues = inputString.split(" ").map(item => ~~item);

  // Extract problem parameters
  const gridHeight = parsedValues[0]; // Represents H in the original problem
  const gridWidth = parsedValues[1];  // Represents W in the original problem
  const finalColumn = parsedValues[2]; // Represents K in the original problem

  // Define the modulo value for calculations to prevent integer overflow.
  const modulusValue = 10**9 + 7;

  // If the width is 1, there's only one possible path, so return 1 immediately.
  if (gridWidth === 1) {
    return 1;
  }

  // Generate a list of all valid Amida ladder configurations for a given width.
  // A configuration is valid if no two adjacent vertical lines are connected by a horizontal bar.
  // This means no "11" pattern in the binary representation of the configuration.
  const permissibleLadderConfigs = Array(2**(gridWidth - 1)) // Total possible configurations for W-1 gaps
    .fill(0) // Initialize with zeros
    .map((_, index) => index) // Map to their numerical index (0 to 2^(W-1)-1)
    .map(num => num.toString(2)) // Convert each index to its binary string representation
    .filter(binaryPattern => !/11/.test(binaryPattern)) // Filter out patterns with "11" (adjacent bars)
    .map(pattern => "000000" + pattern) // Prepend zeros for consistent length handling
    .map(longPattern => longPattern.slice(1 - gridWidth)) // Trim to the correct length (W-1 bits)
    .map(trimmedPattern => "0" + trimmedPattern + "0"); // Add '0' at both ends to simplify boundary checks

  // Initialize the dynamic programming table.
  // dpTable[i][j] will store the number of ways to reach column 'j' at row 'i'.
  const dpTable = Array(gridHeight + 1);
  for (let rowIndex = 0; rowIndex <= gridHeight; rowIndex++) {
    dpTable[rowIndex] = Array(gridWidth).fill(0);
  }

  // Base case: At row 0, there's 1 way to be at column 0 (starting point).
  dpTable[0][0] = 1;

  // Iterate through each row from 1 to H (inclusive).
  for (let currentRow = 1; currentRow <= gridHeight; currentRow++) {
    // For each row, consider every valid Amida configuration.
    permissibleLadderConfigs.forEach(function(currentAmidaConfig) {
      // For each configuration, calculate the path counts for all columns in the current row.
      for (let currentColumn = 0; currentColumn < gridWidth; currentColumn++) {
        // Determine the movement based on the current column and the Amida configuration.
        // "10" means a bar connects current column to the left, so we came from left (j-1).
        // "01" means a bar connects current column to the right, so we came from right (j+1).
        // "00" means no bar, so we came from the same column (j).
        ({
          "10": _ => dpTable[currentRow][currentColumn] += dpTable[currentRow - 1][currentColumn - 1],
          "01": _ => dpTable[currentRow][currentColumn] += dpTable[currentRow - 1][currentColumn + 1],
          "00": _ => dpTable[currentRow][currentColumn] += dpTable[currentRow - 1][currentColumn]
        })[currentAmidaConfig[currentColumn] + currentAmidaConfig[currentColumn + 1]]();

        // Apply modulo operation to keep the numbers within bounds.
        dpTable[currentRow][currentColumn] %= modulusValue;
      }
    });
  }

  // The final answer is the number of ways to reach the target column (K-1) at the final row (H).
  return dpTable[gridHeight][finalColumn - 1];
}

// This block handles input/output when the script is run in a Node.js environment.
// It reads from standard input, processes it using the main function, and prints the result.
if (typeof require !== 'undefined') {
  console.log(calculateAmidaPaths(require("fs").readFileSync("/dev/stdin", "utf8")));
}
