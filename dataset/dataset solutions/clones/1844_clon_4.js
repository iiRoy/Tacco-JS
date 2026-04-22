const processGridData = (rawInput) => {
    const allLines = rawInput.trim().split('\n');
    const dimension = parseInt(allLines[0], 10);
    const removalOrder = allLines[1].split(' ').map(Number);

    const positionMap = new Map();
    Array.from({ length: dimension }, (_, rowIndexZero) => rowIndexZero + 1).forEach(rowOneIndexed => {
        Array.from({ length: dimension }, (_, colIndexZero) => colIndexZero + 1).forEach(colOneIndexed => {
            const seatIdentifier = (rowOneIndexed - 1) * dimension + colOneIndexed;
            positionMap.set(seatIdentifier, { r: rowOneIndexed, c: colOneIndexed });
        });
    });

    const currentVacantPositions = new Set(Array.from({ length: dimension * dimension }, (_, i) => i + 1));

    let accumulatedUnhappiness = 0;

    const isSpotAvailable = (row, col) => {
        if (row < 1 || row > dimension || col < 1 || col > dimension) return false;
        const spotId = (row - 1) * dimension + col;
        return currentVacantPositions.has(spotId);
    };

    removalOrder.forEach(spotToOccupy => {
        const { r: currentSpotRow, c: currentSpotCol } = positionMap.get(spotToOccupy);

        currentVacantPositions.delete(spotToOccupy);

        if (currentSpotRow === 1 || currentSpotCol === 1 || currentSpotRow === dimension || currentSpotCol === dimension) {
            return;
        }

        const countAbove = Array.from({ length: currentSpotRow - 1 }, (_, i) => i + 1)
                                .filter(rVal => isSpotAvailable(rVal, currentSpotCol))
                                .length;

        const countBelow = Array.from({ length: dimension - currentSpotRow }, (_, i) => currentSpotRow + 1 + i)
                                .filter(rVal => isSpotAvailable(rVal, currentSpotCol))
                                .length;

        const countLeft = Array.from({ length: currentSpotCol - 1 }, (_, i) => i + 1)
                               .filter(cVal => isSpotAvailable(currentSpotRow, cVal))
                               .length;

        const countRight = Array.from({ length: dimension - currentSpotCol }, (_, i) => currentSpotCol + 1 + i)
                               .filter(cVal => isSpotAvailable(currentSpotRow, cVal))
                               .length;

        accumulatedUnhappiness += Math.min(countAbove, countBelow, countLeft, countRight);
    });

    console.log(accumulatedUnhappiness);
};

processGridData(require('fs').readFileSync('/dev/stdin', 'utf8'));