const pathMovementRules = [
  { deltaY: -1, deltaX: 0, nextBoundaryDirection: 1, jumpYCoord: (nextY) => nextY + 2, jumpXCoord: (nextX) => nextX + 1, jumpDirection: 1 }, // Direction 0 (up)
  { deltaY: 0, deltaX: 1, nextBoundaryDirection: 2, jumpYCoord: (nextY) => nextY + 1, jumpXCoord: (nextX) => nextX - 2, jumpDirection: 2 }, // Direction 1 (right)
  { deltaY: 1, deltaX: 0, nextBoundaryDirection: 3, jumpYCoord: (nextY) => nextY - 2, jumpXCoord: (nextX) => nextX - 1, jumpDirection: 3 }, // Direction 2 (down)
  { deltaY: 0, deltaX: -1, nextBoundaryDirection: 0, jumpYCoord: (nextY) => nextY - 1, jumpXCoord: (nextX) => nextX + 2, jumpDirection: 0 }  // Direction 3 (left)
];

let currentGridDimension;
let pathMarkedCells;
let finalPathPoint;

function performPathTraversal(initialRow, initialCol, initialDirection) {
  const traversalStack = [];
  traversalStack.push({ row: initialRow, col: initialCol, dir: initialDirection });

  while (traversalStack.length > 0) {
    const { row, col, dir } = traversalStack.pop();

    if (pathMarkedCells.has(`${row},${col}`)) {
      continue;
    }

    const rule = pathMovementRules[dir];
    const nextRow = row + rule.deltaY;
    const nextCol = col + rule.deltaX;

    if (nextRow < 0 || nextCol < 0 || nextRow >= currentGridDimension || nextCol >= currentGridDimension) {
      const newDirection = rule.nextBoundaryDirection;
      traversalStack.push({ row: row, col: col, dir: newDirection });
    } else {
      if (pathMarkedCells.has(`${nextRow},${nextCol}`)) {
        pathMarkedCells.delete(`${row},${col}`);

        const jumpTargetRow = rule.jumpYCoord(nextRow);
        const jumpTargetCol = rule.jumpXCoord(nextCol);
        const jumpTargetDirection = rule.jumpDirection;
        traversalStack.push({ row: jumpTargetRow, col: jumpTargetCol, dir: jumpTargetDirection });
      } else {
        pathMarkedCells.add(`${row},${col}`);
        finalPathPoint = [row, col];
        traversalStack.push({ row: nextRow, col: nextCol, dir: dir });
      }
    }
  }
}

const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericData = dataSource.trim().split("\n").map(Number);

let testCaseCount = numericData.shift();

while (testCaseCount--) {
  currentGridDimension = numericData.shift();

  if (currentGridDimension === 0) {
    console.log("");
    continue;
  }
  if (currentGridDimension === 1) {
    console.log("#");
    continue;
  }

  pathMarkedCells = new Set();
  finalPathPoint = [];

  performPathTraversal(currentGridDimension - 1, 0, 0);

  if (currentGridDimension % 2 === 0) {
    pathMarkedCells.delete(`${finalPathPoint[0]},${finalPathPoint[1]}`);
  }

  const outputLines = [];
  for (let r = 0; r < currentGridDimension; r++) {
    let rowString = '';
    for (let c = 0; c < currentGridDimension; c++) {
      rowString += pathMarkedCells.has(`${r},${c}`) ? '#' : ' ';
    }
    outputLines.push(rowString);
  }
  console.log(outputLines.join('\n'));
}
