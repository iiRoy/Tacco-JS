const countAdjacentBombs = (rCoord, cCoord, currentMap, mapHeight, mapWidth) => {
    const relativePositions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    return relativePositions.reduce((bombTally, [deltaR, deltaC]) => {
        const neighborR = rCoord + deltaR;
        const neighborC = cCoord + deltaC;

        const isWithinBounds = neighborR >= 0 && neighborR < mapHeight && neighborC >= 0 && neighborC < mapWidth;
        
        if (isWithinBounds && currentMap[neighborR][neighborC] === '#') {
            return bombTally + 1;
        }
        return bombTally;
    }, 0);
};

const processMinefield = (sourceData) => {
    const dataLines = sourceData.split('\n');
    const [fieldHeight, fieldWidth] = dataLines[0].split(' ').map(Number);
    const fieldRows = dataLines.slice(1);

    const dotOccurrences = sourceData.match(/\./g);

    if (!dotOccurrences) {
        console.log(fieldRows.join('\n') + '\n');
    } else if (dotOccurrences.length === fieldHeight * fieldWidth) {
        console.log(fieldRows.join('\n').replace(/./g, '0') + '\n');
    } else {
        const finalFieldState = Array.from({ length: fieldHeight }).reduce((currentField, _, rIndex) => {
            return Array.from({ length: fieldWidth }).reduce((rowProcessingField, _, cIndex) => {
                if (rowProcessingField[rIndex][cIndex] === '.') {
                    const bombCount = countAdjacentBombs(rIndex, cIndex, rowProcessingField, fieldHeight, fieldWidth);
                    rowProcessingField[rIndex] = rowProcessingField[rIndex].replace('.', bombCount.toString());
                }
                return rowProcessingField;
            }, currentField);
        }, [...fieldRows]);

        console.log(finalFieldState.join('\n'));
    }
};

// processMinefield(require("fs").readFileSync("/dev/stdin", "utf8"));
