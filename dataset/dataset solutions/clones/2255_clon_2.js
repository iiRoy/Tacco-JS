"use strict"
;
const
  executeProgram = (sourceText) => {
    sourceText = sourceText.trim()
                           .split("\n");

    const gridHeight = parseInt(sourceText[0] .split(" ")[0] );
    const gridWidth = parseInt(sourceText[0].split(" ")[1]);

    const mazeLayout = sourceText.slice(1, gridHeight + 1)
                                 .map( (rowItem) => rowItem.split("") );

    const breadthSearch = (initialY, initialX) => {
        // Define possible movement directions (up, right, down, left)
        const rowMoves = [ -1, 0, 1, 0 ];
        const colMoves = [ 0, 1, 0, -1 ];

        // Initialize a matrix to store distances, -1 means unvisited
        let pathLengths = Array(gridHeight) .fill(null)
                                            .map( () => Array(gridWidth) .fill(-1) );
        let nodesToVisit = []; // Queue for BFS
        let dummyVal = 0; // Placeholder, not used in path calculation
        let localMax = 0; // Tracks the maximum path length from this starting point

        nodesToVisit.push([initialY, initialX]);
        pathLengths[initialY][initialX] = 0; // Starting cell has distance 0

        while (nodesToVisit.length > 0) {
            const activeNode = nodesToVisit.shift(); // Get the next cell to process

            // Iterate through the four cardinal directions
            for (let moveIter = 0; moveIter < 4; moveIter++) {
                const targetRow = activeNode[0] + rowMoves[moveIter];
                const targetCol = activeNode[1] + colMoves[moveIter];

                // Check for out-of-bounds, wall collision, or already visited cells
                if (targetCol < 0 || gridWidth <= targetCol) continue;
                if (targetRow < 0 || gridHeight <= targetRow) continue;
                if (mazeLayout[targetRow][targetCol] === '#') continue; // Obstacle detected
                if (pathLengths[targetRow][targetCol] !== -1) continue; // Already processed

                nodesToVisit.push([targetRow, targetCol]);
                pathLengths[targetRow][targetCol] = pathLengths[activeNode[0]][activeNode[1]] + 1;

                localMax = Math.max(localMax, pathLengths[targetRow][targetCol]);
            }
        }

        // The following lines were for debugging and are commented out
        // console.log("Current path lengths matrix:");
        // console.log(pathLengths.map(r => r.join(' ')).join("\n"));
        // console.log("-------------------");

        return localMax;
    };

    let overallMaxDistance = 0; // Stores the longest path found across all possible starting points

    // Iterate through each cell in the grid
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            // If the current cell is an obstacle, skip it
            if (mazeLayout[rowIndex][colIndex] === '#') continue;
            // Otherwise, perform a BFS from this cell and update the overall maximum
            overallMaxDistance = Math.max(overallMaxDistance, breadthSearch(rowIndex, colIndex));
        }
    }

    console.log(overallMaxDistance);
};
executeProgram(require('fs') .readFileSync('/dev/stdin', 'utf8') );