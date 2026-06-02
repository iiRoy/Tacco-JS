var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = rawInputData.trim().split("\n");

function parseGridDimensions(dimensionString) {
    return dimensionString.split(" ").map(Number);
}

function ensureWithinBounds(value, minimum, maximum) {
    return Math.max(minimum, Math.min(value, maximum));
}

function calculateNewPosition(currentX, currentY, directionIndex, steps, isForwardMovement) {
    // Define movement vectors for each direction: [deltaX, deltaY]
    // Assuming 0=North (y+), 1=East (x+), 2=South (y-), 3=West (x-)
    const movementVectors = [
        [0, 1],  // North: y increases
        [1, 0],  // East: x increases
        [0, -1], // South: y decreases
        [-1, 0]  // West: x decreases
    ];

    let deltaX = movementVectors[directionIndex][0];
    let deltaY = movementVectors[directionIndex][1];

    if (!isForwardMovement) { // If moving backward, reverse the deltas
        deltaX = -deltaX;
        deltaY = -deltaY;
    }

    currentX += deltaX * steps;
    currentY += deltaY * steps;

    return [currentX, currentY];
}

while (true) {
    var dimensionString = inputLines.shift();
    if (dimensionString === "0 0") {
        break;
    }

    const [gridWidth, gridHeight] = parseGridDimensions(dimensionString);

    // robotPositionAndDirection: [directionIndex, xCoordinate, yCoordinate]
    // Initial state: direction 0 (North), x=1, y=1
    let robotPositionAndDirection = [0, 1, 1];
    const MIN_COORDINATE_VALUE = 1; // Coordinates start from 1

    while (true) {
        const commandLine = inputLines.shift();
        const commandTokens = commandLine.split(" ");
        const commandType = commandTokens[0];

        if (commandType === "STOP") {
            break;
        }

        let currentDirectionIndex = robotPositionAndDirection[0];
        let robotXCoordinate = robotPositionAndDirection[1];
        let robotYCoordinate = robotPositionAndDirection[2];

        switch (commandType) {
            case "RIGHT":
                // Increment direction index, wrap around 4 (0-3)
                currentDirectionIndex = (currentDirectionIndex + 1) % 4;
                break;
            case "LEFT":
                // Decrement direction index, wrap around 4 (0-3). Add 4 to handle negative modulo result.
                currentDirectionIndex = (currentDirectionIndex - 1 + 4) % 4;
                break;
            case "FORWARD":
            case "BACKWARD":
                const stepsToMove = Number(commandTokens[1]); // Convert string to number
                const isForward = (commandType === "FORWARD");
                
                // Calculate new position based on current state and command
                const [newX, newY] = calculateNewPosition(
                    robotXCoordinate,
                    robotYCoordinate,
                    currentDirectionIndex,
                    stepsToMove,
                    isForward
                );
                robotXCoordinate = newX;
                robotYCoordinate = newY;
                break;
            // No default case needed as per problem description, only these commands exist.
        }

        // Update robot state with potentially new direction and position
        robotPositionAndDirection[0] = currentDirectionIndex;
        robotPositionAndDirection[1] = robotXCoordinate;
        robotPositionAndDirection[2] = robotYCoordinate;

        // Clamp coordinates within grid boundaries
        robotPositionAndDirection[1] = ensureWithinBounds(robotPositionAndDirection[1], MIN_COORDINATE_VALUE, gridWidth);
        robotPositionAndDirection[2] = ensureWithinBounds(robotPositionAndDirection[2], MIN_COORDINATE_VALUE, gridHeight);
    }

    // Remove direction index before printing, as per original behavior
    robotPositionAndDirection.shift();
    console.log(robotPositionAndDirection.join(" "));
}
