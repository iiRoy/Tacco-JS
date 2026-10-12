function containsInvalidValues(unit) {
  const encountered = new Set();

  for (const value of unit) {
    const outsideRange =
      !Number.isInteger(value) ||
      value < 0 ||
      value > 9;

    if (outsideRange) {
      return true;
    }

    if (value === 0) {
      continue;
    }

    if (encountered.has(value)) {
      return true;
    }

    encountered.add(value);
  }

  return false;
}

function collectSudokuUnits(board) {
  const units = [];

  for (let index = 0; index < 9; index++) {
    units.push(board[index]);

    const column = [];

    for (let row = 0; row < 9; row++) {
      column.push(board[row][index]);
    }

    units.push(column);
  }

  for (let blockStartRow = 0; blockStartRow < 9; blockStartRow += 3) {
    for (
      let blockStartColumn = 0;
      blockStartColumn < 9;
      blockStartColumn += 3
    ) {
      const block = [];

      for (let offset = 0; offset < 9; offset++) {
        const row =
          blockStartRow + Math.floor(offset / 3);
        const column =
          blockStartColumn + offset % 3;

        block.push(board[row][column]);
      }

      units.push(block);
    }
  }

  return units;
}

function validateSudoku(board) {
  const units = collectSudokuUnits(board);
  let position = 0;

  while (position < units.length) {
    if (containsInvalidValues(units[position])) {
      return false;
    }

    position += 1;
  }

  return true;
}

function parseSudoku(source) {
  const numbers = source
    .trim()
    .split(/\s+/)
    .map(Number);

  if (numbers.length !== 81) {
    return null;
  }

  return Array.from(
    { length: 9 },
    (_, row) => numbers.slice(row * 9, row * 9 + 9)
  );
}

const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");
const sudoku = parseSudoku(source);

if (sudoku === null) {
  console.log("INVALID");
} else {
  const valid = validateSudoku(sudoku);
  console.log(valid ? "VALID" : "INVALID");
}