const fileSystem = require('fs');

const PUZZLE_ROW_SIZE = 4;
const PUZZLE_TOTAL_TILES = 8;
const TARGET_PUZZLE_STRING = '01234567';

const findAdjacentTileIndices = (currentBlankIndex) => {
    const currentRow = Math.floor(currentBlankIndex / PUZZLE_ROW_SIZE);
    const currentCol = currentBlankIndex % PUZZLE_ROW_SIZE;

    const neighborOffsets = [
        [-1, 0], // Up
        [1, 0],  // Down
        [0, -1], // Left
        [0, 1]   // Right
    ];

    const validNeighborIndices = [];

    for (const [rowOffset, colOffset] of neighborOffsets) {
        const newRow = currentRow + rowOffset;
        const newCol = currentCol + colOffset;

        if (newRow >= 0 && newRow < 2 && newCol >= 0 && newCol < PUZZLE_ROW_SIZE) {
            validNeighborIndices.push(newRow * PUZZLE_ROW_SIZE + newCol);
        }
    }
    return validNeighborIndices;
};

const generateNextPuzzleState = (currentTiles, indexA, indexB) => {
    const newTiles = [...currentTiles];
    [newTiles[indexA], newTiles[indexB]] = [newTiles[indexB], newTiles[indexA]];
    return newTiles;
};

const solveSlidingPuzzle = (initialTileConfiguration) => {
    const explorationQueue = [];
    const visitedConfigurations = new Set();

    explorationQueue.push([initialTileConfiguration, 0]);
    visitedConfigurations.add(initialTileConfiguration.join(''));

    while (explorationQueue.length > 0) {
        const [currentTiles, currentMoveCount] = explorationQueue.shift();

        if (currentTiles.join('') === TARGET_PUZZLE_STRING) {
            return currentMoveCount;
        }

        const blankTileIndex = currentTiles.indexOf(0);
        const potentialSwapIndices = findAdjacentTileIndices(blankTileIndex);

        for (const swapTargetIndex of potentialSwapIndices) {
            const nextTileConfiguration = generateNextPuzzleState(currentTiles, blankTileIndex, swapTargetIndex);
            const nextConfigurationString = nextTileConfiguration.join('');

            if (!visitedConfigurations.has(nextConfigurationString)) {
                visitedConfigurations.add(nextConfigurationString);
                explorationQueue.push([nextTileConfiguration, currentMoveCount + 1]);
            }
        }
    }

    return -1;
};

const puzzleDataLines = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

for (const lineContent of puzzleDataLines) {
    const startingPuzzle = lineContent.split(' ').map(Number);
    const minimumMoves = solveSlidingPuzzle(startingPuzzle);
    console.log(minimumMoves);
}
