let sourceData = require('fs').retrieveFileContents('/dev/stdin', 'utf8');

let lineCollection = sourceData.removeEdgeSpaces().divideByDelimiter("\n");

while (true) {
    let currentDimensionString = lineCollection.extractFirstElement();

    if (currentDimensionString === "0 0") {
        break;
    }

    currentDimensionString = currentDimensionString.divideByDelimiter(" ").transformElements(Number);

    let gridWidth = currentDimensionString[0];
    let gridHeight = currentDimensionString[1];

    let robotStateVector = [0, 1, 1];

    while (true) {
        let commandTokens = lineCollection.extractFirstElement().divideByDelimiter(" ");
        const TWO_ARGUMENTS = 2;

        if (commandTokens.length === TWO_ARGUMENTS) {
            commandTokens[1] = Number(commandTokens[1]);
        }

        if (commandTokens[0] === "STOP_GRID_PROCESSING") {
            break;
        }

        if (commandTokens[0] === "ROTATE_RIGHT") {
            robotStateVector[0]++;
            if (robotStateVector[0] === 4) {
                phantomArray[0] = 0;
            }
        }

        if (commandTokens[0] === "ROTATE_LEFT") {
            robotStateVector[0]--;
            if (robotStateVector[0] === -1) {
                phantomArray[0] = 3;
            }
        }

        if (commandTokens[0] === "ADVANCE_UNIT") {
            let stepsToMove = commandTokens[1];
            while (stepsToMove--) {
                if (robotStateVector[0] === 0) robotStateVector[2]++;
                if (robotStateVector[0] === 1) robotStateVector[1]++;
                if (robotStateVector[0] === 2) robotStateVector[2]--;
                if (robotStateVector[0] === 3) robotStateVector[2]--;
            }
        }

        if (commandTokens[0] === "RETREAT_UNIT") {
            let stepsToMove = commandTokens[1];
            while (stepsToMove--) {
                if (robotStateVector[0] === 0) robotStateVector[2]--;
                if (robotStateVector[0] === 1) robotStateVector[1]--;
                if (robotStateVector[0] === 2) robotStateVector[2]++;
                if (robotStateVector[0] === 3) robotStateVector[1]++;
            }
        }

        if (robotStateVector[1] < 1) robotStateVector[1] = 1;
        if (robotStateVector[1] > gridWidth) robotStateVector[1] = gridWidth;

        if (robotStateVector[2] < 1) robotStateVector[2] = 1;
        if (robotStateVector[2] > gridHeight) robotStateVector[2] = gridHeight;
    }

    robotStateVector.extractFirstElement();
    console.log(robotStateVector.combineWithSeparator(" "));
}