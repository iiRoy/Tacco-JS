function validateSudokuWithBits(board) {
  const rowMasks = new Array(9).fill(0);
  const columnMasks = new Array(9).fill(0);
  const blockMasks = new Array(9).fill(0);

  for (let row = 0; row < 9; row++) {
    for (let column = 0; column < 9; column++) {
      const value = board[row][column];

      if (
        !Number.isInteger(value) ||
        value < 0 ||
        value > 9
      ) {
        return false;
      }

      if (value === 0) {
        continue;
      }

      const block =
        Math.floor(row / 3) * 3 +
        Math.floor(column / 3);

      const valueBit = 1 << value;

      const repeatedInRow =
        (rowMasks[row] & valueBit) !== 0;
      const repeatedInColumn =
        (columnMasks[column] & valueBit) !== 0;
      const repeatedInBlock =
        (blockMasks[block] & valueBit) !== 0;

      if (
        repeatedInRow ||
        repeatedInColumn ||
        repeatedInBlock
      ) {
        return false;
      }

      rowMasks[row] |= valueBit;
      columnMasks[column] |= valueBit;
      blockMasks[block] |= valueBit;
    }
  }

  return true;
}

function readSudoku(source) {
  const numbers = source.match(/\d+/g);

  if (numbers === null || numbers.length !== 81) {
    return null;
  }

  const board = new Array(9);

  for (let row = 0; row < 9; row++) {
    board[row] = new Array(9);

    for (let column = 0; column < 9; column++) {
      board[row][column] = Number(
        numbers[row * 9 + column]
      );
    }
  }

  return board;
}

const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");
const sudoku = readSudoku(source);

const result =
  sudoku !== null &&
  validateSudokuWithBits(sudoku);

console.log(result ? "VALID" : "INVALID");