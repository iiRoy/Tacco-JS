let dimensions;
let gridData;

function detonate(rowCoord, colCoord, targetVal) {
   const rowOffsets = [0, 0, -1, 1];
   const colOffsets = [-1, 1, 0, 0];

   for (let idx = 0; idx < 4; idx++) {
      let nextRow = rowCoord + rowOffsets[idx];
      let nextCol = colCoord + colOffsets[idx];

      // Check if the adjacent cell is within the grid boundaries.
      if (nextRow < 0 || nextRow >= dimensions[0] || nextCol < 0 || nextCol >= dimensions[1]) {
         continue;
      }

      // If the cell's value matches the target, clear it and recursively process neighbors.
      if (targetVal === gridData[nextRow][nextCol]) {
         gridData[nextRow][nextCol] = 0;
         detonate(nextRow, nextCol, targetVal);
      }
   }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = (fileContent.trim()).split("\n");

while (true) {
   // Read grid dimensions (rows and columns) for the current test case.
   dimensions = (lineSegments.shift()).split(" ").map(Number);

   // If both dimensions are zero, it's the termination condition.
   if (dimensions[0] === 0 && dimensions[1] === 0) {
      break;
   }

   // Initialize the 2D array representing the grid.
   gridData = [];
   for (let rowIndex = 0; rowIndex < dimensions[0]; rowIndex++) {
      let currentLine = (lineSegments.shift()).split("");
      gridData.push(currentLine);
   }

   let totalCount = 0;

   // Iterate through each cell of the grid to find and process features.
   for (let rowIndex = 0; rowIndex < dimensions[0]; rowIndex++) {
      for (let colIndex = 0; colIndex < dimensions[1]; colIndex++) {
         let cellValue = gridData[rowIndex][colIndex];
         // The original code had a commented-out block here, which is preserved.
         // if (cellValue === "@" || cellValue === "#" || cellValue === "*") {
         //    totalCount++;
         //    gridData[rowIndex][colIndex] = 0;
         //    detonate(rowIndex, colIndex, cellValue);
         // }
      }
   }
   // Output the calculated count for the current grid.
   console.log(totalCount);
}
