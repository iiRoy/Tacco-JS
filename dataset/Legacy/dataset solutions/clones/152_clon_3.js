const nodeFs = require('fs');

const standardInputFileDescriptor = process.stdin.fd;
const fileContentSize = nodeFs.fstatSync(standardInputFileDescriptor).size;

const readBuffer = Buffer.alloc(fileContentSize);
const actualBytesRead = nodeFs.readSync(standardInputFileDescriptor, readBuffer, 0, fileContentSize, 0);
const gridLines = readBuffer.toString('utf8', 0, actualBytesRead).trim().split('\n');

solveMazePath();

function solveMazePath() {
  let currentCol = 0;
  let currentRow = 0;
  let currentHeading = 'R';
  let finalPath = '';

  const maxGridRows = gridLines.length;

  // Helper function to check if a vertical move is valid and the cell is walkable.
  // This incorporates the explicit row boundary checks from the original code.
  const isVerticalMoveValidAndWalkable = (targetRow, currentColumn) => {
    return targetRow >= 0 && targetRow < maxGridRows && +gridLines[targetRow][currentColumn];
  };

  // Helper function to check if a horizontal move is valid and the cell is walkable.
  // The original code implicitly handles column bounds by `+gridLines[currentRow][targetColumn]`
  // returning NaN (falsy) if the cell is out of bounds.
  // It does not explicitly check `currentRow` bounds here, implying `currentRow` is always valid for horizontal checks.
  const isHorizontalMoveValidAndWalkable = (currentRowIndex, targetColumn) => {
    return +gridLines[currentRowIndex][targetColumn];
  };

  while (true) {
    const downwardRowIndex = currentRow * 2 + 1;
    const upwardRowIndex = currentRow * 2 - 1;
    const horizontalCheckRowIndex = currentRow * 2; // Corresponds to 'ny' in original
    const leftwardColIndex = currentCol - 1;
    const rightwardColIndex = currentCol + 1;
    const verticalCheckColIndex = currentCol; // Corresponds to 'nx' in original

    switch (currentHeading) {
      case 'L':
        const canMoveDownFromL = isVerticalMoveValidAndWalkable(downwardRowIndex, verticalCheckColIndex);
        const canMoveLeftFromL = isHorizontalMoveValidAndWalkable(horizontalCheckRowIndex, leftwardColIndex);
        const canMoveUpFromL = isVerticalMoveValidAndWalkable(upwardRowIndex, verticalCheckColIndex);

        if (canMoveDownFromL) {
          currentHeading = 'D';
          currentRow++;
        } else if (canMoveLeftFromL) {
          currentHeading = 'L';
          currentCol--;
        } else if (canMoveUpFromL) {
          currentHeading = 'U';
          currentRow--;
        } else {
          currentHeading = 'R';
          currentCol++;
        }
        break;

      case 'R':
        const canMoveUpFromR = isVerticalMoveValidAndWalkable(upwardRowIndex, verticalCheckColIndex);
        const canMoveRightFromR = isHorizontalMoveValidAndWalkable(horizontalCheckRowIndex, verticalCheckColIndex); // nx is x
        const canMoveDownFromR = isVerticalMoveValidAndWalkable(downwardRowIndex, verticalCheckColIndex);

        if (canMoveUpFromR) {
          currentHeading = 'U';
          currentRow--;
        } else if (canMoveRightFromR) {
          currentHeading = 'R';
          currentCol++;
        } else if (canMoveDownFromR) {
          currentHeading = 'D';
          currentRow++;
        } else {
          currentHeading = 'L';
          currentCol--;
        }
        break;

      case 'D':
        const canMoveRightFromD = isHorizontalMoveValidAndWalkable(horizontalCheckRowIndex, verticalCheckColIndex); // nx is x
        const canMoveDownFromD = isVerticalMoveValidAndWalkable(downwardRowIndex, verticalCheckColIndex);
        const canMoveLeftFromD = isHorizontalMoveValidAndWalkable(horizontalCheckRowIndex, leftwardColIndex);

        if (canMoveRightFromD) {
          currentHeading = 'R';
          currentCol++;
        } else if (canMoveDownFromD) {
          currentHeading = 'D';
          currentRow++;
        } else if (canMoveLeftFromD) {
          currentHeading = 'L';
          currentCol--;
        } else {
          currentHeading = 'U';
          currentRow--;
        }
        break;

      case 'U':
        const canMoveLeftFromU = isHorizontalMoveValidAndWalkable(horizontalCheckRowIndex, leftwardColIndex);
        const canMoveUpFromU = isVerticalMoveValidAndWalkable(upwardRowIndex, verticalCheckColIndex);
        const canMoveRightFromU = isHorizontalMoveValidAndWalkable(horizontalCheckRowIndex, verticalCheckColIndex); // nx is x

        if (canMoveLeftFromU) {
          currentHeading = 'L';
          currentCol--;
        } else if (canMoveUpFromU) {
          currentHeading = 'U';
          currentRow--;
        } else if (canMoveRightFromU) {
          currentHeading = 'R';
          currentCol++;
        } else {
          currentHeading = 'D';
          currentRow++;
        }
        break;

      default:
        // This case should ideally not be reached if currentHeading is always one of 'L', 'R', 'D', 'U'.
        // Preserving original behavior of returning silently.
        return;
    }

    finalPath += currentHeading;

    if (!currentCol && !currentRow) {
      break;
    }
  }
  console.log(finalPath);
}
