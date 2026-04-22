var inputReader = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
var receivedLines = [];
var inputDataIterator;

inputReader.on('line', function(lineContent) {
  receivedLines.push(lineContent);
});

inputReader.on('close', function() {
  inputDataIterator = (function(lines) {
    let currentPosition = 0;
    return {
      fetchLine: () => {
        if (currentPosition < lines.length) {
          return lines[currentPosition++];
        }
        throw new Error("Input source exhausted.");
      }
    };
  })(receivedLines);
  console.error('\n↑ Input ↓ Output');
  initiateGridCalculations();
});

function parseDimensionsFromLine() {
  const line = inputDataIterator.fetchLine();
  return line.split(' ').map(Number);
}

function parseRowValuesFromLine() {
  const line = inputDataIterator.fetchLine();
  return line.split(' ').map(Number);
}

function outputResult(value) {
  console.log(value);
}

function initiateGridCalculations() {
  const dimensionsPair = parseDimensionsFromLine();
  const totalRows = dimensionsPair[0];
  const totalColumns = dimensionsPair[1];

  const primaryDataMatrix = [];
  for (let r = 0; r < totalRows; ++r) {
    primaryDataMatrix.push(parseRowValuesFromLine());
  }

  const secondaryDataMatrix = [];
  for (let r = 0; r < totalRows; ++r) {
    secondaryDataMatrix.push(parseRowValuesFromLine());
  }

  const absoluteDifferenceMatrix = Array.from({ length: totalRows }, (_, r) =>
    Array.from({ length: totalColumns }, (_, c) =>
      Math.abs(primaryDataMatrix[r][c] - secondaryDataMatrix[r][c])
    )
  );

  const sumUpperBoundary = 90;

  const reachableSumSets = Array.from({ length: totalRows }, () =>
    Array.from({ length: totalColumns }, () => new Set())
  );

  const initialCellAbsoluteValue = absoluteDifferenceMatrix[0][0];
  if (initialCellAbsoluteValue < sumUpperBoundary) {
    reachableSumSets[0][0].add(initialCellAbsoluteValue);
  }

  for (let rCoord = 0; rCoord < totalRows; ++rCoord) {
    for (let cCoord = 0; cCoord < totalColumns; ++cCoord) {
      if (rCoord === 0 && cCoord === 0) {
        continue;
      }

      const currentCellMagnitude = absoluteDifferenceMatrix[rCoord][cCoord];
      const currentCellPossibleSums = new Set();

      if (rCoord > 0) {
        const sumsFromNorth = reachableSumSets[rCoord - 1][cCoord];
        for (const previousTotal of sumsFromNorth) {
          const plusOption = Math.abs(previousTotal + currentCellMagnitude);
          const minusOption = Math.abs(previousTotal - currentCellMagnitude);
          if (plusOption < sumUpperBoundary) currentCellPossibleSums.add(plusOption);
          if (minusOption < sumUpperBoundary) currentCellPossibleSums.add(minusOption);
        }
      }

      if (cCoord > 0) {
        const sumsFromWest = reachableSumSets[rCoord][cCoord - 1];
        for (const previousTotal of sumsFromWest) {
          const plusOption = Math.abs(previousTotal + currentCellMagnitude);
          const minusOption = Math.abs(previousTotal - currentCellMagnitude);
          if (plusOption < sumUpperBoundary) currentCellPossibleSums.add(plusOption);
          if (minusOption < sumUpperBoundary) currentCellPossibleSums.add(minusOption);
        }
      }
      reachableSumSets[rCoord][cCoord] = currentCellPossibleSums;
    }
  }

  let minimalFinalPathSum = Infinity;
  const sumsInTerminalCell = reachableSumSets[totalRows - 1][totalColumns - 1];
  for (const finalSumValue of sumsInTerminalCell) {
    if (finalSumValue < minimalFinalPathSum) {
      minimalFinalPathSum = finalSumValue;
    }
  }
  
  outputResult(minimalFinalPathSum);
}