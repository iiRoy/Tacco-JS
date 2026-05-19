/*
 * This function, if uncommented, would implement a Breadth-First Search (BFS)
 * algorithm to find the minimum number of moves to reach a target strength
 * within a grid. It navigates through a grid, collecting strength-up items.
 *
 * @param {number} startXCoord - The initial X-coordinate for the search.
 * @param {number} startYCoord - The initial Y-coordinate for the search.
 * @returns {number} The minimum number of moves required, or -1 if no path is found.
 */
/*
function PathFinder(startXCoord, startYCoord) {
    // Mark the starting position in the grid as visited (represented by '.')
    gridMap[startYCoord][startXCoord] = ".";

    // Define arrays for movement offsets in X and Y directions (Up, Left, Right, Down)
    const deltaX = [0, -1, 1, 0];
    const deltaY = [-1, 0, 0, 1];

    // Initialize a counter for the number of moves
    let moveCount = 0;

    // Initialize the BFS queue. Each element is a state:
    // [current_x, current_y, current_moves, current_strength, current_grid_state]
    const searchQueue = [[startXCoord, startYCoord, moveCount, 1, gridMap]];

    // An object to store visited states to prevent redundant computations and cycles.
    // The key for a state is a string combining coordinates and the flattened grid state.
    const visitedStates = {};
    visitedStates[startXCoord + " " + startYCoord + " " + gridMap.join("")] = true;

    // Begin the Breadth-First Search traversal
    while (true) {
        // If the queue is empty, it means no path was found to the target strength
        if (searchQueue.length === 0) {
            moveCount = -1; // Indicate that no solution was found
            break;
        }

        // Dequeue the first element from the queue, representing the current state
        const currentPathNode = searchQueue.shift();

        // Extract components from the current state
        const currentX = currentPathNode[0];
        const currentY = currentPathNode[1];
        const currentMoves = currentPathNode[2];
        const currentStrength = currentPathNode[3];
        const currentGridState = currentPathNode[4];

        // Check if the current strength has reached the required initialPower + 1
        if (currentStrength === initialPower + 1) {
            moveCount = currentMoves; // The target strength is achieved, store the move count
            break;
        }

        // Iterate through all four possible directions (Up, Left, Right, Down)
        for (let idx = 0; idx < 4; idx++) {
            const nextX = currentX + deltaX[idx];
            const nextY = currentY + deltaY[idx];
            let nextStrength = currentStrength; // Initialize next strength with current strength

            // Check if the next coordinates are within the grid boundaries
            if (nextX < 0 || nextY < 0 || nextX >= dimensionsAndPower[0] || nextY >= dimensionsAndPower[1]) {
                continue; // If out of bounds, skip this direction
            }

            // Check if the next cell is an obstacle ('X')
            if (currentGridState[nextY][nextX] === "X") {
                continue; // Cannot move through an obstacle, skip this direction
            }

            // Create a deep copy of the current grid state for the next step.
            // This is crucial because the grid state can change (items collected).
            const gridCopy = currentGridState.map(function (rowVal) {
                return rowVal.slice();
            });

            // Check if the next cell contains a strength-up item matching the current strength
            if (gridCopy[nextY][nextX] === "" + nextStrength) {
                nextStrength++; // Increment strength if an item is collected
                gridCopy[nextY][nextX] = "."; // Mark the collected item's cell as empty ('.')
            }

            // Construct a unique string key for the new state to check against visited states
            const stateKey = nextX + " " + nextY + " " + gridCopy.join("");

            // If this new state has already been visited, skip it to avoid cycles and redundant work
            if (visitedStates.hasOwnProperty(stateKey)) {
                continue;
            }

            // Mark the new state as visited
            visitedStates[stateKey] = true;

            // Enqueue the new state into the search queue
            searchQueue.push([nextX, nextY, currentMoves + 1, nextStrength, gridCopy]);
        }
    }
    return moveCount; // Return the final move count
}
*/

// Utilize Node.js file system module to read input
const fileSystem = require('fs');

// Read all input from standard input, remove leading/trailing whitespace, and split by newlines
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineData = (rawData.trim()).split("\n");

// Extract dimensions (width, height) and initial power from the first line of input
const dimensionsAndPower = (lineData.shift()).split(" ").map(Number);
const initialPower = dimensionsAndPower[2]; // The third value is the power level

// Initialize the grid map and an array to store the starting position
const gridMap = [];
const startPosition = [];

// Iterate through the remaining lines to populate the grid and find the 'S' (start) position
for (let idx = 0; idx < dimensionsAndPower[1]; idx++) {
    const rowChars = (lineData.shift()).split(""); // Split the current line into an array of characters
    // Check if the 'S' character is present in the current row
    if (rowChars.indexOf("S") !== -1) {
        startPosition[0] = rowChars.indexOf("S"); // Store the X-coordinate of 'S'
        startPosition[1] = idx; // Store the Y-coordinate of 'S'
    }
    gridMap.push(rowChars); // Add the processed row to the grid map
}

// Initialize a variable to store the final computed result.
// In this specific code snippet, the PathFinder function is commented out,
// so this variable will retain its initial value.
let finalResult = 0;

// Output the final result to the console.
// Since the PathFinder function is commented, 'finalResult' will be '0'.
console.log(finalResult);
