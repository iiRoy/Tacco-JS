const acquireDataForPuzzle = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const generateTileAdjacencyMap = () => {
    const links = new Map();
    for (let currentPos = 0; currentPos < 8; ++currentPos) {
        const possibleMoves = [];
        const currentGridRow = Math.floor(currentPos / 4);
        const currentGridColumn = currentPos % 4;

        if (currentGridRow > 0) possibleMoves.push(currentPos - 4);
        if (currentGridRow < 1) possibleMoves.push(currentPos + 4);
        if (currentGridColumn > 0) possibleMoves.push(currentPos - 1);
        if (currentGridColumn < 3) possibleMoves.push(currentPos + 1);
        
        links.set(currentPos, possibleMoves);
    }
    return links;
};

const tileMovementConnections = generateTileAdjacencyMap();
const solvedConfiguration = '01234567';

const processAllPuzzleInputs = (allPuzzleData) => {
    const puzzleLines = allPuzzleData.trim().split('\n');

    puzzleLines.forEach(puzzleText => {
        const initialPuzzleState = puzzleText.split(' ').join('');
        
        const knownStates = new Map();
        const progressionQueue = [];

        progressionQueue.push([initialPuzzleState, 0]);
        knownStates.set(initialPuzzleState, true);

        let solutionFoundForThisPuzzle = false;

        while (progressionQueue.length > 0) {
            const [currentPuzzleLayout, currentMoveCount] = progressionQueue.shift();

            if (currentPuzzleLayout === solvedConfiguration) {
                console.log(currentMoveCount);
                solutionFoundForThisPuzzle = true;
                break;
            }

            const zeroTilePosition = currentPuzzleLayout.indexOf('0');
            const potentialSwapPositions = tileMovementConnections.get(zeroTilePosition);
            
            let nextMoveCounter = currentMoveCount; 

            for (const targetSwapPosition of potentialSwapPositions) {
                const layoutChars = Array.from(currentPuzzleLayout);
                const swappedTileValue = layoutChars[targetSwapPosition];
                layoutChars[zeroTilePosition] = swappedTileValue;
                layoutChars[targetSwapPosition] = '0';
                const nextPuzzleLayout = layoutChars.join('');

                if (!knownStates.has(nextPuzzleLayout)) {
                    knownStates.set(nextPuzzleLayout, true);
                    progressionQueue.push([nextPuzzleLayout, nextMoveCounter++]);
                }
            }
        }
    });
};

processAllPuzzleInputs(acquireDataForPuzzle());