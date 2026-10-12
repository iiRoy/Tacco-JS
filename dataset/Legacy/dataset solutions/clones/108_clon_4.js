const fileSystem = require('fs');

function processGridData() {
  const rawInputData = fileSystem.readFileSync(process.stdin.fd).toString('utf8');
  const inputLines = rawInputData.split('\n');

  const gridDimension = 14;
  const dataGrid = Array.from({ length: gridDimension }, () =>
    Array.from({ length: gridDimension }, () => 0)
  );

  const patternSet = {
    '1': [[1,0], [0,-1], [0,0], [0,1], [-1,0]],
    '2': [[1,-1], [1,1], [-1,-1], [-1,1]],
    '3': [[2,0], [-2,0], [0,-2], [0,2]]
  };

  const typeActionMap = {
    '1': patternSet['1'],
    '2': [...patternSet['1'], ...patternSet['2']],
    '3': [...patternSet['1'], ...patternSet['2'], ...patternSet['3']]
  };

  // The original loop iterates from the second-to-last line down to the first.
  // `inputLines.slice(0, -1)` removes the last element (often an empty string from trailing newline).
  // `reverse()` ensures processing order matches the original `for(;len--;)` loop.
  inputLines.slice(0, -1).reverse().forEach(currentLine => {
    if (!currentLine) return;

    const xCoordinate = parseInt(currentLine[0]) + 2;
    const yCoordinate = parseInt(currentLine[2]) + 2;
    const actionIdentifier = currentLine[4];

    const relevantOffsets = typeActionMap[actionIdentifier];
    if (relevantOffsets) {
      relevantOffsets.forEach(([deltaY, deltaX]) => {
        const targetY = yCoordinate + deltaY;
        const targetX = xCoordinate + deltaX;
        if (targetY >= 0 && targetY < gridDimension && targetX >= 0 && targetX < gridDimension) {
          dataGrid[targetY][targetX]++;
        }
      });
    }
  });

  let zeroCount = 0;
  let highestDrop = 0;

  // The original code iterates a 10x10 subgrid from f[2][2] to f[11][11].
  // This is achieved by iterating yOffset and xOffset from 0 to 9,
  // then accessing dataGrid[yOffset + 2][xOffset + 2].
  Array.from({ length: 10 }, (_, yOffset) => {
    Array.from({ length: 10 }, (_, xOffset) => {
      const cellValue = dataGrid[yOffset + 2][xOffset + 2];
      if (cellValue === 0) {
        zeroCount++;
      }
      highestDrop = Math.max(highestDrop, cellValue);
    });
  });

  console.log(zeroCount);
  console.log(highestDrop);
}

processGridData();
