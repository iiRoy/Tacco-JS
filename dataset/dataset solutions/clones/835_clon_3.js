const GRID_ROWS = 12;
const GRID_COLS = 6;
const MIN_CHAIN_SIZE = 4;

const ROW_OFFSETS = [-1, 0, 0, 1];
const COL_OFFSETS = [0, -1, 1, 0];

let currentGrid;
let cellsToBombThisTurn;
let currentChainCount;

function findConnectedCells(row, col, targetColor) {
   for (let i = 0; i < 4; i++) {
      const nextRow = row + ROW_OFFSETS[i];
      const nextCol = col + COL_OFFSETS[i];

      if (nextRow < 0 || nextCol < 0 || nextRow >= GRID_ROWS || nextCol >= GRID_COLS) {
         continue;
      }

      if (currentGrid[nextRow][nextCol] === targetColor) {
         currentChainCount++;
         if (currentChainCount === MIN_CHAIN_SIZE) {
            cellsToBombThisTurn.push([nextRow, nextCol]);
         }
         currentGrid[nextRow][nextCol] = targetColor + currentChainCount;
         findConnectedCells(nextRow, nextCol, targetColor);
      }
   }
}

function removeConnectedCells(row, col, targetColor) {
   for (let i = 0; i < 4; i++) {
      const nextRow = row + COL_OFFSETS[i]; // Typo in original, should be ROW_OFFSETS[i] and COL_OFFSETS[i]
      const nextCol = col + ROW_OFFSETS[i]; // Corrected to match original logic's dy/dx usage

      // Re-checking original BOMB:
      // var dy=[-1,0,0,1];
      // var dx=[0,-1,1,0];
      // var yy=y+dy[i];
      // var xx=x+dx[i];
      // My ROW_OFFSETS and COL_OFFSETS are correct. The above was a self-correction thought.
      // Let's use the correct offsets.

      const actualNextRow = row + ROW_OFFSETS[i];
      const actualNextCol = col + COL_OFFSETS[i];

      if (actualNextRow < 0 || actualNextCol < 0 || actualNextRow >= GRID_ROWS || actualNextCol >= GRID_COLS) {
         continue;
      }

      if (currentGrid[actualNextRow][actualNextCol] === targetColor) {
         currentGrid[actualNextRow][actualNextCol] = ".";
         removeConnectedCells(actualNextRow, actualNextCol, targetColor);
      } else if (currentGrid[actualNextRow][actualNextCol] === "O") {
         currentGrid[actualNextRow][actualNextCol] = ".";
      }
   }
}

function gravityShiftCell(targetRow, col) {
   const initialTargetRow = targetRow;
   let currentRow = targetRow;
   while (currentRow > 0) {
      currentRow--;
      if (currentGrid[currentRow][col] !== ".") {
         currentGrid[initialTargetRow][col] = currentGrid[currentRow][col];
         currentGrid[currentRow][col] = ".";
         break;
      }
   }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");
const numTestCases = parseInt(inputLines.shift(), 10);

for (let caseIdx = 0; caseIdx < numTestCases; caseIdx++) {
   currentGrid = [];
   for (let r = 0; r < GRID_ROWS; r++) {
      const gridRowChars = inputLines.shift().split("");
      currentGrid.push(gridRowChars);
   }

   let totalChainReactions = 0;

   while (true) {
      cellsToBombThisTurn = [];

      const availableColors = ["R", "G", "B", "Y", "P"];
      for (let r = 0; r < GRID_ROWS; r++) {
         for (let c = 0; c < GRID_COLS; c++) {
            const cellValue = currentGrid[r][c];
            if (availableColors.includes(cellValue)) {
               currentChainCount = 1;
               currentGrid[r][c] = cellValue + currentChainCount;
               findConnectedCells(r, c, cellValue);
            }
         }
      }

      for (let r = 0; r < GRID_ROWS; r++) {
         for (let c = 0; c < GRID_COLS; c++) {
            currentGrid[r][c] = currentGrid[r][c].slice(0, 1);
         }
      }

      if (cellsToBombThisTurn.length === 0) {
         break;
      }

      totalChainReactions++;

      cellsToBombThisTurn.forEach(function(cellCoords) {
         const r = cellCoords[0];
         const c = cellCoords[1];
         const cellColor = currentGrid[r][c];
         if (cellColor !== ".") {
            removeConnectedCells(r, c, cellColor);
         }
      });

      for (let r = GRID_ROWS - 1; r > 0; r--) {
         for (let c = 0; c < GRID_COLS; c++) {
            if (currentGrid[r][c] === ".") {
               gravityShiftCell(r, c);
            }
         }
      }
   }
   console.log(totalChainReactions);
}
