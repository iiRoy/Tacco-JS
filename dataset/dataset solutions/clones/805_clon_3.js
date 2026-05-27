function fireProjectile(rowOffset, colOffset, currentMap, currentTankPos) {
    let stepCount = 0;
    const [tankRow, tankCol] = currentTankPos;

    const getTargetCoordinates = (s) => [tankRow + (rowOffset * s), tankCol + (colOffset * s)];

    while (true) {
        stepCount++;
        const [targetR, targetC] = getTargetCoordinates(stepCount);

        // Basic bounds check, though map borders should prevent out-of-bounds access
        if (targetR < 0 || targetR >= currentMap.length || targetC < 0 || targetC >= currentMap[0].length) {
            break;
        }

        const targetCellContent = currentMap[targetR][targetC];

        if (targetCellContent === "#") {
            break; // Projectile hit a wall
        } else if (targetCellContent === "*") {
            currentMap[targetR][targetC] = "."; // Destroy the target
            break;
        }
        // If targetCellContent is '.', continue traveling
    }
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Normalize direction characters for internal processing consistency
const processedInput = rawData
    .replace(/\^/g, "U")
    .replace(/v/g, "D")
    .replace(/\</g, "L")
    .replace(/\>/g, "R");

let inputLines = processedInput.trim().split("\n");
let numTestCases = parseInt(inputLines.shift(), 10);

// Define direction constants for clearer movement and firing logic
const DIRECTION_VECTORS = {
    U: { row: -1, col: 0 },
    D: { row: 1, col: 0 },
    L: { row: 0, col: -1 },
    R: { row: 0, col: 1 }
};

for (let caseIndex = 0; caseIndex < numTestCases; caseIndex++) {
    if (caseIndex !== 0) {
        console.log("");
    }

    const mapDimensions = inputLines.shift().split(" ").map(Number);
    const [mapHeight, mapWidth] = mapDimensions;

    let gameMap = [];
    let tankPosition = [0, 0]; // [currentTankRow, currentTankCol]

    // Create a dynamic top border based on map width
    const horizontalBorderRow = Array(mapWidth + 2).fill("#").join("");
    gameMap.push(horizontalBorderRow.split(""));

    // Helper function to process each map row, find tank, and add side borders
    const processAndBorderMapRow = (rowString, originalRowIndex) => {
        let currentRowChars = rowString.split("");
        let foundTankColumn = -1;

        // Iterate to find the tank's initial position in the current row
        for (let charIdx = 0; charIdx < currentRowChars.length; charIdx++) {
            const char = currentRowChars[charIdx];
            if (DIRECTION_VECTORS[char]) { // Check if character is a known tank direction
                foundTankColumn = charIdx;
                break;
            }
        }

        if (foundTankColumn !== -1) {
            // Adjust tank position to account for the added top and left borders
            tankPosition = [originalRowIndex + 1, foundTankColumn + 1];
        }

        // Add left and right borders to the current row
        currentRowChars.unshift("#");
        currentRowChars.push("#");
        gameMap.push(currentRowChars);
    };

    for (let rowIndex = 0; rowIndex < mapHeight; rowIndex++) {
        processAndBorderMapRow(inputLines.shift(), rowIndex);
    }

    // Create a dynamic bottom border
    gameMap.push(horizontalBorderRow.split(""));

    inputLines.shift(); // Consume the empty line separating map data from commands

    const commands = inputLines.shift().split("");

    // Helper function to encapsulate tank movement logic
    const executeTankMovement = (directionChar, map, tankPos) => {
        const [currentRow, currentCol] = tankPos;
        const { row: deltaRow, col: deltaCol } = DIRECTION_VECTORS[directionChar];

        const nextRow = currentRow + deltaRow;
        const nextCol = currentCol + deltaCol;

        if (map[nextRow][nextCol] === ".") {
            // Move tank to the empty spot
            map[nextRow][nextCol] = directionChar;
            map[currentRow][currentCol] = ".";
            tankPos[0] = nextRow;
            tankPos[1] = nextCol;
        } else {
            // Only change tank's direction if movement is blocked
            map[currentRow][currentCol] = directionChar;
        }
    };

    commands.forEach(commandChar => {
        switch (commandChar) {
            case "U":
            case "D":
            case "L":
            case "R":
                executeTankMovement(commandChar, gameMap, tankPosition);
                break;
            case "S":
                const currentTankDirectionChar = gameMap[tankPosition[0]][tankPosition[1]];
                const { row: fireRowOffset, col: fireColOffset } = DIRECTION_VECTORS[currentTankDirectionChar];
                fireProjectile(fireRowOffset, fireColOffset, gameMap, tankPosition);
                break;
            default:
                // Ignore unknown commands, if any
                break;
        }
    });

    // Remove the temporary borders before final output
    gameMap.shift(); // Remove top border
    gameMap.pop();  // Remove bottom border

    // Process each row to remove side borders and join characters
    const finalMapRows = gameMap.map(row => {
        row.shift(); // Remove left border
        row.pop();  // Remove right border
        return row.join("");
    });

    // Join rows and replace internal direction chars back to original symbols for output
    const formattedOutput = finalMapRows.join("\n")
        .replace(/U/g, "^")
        .replace(/D/g, "v")
        .replace(/L/g, "<")
        .replace(/R/g, ">");

    console.log(formattedOutput);
}
