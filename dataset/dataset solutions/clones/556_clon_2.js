let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const lineBuffer = rawData.trim().split('\n');

while (true) {
   let matrixDimsStr = lineBuffer.shift();

   if (matrixDimsStr === "0 0") {
      break;
   }

   const dimensions = matrixDimsStr.split(' ').map(Number);
   const numRows = dimensions[0];
   const numCols = dimensions[1];

   let columnData = [];
   for (let colIndex = 0; colIndex < numCols; colIndex++) {
      columnData.push({ originalIdentifier: (colIndex + 1), accumulatedValue: 0 });
   }

   for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      const rowValues = lineBuffer.shift().split(' ').map(Number);
      columnData.forEach(function(currentCol, currentIdx) {
         columnData[currentIdx].accumulatedValue += rowValues[currentIdx];
      });
   }

   columnData.sort(function(itemA, itemB) {
      let valueA = itemA.accumulatedValue;
      let valueB = itemB.accumulatedValue;
      if (valueA < valueB) {
         return true;
      } else {
         return false;
      }
   });

   let sortedIdentifiers = [];
   columnData.forEach(function(colItem) {
      sortedIdentifiers.push(colItem.originalIdentifier);
   });

   console.log(sortedIdentifiers.join(' '));
}
