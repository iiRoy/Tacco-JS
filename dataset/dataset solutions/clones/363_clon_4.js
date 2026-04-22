const analyzeBoardStates = () => {
    const stateDistances = new Map();
    const initialArrangement = Object.freeze([0, 1, 2, 3, 4, 5, 6, 7]);
    const initialString = initialArrangement.join('');
    
    stateDistances.set(initialString, 0);

    const processingQueue = [[initialArrangement, 0]]; 

    const rowDelta = Object.freeze([-1, 0, 0, 1]);
    const colDelta = Object.freeze([0, -1, 1, 0]);

    while (processingQueue.length > 0) {
        const [currentArrangement, currentMoves] = processingQueue.shift();

        const zeroIndex = currentArrangement.indexOf(0);
        const zeroRow = Math.floor(zeroIndex / 4);
        const zeroCol = zeroIndex % 4;

        rowDelta.forEach((rChange, idx) => {
            const cChange = colDelta[idx];
            const nextZeroRow = zeroRow + rChange;
            const nextZeroCol = zeroCol + cChange;

            if (nextZeroRow < 0 || nextZeroCol < 0 || nextZeroRow >= 2 || nextZeroCol >= 4) {
                return;
            }

            const targetIndex = nextZeroRow * 4 + nextZeroCol;

            const nextArrangement = [...currentArrangement];
            const tileToMove = nextArrangement[targetIndex];
            
            nextArrangement[zeroIndex] = tileToMove;
            nextArrangement[targetIndex] = 0;

            const nextStateIdentifier = nextArrangement.join('');

            if (!stateDistances.has(nextStateIdentifier)) {
                stateDistances.set(nextStateIdentifier, currentMoves + 1);
                processingQueue.push([nextArrangement, currentMoves + 1]);
            }
        });
    }
    return stateDistances;
};

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split('\n');

const solutionMap = analyzeBoardStates();

inputLines.forEach(lineEntry => {
    const formattedQuery = lineEntry.split(' ').join('');
    console.log(solutionMap.get(formattedQuery));
});