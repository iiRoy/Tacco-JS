function validatePuzzle(grid) {
  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const seenInRow = new Set();
    const seenInColumn = new Set();

    for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
      const horizontalNumber = grid[rowIndex][columnIndex];
      const verticalNumber = grid[columnIndex][rowIndex];

      if (
        !Number.isInteger(horizontalNumber) ||
        horizontalNumber < 0 ||
        horizontalNumber > 9
      ) {
        return false;
      }

      if (horizontalNumber !== 0) {
        if (seenInRow.has(horizontalNumber)) {
          return false;
        }

        seenInRow.add(horizontalNumber);
      }

      if (verticalNumber !== 0) {
        if (seenInColumn.has(verticalNumber)) {
          return false;
        }

        seenInColumn.add(verticalNumber);
      }
    }
  }

  for (let regionRow = 0; regionRow < 3; regionRow++) {
    for (let regionColumn = 0; regionColumn < 3; regionColumn++) {
      const seenInRegion = new Set();

      for (let localRow = 0; localRow < 3; localRow++) {
        for (let localColumn = 0; localColumn < 3; localColumn++) {
          const number =
            grid[regionRow * 3 + localRow][regionColumn * 3 + localColumn];

          if (number !== 0) {
            if (seenInRegion.has(number)) {
              return false;
            }

            seenInRegion.add(number);
          }
        }
      }
    }
  }

  return true;
}

function createGrid(source) {
  const numbers = source.trim().split(/\s+/).map(Number);

  if (numbers.length !== 81) {
    return null;
  }

  const grid = [];

  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    grid.push(
      numbers.slice(rowIndex * 9, rowIndex * 9 + 9)
    );
  }

  return grid;
}

const source = require("fs")
  .readFileSync("/dev/stdin", "utf8");

const grid = createGrid(source);

console.log(
  grid !== null && validatePuzzle(grid)
    ? "VALID"
    : "INVALID"
);