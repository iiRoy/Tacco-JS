function processConfinement(sourceText) {
    const lines = sourceText.trim().split("\n");
    const gridDimension = parseInt(lines[0], 10);
    const seatSequence = lines[1].split(" ").map(Number);

    const resolvePosition = (seatIdentifier, dimension) => {
        const adjusted = seatIdentifier - 1;
        const rowIdx = Math.floor(adjusted / dimension);
        const colIdx = adjusted % dimension;
        return [rowIdx, colIdx];
    };

    const vacantSpots = new Set();
    for (let r = 0; r < gridDimension; r++) {
        for (let c = 0; c < gridDimension; c++) {
            vacantSpots.add(`${r}:${c}`);
        }
    }

    const measureAvailability = (startCoord, endCoord, fixedCoord, isScanningRow, currentVacancies) => {
        let tally = 0;
        for (let k = startCoord; k <= endCoord; k++) {
            const cellKey = isScanningRow ? `${fixedCoord}:${k}` : `${k}:${fixedCoord}`;
            if (currentVacancies.has(cellKey)) {
                tally++;
            }
        }
        return tally;
    };

    const totalDiscomfort = seatSequence.reduce((cumulativeDiscomfort, currentSeatId) => {
        const [currentRow, currentCol] = resolvePosition(currentSeatId, gridDimension);
        const currentCellKey = `${currentRow}:${currentCol}`;

        vacantSpots.delete(currentCellKey);

        if (currentRow === 0 || currentCol === 0 || currentRow === gridDimension - 1 || currentCol === gridDimension - 1) {
            return cumulativeDiscomfort;
        }

        const countAbove = measureAvailability(0, currentRow - 1, currentCol, false, vacantSpots);
        const countBelow = measureAvailability(currentRow + 1, gridDimension - 1, currentCol, false, vacantSpots);
        const countLeft = measureAvailability(0, currentCol - 1, currentRow, true, vacantSpots);
        const countRight = measureAvailability(currentCol + 1, gridDimension - 1, currentRow, true, vacantSpots);

        return cumulativeDiscomfort + Math.min(countAbove, countBelow, countLeft, countRight);

    }, 0);

    console.log(totalDiscomfort);
}

processConfinement(require("fs").readFileSync("/dev/stdin", "utf8"));