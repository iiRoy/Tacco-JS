const processGame = (rawInputLines) => {
  const bingoGrid = rawInputLines.slice(0, 3).map(line => line.split(" ").map(Number));
  const announcedNumbers = new Set(rawInputLines.slice(3).map(numStr => parseInt(numStr, 10)));

  const markedStatus = bingoGrid.map(row =>
    row.map(cellValue => announcedNumbers.has(cellValue))
  );

  const winningCombinations = [
    // Horizontal lines
    [[0, 0], [0, 1], [0, 2]],
    [[1, 0], [1, 1], [1, 2]],
    [[2, 0], [2, 1], [2, 2]],
    // Vertical lines
    [[0, 0], [1, 0], [2, 0]],
    [[0, 1], [1, 1], [2, 1]],
    [[0, 2], [1, 2], [2, 2]],
    // Diagonal lines
    [[0, 0], [1, 1], [2, 2]],
    [[0, 2], [1, 1], [2, 0]]
  ];

  const hasWinningLine = winningCombinations.some(lineCoordinates =>
    lineCoordinates.every(([rowIdx, colIdx]) => markedStatus[rowIdx][colIdx])
  );

  const finalVerdict = hasWinningLine ? 'Yes' : 'No';
  console.log(finalVerdict);
};

processGame(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
