const obtainSeatCoordinates = (seatIdentifier, gridDimension) => {
    const zeroBasedIndex = seatIdentifier - 1;
    const rowPosition = Math.floor(zeroBasedIndex / gridDimension) + 1;
    const columnPosition = (zeroBasedIndex % gridDimension) + 1;
    return [rowPosition, columnPosition];
};

const generateCoordinateKey = (rowVal, colVal) => `${rowVal}_${colVal}`;

function ProcessInput(inputContent) {
    const parsedLines = inputContent.trim().split("\n");
    const gridDimension = parseInt(parsedLines[0], 10);
    const seatOrderSequence = parsedLines[1].split(" ").map(Number);

    const currentlyAvailableSeats = new Set();
    for (let rIdx = 1; rIdx <= gridDimension; rIdx++) {
        for (let cIdx = 1; cIdx <= gridDimension; cIdx++) {
            currentlyAvailableSeats.add(generateCoordinateKey(rIdx, cIdx));
        }
    }

    let cumulativeDislikeScore = 0;

    for (let currentPermutationIndex = 0; currentPermutationIndex < gridDimension * gridDimension; currentPermutationIndex++) {
        const seatNumberToOccupy = seatOrderSequence[currentPermutationIndex];
        const [originalSeatRow, originalSeatCol] = obtainSeatCoordinates(seatNumberToOccupy, gridDimension);

        currentlyAvailableSeats.delete(generateCoordinateKey(originalSeatRow, originalSeatCol));

        if (originalSeatRow === 1 || originalSeatCol === 1 || originalSeatRow === gridDimension || originalSeatCol === gridDimension) {
            // Border seats do not contribute to the dislike score.
        } else {
            let countUpward = 0; // Corresponds to original 'left' variable (vertical check, decreasing row)
            let countDownward = 0; // Corresponds to original 'right' variable (vertical check, increasing row)
            let countLeftward = 0; // Corresponds to original 'up' variable (horizontal check, decreasing column, using originalSeatRow for column iteration)
            let countRightward = 0; // Corresponds to original 'down' variable (horizontal check, increasing column, using originalSeatRow for column iteration)

            // Original 'left' (actual UP)
            for (let r = originalSeatRow - 1; r >= 1; r--) {
                if (currentlyAvailableSeats.has(generateCoordinateKey(r, originalSeatCol))) {
                    countUpward++;
                }
            }

            // Original 'right' (actual DOWN)
            for (let r = originalSeatRow + 1; r <= gridDimension; r++) {
                if (currentlyAvailableSeats.has(generateCoordinateKey(r, originalSeatCol))) {
                    countDownward++;
                }
            }

            // Original 'up' (actual LEFT, but uses originalSeatRow for column iteration)
            for (let c = originalSeatRow - 1; c >= 1; c--) {
                if (currentlyAvailableSeats.has(generateCoordinateKey(originalSeatRow, c))) {
                    countLeftward++;
                }
            }

            // Original 'down' (actual RIGHT, but uses originalSeatRow for column iteration)
            for (let c = originalSeatRow + 1; c <= gridDimension; c++) {
                if (currentlyAvailableSeats.has(generateCoordinateKey(originalSeatRow, c))) {
                    countRightward++;
                }
            }

            cumulativeDislikeScore += Math.min(countUpward, countDownward, countLeftward, countRightward);
        }
    }

    console.log(cumulativeDislikeScore);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
