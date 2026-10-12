function ProcessInput(rawData) {
  // The input string is split by spaces and each part is converted to an integer.
  // The bitwise NOT operator (~~) is used as a concise way to perform floor division/truncation.
  rawData = rawData.split(" ").map(item => ~~item);

  // Extract the problem's height, width, and target column from the processed input.
  var heightVal = rawData[0];
  var widthVal = rawData[1];
  var targetCol = rawData[2];

  // Define the modulo constant to keep results within a specific range, preventing overflow.
  var moduloConst = 1000000007;

  // Handle a special edge case: if the width is 1, there's only one possible path.
  if (widthVal === 1) {
    return 1;
  }

  // Generate a list of all valid Amida (ladder) configurations for a single row.
  // A configuration is valid if no two adjacent vertical lines have a horizontal bar ('11' pattern).
  var permissibleLadderConfigs = Array(Math.pow(2, (widthVal - 1))) // Create an array with 2^(W-1) elements
    .fill(0) // Initialize all elements to 0
    .map((_unused, indexVal) => indexVal) // Map each element to its index (0 to 2^(W-1) - 1)
    .map(indexVal => indexVal.toString(2)) // Convert each index to its binary string representation
    .filter(configStr => !/11/.test(configStr)) // Filter out configurations that contain "11" (invalid horizontal bars)
    .map(configStr => "000000" + configStr) // Prepend "000000" to ensure sufficient leading zeros for slicing
    .map(configStr => configStr.slice(1 - widthVal)) // Slice to get the correct length (W-1 bits)
    .map(configStr => "0" + configStr + "0"); // Add '0' at both ends for simplified boundary checks in the DP loop

  // Initialize the dynamic programming table.
  // `dynamicProgressionGrid[r][c]` will store the number of ways to reach column `c` at row `r`.
  var dynamicProgressionGrid = Array(heightVal + 1);
  for (var rowIdx = 0; rowIdx <= heightVal; rowIdx++) {
    dynamicProgressionGrid[rowIdx] = Array(widthVal).fill(0);
  }

  // Set the base case: there is 1 way to be at column 0 at the starting row (row 0).
  dynamicProgressionGrid[0][0] = 1;

  // Iterate through each row of the Amida ladder, starting from the first row (index 1).
  for (var rowIdx = 1; rowIdx <= heightVal; rowIdx++) {
    // For each valid Amida configuration for the current row:
    permissibleLadderConfigs.forEach(function(configStr) {
      // Iterate through each column in the current row.
      for (var colIdx = 0; colIdx < widthVal; colIdx++) {
        // Use an object literal to simulate a switch-like behavior based on the current and next bit in the configuration string.
        // This determines how the path moves from the previous row to the current column.
        ({
          "10": () => dynamicProgressionGrid[rowIdx][colIdx] += dynamicProgressionGrid[rowIdx - 1][colIdx - 1], // Move from left (j-1) to current (j)
          "01": () => dynamicProgressionGrid[rowIdx][colIdx] += dynamicProgressionGrid[rowIdx - 1][colIdx + 1], // Move from right (j+1) to current (j)
          "00": () => dynamicProgressionGrid[rowIdx][colIdx] += dynamicProgressionGrid[rowIdx - 1][colIdx] // Stay in the same column (j)
        })[configStr[colIdx] + configStr[colIdx + 1]](); // Execute the function corresponding to the combined bits.

        // Apply the modulo operation to keep the result within the defined range.
        dynamicProgressionGrid[rowIdx][colIdx] %= moduloConst;
      }
    });
  }

  // The final result is the number of ways to reach the target column (K-1) at the maximum height (H).
  return dynamicProgressionGrid[heightVal][targetCol - 1];
}

// This block handles reading input from stdin and printing the result to stdout,
// typical for competitive programming environments.
if (typeof require !== 'undefined') {
  console.log(ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8")));
}
