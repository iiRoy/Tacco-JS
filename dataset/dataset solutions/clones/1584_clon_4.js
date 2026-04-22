const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

((incomingData) => {
    const textSegments = incomingData.split('\n');

    const [gridRows, gridCols] = textSegments[0].split(' ').map(Number);

    const startCoordinates = textSegments[1].split(' ').map(Number);

    const endCoordinates = textSegments[2].split(' ').map(Number);

    const labyrinthLayout = textSegments.slice(3, 3 + gridRows).map(line => line.split(''));

    const obstructionCharacter = '#';

    const updatePathCost = (rowIdx, colIdx, currentWeight, totalRows, totalCols, weightMap, layoutData, blockChar) => {
        if (rowIdx < 0 || rowIdx >= totalRows || colIdx < 0 || colIdx >= totalCols) {
            return false;
        }
        if (layoutData[rowIdx][colIdx] === blockChar) {
            return false;
        }
        if (currentWeight < weightMap[rowIdx][colIdx]) {
            weightMap[rowIdx][colIdx] = currentWeight;
            return true;
        }
        return false;
    };

    const minimumPathWeights = Array(gridRows).fill(null).map(() => Array(gridCols).fill(Number.MAX_SAFE_INTEGER));

    const traversalQueue = [];

    const initialRow = startCoordinates[0] - 1;
    const initialCol = startCoordinates[1] - 1;
    minimumPathWeights[initialRow][initialCol] = 0;

    traversalQueue.unshift([initialRow, initialCol]);

    while (traversalQueue.length > 0) {
        const [currentRow, currentCol] = traversalQueue.shift();
        const currentPathWeight = minimumPathWeights[currentRow][currentCol];

        const directDisplacements = [
            [1, 0], [-1, 0], [0, 1], [0, -1]
        ];
        for (const [dr, dc] of directDisplacements) {
            const nextRow = currentRow + dr;
            const nextCol = currentCol + dc;
            if (updatePathCost(nextRow, nextCol, currentPathWeight, gridRows, gridCols, minimumPathWeights, labyrinthLayout, obstructionCharacter)) {
                traversalQueue.unshift([nextRow, nextCol]);
            }
        }

        const jumpDisplacements = [
            [-2, -2], [-2, -1], [-2, 0], [-2, 1], [-2, 2],
            [-1, -2], [-1, -1], [-1, 1], [-1, 2],
            [0, -2], [0, 2],
            [1, -2], [1, -1], [1, 1], [1, 2],
            [2, -2], [2, -1], [2, 0], [2, 1], [2, 2]
        ];
        const nextPathWeight = currentPathWeight + 1;
        for (const [dr, dc] of jumpDisplacements) {
            const nextRow = currentRow + dr;
            const nextCol = currentCol + dc;
            if (updatePathCost(nextRow, nextCol, nextPathWeight, gridRows, gridCols, minimumPathWeights, labyrinthLayout, obstructionCharacter)) {
                traversalQueue.push([nextRow, nextCol]);
            }
        }
    }

    const targetRow = endCoordinates[0] - 1;
    const targetCol = endCoordinates[1] - 1;
    const finalResult = minimumPathWeights[targetRow][targetCol];
    console.log(finalResult === Number.MAX_SAFE_INTEGER ? -1 : finalResult);

})(dataSource);