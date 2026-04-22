function ProcessInputGrid(rawData) {
 let gridLines = rawData.split('\n');

 const gridHeight = Number(gridLines[0].split(' ')[0]);
 const gridWidth = Number(gridLines[0].split(' ')[1]);

 gridLines = gridLines.filter((_lineItem, lineIndex) => lineIndex >= 1);

 // Search for any '.' characters in the raw input data
 const emptyCellMatches = rawData.match(/(\.)/g);

 if (emptyCellMatches === null) {
  // Scenario: The input grid contains only bombs, no empty cells.
  console.log(gridLines.join('\n') + '\n');
 } else if (emptyCellMatches.length === gridWidth * gridHeight) {
  // Scenario: All cells in the grid are empty, meaning no bombs.
  console.log(gridLines.join('\n').replace(/./g, '0') + '\n');
 } else {
  /*
   * Scenario: The grid contains a mix of bombs and empty cells.
   * Iterate through the grid to count adjacent bombs for each empty cell.
   */
  for (let rowIndex = 0; rowIndex < gridLines.length; rowIndex++) {
   for (let colIndex = 0; colIndex < gridLines[rowIndex].length; colIndex++) {
    // If the current cell is not empty, skip it.
    if (gridLines[rowIndex][colIndex] !== '.') continue;

    // Define all 8 neighboring cells
    let cellUp = (rowIndex - 1 < 0) ? null : gridLines[rowIndex - 1][colIndex], // Cell above current
        cellDown = (rowIndex + 1 >= gridHeight) ? null : gridLines[rowIndex + 1][colIndex], // Cell below current
        cellRight = (colIndex + 1 >= gridWidth) ? null : gridLines[rowIndex][colIndex + 1], // Cell to the right
        cellLeft = (colIndex - 1 < 0) ? null : gridLines[rowIndex][colIndex - 1], // Cell to the left

        cellUpRight = (cellUp === null || cellRight === null) ? null : gridLines[rowIndex - 1][colIndex + 1], // Cell diagonally up-right
        cellUpLeft = (cellUp === null || cellLeft === null) ? null : gridLines[rowIndex - 1][colIndex - 1], // Cell diagonally up-left
        cellDownRight = (cellDown === null || cellRight === null) ? null : gridLines[rowIndex + 1][colIndex + 1], // Cell diagonally down-right
        cellDownLeft = (cellDown === null || cellLeft === null) ? null : gridLines[rowIndex + 1][colIndex - 1]; // Cell diagonally down-left

    // Concatenate neighbor values and count bomb markers ('#')
    let adjacentBombCount = (cellUp + cellRight + cellDown + cellLeft + cellUpRight + cellUpLeft + cellDownRight + cellDownLeft).match(/#/g);

    // If no bombs found, count is 0; otherwise, use the match length.
    adjacentBombCount = (adjacentBombCount === null) ? 0 : adjacentBombCount.length;

    // Replace the empty cell ('.') with the calculated bomb count.
    gridLines[rowIndex] = gridLines[rowIndex].replace('.', adjacentBombCount);
   }
  }
  // Output the modified grid.
  console.log(gridLines.join('\n'));
 }
}
// Invocation example: ProcessInputGrid(require("fs").readFileSync("/dev/stdin", "utf8"));