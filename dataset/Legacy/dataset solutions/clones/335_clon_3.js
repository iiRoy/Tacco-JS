const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputData.trim().split("\n");

let finalOutcome = ""; // Declared at a higher scope for recursive function access

function tracePath(currRow, currCol) {
    const currentCellContent = gridMap[currRow][currCol]; // Helper variable for current cell's value

    if (currentCellContent === "#") {
        finalOutcome = "LOOP";
        return;
    }

    if (currentCellContent === ".") {
        finalOutcome = currCol + " " + currRow;
        return;
    }

    // Mark the current cell as visited
    gridMap[currRow][currCol] = "#";

    // The following logic to update coordinates is effectively dead code
    // because gridMap[currRow][currCol] has just been set to '#'.
    // This preserves the original code's observable behavior (bug).
    let nextRowCoord = currRow; // Temporary variables for potential next coordinates
    let nextColCoord = currCol;

    // Using a switch statement for the direction check,
    // which will always evaluate against '#' at this point.
    switch (gridMap[currRow][currCol]) {
        case ">":
            nextColCoord++;
            break;
        case "<":
            nextColCoord--;
            break;
        case "^":
            nextRowCoord--;
            break;
        case "v":
            nextRowCoord++;
            break;
        default:
            // If the cell is '#', no coordinate change occurs here.
            break;
    }

    // Recursively call with the *original* currRow, currCol,
    // as nextRowCoord/nextColCoord were not updated by the switch.
    tracePath(currRow, currCol);
}

let gridMap = []; // Declared at a higher scope for tracePath access

while (true) {
    const currentDimensionLine = inputLinesArray.shift();
    const dimensionStrings = currentDimensionLine.split(" ");
    const gridHeight = Number(dimensionStrings[0]);
    const gridWidth = Number(dimensionStrings[1]);

    if (gridHeight === 0 && gridWidth === 0) {
        break;
    }

    gridMap = []; // Reset gridMap for each test case
    for (let rowIterator = 0; rowIterator < gridHeight; rowIterator++) {
        const currentGridRowString = inputLinesArray.shift();
        const currentRowChars = currentGridRowString.split("");
        gridMap.push(currentRowChars);
    }

    finalOutcome = ""; // Reset outcome for each test case
    tracePath(0, 0);
    console.log(finalOutcome);
}
