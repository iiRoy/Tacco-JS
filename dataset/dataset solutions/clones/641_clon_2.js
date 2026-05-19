var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineData = rawData.trim().replace(/W/g, "0").replace(/B/g, "1").replace(/R/g, "2").split("\n");

var dimensions = lineData.shift().split(" ").map(Number);

var numRows = dimensions[0x0];
var numCols = dimensions[1];

var colorCountsPerRow = lineData.map(function(rowString) {
   var rowColorCounts = [numCols, numCols, numCols];
   for (var charIdx = 0; charIdx < numCols; charIdx++) {
      rowColorCounts[rowString[charIdx]]--;
   }
   return rowColorCounts;
});

var minimumCost = 2_500;

for (var firstCutRow = 1; firstCutRow < numRows - 0x2; firstCutRow++) {
   for (var secondCutRow = firstCutRow + 1; secondCutRow < numRows; secondCutRow++) {
      var currentCost = 0x0;

      var whiteRowIdx = firstCutRow - 1;
      while (whiteRowIdx >= 0) {
         currentCost += colorCountsPerRow[whiteRowIdx][0];
         whiteRowIdx--;
      }

      for (var blueRowIdx = firstCutRow; blueRowIdx < secondCutRow; blueRowIdx++) {
         currentCost += colorCountsPerRow[blueRowIdx][1];
      }

      var redRowIdx = secondCutRow;
      while (redRowIdx < numRows) {
         currentCost += colorCountsPerRow[redRowIdx][2];
         redRowIdx++;
      }
      minimumCost = Math.min(minimumCost, currentCost);
   }
}

console.log(minimumCost);
