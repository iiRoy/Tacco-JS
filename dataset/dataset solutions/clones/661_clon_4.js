const fileSystemModule = require('fs');
const rawSourceData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
let processedLines = rawSourceData.trim().split("\n");
let currentLinePointer = 0;

function executeNextOperation() {
    const dimensionsAndOperationsLine = processedLines[currentLinePointer++];
    if (dimensionsAndOperationsLine === "0 0") {
        return false;
    }

    const parsedDimensions = dimensionsAndOperationsLine.split(" ").map(Number);
    const cubeWidth = parsedDimensions[0];
    const numOperations = parsedDimensions[1];

    const untouchedPositions = new Set();
    for (let xPos = 0; xPos < cubeWidth; xPos++) {
        for (let yPos = 0; yPos < cubeWidth; yPos++) {
            for (let zPos = 0; zPos < cubeWidth; zPos++) {
                untouchedPositions.add(`${xPos}-${yPos}-${zPos}`);
            }
        }
    }

    for (let opIndex = 0; opIndex < numOperations; opIndex++) {
        const operationDetails = processedLines[currentLinePointer++].split(" ");
        const operationType = operationDetails.shift();
        const operationCoordinates = operationDetails.map(val => Number(val) - 1);

        const firstCoord = operationCoordinates[0];
        const secondCoord = operationCoordinates[1];

        for (let varyingCoord = 0; varyingCoord < cubeWidth; varyingCoord++) {
            let positionKey;
            switch (operationType) {
                case "xy":
                    positionKey = `${firstCoord}-${secondCoord}-${varyingCoord}`;
                    break;
                case "xz":
                    positionKey = `${firstCoord}-${varyingCoord}-${secondCoord}`;
                    break;
                case "yz":
                    positionKey = `${varyingCoord}-${firstCoord}-${secondCoord}`;
                    break;
            }
            untouchedPositions.delete(positionKey);
        }
    }

    console.log(untouchedPositions.size);
    return true;
}

while (executeNextOperation()) {
    // Continue processing scenarios until "0 0" is encountered
}