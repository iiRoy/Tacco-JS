const fileSystem = require('fs');

/**
 * Represents the game map and player's tank.
 * These are effectively module-scoped variables, mimicking the original's global-like usage.
 * They are re-initialized for each test case.
 */
let gameBoardGrid = []; // The 2D array representing the game map.
let playerTankCoordinates = [0, 0]; // [row, column] of the tank's current position.

/**
 * Helper function to safely read and parse input data from stdin.
 * It handles potential file reading errors and cleans up the input lines.
 * @returns {string[]} An array of strings, where each string is a non-empty line from the input.
 */
function acquireInputLines() {
    try {
        const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
        // Split input by newline characters, considering both Unix (\n) and Windows (\r\n) formats.
        // Filter out any empty lines that might result from extra newlines at the end of the file.
        return rawInputData.split(/\r?\n/).filter(line => line.length > 0);
    } catch (errorReadingInput) {
        // Log an error message if input file cannot be read.
        console.error("Critical: Failed to read input data from /dev/stdin.", errorReadingInput.message);
        // Return an empty array to signal failure, allowing the main program to exit gracefully.
        return [];
    }
}

/**
 * Attempts to move the player's tank to a new location on the map.
 * This function also updates the tank's visual orientation character on the map.
 * @param {number} rowMovementDelta - The change in the row index (e.g., -1 for up, 1 for down).
 * @param {number} colMovementDelta - The change in the column index (e.g., -1 for left, 1 for right).
 * @param {string} newTankOrientationChar - The character representing the tank's new direction (e.g., '^', 'v', '<', '>').
 * @returns {boolean} True if the tank successfully moved to an empty cell, false if movement was blocked or only orientation changed.
 */
function relocateTank(rowMovementDelta, colMovementDelta, newTankOrientationChar) {
    // Determine the potential new coordinates for the tank.
    const destinationRow = playerTankCoordinates[0] + rowMovementDelta;
    const destinationCol = playerTankCoordinates[1] + colMovementDelta;

    // First, update the tank's orientation at its current position, regardless of movement success.
    gameBoardGrid[playerTankCoordinates[0]][playerTankCoordinates[1]] = newTankOrientationChar;

    // Check if the destination cell is within the valid bounds of the game board.
    // (This check is somewhat redundant due to boundary walls, but adds explicit safety.)
    if (destinationRow < 0 || destinationRow >= gameBoardGrid.length ||
        destinationCol < 0 || destinationCol >= gameBoardGrid[0].length) {
        // If the calculated destination is out of bounds, the tank cannot move.
        return false;
    }

    // Retrieve the content of the target cell.
    const targetCellContent = gameBoardGrid[destinationRow][destinationCol];

    // If the target cell is empty ('.'), the tank can move there.
    if (targetCellContent === '.') {
        // Place the tank's new orientation character at the destination.
        gameBoardGrid[destinationRow][destinationCol] = newTankOrientationChar;
        // Clear the tank's previous position by setting it to an empty cell.
        gameBoardGrid[playerTankCoordinates[0]][playerTankCoordinates[1]] = '.';
        // Update the internal tracker for the tank's coordinates.
        playerTankCoordinates[0] = destinationRow;
        playerTankCoordinates[1] = destinationCol;
        return true; // Movement was successful.
    } else {
        // If the target cell is not empty (e.g., '#', '*'), the tank cannot move.
        // Its orientation has already been updated.
        return false; // Movement was blocked.
    }
}

/**
 * Simulates the tank firing a projectile in a given direction.
 * The projectile travels one unit at a time until it hits a wall ('#') or a brick ('*').
 * Brick walls ('*') are destroyed (turned into '.'). Steel walls ('#') stop the projectile.
 * @param {number} projectileRowDirection - The row component of the projectile's trajectory vector.
 * @param {number} projectileColDirection - The column component of the projectile's trajectory vector.
 */
function fireProjectile(projectileRowDirection, projectileColDirection) {
    // The projectile starts one unit away from the tank.
    // We use a loop with a maximum distance to prevent potential infinite loops on malformed maps.
    const maxProjectileRange = 100; // A reasonable upper bound for map sizes.

    for (let currentDistance = 1; currentDistance <= maxProjectileRange; currentDistance++) {
        // Calculate the coordinates of the cell the projectile would hit at this distance.
        const impactRow = playerTankCoordinates[0] + (projectileRowDirection * currentDistance);
        const impactCol = playerTankCoordinates[1] + (projectileColDirection * currentDistance);

        // Basic bounds check: if projectile goes beyond the known map dimensions, it's effectively stopped.
        if (impactRow < 0 || impactRow >= gameBoardGrid.length ||
            impactCol < 0 || impactCol >= gameBoardGrid[0].length) {
            break; // Projectile exited map boundaries.
        }

        const encounteredTerrain = gameBoardGrid[impactRow][impactCol];

        // Evaluate the type of terrain encountered.
        if (encounteredTerrain === '#') {
            // Projectile hit a steel wall, it stops here.
            break;
        } else if (encounteredTerrain === '*') {
            // Projectile hit a brick wall; destroy it and then stop.
            gameBoardGrid[impactRow][impactCol] = '.'; // Change brick to empty space.
            break; // Projectile stops after destroying the brick.
        }
        // If encounteredTerrain is '.', the projectile continues its path.
    }
    // No explicit return value is needed as this function modifies the global gameBoardGrid directly.
}

// --- Main Program Execution Flow ---

// 1. Acquire and prepare input lines from stdin.
let allInputLines = acquireInputLines();

// Exit if there was an issue reading input.
if (allInputLines.length === 0) {
    process.exit(1);
}

// 2. Parse the total number of test cases from the first line of input.
const totalTestCases = parseInt(allInputLines.shift(), 10);

// 3. Process each test case sequentially.
for (let currentCaseIndex = 0; currentCaseIndex < totalTestCases; currentCaseIndex++) {
    // Output an empty line as a separator between test case results, except before the very first one.
    if (currentCaseIndex > 0) {
        console.log("");
    }

    // 4. Read map dimensions (height and width) for the current test case.
    const mapDimensions = allInputLines.shift().split(" ").map(Number);
    const mapHeight = mapDimensions[0];
    const mapWidth = mapDimensions[1];

    // 5. Initialize the game board for the current test case.
    gameBoardGrid = [];

    // Create a dynamic boundary row for the top and bottom of the map.
    // The map is padded with '#' on all four sides, so width + 2 for boundaries.
    const horizontalBoundaryRow = Array(mapWidth + 2).fill('#');
    gameBoardGrid.push(horizontalBoundaryRow); // Add the top boundary row.

    // 6. Read and process each actual row of the game map.
    for (let rowIndex = 0; rowIndex < mapHeight; rowIndex++) {
        let currentRowCharacters = allInputLines.shift().split("");
        let tankFoundInRow = false; // Flag to optimize tank finding.

        // Iterate through characters to find the tank's initial position.
        for (let charColumnIndex = 0; charColumnIndex < currentRowCharacters.length; charColumnIndex++) {
            const currentChar = currentRowCharacters[charColumnIndex];
            if (currentChar === "^" || currentChar === "v" || currentChar === "<" || currentChar === ">") {
                // Adjust coordinates for the added boundary rows/columns.
                playerTankCoordinates = [rowIndex + 1, charColumnIndex + 1];
                tankFoundInRow = true;
                break; // Tank found, no need to scan further in this row.
            }
        }

        // Add the left and right boundary '#' characters to the current map row.
        currentRowCharacters.unshift("#"); // Prepend left boundary.
        currentRowCharacters.push("#");    // Append right boundary.
        gameBoardGrid.push(currentRowCharacters); // Add the processed row to the game board.
    }

    gameBoardGrid.push(horizontalBoundaryRow); // Add the bottom boundary row.

    // 7. Consume the empty line that separates the map data from the command sequence.
    allInputLines.shift();

    // 8. Read the sequence of commands for the tank.
    const commandSequence = allInputLines.shift().split("");

    // 9. Process each command in the sequence.
    for (const singleCommand of commandSequence) {
        // Utilize a switch statement for clear and efficient command dispatching.
        switch (singleCommand) {
            case "U": // Move Up command
                relocateTank(-1, 0, "^");
                break;
            case "D": // Move Down command
                relocateTank(1, 0, "v");
                break;
            case "L": // Move Left command
                relocateTank(0, -1, "<");
                break;
            case "R": // Move Right command
                relocateTank(0, 1, ">");
                break;
            case "S": // Shoot command
                // First, determine the tank's current orientation to know the firing direction.
                const currentTankOrientation = gameBoardGrid[playerTankCoordinates[0]][playerTankCoordinates[1]];
                // Use another switch statement to handle different firing directions.
                switch (currentTankOrientation) {
                    case "^": fireProjectile(-1, 0); break; // Fire Up
                    case "v": fireProjectile(1, 0); break;  // Fire Down
                    case "<": fireProjectile(0, -1); break; // Fire Left
                    case ">": fireProjectile(0, 1); break;  // Fire Right
                    default:
                        // This case indicates an unexpected or invalid tank orientation character.
                        // It's a defensive programming measure.
                        console.warn(`[Debug Warning] Tank in an unknown orientation '${currentTankOrientation}' at [${playerTankCoordinates[0]},${playerTankCoordinates[1]}] during shot command.`);
                        break;
                }
                break;
            default:
                // Log a warning for any unrecognized commands encountered in the input.
                console.warn(`[Debug Warning] Encountered an unknown command: '${singleCommand}'. It will be ignored.`);
                break;
        }
    }

    // 10. Prepare the final game map for output.
    // First, extract only the inner map rows, discarding the temporary top and bottom boundary rows.
    // Using slice creates a new array without modifying the original gameBoardGrid.
    const actualMapRows = gameBoardGrid.slice(1, gameBoardGrid.length - 1);

    // Then, format each row: remove the side boundary characters and join into a single string.
    // Finally, join all formatted rows with newline characters to create the final output string.
    const formattedOutputMap = actualMapRows.map(rowArray => {
        // For each row array, remove the first and last element (the '#' boundaries)
        // using slice, then join the remaining characters into a string.
        return rowArray.slice(1, rowArray.length - 1).join('');
    }).join("\n");

    // 11. Output the resulting map for the current test case.
    console.log(formattedOutputMap);
}