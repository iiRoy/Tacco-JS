var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string: trim, replace color characters with numeric codes, and split into lines.
var lineData = rawData.trim().replace(/W/g, "0").replace(/B/g, "1").replace(/R/g, "2").split("\n");

// Extract dimensions (number of rows and columns) from the first line.
var dimensions = lineData.shift().split(" ").map(Number);
var rows = dimensions[0]; // N
var cols = dimensions[1]; // M

// Calculate the cost to change each row to a solid color (white, blue, or red).
// rowCosts[k][0] = cost to make row k all white
// rowCosts[k][1] = cost to make row k all blue
// rowCosts[k][2] = cost to make row k all red
var rowCosts = lineData.map(function(currentLine) {
   // Initialize costs for current row assuming it's all white, all blue, all red.
   // Each element starts with 'cols' (total characters), then we subtract for matching colors.
   var lineColorCosts = [cols, cols, cols];
   for (var idx = 0; idx < cols; idx++) {
      // Decrement the cost for the actual color found at this position.
      // e.g., if currentLine[idx] is '0' (white), decrement lineColorCosts[0].
      lineColorCosts[currentLine[idx]]--;
   }
   return lineColorCosts;
});

// Initialize the minimum cost to a large value.
// The maximum possible cost for N=50, M=50 is 50*50 = 2500.
var minimumCost = 2500;

// Handle the special case where there are exactly 3 rows.
// In this scenario, the only possible split is row 0 white, row 1 blue, row 2 red.
if (rows == 3) {
   minimumCost = rowCosts[0][0] + rowCosts[1][1] + rowCosts[2][2];
}

// Iterate through all possible split points for the three color sections.
// The first split point (white-blue boundary) can be from row 1 up to row N-3.
for (var firstSplitRow = 1; firstSplitRow < rows - 2; firstSplitRow++) {
   // The second split point (blue-red boundary) can be from firstSplitRow + 1 up to row N-2.
   for (var secondSplitRow = firstSplitRow + 1; secondSplitRow < rows - 1; secondSplitRow++) {
      var currentTotalCost = 0;

      // Calculate cost for the white section (rows 0 to firstSplitRow - 1).
      // All these rows must be converted to white (color 0).
      var whiteRowIndex = firstSplitRow - 1;
      while (whiteRowIndex >= 0) {
         currentTotalCost += rowCosts[whiteRowIndex][0];
         whiteRowIndex--;
      }

      // Calculate cost for the blue section (rows firstSplitRow to secondSplitRow - 1).
      // All these rows must be converted to blue (color 1).
      for (var blueSectionRow = firstSplitRow; blueSectionRow < secondSplitRow; blueSectionRow++) {
         currentTotalCost += rowCosts[blueSectionRow][1];
      }

      // Calculate cost for the red section (rows secondSplitRow to N - 1).
      // All these rows must be converted to red (color 2).
      var redRowIndex = secondSplitRow;
      while (redRowIndex != rows - 1) {
         currentTotalCost += rowCosts[redRowIndex][2];
         redRowIndex++;
      }

      // Update the overall minimum cost found so far.
      minimumCost = Math.min(minimumCost, currentTotalCost);
   }
}

// Output the final calculated minimum cost.
console.log(minimumCost);
