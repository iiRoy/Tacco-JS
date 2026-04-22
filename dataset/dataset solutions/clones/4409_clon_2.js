function displayMessage(messageContent){
  console.log(messageContent); // Output a given string to the console
}

function ProcessData(rawData) {
  // The following lines are examples of various input parsing strategies.
  // rawData = parseInt(rawData); // Convert input to an integer
  // rawData = rawData.trim().split(" "); // Split input by spaces into an array
  rawData = rawData.trim().split("\n"); // The active input processing: split by newlines
  // rawData = rawData.trim().split(" ").map((element)=>Number(element)); // Split by spaces and convert elements to numbers
  // rawData = rawData.trim().split("\n").map((element)=>Number(element)); // Split by newlines and convert elements to numbers

  /*
   * This section describes the logic for calculating arrangements in a 2xN grid.
   * Consider a 2x2 block:
   * - If the first column is vertical (top char == bottom char), there are 3 ways to fill it.
   * - If the first column is horizontal (top char != bottom char), there are 6 ways to fill the first 2 columns.
   *
   * Subsequent columns depend on the previous column's orientation (vertical or horizontal).
   * - If the previous column was vertical, and the current column is vertical, 2 ways.
   * - If the previous column was vertical, and the current column is horizontal, 2 ways.
   * - If the previous column was horizontal, and the current column is vertical, 1 way.
   * - If the previous column was horizontal, and the current column is horizontal, 3 ways.
   */

  var gridSize = parseInt(rawData[0]); // Extract the grid dimension from the first line of input
  var firstRowChars = rawData[1].split(""); // Get characters for the first row
  var secondRowChars = rawData[2].split(""); // Get characters for the second row
  var totalArrangements = 1; // Initialize the count of unique arrangements
  var moduloValue = 1000000007; // A large prime number for modulo operations
  var wasVertical = true; // Flag to track if the preceding block was arranged vertically (true) or horizontally (false)

  for(var columnIndex = 0; columnIndex < gridSize; columnIndex++) {
    if(columnIndex == 0) { // Special handling for the very first column
      if(firstRowChars[columnIndex] == secondRowChars[columnIndex]) {
        totalArrangements = totalArrangements * 3 % moduloValue; // First column is vertical: 3 options
      } else {
        totalArrangements = totalArrangements * 6 % moduloValue; // First two columns are horizontal: 6 options
        columnIndex++; // Consume the next column as well
        wasVertical = false; // Mark the current block as horizontal
      }
    } else { // Processing for subsequent columns
      if(wasVertical) { // If the previous block was vertical
        totalArrangements = totalArrangements * 2 % moduloValue; // Always 2 options when extending from a vertical block
        if(firstRowChars[columnIndex] == secondRowChars[columnIndex]) {
          wasVertical = true; // Current column is vertical, so the next block starts vertically
        } else {
          columnIndex++; // Current column is horizontal, consume next column
          wasVertical = false; // Mark the current block as horizontal
        }
      } else { // If the previous block was horizontal
        if(firstRowChars[columnIndex] == secondRowChars[columnIndex]) {
          wasVertical = true; // Current column is vertical, next block starts vertically
        } else {
          totalArrangements = totalArrangements * 3 % moduloValue; // Current block is horizontal, 3 options
          columnIndex++; // Consume next column
          wasVertical = false; // Mark the current block as horizontal
        }
      }
    }
    // Debugging line (originally commented out): displayMessage(firstRowChars[columnIndex]+secondRowChars[columnIndex] + ":" + totalArrangements);
  }
  displayMessage(totalArrangements); // Output the final calculated number of arrangements
}

// Read input from standard input, trim whitespace, and pass it to the main processing function
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());