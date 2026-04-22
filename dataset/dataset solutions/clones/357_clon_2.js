function exploreNeighbors(rowCoord, colCoord, targetChar) {
  let rowOffsets = [0, 0, -1, 1];
  let colOffsets = [-1, 1, 0, 0];

  for (let idx = 0; idx < 4; idx++) {
    let nextRow = rowCoord + rowOffsets[idx];
    let nextCol = colCoord + colOffsets[idx];

    if (nextRow < 0 || nextRow >= dimensions[0] || nextCol < 0 || nextCol >= dimensions[1]) continue;

    if (targetChar === gridMatrix[nextRow][nextCol]) {
      gridMatrix[nextRow][nextCol] = "X"; // Mark cell as visited
      exploreNeighbors(nextRow, nextCol, targetChar);
    }
  }
}

const fileSystem = require('fs');
let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let lineBuffer = rawData.trim().split("\n");

while (true) {
  let dimensions = lineBuffer.shift().split(" ").map(Number);

  if (dimensions[0] === 0 && dimensions[1] === 0) break;

  let gridMatrix = [];
  for (let rowIndex = 0; rowIndex < dimensions[0]; rowIndex++) {
    let rowChars = lineBuffer.shift().split("");
    gridMatrix.push(rowChars);
  }

  let objectCount = 0;
  for (let rowIndex = 0; rowIndex < dimensions[0]; rowIndex++) {
    for (let colIndex = 0; colIndex < dimensions[1]; colIndex++) {
      let currentChar = gridMatrix[rowIndex][colIndex];
      if (currentChar === "@" || currentChar === "#" || currentChar === "*") {
        objectCount++;
        gridMatrix[rowIndex][colIndex] = "X"; // Mark initial object cell as processed
        exploreNeighbors(rowIndex, colIndex, currentChar);
      }
    }
  }
  console.log(objectCount);
}