function solveProblem(inputLines) {
  const [gridHeight, gridWidth, stepCount] = inputLines[0].split(' ').map(Number);
  const initialGrid = inputLines.slice(1).map(row => [...row]);

  let startLocation = [];
  initialGrid.some((row, rIdx) =>
    row.some((cell, cIdx) => {
      if (cell === 'S') {
        startLocation = [rIdx, cIdx];
        return true;
      }
      return false;
    })
  );

  const cardinalDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  const [finalWave, finalGameBoard] = Array.from({ length: stepCount }).reduce(
    ([currentWaveSet, currentBoardState], _, stepIdx) => {
      const nextWaveSet = new Set();

      if (currentWaveSet.size === 0) {
          return [currentWaveSet, currentBoardState];
      }

      for (const cellCoordStr of currentWaveSet) {
        const [r, c] = cellCoordStr.split(',').map(Number);

        cardinalDirections.forEach(([dr, dc]) => {
          const nextR = r + dr;
          const nextC = c + dc;

          if (nextR >= 0 && nextR < gridHeight &&
              nextC >= 0 && nextC < gridWidth &&
              currentBoardState[nextR][nextC] === '.') {
            currentBoardState[nextR][nextC] = 'S';
            nextWaveSet.add(`${nextR},${nextC}`);
          }
        });
      }
      return [nextWaveSet, currentBoardState];
    },
    [
      new Set([`${startLocation[0]},${startLocation[1]}`]),
      initialGrid.map(row => [...row])
    ]
  );

  let minBoundarySteps = Infinity;

  finalGameBoard.some((row, rIdx) => {
    return row.some((cell, cIdx) => {
      if (cell === 'S') {
        const distanceToBoundary = Math.min(cIdx, rIdx, gridWidth - 1 - cIdx, gridHeight - 1 - rIdx);
        if (distanceToBoundary === 0) {
          minBoundarySteps = 1;
          return true;
        }
        minBoundarySteps = Math.min(minBoundarySteps, Math.ceil(distanceToBoundary / stepCount) + 1);
      }
      return false;
    });
  });

  console.log(minBoundarySteps);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));
