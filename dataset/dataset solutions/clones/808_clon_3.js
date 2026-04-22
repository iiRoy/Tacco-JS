// Global constants for map elements and internal direction representations
const MAP_WALL = '#';
const MAP_EMPTY = '.';
const MAP_TARGET = '*';

const TANK_DIR_UP = 'U';
const TANK_DIR_DOWN = 'D';
const TANK_DIR_LEFT = 'L';
const TANK_DIR_RIGHT = 'R';

// Mapping for input characters to internal direction constants
const INPUT_TO_INTERNAL_DIRECTION_MAP = {
    '^': TANK_DIR_UP,
    'v': TANK_DIR_DOWN,
    '<': TANK_DIR_LEFT,
    '>': TANK_DIR_RIGHT
};

// Mapping for internal direction constants to final output characters
const INTERNAL_TO_OUTPUT_DIRECTION_MAP = {
    [TANK_DIR_UP]: '^',
    [TANK_DIR_DOWN]: 'v',
    [TANK_DIR_LEFT]: '<',
    [TANK_DIR_RIGHT]: '>'
};

/**
 * Updates the tank's coordinates on the grid, if the move is valid.
 * This function also updates the grid to reflect the tank's new position.
 * @param {Array<Array<string>>} gameGrid The 2D array representing the current battlefield.
 * @param {{row: number, col: number}} currentTankPosition The current row and column of the tank.
 * @param {number} rowChange The delta for the row coordinate (e.g., -1 for up, 1 for down).
 * @param {number} colChange The delta for the column coordinate (e.g., -1 for left, 1 for right).
 */
function attemptTankMovement(gameGrid, currentTankPosition, rowChange, colChange) {
    // Retrieve the tank's current symbol (which also indicates its direction) from the grid.
    const vehicleDirectionSymbol = gameGrid[currentTankPosition.row][currentTankPosition.col];
    
    // Calculate the potential new coordinates for the tank.
    const potentialNewRow = currentTankPosition.row + rowChange;
    const potentialNewCol = currentTankPosition.col + colChange;

    // Check the content of the cell the tank is trying to move into.
    const contentOfTargetCell = gameGrid[potentialNewRow][potentialNewCol];
    const isTargetCellEmpty = (contentOfTargetCell === MAP_EMPTY);

    // If the target cell is empty, the tank can move.
    if (isTargetCellEmpty) {
        // First, clear the tank's old position on the grid.
        gameGrid[currentTankPosition.row][currentTankPosition.col] = MAP_EMPTY;
        
        // Then, place the tank's symbol in its new position.
        gameGrid[potentialNewRow][potentialNewCol] = vehicleDirectionSymbol;

        // Finally, update the tank's stored coordinates.
        currentTankPosition.row = potentialNewRow;
        currentTankPosition.col = potentialNewCol;
    } else {
        // If the tank cannot move (e.g., hits a wall or another object),
        // it remains in its current position. The original code would re-draw
        // the tank in its current spot, which is a redundant operation if no move occurred.
        // We explicitly do nothing here as the grid state for the tank's current cell is already correct.
    }
}

/**
 * Simulates firing a projectile from the tank in a given direction.
 * The projectile continues until it hits a wall or destroys a target.
 * @param {Array<Array<string>>} gameGrid The 2D array representing the current battlefield.
 * @param {{row: number, col: number}} currentTankPosition The current row and column of the tank.
 * @param {number} projectileRowDirection The row component of the projectile's direction vector.
 * @param {number} projectileColDirection The column component of the projectile's direction vector.
 */
function activateWeaponSystem(gameGrid, currentTankPosition, projectileRowDirection, projectileColDirection) {
    let currentProjectileDistance = 0; // Distance traveled by the projectile.
    const startingTankRow = currentTankPosition.row;
    const startingTankCol = currentTankPosition.col;

    // The projectile travels indefinitely until it impacts something.
    while (true) {
        currentProjectileDistance++; // Move one unit further.
        
        // Calculate the coordinates of the cell the projectile impacts next.
        const impactLocationRow = startingTankRow + (projectileRowDirection * currentProjectileDistance);
        const impactLocationCol = startingTankCol + (projectileColDirection * currentProjectileDistance);

        // Basic bounds check, though the map is assumed to be fully enclosed by walls.
        // This prevents errors if projectile somehow escapes the expected walled boundaries.
        if (impactLocationRow < 0 || impactLocationCol < 0 || 
            impactLocationRow >= gameGrid.length || impactLocationCol >= gameGrid[0].length) {
            // Projectile has gone out of the defined grid without hitting a wall.
            // This scenario should ideally not occur with correctly bordered maps.
            break; 
        }

        // Get the content of the cell at the impact location.
        const impactedCellContent = gameGrid[impactLocationRow][impactLocationCol];

        if (impactedCellContent === MAP_WALL) {
            // Projectile hit a wall, it stops and is destroyed.
            break;
        } else if (impactedCellContent === MAP_TARGET) {
            // Projectile hit a target. Destroy the target by replacing it with an empty space, then stop.
            gameGrid[impactLocationRow][impactLocationCol] = MAP_EMPTY;
            break;
        }
        // If it hit an empty space or the tank itself (which is skipped over), continue traveling.
    }
}

/**
 * Helper function to create a row filled with a specific character, useful for borders.
 * @param {number} rowLength The desired length of the border row.
 * @param {string} fillerChar The character to fill the row with (defaults to MAP_WALL).
 * @returns {Array<string>} An array of characters representing the border row.
 */
function generateBorderRow(rowLength, fillerChar = MAP_WALL) {
    // Ensure the length is at least 1 and is an integer.
    const effectiveLength = Math.max(1, parseInt(rowLength, 10) || 1);
    // Create an array filled with the border character.
    const borderCharactersArray = new Array(effectiveLength).fill(fillerChar);
    return borderCharactersArray;
}

// --- Main Program Execution Flow ---

// Read the entire input data from standard input as a UTF-8 string.
let rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the input string to convert external direction symbols to internal constants.
// This uses a replacer function with a regular expression to handle all symbols in one pass.
rawInputString = rawInputString.replace(/[\^v<>]/g, (matchedChar) => {
    return INPUT_TO_INTERNAL_DIRECTION_MAP[matchedChar] || matchedChar;
});

// Split the processed input into an array of lines, trimming any leading/trailing whitespace from the whole input.
let inputLinesForProcessing = rawInputString.trim().split('\n');

// The first line indicates the number of test cases. Parse it as an integer.
const numberOfTestCases = parseInt(inputLinesForProcessing.shift(), 10);

// Loop through each individual test case.
for (let currentCaseIndex = 0; currentCaseIndex < numberOfTestCases; currentCaseIndex++) {
    // Print an empty line as a separator between the output of consecutive test cases.
    // This is skipped for the very first test case's output.
    if (currentCaseIndex > 0) {
        console.log('');
    }

    // Extract map dimensions (height and width) from the next line of input.
    const mapSizeLine = inputLinesForProcessing.shift();
    const [mapHeight, mapWidth] = mapSizeLine.split(' ').map(Number); // Destructure directly after mapping.

    // Initialize the primary game grid (battlefield) for the current scenario.
    const currentBattlefieldGrid = [];

    // Add a top border row to the grid. The width is mapWidth + 2 for the left and right walls.
    currentBattlefieldGrid.push(generateBorderRow(mapWidth + 2));

    // Initialize an object to store the tank's current row and column.
    const tankCurrentCoordinates = { row: 0, col: 0 };
    // A flag to confirm if the tank was successfully located on the map.
    let isTankLocated = false;

    // Populate the game grid with the map layout from input lines.
    for (let r = 0; r < mapHeight; r++) {
        let battlefieldRowChars = inputLinesForProcessing.shift().split('');
        
        // Search for the tank within the current row.
        // We look for any character that is one of our internal direction symbols.
        const tankColumnIndexInRow = battlefieldRowChars.findIndex(char => 
            Object.values(INPUT_TO_INTERNAL_DIRECTION_MAP).includes(char)
        );

        // If the tank is found in this row, record its initial position.
        // Note: The coordinates are offset by +1 due to the border rows/columns being added.
        if (tankColumnIndexInRow !== -1) {
            tankCurrentCoordinates.row = r + 1;
            tankCurrentCoordinates.col = tankColumnIndexInRow + 1;
            isTankLocated = true;
        }

        // Add border walls to the left and right of the current map row.
        battlefieldRowChars.unshift(MAP_WALL); // Left border
        battlefieldRowChars.push(MAP_WALL);    // Right border
        currentBattlefieldGrid.push(battlefieldRowChars); // Add the bordered row to the grid.
    }

    // Add a bottom border row to the grid.
    currentBattlefieldGrid.push(generateBorderRow(mapWidth + 2));

    // Consume the empty line that separates the map data from the command sequence.
    inputLinesForProcessing.shift();

    // Parse the command sequence for the current test case.
    const operationalCommands = inputLinesForProcessing.shift().split('');

    // Process each command in the sequence one by one.
    for (const currentOperation of operationalCommands) {
        // Before executing a command, determine the tank's current facing direction.
        // This is stored as the character itself in the grid cell where the tank resides.
        const tankFacingDirection = currentBattlefieldGrid[tankCurrentCoordinates.row][tankCurrentCoordinates.col];

        // Use a switch statement for clear handling of different commands.
        switch (currentOperation) {
            case TANK_DIR_UP:
                attemptTankMovement(currentBattlefieldGrid, tankCurrentCoordinates, -1, 0);
                break;
            case TANK_DIR_DOWN:
                attemptTankMovement(currentBattlefieldGrid, tankCurrentCoordinates, 1, 0);
                break;
            case TANK_DIR_LEFT:
                attemptTankMovement(currentBattlefieldGrid, tankCurrentCoordinates, 0, -1);
                break;
            case TANK_DIR_RIGHT:
                attemptTankMovement(currentBattlefieldGrid, tankCurrentCoordinates, 0, 1);
                break;
            case 'S': // 'S' indicates a "Shoot" command.
                let projectileRowDelta = 0;
                let projectileColDelta = 0;

                // Determine the projectile's direction based on the tank's current facing.
                if (tankFacingDirection === TANK_DIR_UP) {
                    projectileRowDelta = -1;
                } else if (tankFacingDirection === TANK_DIR_DOWN) {
                    projectileRowDelta = 1;
                } else if (tankFacingDirection === TANK_DIR_LEFT) {
                    projectileColDelta = -1;
                } else if (tankFacingDirection === TANK_DIR_RIGHT) {
                    projectileColDelta = 1;
                }
                // Execute the shooting action.
                activateWeaponSystem(currentBattlefieldGrid, tankCurrentCoordinates, projectileRowDelta, projectileColDelta);
                break;
            default:
                // Log a warning for any unrecognized commands, but continue processing.
                // This adds robustness for unexpected input.
                // console.warn(`Encountered an unrecognized command: ${currentOperation}`);
                break;
        }
    }

    // --- Prepare the final output map for printing ---
    // 1. Remove the top and bottom border rows from the grid.
    const gridWithoutVerticalBorders = currentBattlefieldGrid.slice(1, -1); 
    
    // 2. For each remaining row, remove the left and right border characters.
    // 3. Join the characters of each row to form a string.
    const processedOutputRows = gridWithoutVerticalBorders.map(rowArray => {
        const rowWithoutHorizontalBorders = rowArray.slice(1, -1); // Exclude first and last characters.
        return rowWithoutHorizontalBorders.join(''); // Convert character array to a single string.
    });
    
    // 4. Join all the processed row strings with newline characters to form the final output block.
    let finalScenarioOutputString = processedOutputRows.join('\n');

    // Convert internal direction symbols back to their original external representation for the final output.
    finalScenarioOutputString = finalScenarioOutputString.replace(/[UDLR]/g, (internalChar) => {
        return INTERNAL_TO_OUTPUT_DIRECTION_MAP[internalChar] || internalChar;
    });

    // Print the final state of the battlefield for the current test case.
    console.log(finalScenarioOutputString);
}