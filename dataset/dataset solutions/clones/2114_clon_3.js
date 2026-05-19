const processBingoGame = (inputLines) => {
  const firstRowNums = inputLines[0].split(" ");
  const secondRowNums = inputLines[1].split(" ");
  const thirdRowNums = inputLines[2].split(" ");

  let bingoGridValues = [...firstRowNums, ...secondRowNums, ...thirdRowNums];
  let finalResult = 'No';

  for (let drawnNumIdx = 3; drawnNumIdx < inputLines.length; drawnNumIdx++) {
    const currentDrawnNumber = Number(inputLines[drawnNumIdx]);
    bingoGridValues = bingoGridValues.map(currentGridVal => {
      if (Number(currentGridVal) === currentDrawnNumber) {
        return 'O';
      } else {
        return currentGridVal;
      }
    });
  }

  const winningPatterns = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal top-left to bottom-right
    [2, 4, 6]  // Diagonal top-right to bottom-left
  ];

  let isBingoAchieved = false;
  for (const patternIndices of winningPatterns) {
    const [idxA, idxB, idxC] = patternIndices;
    if (bingoGridValues[idxA] === 'O' && bingoGridValues[idxB] === 'O' && bingoGridValues[idxC] === 'O') {
      isBingoAchieved = true;
      break;
    }
  }

  if (isBingoAchieved) {
    finalResult = 'Yes';
  }

  console.log(finalResult);
};

processBingoGame(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
