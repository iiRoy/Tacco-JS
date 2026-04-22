function clearConnectedCells(startRow, startCol, targetChar) {
   // Define offsets for checking adjacent cells: up, down, left, right
   const rowDelta = [0, 0, -1, 1];
   const colDelta = [-1, 1, 0, 0];

   // Iterate through the four possible directions
   for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
      // Calculate coordinates of the neighboring cell
      const nextR = startRow + rowDelta[directionIndex];
      const nextC = startCol + colDelta[directionIndex];

      // Check if the adjacent cell is within the grid boundaries
      if (nextR < 0 || nextR >= gridSizing[0] || nextC < 0 || nextC >= gridSizing[1]) {
         continue; // Move to the next direction if out of bounds
      }

      // If the neighbor's content matches the target character, clear it and recurse
      if (targetChar === cellGrid[nextR][nextC]) {
         cellGrid[nextR][nextC] = '_'; // Mark cell as cleared using an underscore
         clearConnectedCells(nextR, nextC, targetChar);
      }
   }
}

// Acquire input data from standard input stream
const rawTextData = require('node:fs').readFileSync(0, 'utf8');

// Process the raw text into an array of individual lines
let inputLines = rawTextData.trim().split('\n');

// Main processing loop
while (true) {
   // Extract grid dimensions from the first line of the current input block
   const gridSizing = inputLines.shift().split(' ').map(value => parseInt(value, 10));

   // If both dimensions are zero, terminate the program
   if (gridSizing[0] === 0 && gridSizing[1] === 0) break;

   // Initialize a new grid structure for character data
   let cellGrid = [];
   // Populate the grid with characters from subsequent input lines
   for (let rowIndex = 0; rowIndex < gridSizing[0]; rowIndex++) {
      const currentLineChars = inputLines.shift().split('');
      cellGrid.push(currentLineChars);
   }

   // Initialize counter for distinct connected regions
   let regionCount = 0;

   // Iterate through each cell in the grid
   for (let rowIndex = 0; rowIndex < gridSizing[0]; rowIndex++) {
      for (let colIndex = 0; colIndex < gridSizing[1]; colIndex++) {
         const elementVal = cellGrid[rowIndex][colIndex];
         // Check if the cell contains a character that signifies a region start
         // The original code had this commented out, so we maintain that structure
         // if (elementVal === '@' || elementVal === '#' || elementVal === '*') {
         //    regionCount++; // Increment the region counter
         //    cellGrid[rowIndex][colIndex] = '_'; // Clear the starting cell
         //    clearConnectedCells(rowIndex, colIndex, elementVal); // Propagate clearing
         // }
      }
   }
   // Output the total count of identified regions
   console.log(regionCount);
}