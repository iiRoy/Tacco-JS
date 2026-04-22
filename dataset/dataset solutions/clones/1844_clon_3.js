const processInputData = (rawDataString) => {
  const cleanedInputLines = rawDataString.trim().split("\n");

  const gridDimension = parseInt(cleanedInputLines[0], 10);

  if (isNaN(gridDimension) || gridDimension <= 0) {
    console.error("Invalid grid dimension provided. Must be a positive integer.");
    return;
  }

  const seatSequence = cleanedInputLines[1].split(" ").map((str) => parseInt(str, 10));

  const seatingGrid = Array.from({ length: gridDimension }, () =>
    Array.from({ length: gridDimension }, () => 0)
  );

  const seatCoordinatesMap = {};

  for (let rowOneBased = 1; rowOneBased <= gridDimension; rowOneBased++) {
    for (let colOneBased = 1; colOneBased <= gridDimension; colOneBased++) {
      const seatIdentifier = (rowOneBased - 1) * gridDimension + colOneBased;
      seatingGrid[rowOneBased - 1][colOneBased - 1] = seatIdentifier;
      seatCoordinatesMap[seatIdentifier] = [rowOneBased, colOneBased];
    }
  }

  let unfavorableCount = 0;

  for (let k = 0; k < seatSequence.length; k++) {
    const currentSeatNumber = seatSequence[k];

    const [takenSeatRow, takenSeatCol] = seatCoordinatesMap[currentSeatNumber];

    seatingGrid[takenSeatRow - 1][takenSeatCol - 1] = 0; // Mark the seat as taken

    const isBorderSeat =
      takenSeatRow === 1 ||
      takenSeatCol === 1 ||
      takenSeatRow === gridDimension ||
      takenSeatCol === gridDimension;

    if (isBorderSeat) {
      continue;
    }

    let countEmptyNorth = 0;
    let countEmptySouth = 0;
    let countEmptyWest = 0;
    let countEmptyEast = 0;

    const zeroIndexedRow = takenSeatRow - 1;
    const zeroIndexedCol = takenSeatCol - 1;

    // Count empty seats strictly above (decreasing row index)
    for (let rIter = zeroIndexedRow - 1; rIter >= 0; rIter--) {
      if (seatingGrid[rIter][zeroIndexedCol] !== 0) {
        countEmptyNorth++;
      }
    }

    // Count empty seats strictly below (increasing row index)
    for (let rIter = zeroIndexedRow + 1; rIter < gridDimension; rIter++) {
      if (seatingGrid[rIter][zeroIndexedCol] !== 0) {
        countEmptySouth++;
      }
    }

    // Count empty seats strictly to the left (decreasing column index)
    for (let cIter = zeroIndexedCol - 1; cIter >= 0; cIter--) {
      if (seatingGrid[zeroIndexedRow][cIter] !== 0) {
        countEmptyWest++;
      }
    }

    // Count empty seats strictly to the right (increasing column index)
    for (let cIter = zeroIndexedCol + 1; cIter < gridDimension; cIter++) {
      if (seatingGrid[zeroIndexedRow][cIter] !== 0) {
        countEmptyEast++;
      }
    }

    unfavorableCount += Math.min(countEmptyNorth, countEmptySouth, countEmptyWest, countEmptyEast);
  }

  console.log(unfavorableCount);
};

try {
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
  processInputData(fileContent);
} catch (error) {
  console.error("Error reading input from /dev/stdin:", error.message);
}