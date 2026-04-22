const standardInputReader = require('fs');

// Helper function to check if a grid cell represents a traversable path
function isPathSegmentOpen(gridMap, rowIndex, colIndex) {
    // Ensure indices are within bounds before attempting access
    if (rowIndex < 0 || rowIndex >= gridMap.length) {
        return false;
    }
    if (colIndex < 0 || colIndex >= gridMap[rowIndex].length) {
        return false;
    }
    // Convert character '0' or '1' to number for evaluation
    return parseInt(gridMap[rowIndex][colIndex], 10) === 1;
}

// Function to process the input and start the navigation simulation
function initiatePathfinding() {
    // Read entire standard input synchronously
    let rawInputContent;
    try {
        rawInputContent = standardInputReader.readFileSync(process.stdin.fd, 'utf8');
    } catch (error) {
        console.error("Error reading standard input:", error.message);
        return; // Exit if input cannot be read
    }

    // Pre-process the raw input into a grid structure
    const gridLayout = rawInputContent.trim().split('\n');

    // Validate the grid layout
    if (!gridLayout || gridLayout.length === 0 || !gridLayout[0]) {
        console.error("Invalid or empty grid layout provided.");
        return;
    }

    // Initialize current position and direction
    let currentXPosition = 0;
    let currentYPosition = 0;
    let currentHeading = 'R'; // Initial direction is Right

    // Array to store the sequence of movements
    const traversalHistory = [];

    // Constants for directions, can be mapped to more descriptive strings
    const DIRECTION_EAST = 'R';
    const DIRECTION_WEST = 'L';
    const DIRECTION_NORTH = 'U';
    const DIRECTION_SOUTH = 'D';

    // Loop until the robot returns to the starting point (0,0)
    while (true) {
        // Calculate grid-specific row indices based on current Y-coordinate
        const gridRowForCurrentY = currentYPosition * 2;
        const gridRowForAboveY = currentYPosition * 2 - 1;
        const gridRowForBelowY = currentYPosition * 2 + 1;

        // Calculate grid-specific column indices based on current X-coordinate
        const gridColForCurrentX = currentXPosition;
        const gridColForLeftX = currentXPosition - 1;
        // Note: gridColForRightX (currentXPosition + 1) is not directly used for path checks
        // as the 'R' path check uses gridColForCurrentX.

        let movedInCurrentIteration = false; // Flag to check if a move was made

        // Define a strategy for each heading. Each strategy is an ordered list of
        // potential moves to attempt, along with the corresponding grid coordinates
        // to check for path traversability and the action to take.
        const movementStrategy = {
            [DIRECTION_WEST]: [ // If currently heading West (L)
                {
                    targetDir: DIRECTION_WEST, // Try to continue West
                    checkRow: gridRowForCurrentY,
                    checkCol: gridColForLeftX,
                    action: () => { currentXPosition--; }
                },
                {
                    targetDir: DIRECTION_NORTH, // Then try North
                    checkRow: gridRowForAboveY,
                    checkCol: gridColForCurrentX,
                    action: () => { currentYPosition--; }
                },
                {
                    targetDir: DIRECTION_SOUTH, // Then try South
                    checkRow: gridRowForBelowY,
                    checkCol: gridColForCurrentX,
                    action: () => { currentYPosition++; }
                }
            ],
            [DIRECTION_EAST]: [ // If currently heading East (R)
                {
                    targetDir: DIRECTION_EAST, // Try to continue East
                    checkRow: gridRowForCurrentY,
                    checkCol: gridColForCurrentX,
                    action: () => { currentXPosition++; }
                },
                {
                    targetDir: DIRECTION_SOUTH, // Then try South
                    checkRow: gridRowForBelowY,
                    checkCol: gridColForCurrentX,
                    action: () => { currentYPosition++; }
                },
                {
                    targetDir: DIRECTION_NORTH, // Then try North
                    checkRow: gridRowForAboveY,
                    checkCol: gridColForCurrentX,
                    action: () => { currentYPosition--; }
                }
            ],
            [DIRECTION_SOUTH]: [ // If currently heading South (D)
                {
                    targetDir: DIRECTION_SOUTH, // Try to continue South
                    checkRow: gridRowForBelowY,
                    checkCol: gridColForCurrentX,
                    action: () => { currentYPosition++; }
                },
                {
                    targetDir: DIRECTION_EAST, // Then try East
                    checkRow: gridRowForCurrentY,
                    checkCol: gridColForCurrentX,
                    action: () => { currentXPosition++; }
                },
                {
                    targetDir: DIRECTION_WEST, // Then try West
                    checkRow: gridRowForCurrentY,
                    checkCol: gridColForLeftX,
                    action: () => { currentXPosition--; }
                }
            ],
            [DIRECTION_NORTH]: [ // If currently heading North (U)
                {
                    targetDir: DIRECTION_NORTH, // Try to continue North
                    checkRow: gridRowForAboveY,
                    checkCol: gridColForCurrentX,
                    action: () => { currentYPosition--; }
                },
                {
                    targetDir: DIRECTION_WEST, // Then try West
                    checkRow: gridRowForCurrentY,
                    checkCol: gridColForLeftX,
                    action: () => { currentXPosition--; }
                },
                {
                    targetDir: DIRECTION_EAST, // Then try East
                    checkRow: gridRowForCurrentY,
                    checkCol: gridColForCurrentX,
                    action: () => { currentXPosition++; }
                }
            ]
        };

        // Get the prioritized list of moves for the current heading
        const availableMoves = movementStrategy[currentHeading];

        // Iterate through the prioritized moves
        for (const moveAttempt of availableMoves) {
            // Check if the path segment for this move is open
            if (isPathSegmentOpen(gridLayout, moveAttempt.checkRow, moveAttempt.checkCol)) {
                // If path is open, update direction and position
                currentHeading = moveAttempt.targetDir;
                moveAttempt.action();
                traversalHistory.push(currentHeading);
                movedInCurrentIteration = true;
                break; // A move was successfully made, so break from trying other options
            }
        }

        // If no move was made, it means the robot is stuck or at a dead end
        // For this specific problem, the `default` case in the original `switch`
        // implies a `return`, which would end the program.
        // If `movedInCurrentIteration` is false here, it means the robot cannot move.
        // This implies an error condition or end of path, though the problem states it returns to origin.
        // The original code does not explicitly handle "stuck" scenarios, so we assume
        // a path always exists back to the origin. If no move is possible, it would loop infinitely
        // or break if currentX/Y become 0.
        if (!movedInCurrentIteration) {
            // This case should ideally not be reached if a path to origin always exists.
            // For robustness, one could add an error message or a safety break.
            // For now, mirroring the original's implicit assumption that a path is always found.
        }

        // Check if the robot has returned to the origin (0,0)
        if (currentXPosition === 0 && currentYPosition === 0) {
            break; // Exit the loop if at origin
        }
    }

    // Output the recorded sequence of movements
    console.log(traversalHistory.join(''));
}

// Start the navigation process
initiatePathfinding();