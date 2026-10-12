function exchangeCharacters(sourceString, posA, posB) {
    const characterArray = sourceString.split('');
    const temporaryChar = characterArray[posA];
    characterArray[posA] = characterArray[posB];
    characterArray[posB] = temporaryChar;
    return characterArray.join('');
}

function solveGridMoves() {
    const distanceRegistry = new Map();
    const initialTileOrder = "01234567";
    const stateQueue = [];

    const moveOffsets = [
        [-1, 0],
        [0, -1],
        [0, 1],
        [1, 0]
    ];

    distanceRegistry.set(initialTileOrder, 0);
    stateQueue.push([initialTileOrder, 0, 0]);

    let head = 0;
    while (head < stateQueue.length) {
        const [currentTiles, moveCount, blankTileIndex] = stateQueue[head++];
        
        const rowCoord = Math.floor(blankTileIndex / 4);
        const colCoord = blankTileIndex % 4;

        for (const [deltaY, deltaX] of moveOffsets) {
            const nextRowCoord = rowCoord + deltaY;
            const nextColCoord = colCoord + deltaX;

            if (nextRowCoord < 0 || nextColCoord < 0 || nextRowCoord >= 2 || nextColCoord >= 4) {
                continue;
            }

            const nextBlankTileIndex = nextRowCoord * 4 + nextColCoord;
            
            const nextGridState = exchangeCharacters(currentTiles, blankTileIndex, nextBlankTileIndex);

            if (!distanceRegistry.has(nextGridState)) {
                distanceRegistry.set(nextGridState, moveCount + 1);
                stateQueue.push([nextGridState, moveCount + 1, nextBlankTileIndex]);
            }
        }
    }
    return distanceRegistry;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const queryStates = rawInputData.trim().split("\n");

const computedSolutions = solveGridMoves();

queryStates.forEach(function(singleQueryLine) {
    const cleanedQuery = singleQueryLine.split(" ").join("");
    console.log(computedSolutions.get(cleanedQuery));
});
