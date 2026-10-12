const inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let inputHandler;
const rawInputLines = [];

inputReader.on('line', (line) => { rawInputLines.push(line); });
inputReader.on('close', () => {
  inputHandler = createInputProcessor(rawInputLines);
  console.error('\n↑入力 ↓出力');
  executeCalculation();
});

function createDeepClone(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

function getNextInt() { return transformInput(retrieveNext(), 1); }
function getNextStrArray() { return transformInput(retrieveNext(), 2); }
function getNextIntArray() { return transformInput(retrieveNext(), 4); }
function getNextCharArray() { return transformInput(retrieveNext(), 6); }

function retrieveNext() { return inputHandler.retrieveNext(); }
function hasMoreInput() { return inputHandler.canAdvance(); }

function createInputProcessor(lines) {
  return {
    sourceLines: lines,
    currentLineIndex: 0,
    totalLines: lines.length,
    canAdvance: function() { return (this.currentLineIndex < this.totalLines); },
    retrieveNext: function() {
      if (this.canAdvance()) {
        return this.sourceLines[this.currentLineIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function printOutput(data) { console.log(data); }
function printDebug(data) { console.error('debug:' + require('util').inspect(data, false, null)); }

function transformInput(item, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(item);
      case 2: return item.split(' ');
      case 4: return item.split(' ').map(Number);
      case 6: return item.split('');
      case 7: return item.split('').map(Number);
      case 8: return item.join(' ');
      case 9: return item.join('\n');
      case 0: return item.join('');
      default: return item;
    }
  } catch (error) {
    return item;
  }
}

function executeCalculation() {
  const gridDimensions = getNextIntArray();
  const numRows = gridDimensions[0];
  const numCols = gridDimensions[1];

  const maxAbsoluteSumLimit = 1272;

  const differenceMatrix = Array.from({ length: numRows }, () => Array(numCols));
  for (let r = 0; r < numRows; r++) {
    const firstMatrixRow = getNextIntArray();
    for (let c = 0; c < numCols; c++) {
      differenceMatrix[r][c] = firstMatrixRow[c];
    }
  }

  for (let r = 0; r < numRows; r++) {
    const secondMatrixRow = getNextIntArray();
    for (let c = 0; c < numCols; c++) {
      differenceMatrix[r][c] = Math.abs(differenceMatrix[r][c] - secondMatrixRow[c]);
    }
  }

  const reachableSums = Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => new Set())
  );

  const initialDiff = differenceMatrix[0][0];
  if (initialDiff < maxAbsoluteSumLimit) {
    reachableSums[0][0].add(initialDiff);
  }

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      if (r === 0 && c === 0) {
        continue;
      }

      const currentCellDiff = differenceMatrix[r][c];
      const currentCellReachableSums = reachableSums[r][c];

      if (r > 0) {
        const sumsFromAbove = reachableSums[r - 1][c];
        for (const previousSum of sumsFromAbove) {
          const sumPlus = Math.abs(previousSum + currentCellDiff);
          if (sumPlus < maxAbsoluteSumLimit) {
            currentCellReachableSums.add(sumPlus);
          }
          const sumMinus = Math.abs(previousSum - currentCellDiff);
          if (sumMinus < maxAbsoluteSumLimit) {
            currentCellReachableSums.add(sumMinus);
          }
        }
      }

      if (c > 0) {
        const sumsFromLeft = reachableSums[r][c - 1];
        for (const previousSum of sumsFromLeft) {
          const sumPlus = Math.abs(previousSum + currentCellDiff);
          if (sumPlus < maxAbsoluteSumLimit) {
            currentCellReachableSums.add(sumPlus);
          }
          const sumMinus = Math.abs(previousSum - currentCellDiff);
          if (sumMinus < maxAbsoluteSumLimit) {
            currentCellReachableSums.add(sumMinus);
          }
        }
      }
    }
  }

  const finalCellSums = reachableSums[numRows - 1][numCols - 1];
  let minimumResult = Infinity;

  for (const sumValue of finalCellSums) {
    if (sumValue < minimumResult) {
      minimumResult = sumValue;
    }
  }

  printOutput(minimumResult);
}
