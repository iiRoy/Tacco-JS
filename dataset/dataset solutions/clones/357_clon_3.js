const VISITED_MARKER = "m";

function exploreConnected(startRow, startCol, initialChar, gridRef, totalRows, totalCols) {
   const rowOffsets = [0, 0, -1, 1];
   const colOffsets = [-1, 1, 0, 0];
   const numDirections = rowOffsets.length;

   for (let dirIndex = 0; dirIndex < numDirections; dirIndex++) {
      const nextRow = startRow + rowOffsets[dirIndex];
      const nextCol = startCol + colOffsets[dirIndex];

      if (nextRow < 0 || nextRow >= totalRows || nextCol < 0 || nextCol >= totalCols) {
         continue;
      }

      const adjacentCellContent = gridRef[nextRow][nextCol];
      const isMatchingChar = (adjacentCellContent === initialChar);

      if (isMatchingChar) {
         gridRef[nextRow][nextCol] = VISITED_MARKER;
         exploreConnected(nextRow, nextCol, initialChar, gridRef, totalRows, totalCols);
      }
   }
}

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
let rawInputLines = rawInput.trim().split("\n");

while (true) {
   const currentLine = rawInputLines.shift();
   const dimensionStrings = currentLine.split(" ");
   const dimensions = dimensionStrings.map(Number);

   const numRows = dimensions[0];
   const numCols = dimensions[1];

   if (numRows === 0 && numCols === 0) {
      break;
   }

   let terrainGrid = [];
   for (let rIdx = 0; rIdx < numRows; rIdx++) {
      const gridRowChars = rawInputLines.shift().split("");
      terrainGrid.push(gridRowChars);
   }

   let discoveredIslands = 0;

   for (let currentRow = 0; currentRow < numRows; currentRow++) {
      for (let currentCol = 0; currentCol < numCols; currentCol++) {
         const cellContent = terrainGrid[currentRow][currentCol];
         const isIslandStart = (cellContent === "@" || cellContent === "#" || cellContent === "*");

         if (isIslandStart) {
            discoveredIslands++;
            terrainGrid[currentRow][currentCol] = VISITED_MARKER;
            exploreConnected(currentRow, currentCol, cellContent, terrainGrid, numRows, numCols);
         }
      }
   }
   console.log(discoveredIslands);
}
