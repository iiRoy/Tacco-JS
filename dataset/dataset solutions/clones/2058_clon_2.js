'use strict'

const executeProgram = inputData => {
  const generatePathPatterns = (lowerBoundStr, upperBoundStr) => {
    const targetOneCount = (lowerBoundStr.match(/1/g) || []).length;
    const numLowerBound = parseInt(lowerBoundStr, 2);
    const numUpperBound = parseInt(upperBoundStr, 2);
    let patternCollection = [];

    for (let currentNumber = numLowerBound; currentNumber <= numUpperBound; currentNumber++) {
      const currentBinaryRep = (currentNumber).toString(2);
      if (targetOneCount !== (currentBinaryRep.match(/1/g) || []).length) {
        continue;
      }
      const leadingZeros = [...Array(upperBoundStr.length - currentBinaryRep.length)].map(_ => "0").join("");
      patternCollection.push(leadingZeros + currentBinaryRep);
    }

    return patternCollection;
  };

  const rawInputLines = inputData.trim().split("\n");
  const gridDimensions = rawInputLines[0].split(" ").map(item => parseInt(item, 10));
  const gridRowStrings = rawInputLines.slice(1).slice(0, gridDimensions[0]);
  const processedGrid = gridRowStrings.map(rowContent => (rowContent.slice(0, gridDimensions[1])));

  let minObstacleEncounters;
  const finalRowIndex = gridDimensions[0] - 1;
  const finalColIndex = gridDimensions[1] - 1;
  const minPathString = [...Array(finalColIndex)].map(_ => "0").join("") + [...Array(finalRowIndex)].map(_ => "1").join("");
  const maxPathString = minPathString.split("").reverse().join("");
  const allValidPatterns = generatePathPatterns(minPathString, maxPathString);

  for (let patternIdx = 0; patternIdx < allValidPatterns.length; patternIdx++) {
    let currentObstacleCount = 0;
    let currentColumn = 0;
    let currentRow = 0;

    if (processedGrid[currentRow][currentColumn] === "#") {
      currentObstacleCount++;
    }
    for (let stepIdx = 0; stepIdx < allValidPatterns[patternIdx].length; stepIdx++) {
      if (allValidPatterns[patternIdx][stepIdx] === "1") {
        currentRow++;
      } else {
        currentColumn++;
      }
      if (processedGrid[currentRow][currentColumn] === "#") {
        currentObstacleCount++;
        if (minObstacleEncounters && currentObstacleCount >= minObstacleEncounters) {
          break;
        }
      }
    }
    if (minObstacleEncounters !== 0 && (!minObstacleEncounters || minObstacleEncounters > currentObstacleCount)) {
      minObstacleEncounters = currentObstacleCount;
      if (currentObstacleCount === 0) {
        break;
      }
    }
  }

  console.log(minObstacleEncounters);
};

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));