function processGridData(rawData) {
  const dataLines = rawData.match(/[^\n]+/g);
  const [gridRows, gridCols, entryCounter] = dataLines[0].split(" ").map(Number);

  const itemLocations = new Map();
  for (let idx = 1; idx <= entryCounter; idx++) {
    const [rowCoord, colCoord, entryValue] = dataLines[idx].split(" ").map(Number);
    itemLocations.set(`${rowCoord - 1}_${colCoord - 1}`, entryValue);
  }

  const scoreMatrix = new Map();

  const obtainScores = (r, c) => {
    if (r < 0 || c < 0) return [0, 0, 0, 0];
    const cellKey = `${r}_${c}`;
    if (!scoreMatrix.has(cellKey)) {
      return [0, 0, 0, 0];
    }
    return scoreMatrix.get(cellKey);
  };

  for (let rowIter = 0; rowIter < gridRows; rowIter++) {
    for (let colIter = 0; colIter < gridCols; colIter++) {
      const currentCellIdentifier = `${rowIter}_${colIter}`;
      const valueAtThisCoordinate = itemLocations.get(currentCellIdentifier) || 0;

      const currentCellScores = [0, 0, 0, 0];

      // Contribution from the cell directly above (rowIter-1, colIter)
      const scoresFromAbove = obtainScores(rowIter - 1, colIter);
      let maxScoreFromAbove = 0;
      for (let scoreComponent = 0; scoreComponent < 4; scoreComponent++) {
        maxScoreFromAbove = Math.max(maxScoreFromAbove, scoresFromAbove[scoreComponent]);
      }
      currentCellScores[0] = Math.max(currentCellScores[0], maxScoreFromAbove);

      // Contribution from the cell to the left (rowIter, colIter-1)
      const scoresFromLeft = obtainScores(rowIter, colIter - 1);
      for (let scoreComponent = 0; scoreComponent < 4; scoreComponent++) {
        currentCellScores[scoreComponent] = Math.max(currentCellScores[scoreComponent], scoresFromLeft[scoreComponent]);
      }

      // Apply the item value of the current cell, up to 3 times
      for (let pickCount = 2; pickCount >= 0; pickCount--) {
        currentCellScores[pickCount + 1] = Math.max(currentCellScores[pickCount + 1], currentCellScores[pickCount] + valueAtThisCoordinate);
      }

      scoreMatrix.set(currentCellIdentifier, currentCellScores);
    }
  }

  let overallMaxScore = 0;
  const finalCellScores = obtainScores(gridRows - 1, gridCols - 1);
  for (let scoreComponent = 0; scoreComponent < 4; scoreComponent++) {
    overallMaxScore = Math.max(overallMaxScore, finalCellScores[scoreComponent]);
  }
  console.log(overallMaxScore);
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));