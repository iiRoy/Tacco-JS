// Constants for input/output processing and game elements
const STDIN_SOURCE_PATH = '/dev/stdin';
const EMPTY_SPACE_CHAR = '.';
const SOLID_WALL_CHAR = '#';
const BREAKABLE_BLOCK_CHAR = '*';

// Mappings for converting input characters to internal representation
const INPUT_DIRECTION_MAP = {
    '^': 'U',
    'v': 'D',
    '<': 'L',
    '>': 'R'
};

// Mappings for converting internal representation back to output characters
const OUTPUT_DIRECTION_MAP = {
    'U': '^',
    'D': 'v',
    'L': '<',
    'R': '>'
};

// Delta values for movement directions: [row_delta, col_delta]
const DIRECTION_DELTAS = {
    'U': [-1, 0],
    'D': [1, 0],
    'L': [0, -1],
    'R': [0, 1]
};

// Global variables to hold game state (accessed by helper functions)
let battleGrid = [];       // The 2D array representing the game map
let vehiclePosition = [0, 0]; // Tank's current [row, col] coordinates

/**
 * Simulates a projectile being fired from the tank's current location.
 * The projectile travels in a straight line until it hits a solid wall or a breakable block.
 * If it hits a breakable block, the block is destroyed (replaced with an empty space).
 * @param {number} rowStep - The change in row for each projectile step (-1 for Up, 1 for Down).
 * @param {number} colStep - The change in column for each projectile step (-1 for Left, 1 for Right).
 */
function initiateProjectileFire(rowStep, colStep) {
    // Start tracking the projectile's path from one step away from the tank
    for (let currentDistance = 1; ; currentDistance++) {
        const impactRow = vehiclePosition[0] + (rowStep * currentDistance);
        const impactCol = vehiclePosition[1] + (colStep * currentDistance);

        // Retrieve the character at the potential impact point
        const cellTypeAtImpact = battleGrid[impactRow][impactCol];

        // Check what the projectile has hit
        if (cellTypeAtImpact === SOLID_WALL_CHAR) {
            // Projectile hit a solid barrier, it stops here.
            break;
        } else if (cellTypeAtImpact === BREAKABLE_BLOCK_CHAR) {
            // Projectile hit a breakable block, destroy it and stop.
            battleGrid[impactRow][impactCol] = EMPTY_SPACE_CHAR;
            break;
        }
        // If it hit an empty space, the projectile continues its trajectory.
    }
}

/**
 * Executes a tank movement or rotation command.
 * Updates the tank's position on the grid if the move is valid (to an empty space).
 * Always updates the tank's orientation on the grid.
 * @param {string} desiredDirection - The direction character (U, D, L, R) for the tank's action.
 */
function performTankAction(desiredDirection) {
    const [rowDelta, colDelta] = DIRECTION_DELTAS[desiredDirection];

    // Calculate the potential new coordinates for the tank
    const potentialNewRow = vehiclePosition[0] + rowDelta;
    const potentialNewCol = vehiclePosition[1] + colDelta;

    // Check if the target cell is empty, allowing for movement
    if (battleGrid[potentialNewRow][potentialNewCol] === EMPTY_SPACE_CHAR) {
        // Tank moves to the new position
        battleGrid[potentialNewRow][potentialNewCol] = desiredDirection; // Place tank in new cell
        battleGrid[vehiclePosition[0]][vehiclePosition[1]] = EMPTY_SPACE_CHAR; // Clear old cell
        vehiclePosition[0] = potentialNewRow; // Update tank's row coordinate
        vehiclePosition[1] = potentialNewCol; // Update tank's column coordinate
    } else {
        // Tank cannot move (blocked), but it still changes its orientation
        battleGrid[vehiclePosition[0]][vehiclePosition[1]] = desiredDirection;
    }
}

// Main program execution starts here
try {
    // Read all raw input data from stdin
    const rawInputData = require('fs').readFileSync(STDIN_SOURCE_PATH, 'utf8');

    // Pre-process the input string: convert caret/vee/angle brackets to UDLR
    let processedInput = rawInputData;
    for (const key in INPUT_DIRECTION_MAP) {
        processedInput = processedInput.replace(new RegExp(key, 'g'), INPUT_DIRECTION_MAP[key]);
    }

    // Split the processed input into individual lines
    const inputLines = processedInput.trim().split('\n');

    // Extract the total number of test scenarios
    let numberOfTestScenarios = parseInt(inputLines.shift(), 10);

    // Iterate through each test scenario
    for (let scenarioIndex = 0; scenarioIndex < numberOfTestScenarios; scenarioIndex++) {
        // Print an empty line to separate output of multiple scenarios
        if (scenarioIndex > 0) {
            console.log('');
        }

        // Parse map dimensions (height and width) for the current scenario
        const mapDimensions = inputLines.shift().split(' ').map(s => parseInt(s, 10));
        const mapHeight = mapDimensions[0];
        const mapWidth = mapDimensions[1];

        // Initialize the battle grid with outer wall borders
        battleGrid = [];
        const horizontalBorder = Array(mapWidth + 2).fill(SOLID_WALL_CHAR).join(''); // +2 for side walls
        battleGrid.push(horizontalBorder.split('')); // Top border

        // Reset tank's initial position for this scenario
        vehiclePosition = [0, 0];

        // Populate the battle grid with map data and locate the tank
        for (let gridRowIndex = 0; gridRowIndex < mapHeight; gridRowIndex++) {
            const currentMapRowChars = inputLines.shift().split('');
            let initialTankCol = -1; // Temporary variable to find tank's column

            // Search for the tank within the current row
            for (let charIndex = 0; charIndex < currentMapRowChars.length; charIndex++) {
                const cellCharacter = currentMapRowChars[charIndex];
                if (DIRECTION_DELTAS.hasOwnProperty(cellCharacter)) { // If it's a direction char (U,D,L,R)
                    initialTankCol = charIndex;
                    // Store tank's actual grid coordinates (accounting for added borders)
                    vehiclePosition[0] = gridRowIndex + 1; // +1 for top border
                    vehiclePosition[1] = charIndex + 1;   // +1 for left border
                }
            }

            // Add side walls to the current map row and then add it to the battle grid
            currentMapRowChars.unshift(SOLID_WALL_CHAR); // Left border
            currentMapRowChars.push(SOLID_WALL_CHAR);    // Right border
            battleGrid.push(currentMapRowChars);
        }

        // Add the bottom border to the battle grid
        battleGrid.push(horizontalBorder.split(''));

        // Consume the empty line that separates map data from command sequence
        inputLines.shift();

        // Get the sequence of commands for the current scenario
        const commandStream = inputLines.shift().split('');

        // Process each command in the sequence
        for (const currentCommand of commandStream) {
            switch (currentCommand) {
                case 'U': // Move Up
                case 'D': // Move Down
                case 'L': // Move Left
                case 'R': // Move Right
                    performTankAction(currentCommand);
                    break;
                case 'S': // Shoot
                    const currentTankDirection = battleGrid[vehiclePosition[0]][vehiclePosition[1]];
                    const [shotRowDelta, shotColDelta] = DIRECTION_DELTAS[currentTankDirection];
                    initiateProjectileFire(shotRowDelta, shotColDelta);
                    break;
                default:
                    // Optionally, log unknown commands for debugging or ignore them
                    // console.warn(`Unknown command encountered: ${currentCommand}`);
                    break;
            }
        }

        // Prepare the final battle grid for output
        const finalOutputGrid = [];
        // Iterate through the grid, skipping the outer border rows
        for (let r = 1; r < battleGrid.length - 1; r++) {
            const rowWithoutBorders = [];
            // Iterate through the row, skipping the outer border columns
            for (let c = 1; c < battleGrid[r].length - 1; c++) {
                const charToOutput = battleGrid[r][c];
                // Convert internal direction chars back to original output format
                rowWithoutBorders.push(OUTPUT_DIRECTION_MAP[charToOutput] || charToOutput);
            }
            finalOutputGrid.push(rowWithoutBorders.join('')); // Join characters to form a string row
        }

        // Print the final state of the battle grid for the current scenario
        console.log(finalOutputGrid.join('\n'));
    }
} catch (error) {
    // Basic error handling for file reading or parsing issues
    console.error("An error occurred during processing:", error.message);
}