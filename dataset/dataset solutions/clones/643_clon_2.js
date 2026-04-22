var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedLines = sourceData.trim().replace(/G/g, "0").replace(/P/g, "1").replace(/O/g, "2").split("\n");
var gridDimensions = processedLines.shift().split(" ").map(Number);
var numRows = gridDimensions[0];
var numCols = gridDimensions[1];
var rowColorCostMatrix = processedLines.map(function(currentLineData) {
   var lineCosts = [numCols, numCols, numCols];
   for (var charIndex = 0; charIndex < numCols; charIndex++) {
      lineCosts[parseInt(currentLineData[charIndex])]--;
   }
   return lineCosts;
});
var smallestOverallCost = 2500;
for (var rowBoundaryOne = 0; rowBoundaryOne < numRows ; rowBoundaryOne++) {
   for (var rowBoundaryTwo = 0; rowBoundaryTwo < numRows ; rowBoundaryTwo++) {
      var segmentValidityFlags = [0,0,0];
      var currentAccumulatedCost = 0;
      var currentRowPointer = 0;
      while(currentRowPointer < rowBoundaryOne){
         segmentValidityFlags[0] = 1;
         currentAccumulatedCost += rowColorCostMatrix[currentRowPointer][0];
         currentRowPointer++;
      }
      while(currentRowPointer < rowBoundaryTwo){
         segmentValidityFlags[1] = 1;
         currentAccumulatedCost += rowColorCostMatrix[currentRowPointer][1];
         currentRowPointer++;
      }
      while(currentRowPointer < numRows){
         segmentValidityFlags[2] = 1;
         currentAccumulatedCost += rowColorCostMatrix[currentRowPointer][2];
         currentRowPointer++;
      }
      if (segmentValidityFlags[0] + segmentValidityFlags[1] + segmentValidityFlags[2] === 3)smallestOverallCost = Math.min(currentAccumulatedCost, smallestOverallCost);
   }
}
console.log(smallestOverallCost);