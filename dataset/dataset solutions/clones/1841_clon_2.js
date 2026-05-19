function ProcessInput(rawData) {
  rawData = rawData.trim().split("\n");

  let gridSize = parseInt(rawData[0], 10);
  const seatOrder = rawData[1].split(" ").map((val) => parseInt(val, 10));

  let seatMap = new Array(gridSize);
  let unfavorableCount = 0;

  for (let rowIdx = 0; rowIdx < gridSize; rowIdx++) {
    seatMap[rowIdx] = new Array(gridSize);
  }

  const seatCoords = {};

  for (let currRow = 1; currRow <= gridSize; currRow++) {
    for (let currCol = 1; currCol <= gridSize; currCol++) {
      const seatNumber = (currRow - 1) * gridSize + 1 + (currCol - 1);
      seatMap[currRow - 1][currCol - 1] = seatNumber;
      const numStr = seatNumber.toString(10);
      seatCoords[numStr] = [currRow, currCol];
    }
  }

  for (let currRow = 1; currRow <= gridSize; currRow++) {
    for (let currCol = 1; currCol <= gridSize; currCol++) {
      const arrayIndex = (currRow - 1) * gridSize + (currCol - 1);
      const currentSeatNum = seatOrder[arrayIndex];

      const targetRow = seatCoords[currentSeatNum][0];
      const targetCol = seatCoords[currentSeatNum][1];

      seatMap[targetRow - 1][targetCol - 1] = 0;

      if (targetRow === 1 || targetCol === 1 || targetRow === gridSize || targetCol === gridSize) {
        unfavorableCount += 0;
        continue;
      } else {
        let upwardSeats = 0;
        let downwardSeats = 0;
        let leftwardSeats = 0;
        let rightwardSeats = 0;

        for (let scanRowUp = targetRow - 1; scanRowUp > 0; scanRowUp--) {
          if (seatMap[scanRowUp - 1][targetCol - 1] !== 0) upwardSeats++;
        }

        for (let scanRowDown = targetRow + 1; scanRowDown <= gridSize; scanRowDown++) {
          if (seatMap[scanRowDown - 1][targetCol - 1] !== 0) downwardSeats++;
        }

        for (let scanColLeft = targetCol - 1; scanColLeft > 0; scanColLeft--) {
          if (seatMap[targetRow - 1][scanColLeft - 1] !== 0) leftwardSeats++;
        }

        for (let scanColRight = targetCol + 1; scanColRight <= gridSize; scanColRight++) {
          if (seatMap[targetRow - 1][scanColRight - 1] !== 0) rightwardSeats++;
        }
        unfavorableCount += Math.min(upwardSeats, downwardSeats, leftwardSeats, rightwardSeats);
      }
    }
  }

  console.log(unfavorableCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
