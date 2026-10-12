function processInput(rawData) {
  const processedLines = rawData.trim().split("\n");
  const gridSize = parseInt(processedLines[0], 10);
  const seatOrder = processedLines[1].split(" ").map(Number);

  const ONE_BASED_OFFSET = 1;

  const seatGrid = Array.from({ length: gridSize }, () => new Array(gridSize).fill(0));

  const seatCoordinates = {};

  for (let currRow = ONE_BASED_OFFSET; currRow <= gridSize; currRow++) {
    for (let currCol = ONE_BASED_OFFSET; currCol <= gridSize; currCol++) {
      const currentSeatNumber = (currRow - ONE_BASED_OFFSET) * gridSize + currCol;
      
      seatGrid[currRow - ONE_BASED_OFFSET][currCol - ONE_BASED_OFFSET] = currentSeatNumber;
      
      seatCoordinates[currentSeatNumber.toString()] = [currRow, currCol];
    }
  }

  let unfavorableCount = 0;

  const isBorderSeat = (r, c, size) => {
    return r === ONE_BASED_OFFSET || c === ONE_BASED_OFFSET || r === size || c === size;
  };

  for (let currRow = ONE_BASED_OFFSET; currRow <= gridSize; currRow++) {
    for (let currCol = ONE_BASED_OFFSET; currCol <= gridSize; currCol++) {
      const seatOrderIndex = (currRow - ONE_BASED_OFFSET) * gridSize + (currCol - ONE_BASED_OFFSET);
      
      const currentSeatNum = seatOrder[seatOrderIndex];
      
      const [seatRowCoord, seatColCoord] = seatCoordinates[currentSeatNum.toString()];

      seatGrid[seatRowCoord - ONE_BASED_OFFSET][seatColCoord - ONE_BASED_OFFSET] = 0;

      if (isBorderSeat(seatRowCoord, seatColCoord, gridSize)) {
        continue;
      } else {
        let verticalUpCount = 0;
        let verticalDownCount = 0;
        let horizontalLeftCount = 0;
        let horizontalRightCount = 0;

        for (let tempRow = seatRowCoord - ONE_BASED_OFFSET; tempRow >= ONE_BASED_OFFSET; tempRow--) {
          if (seatGrid[tempRow - ONE_BASED_OFFSET][seatColCoord - ONE_BASED_OFFSET] !== 0) {
            verticalUpCount++;
          }
        }

        for (let tempRow = seatRowCoord + ONE_BASED_OFFSET; tempRow <= gridSize; tempRow++) {
          if (seatGrid[tempRow - ONE_BASED_OFFSET][seatColCoord - ONE_BASED_OFFSET] !== 0) {
            verticalDownCount++;
          }
        }

        for (let tempCol = seatColCoord - ONE_BASED_OFFSET; tempCol >= ONE_BASED_OFFSET; tempCol--) {
          if (seatGrid[seatRowCoord - ONE_BASED_OFFSET][tempCol - ONE_BASED_OFFSET] !== 0) {
            horizontalLeftCount++;
          }
        }

        for (let tempCol = seatColCoord + ONE_BASED_OFFSET; tempCol <= gridSize; tempCol++) {
          if (seatGrid[seatRowCoord - ONE_BASED_OFFSET][tempCol - ONE_BASED_OFFSET] !== 0) {
            horizontalRightCount++;
          }
        }
        
        unfavorableCount += Math.min(verticalUpCount, verticalDownCount, horizontalLeftCount, horizontalRightCount);
      }
    }
  }

  console.log(unfavorableCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
