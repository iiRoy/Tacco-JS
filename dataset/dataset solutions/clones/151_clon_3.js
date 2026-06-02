const fileSysMod = require('fs');

const fileDescriptor = process.stdin.fd;
const fileSize = fileSysMod.fstatSync(fileDescriptor).size;
const dataBuffer = Buffer.alloc(fileSize);
const actualBytesRead = fileSysMod.readSync(fileDescriptor, dataBuffer, 0, fileSize, 0);

const rawInputString = dataBuffer.toString('utf8', 0, actualBytesRead);
const trimmedInputString = rawInputString.trim();
const gridData = trimmedInputString.split('\n');

executePathfinding();

function executePathfinding() {
  let currentCol = 0;
  let currentRow = 0;
  let currentDirectionChar = 'R';
  let pathSequence = '';

  const isCellTraversable = (r, c, grid) => {
    return +grid[r][c] === 1;
  };

  const isValidRowIndex = (r, maxRows) => r >= 0 && r < maxRows;

  const maxGridRows = gridData.length;

  while (true) {
    const potentialRowUp = currentRow * 2 - 1;
    const potentialRowCurrent = currentRow * 2;
    const potentialRowDown = currentRow * 2 + 1;

    const potentialColLeft = currentCol - 1;
    const potentialColCurrent = currentCol;
    const potentialColRight = currentCol + 1;

    switch (currentDirectionChar) {
      case 'L':
        if (isCellTraversable(potentialRowCurrent, potentialColLeft, gridData)) {
          currentDirectionChar = 'L';
          currentCol = currentCol - 1;
        } else if (isValidRowIndex(potentialRowUp, maxGridRows) && isCellTraversable(potentialRowUp, potentialColCurrent, gridData)) {
          currentDirectionChar = 'U';
          currentRow = currentRow - 1;
        } else if (isValidRowIndex(potentialRowDown, maxGridRows) && isCellTraversable(potentialRowDown, potentialColCurrent, gridData)) {
          currentDirectionChar = 'D';
          currentRow = currentRow + 1;
        }
        break;

      case 'R':
        if (isCellTraversable(potentialRowCurrent, potentialColRight, gridData)) {
          currentDirectionChar = 'R';
          currentCol = currentCol + 1;
        } else if (isValidRowIndex(potentialRowDown, maxGridRows) && isCellTraversable(potentialRowDown, potentialColCurrent, gridData)) {
          currentDirectionChar = 'D';
          currentRow = currentRow + 1;
        } else if (isValidRowIndex(potentialRowUp, maxGridRows) && isCellTraversable(potentialRowUp, potentialColCurrent, gridData)) {
          currentDirectionChar = 'U';
          currentRow = currentRow - 1;
        }
        break;

      case 'D':
        if (isValidRowIndex(potentialRowDown, maxGridRows) && isCellTraversable(potentialRowDown, potentialColCurrent, gridData)) {
          currentDirectionChar = 'D';
          currentRow = currentRow + 1;
        } else if (isCellTraversable(potentialRowCurrent, potentialColRight, gridData)) {
          currentDirectionChar = 'R';
          currentCol = currentCol + 1;
        } else if (isCellTraversable(potentialRowCurrent, potentialColLeft, gridData)) {
          currentDirectionChar = 'L';
          currentCol = currentCol - 1;
        }
        break;

      case 'U':
        if (isValidRowIndex(potentialRowUp, maxGridRows) && isCellTraversable(potentialRowUp, potentialColCurrent, gridData)) {
          currentDirectionChar = 'U';
          currentRow = currentRow - 1;
        } else if (isCellTraversable(potentialRowCurrent, potentialColLeft, gridData)) {
          currentDirectionChar = 'L';
          currentCol = currentCol - 1;
        } else if (isCellTraversable(potentialRowCurrent, potentialColRight, gridData)) {
          currentDirectionChar = 'R';
          currentCol = currentCol + 1;
        }
        break;

      default:
        return;
    }

    pathSequence += currentDirectionChar;

    if (currentCol === 0 && currentRow === 0) {
      break;
    }
  }

  console.log(pathSequence);
}
