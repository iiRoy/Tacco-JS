function calculateMinMoves ( ) {
    let stateDistances = {};
    stateDistances["01234567"] = 0;
    const rowOffsets = [-1, 0, 0, 1];
    const colOffsets = [0, -1, 1, 0];
    const initialTiles = [0, 1, 2, 3, 4, 5, 6, 7];
    let workQueue = [[initialTiles, 0]];
    while (workQueue.length > 0) {
        const currentEntry = workQueue.shift();
        const currentLayout = currentEntry[0];
        const stepsTaken = currentEntry[1];
        const emptySpotIndex = currentLayout.indexOf(0);
        const emptyRow = Math.floor(emptySpotIndex / 4);
        const emptyCol = emptySpotIndex % 4;
        let gridRepresentation = [currentLayout.slice(0, 4), currentLayout.slice(4, 8)];
        for (let moveIdx = 0; moveIdx < 4; moveIdx++) {
            const nextEmptyRow = emptyRow + rowOffsets[moveIdx];
            const nextEmptyCol = emptyCol + colOffsets[moveIdx];
            if (nextEmptyRow < 0 || nextEmptyCol < 0 || nextEmptyRow >= 2 || nextEmptyCol >= 4) {
                continue;
            }
            const tileToMove = gridRepresentation[nextEmptyRow][nextEmptyCol];
            gridRepresentation[emptyRow][emptyCol] = tileToMove;
            gridRepresentation[nextEmptyRow][nextEmptyCol] = 0;
            const nextFlatLayout = gridRepresentation[0].concat(gridRepresentation[1]);
            const layoutKey = nextFlatLayout.join("");
            if (!stateDistances.hasOwnProperty(layoutKey)) {
                stateDistances[layoutKey] = stepsTaken + 1;
                workQueue.push([nextFlatLayout, stepsTaken + 1]);
            }
            gridRepresentation[nextEmptyRow][nextEmptyCol] = tileToMove;
            gridRepresentation[emptyRow][emptyCol] = 0;
        }
    }
    return stateDistances;
}
const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
const puzzleInputLines = fileData.trim().split("\n");
const solutionMap = calculateMinMoves();
puzzleInputLines.forEach(function(currentLine) {
    console.log(solutionMap[currentLine.split(" ").join("")]);
});