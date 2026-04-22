let inputBuffer = [];
let darkCellCount, gridMatrix, gridHeight, gridWidth;

/* Import the necessary module for line-by-line input processing */
const inputProcessor = require('readline');

/* Configure the interface for reading and writing */
const ioInterface = inputProcessor.createInterface({
    sourceStream: process.stdin,
    writeTo: process.stdout,
});

/* Event handler for each incoming line of text */
ioInterface.on('line', function (currentLine) {
    inputBuffer.push(currentLine);
});


/* Event handler for when the input stream closes */
ioInterface.on('close', function () {
    /* Parse grid dimensions from the first line */
    gridHeight = parseFloat(inputBuffer[0].split(" ")[0]);
    gridWidth = parseFloat(inputBuffer[0].split(" ")[1]);

    /* Remove the dimension line as it's been processed */
    inputBuffer.shift();

    /* Convert remaining input lines into a 2D character array */
    gridMatrix = inputBuffer.map(singleRow => singleRow.split(''));

    /* Initialize variables for BFS */
    darkCellCount = 0;
    const explorationQueue = [];

    /* Iterate through the grid to find all dark cells and populate the initial queue */
    for (let rowIterator = 0; rowIterator < gridHeight; rowIterator++) {
        for (let colIterator = 0; colIterator < gridWidth; colIterator++) {
            if (gridMatrix[rowIterator][colIterator] === '#') {
                explorationQueue.push([rowIterator, colIterator]);
                darkCellCount++;
            }
        }
    }

    /* Execute the breadth-first traversal and print the outcome */
    console.log(performTraversal(explorationQueue));
});


/*
 * This function conducts a breadth-first search (BFS)
 * starting from a queue of initial points.
 * It aims to visit all connected '#' cells and count them.
 */
function performTraversal(initialPoints) {

    let visitedDarkCells = 0;
    let finalOutcome = 'No';

    /* Continue as long as there are points to explore in the queue */
    while (initialPoints.length > 0) {

        /* Get the next coordinate pair from the front of the queue */
        const currentPoint = initialPoints.shift();
        let yCoord = currentPoint[0];
        let xCoord = currentPoint[1];

        /*
         * Check all four adjacent cells (up, down, left, right).
         * If a neighbor is within bounds and is a dark cell ('#'),
         * mark it as visited ('.'), increment the counter, and add it to the queue.
         */

        /* Check right neighbor */
        if (0 <= xCoord + 1 && xCoord + 1 < gridWidth) {
            if (gridMatrix[yCoord][xCoord + 1] === '#') {
                gridMatrix[yCoord][xCoord + 1] = '.';
                visitedDarkCells++;
                initialPoints.push([yCoord, xCoord + 1]);
            }
        }

        /* Check left neighbor */
        if (0 <= xCoord - 1 && xCoord - 1 < gridWidth) {
            if (gridMatrix[yCoord][xCoord - 1] === '#') {
                gridMatrix[yCoord][xCoord - 1] = '.';
                visitedDarkCells++;
                initialPoints.push([yCoord, xCoord - 1]);
            }
        }

        /* Check bottom neighbor */
        if (0 <= yCoord + 1 && yCoord + 1 < gridHeight) {
            if (gridMatrix[yCoord + 1][xCoord] === '#') {
                gridMatrix[yCoord + 1][xCoord] = '.';
                visitedDarkCells++;
                initialPoints.push([yCoord + 1, xCoord]);
            }
        }

        /* Check top neighbor */
        if (0 <= yCoord - 1 && yCoord - 1 < gridHeight) {
            if (gridMatrix[yCoord - 1][xCoord] === '#') {
                gridMatrix[yCoord - 1][xCoord] = '.';
                visitedDarkCells++;
                initialPoints.push([yCoord - 1, xCoord]);
            }
        }

    }

    /* If all initially counted dark cells were visited, the traversal was complete */
    if (visitedDarkCells === darkCellCount) {
        finalOutcome = 'Yes';
    }

    return finalOutcome;
}