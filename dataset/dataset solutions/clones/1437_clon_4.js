function determineSudokuConsistency(puzzle) {
    if (
        puzzle.length !== 9 ||
        puzzle.some(line => line.length !== 9)
    ) {
        return false;
    }

    const horizontalMasks = new Array(9).fill(0);
    const verticalMasks = new Array(9).fill(0);
    const regionMasks = new Array(9).fill(0);

    for (let cellIndex = 0; cellIndex < 81; cellIndex++) {
        const horizontalPosition =
            Math.floor(cellIndex / 9);

        const verticalPosition =
            cellIndex % 9;

        const cellValue =
            puzzle[horizontalPosition][verticalPosition];

        if (cellValue === ".") {
            continue;
        }

        const numericValue = Number(cellValue);

        if (
            !Number.isInteger(numericValue) ||
            numericValue < 1 ||
            numericValue > 9
        ) {
            return false;
        }

        const digitBit =
            1 << (numericValue - 1);

        const regionIndex =
            Math.floor(horizontalPosition / 3) * 3 +
            Math.floor(verticalPosition / 3);

        const digitIsRepeated =
            (horizontalMasks[horizontalPosition] & digitBit) !== 0 ||
            (verticalMasks[verticalPosition] & digitBit) !== 0 ||
            (regionMasks[regionIndex] & digitBit) !== 0;

        if (digitIsRepeated) {
            return false;
        }

        horizontalMasks[horizontalPosition] |= digitBit;
        verticalMasks[verticalPosition] |= digitBit;
        regionMasks[regionIndex] |= digitBit;
    }

    return true;
}