const processGridConfiguration = (fullContent) => {
    const contentLines = fullContent.trim().split('\n');
    const [dimensionX, dimensionY] = contentLines[0].split(' ').map(Number);
    const cellStructures = contentLines.slice(1, 1 + dimensionX).map(segment => segment.split(''));
    return { dimensionX, dimensionY, cellStructures };
};

const rotateMatrix = (originalMatrix) => {
    if (originalMatrix.length === 0 || originalMatrix[0].length === 0) return [];
    return Array.from({ length: originalMatrix[0].length }, (_, colIndex) =>
        Array.from({ length: originalMatrix.length }, (_, rowIndex) => originalMatrix[rowIndex][colIndex])
    );
};

const determineConsecutiveLengths = (sequence, targetChar, fromStart) => {
    let currentStreak = 0;
    const processSegment = (segment) => {
        return segment.map(unit => {
            if (unit === targetChar) {
                currentStreak++;
            } else {
                currentStreak = 0;
            }
            return currentStreak;
        });
    };

    if (fromStart) {
        return processSegment(sequence);
    } else {
        const reversedSequence = [...sequence].reverse();
        const reversedStreaks = processSegment(reversedSequence);
        return reversedStreaks.reverse();
    }
};

const calculateMaxBrightness = (rawInputText) => {
    const { dimensionX, dimensionY, cellStructures } = processGridConfiguration(rawInputText);

    const horizontalLeftPathLengths = cellStructures.map(rowSegment =>
        determineConsecutiveLengths(rowSegment, '.', true)
    );

    const horizontalRightPathLengths = cellStructures.map(rowSegment =>
        determineConsecutiveLengths(rowSegment, '.', false)
    );

    const verticalStructures = rotateMatrix(cellStructures);

    const verticalTopPathLengthsTransposed = verticalStructures.map(colSegment =>
        determineConsecutiveLengths(colSegment, '.', true)
    );
    const verticalTopPathLengths = rotateMatrix(verticalTopPathLengthsTransposed);

    const verticalBottomPathLengthsTransposed = verticalStructures.map(colSegment =>
        determineConsecutiveLengths(colSegment, '.', false)
    );
    const verticalBottomPathLengths = rotateMatrix(verticalBottomPathLengthsTransposed);

    let ultimateBrightness = 0;

    for (let rIndex = 0; rIndex < dimensionX; rIndex++) {
        for (let cIndex = 0; cIndex < dimensionY; cIndex++) {
            if (cellStructures[rIndex][cIndex] === '.') {
                const currentCellTotal =
                    horizontalLeftPathLengths[rIndex][cIndex] +
                    horizontalRightPathLengths[rIndex][cIndex] +
                    verticalTopPathLengths[rIndex][cIndex] +
                    verticalBottomPathLengths[rIndex][cIndex] - 3;

                ultimateBrightness = Math.max(ultimateBrightness, currentCellTotal);
            }
        }
    }

    return ultimateBrightness;
};

console.log(calculateMaxBrightness(require("fs").readFileSync("/dev/stdin", "utf8")));