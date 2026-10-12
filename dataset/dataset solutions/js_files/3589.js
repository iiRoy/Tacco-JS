function calculateEditDistance(source, target) {
    const rowCount = source.length + 1;
    const columnCount = target.length + 1;

    const distanceTable = Array.from(
        { length: rowCount },
        () => new Array(columnCount).fill(0)
    );

    for (let row = 0; row < rowCount; row++) {
        distanceTable[row][0] = row;
    }

    for (let column = 0; column < columnCount; column++) {
        distanceTable[0][column] = column;
    }

    for (let row = 1; row < rowCount; row++) {
        for (let column = 1; column < columnCount; column++) {
            const sourceCharacter = source[row - 1];
            const targetCharacter = target[column - 1];

            if (sourceCharacter === targetCharacter) {
                distanceTable[row][column] =
                    distanceTable[row - 1][column - 1];
            } else {
                const deletionCost =
                    distanceTable[row - 1][column] + 1;

                const insertionCost =
                    distanceTable[row][column - 1] + 1;

                const substitutionCost =
                    distanceTable[row - 1][column - 1] + 1;

                distanceTable[row][column] = Math.min(
                    deletionCost,
                    insertionCost,
                    substitutionCost
                );
            }
        }
    }

    return distanceTable[rowCount - 1][columnCount - 1];
}