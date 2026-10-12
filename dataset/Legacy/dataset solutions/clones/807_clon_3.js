let gameGrid;
let tankPosition;

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';

const WALL_BLOCK_CHAR = '#';
const TARGET_BLOCK_CHAR = '*';
const EMPTY_SPACE_CHAR = '.';

const TANK_DIR_UP = 'U';
const TANK_DIR_DOWN = 'D';
const TANK_DIR_LEFT = 'L';
const TANK_DIR_RIGHT = 'R';

const COMMAND_SHOOT = 'S';

const FIXED_BORDER_ROW_CONTENT = "####################"; // Preserves original fixed length

function fireProjectile(rowOffset, colOffset) {
    let currentStep = 0;
    const currentTankRow = tankPosition[0];
    const currentTankCol = tankPosition[1];

    while (true) {
        currentStep++;
        const targetRow = currentTankRow + (rowOffset * currentStep);
        const targetCol = currentTankCol + (colOffset * currentStep);

        const currentTargetCell = gameGrid[targetRow][targetCol];

        if (currentTargetCell === WALL_BLOCK_CHAR) {
            break;
        } else if (currentTargetCell === TARGET_BLOCK_CHAR) {
            gameGrid[targetRow][targetCol] = EMPTY_SPACE_CHAR;
            break;
        }
    }
}

function prepareInputData(rawInputString) {
    let processedInput = rawInputString;
    processedInput = processedInput.replace(/\^/g, TANK_DIR_UP);
    processedInput = processedInput.replace(/v/g, TANK_DIR_DOWN);
    processedInput = processedInput.replace(/\</g, TANK_DIR_LEFT);
    processedInput = processedInput.replace(/\>/g, TANK_DIR_RIGHT);
    return processedInput.trim().split("\n");
}

function calculateNewTankPosition(currentRow, currentCol, direction) {
    let nextRow = currentRow;
    let nextCol = currentCol;
    switch (direction) {
        case TANK_DIR_UP: nextRow--; break;
        case TANK_DIR_DOWN: nextRow++; break;
        case TANK_DIR_LEFT: nextCol--; break;
        case TANK_DIR_RIGHT: nextCol++; break;
    }
    return [nextRow, nextCol];
}

function performTankMove(grid, oldPos, newPos, directionChar) {
    grid[newPos[0]][newPos[1]] = directionChar;
    grid[oldPos[0]][oldPos[1]] = EMPTY_SPACE_CHAR;
    return newPos;
}

function initializeGameGrid(mapHeight, mapRowsData) {
    const gridWithBorders = [];
    gridWithBorders.push(FIXED_BORDER_ROW_CONTENT.split(""));

    let initialTankRow = 0;
    let initialTankCol = 0;

    for (let rIdx = 0; rIdx < mapHeight; rIdx++) {
        const currentRowChars = mapRowsData[rIdx].split("");
        let tankColIdx = -1;

        currentRowChars.forEach((cellVal, charIdx) => {
            if ([TANK_DIR_UP, TANK_DIR_DOWN, TANK_DIR_LEFT, TANK_DIR_RIGHT].includes(cellVal)) {
                tankColIdx = charIdx;
            }
        });

        if (tankColIdx !== -1) {
            initialTankRow = rIdx + 1; // +1 for top border
            initialTankCol = tankColIdx + 1; // +1 for left border
        }
        currentRowChars.unshift(WALL_BLOCK_CHAR);
        currentRowChars.push(WALL_BLOCK_CHAR);
        gridWithBorders.push(currentRowChars);
    }
    gridWithBorders.push(FIXED_BORDER_ROW_CONTENT.split(""));
    return { grid: gridWithBorders, tankPos: [initialTankRow, initialTankCol] };
}

function generateOutputString(finalGrid) {
    const gridWithoutOuterBorders = finalGrid.slice(1, finalGrid.length - 1); // Removes top and bottom borders

    const processedRows = gridWithoutOuterBorders.map(row => {
        const rowWithoutSideBorders = row.slice(1, row.length - 1); // Removes left and right borders
        return rowWithoutSideBorders.join("");
    });

    let outputString = processedRows.join("\n");

    outputString = outputString.replace(new RegExp(TANK_DIR_UP, 'g'), "^");
    outputString = outputString.replace(new RegExp(TANK_DIR_DOWN, 'g'), "v");
    outputString = outputString.replace(new RegExp(TANK_DIR_LEFT, 'g'), "<");
    outputString = outputString.replace(new RegExp(TANK_DIR_RIGHT, 'g'), ">");

    return outputString;
}

function processSingleTestCase(inputLinesRef, currentCaseIndex) {
    if (currentCaseIndex !== 0) {
        console.log("\n");
    }

    const mapDimensions = inputLinesRef.shift().split(" ").map(Number);
    const mapHeight = mapDimensions[0];
    // const mapWidth = mapDimensions[1]; // Not directly used for grid creation, but available

    const mapRowsData = inputLinesRef.splice(0, mapHeight);
    const gridAndTankData = initializeGameGrid(mapHeight, mapRowsData);
    gameGrid = gridAndTankData.grid;
    tankPosition = gridAndTankData.tankPos;

    inputLinesRef.shift(); // Consume empty line
    const commandSequence = inputLinesRef.shift().split("");

    commandSequence.forEach(currentCommand => {
        const currentTankRow = tankPosition[0];
        const currentTankCol = tankPosition[1];
        const tankCurrentDirection = gameGrid[currentTankRow][currentTankCol];

        let potentialNewPos;

        switch (currentCommand) {
            case TANK_DIR_UP:
            case TANK_DIR_DOWN:
            case TANK_DIR_LEFT:
            case TANK_DIR_RIGHT:
                potentialNewPos = calculateNewTankPosition(currentTankRow, currentTankCol, currentCommand);
                const nextCellContent = gameGrid[potentialNewPos[0]][potentialNewPos[1]];

                if (nextCellContent === EMPTY_SPACE_CHAR) {
                    tankPosition = performTankMove(gameGrid, tankPosition, potentialNewPos, currentCommand);
                } else {
                    gameGrid[currentTankRow][currentTankCol] = currentCommand; // Update tank direction
                }
                break;
            case COMMAND_SHOOT:
                if (tankCurrentDirection === TANK_DIR_UP) fireProjectile(-1, 0);
                else if (tankCurrentDirection === TANK_DIR_DOWN) fireProjectile(1, 0);
                else if (tankCurrentDirection === TANK_DIR_LEFT) fireProjectile(0, -1);
                else if (tankCurrentDirection === TANK_DIR_RIGHT) fireProjectile(0, 1);
                break;
        }
    });

    console.log(generateOutputString(gameGrid));
}

const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8');
let inputLines = prepareInputData(rawInputContent);

const numTestCases = parseInt(inputLines.shift(), 10);

for (let caseIndex = 0; caseIndex < numTestCases; caseIndex++) {
    processSingleTestCase(inputLines, caseIndex);
}
