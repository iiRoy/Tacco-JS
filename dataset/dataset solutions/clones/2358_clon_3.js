// Input handling boilerplate - Encapsulated
const setupInputProcessing = () => {
  const inputLines = [];
  const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  inputReader.on('line', (line) => {
    inputLines.push(line);
  });

  return new Promise((resolve) => {
    inputReader.on('close', () => {
      console.error('\n↑入力 ↓出力');
      resolve(inputLines);
    });
  });
};

// Class for managing input lines
class InputProcessor {
  constructor(lines) {
    this.lineList = lines;
    this.currentLineIndex = 0;
    this.totalLines = lines.length;
  }

  hasMoreLines() {
    return this.currentLineIndex < this.totalLines;
  }

  getNextLine() {
    if (this.hasMoreLines()) {
      return this.lineList[this.currentLineIndex++];
    } else {
      throw new Error('ArrayIndexOutOfBoundsException: No more input lines available.');
    }
  }
}

let globalInputProcessor;

// Helper functions for input conversion
const parseInteger = (str) => parseInt(str, 10);
const splitBySpace = (str) => str.split(' ');
const splitAndParseInt = (str) => str.split(' ').map(Number);
const splitByChar = (str) => str.split('');
const splitByCharAndParseInt = (str) => str.split('').map(Number);
const joinWithSpace = (arr) => arr.join(' ');
const joinWithNewline = (arr) => arr.join('\n');
const joinWithoutSeparator = (arr) => arr.join('');

// Central input conversion utility
const convertInput = (inputStrOrArr, typeCode) => {
  try {
    switch (typeCode) {
      case 1: return parseInteger(inputStrOrArr);
      case 2: return splitBySpace(inputStrOrArr);
      case 4: return splitAndParseInt(inputStrOrArr);
      case 6: return splitByChar(inputStrOrArr);
      case 7: return splitByCharAndParseInt(inputStrOrArr);
      case 8: return joinWithSpace(inputStrOrArr);
      case 9: return joinWithNewline(inputStrOrArr);
      case 0: return joinWithoutSeparator(inputStrOrArr);
      default: return inputStrOrArr;
    }
  } catch (e) {
    return inputStrOrArr;
  }
};

// Renamed utility functions for main logic
const readInt = () => convertInput(globalInputProcessor.getNextLine(), 1);
const readStrArray = () => convertInput(globalInputProcessor.getNextLine(), 2);
const readIntArray = () => convertInput(globalInputProcessor.getNextLine(), 4);
const readCharArray = () => convertInput(globalInputProcessor.getNextLine(), 6);
const getNextInputLine = () => globalInputProcessor.getNextLine();
const hasMoreInput = () => globalInputProcessor.hasMoreLines();

const printResult = (output) => console.log(output);
const printDebug = (data) => console.error('debug:' + require('util').inspect(data, false, null));

// Deep copy utility (unused in main logic, but part of boilerplate)
const createDeepCopy = (sourceObj) => {
  return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));
};

// Main problem-solving function
const solveProblem = () => {
  const dimensions = readIntArray();
  const height = dimensions[0];
  const width = dimensions[1];

  // Initialize the first matrix
  const matrixA = Array.from({ length: height }, () => readIntArray());

  // Calculate the difference matrix directly by reading the second matrix row-by-row
  const diffMatrix = Array.from({ length: height }, (_, rowIdx) => {
    const rowB = readIntArray();
    return Array.from({ length: width }, (_, colIdx) => {
      return Math.abs(matrixA[rowIdx][colIdx] - rowB[colIdx]);
    });
  });

  const maxPossibleSum = 90; // Constant for DP table size, based on problem constraints

  // Initialize DP table with false values
  const dpTable = Array.from({ length: height }, () =>
    Array.from({ length: width }, () =>
      new Array(maxPossibleSum).fill(false)
    )
  );

  // Base case: starting cell (0,0)
  dpTable[0][0][diffMatrix[0][0]] = true;

  // Helper function for DP state transition logic
  const propagateDpState = (targetRow, targetCol, sourceRow, sourceCol, currentCellVal) => {
    for (let sumVal = 0; sumVal < maxPossibleSum; sumVal++) {
      if (dpTable[sourceRow][sourceCol][sumVal]) {
        const sumPlusVal = Math.abs(sumVal + currentCellVal);
        const sumMinusVal = Math.abs(sumVal - currentCellVal);
        
        // Only mark true if the resulting sum is within the valid range
        if (sumPlusVal < maxPossibleSum) {
          dpTable[targetRow][targetCol][sumPlusVal] = true;
        }
        if (sumMinusVal < maxPossibleSum) {
          dpTable[targetRow][targetCol][sumMinusVal] = true;
        }
      }
    }
  };

  // Fill DP table using nested loops
  for (let rowIdx = 0; rowIdx < height; rowIdx++) {
    for (let colIdx = 0; colIdx < width; colIdx++) {
      if (rowIdx === 0 && colIdx === 0) {
        continue; // Base case already handled, skip
      }

      const currentCellDiff = diffMatrix[rowIdx][colIdx];

      // Propagate state from the cell above, if available
      if (rowIdx > 0) {
        propagateDpState(rowIdx, colIdx, rowIdx - 1, colIdx, currentCellDiff);
      }
      // Propagate state from the cell to the left, if available
      if (colIdx > 0) {
        propagateDpState(rowIdx, colIdx, rowIdx, colIdx - 1, currentCellDiff);
      }
    }
  }

  // Find the minimum absolute sum at the target cell (bottom-right)
  for (let sumVal = 0; sumVal < maxPossibleSum; sumVal++) {
    if (dpTable[height - 1][width - 1][sumVal]) {
      printResult(sumVal);
      return;
    }
  }
};

// Execute the main logic after all input lines are processed
setupInputProcessing().then((lines) => {
  globalInputProcessor = new InputProcessor(lines);
  solveProblem();
});
