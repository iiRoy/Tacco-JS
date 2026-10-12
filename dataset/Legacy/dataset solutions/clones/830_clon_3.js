var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
var processedLines = fileContent.trim();
var inputLines = processedLines.split("\n");

while (true) {
   var currentDimensionsStr = inputLines.shift().split(" ");
   var dimCheck = currentDimensionsStr[0] + " " + currentDimensionsStr[1];
   if (dimCheck === "0 0") {
      break;
   }

   var countN = parseInt(currentDimensionsStr[0], 10);
   var countM = parseInt(currentDimensionsStr[1], 10);

   var mValues = [];
   for (var mIdx = 0; mIdx < countM; mIdx++) {
      mValues.push(Number(inputLines.shift()));
   }

   var nValues = [];
   for (var nIdx = 0; nIdx < countN; nIdx++) {
      nValues.push(Number(inputLines.shift()));
   }

   var memoizationTable = [];
   var maxJValue = 255;

   for (var r = 0; r <= countN; r++) {
      var currentRow = [];
      for (var c = 0; c <= maxJValue; c++) {
         currentRow.push(Infinity);
      }
      memoizationTable.push(currentRow);
   }

   memoizationTable[0][128] = 0;

   for (var currentNStep = 1; currentNStep <= countN; currentNStep++) {
      for (var prevJState = 0; prevJState <= maxJValue; prevJState++) {
         var previousCost = memoizationTable[currentNStep - 1][prevJState];

         if (previousCost !== Infinity) {
            for (var mElementIterator = 0; mElementIterator < countM; mElementIterator++) {
               var potentialNextJ = prevJState + mValues[mElementIterator];
               
               var clampedNextJ = potentialNextJ;
               if (clampedNextJ < 0) {
                  clampedNextJ = 0;
               }
               if (clampedNextJ > maxJValue) {
                  clampedNextJ = maxJValue;
               }
               
               var currentNValue = nValues[currentNStep - 1];
               var costToAdd = Math.pow(currentNValue - clampedNextJ, 2);
               var newTotalCost = previousCost + costToAdd;
               
               memoizationTable[currentNStep][clampedNextJ] = Math.min(memoizationTable[currentNStep][clampedNextJ], newTotalCost);
            }
         }
      }
   }

   var overallMinimumCost = Infinity;
   var finalRow = memoizationTable[countN];
   for (var finalJ = 0; finalJ <= maxJValue; finalJ++) {
      overallMinimumCost = Math.min(overallMinimumCost, finalRow[finalJ]);
   }
   
   console.log(overallMinimumCost);
}
