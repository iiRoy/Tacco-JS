/*
 * This module processes input data to calculate a specific grid-related value.
 * The calculation determines the number of 'inner' cells in a rectangular grid
 * after removing a border of two units from each side.
 */
function SolveGridProblem(sourceData) {
  // Parse the input string into two BigInt values representing grid dimensions.
  // The input is expected to be two space-separated numbers.
  const [horizontalExtent, verticalExtent] = sourceData
    .split(" ") // Split the string by space
    .map(BigInt); // Convert each part to a BigInt

  // Perform the core calculation based on the grid dimensions.
  // The logic handles edge cases where one or both dimensions are small (1 or 2).
  const calculatedResult = (
    (horizontalExtent === 1n || verticalExtent === 1n) // Check if either dimension is 1
      ? (
          (horizontalExtent === verticalExtent) // If both are 1 (implies 1x1 grid)
            ? 0n // Result is zero for a 1x1 grid
            : (horizontalExtent === 1n) // If only horizontal extent is 1
              ? verticalExtent - 2n // Adjust vertical extent, effectively 0 if vertical is 1 or 2
              : horizontalExtent - 2n // If only vertical extent is 1, adjust horizontal extent
        )
      : horizontalExtent * verticalExtent - // For larger grids, calculate total area
        ((horizontalExtent - 2n) * 2n + (verticalExtent - 2n) * 2n) - // Subtract perimeter-like sections
        4n // Subtract corners
  );

  // Output the final computed value as a string to the console.
  console.log(calculatedResult.toString());
}

// Execute the main problem solver with data read from standard input.
// The input is read as a UTF-8 string and any leading/trailing whitespace is removed.
SolveGridProblem(
  require("fs")
    .readFileSync("/dev/stdin", "utf8") // Read file from standard input
    .trim() // Remove whitespace
);