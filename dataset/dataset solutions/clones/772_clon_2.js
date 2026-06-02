var xOffsets = { N: 0, S: 0, E: 1, W: -1 };
var yOffsets = { N: 1, S: -1, E: 0, W: 0 };

function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get an array of lines.
    rawData = rawData.split("\n");

    // Initialize a line index counter.
    var lineIndex = 0;

    // Main processing loop. Continues until a specific termination condition is met.
    while (true) {
        // Parse the number of initial points from the current line.
        var numPoints = parseInt(rawData[lineIndex++], 10);

        // If the number of points is zero, it's the termination signal.
        if (numPoints === 0) {
            break;
        }

        // Initialize a 2D array (grid) to track the presence of points.
        // The grid dimensions are fixed at 21x21 (indices 0-20).
        var gridState = [];
        for (var idx1 = 0; idx1 <= 20; idx1++) {
            gridState[idx1] = [];
            for (var idx2 = 0; idx2 <= 20; idx2++) {
                gridState[idx1][idx2] = false; // Initially, no points are present.
            }
        }

        // Read and mark the initial points on the grid.
        for (var idx1 = 0; idx1 < numPoints; idx1++) {
            // Split the current line to get X and Y coordinates.
            rawData[lineIndex] = rawData[lineIndex].split(" ");
            // Mark the point as present (true) on the grid.
            gridState[parseInt(rawData[lineIndex][0], 10)][parseInt(rawData[lineIndex++][1], 10)] = true;
        }

        // Parse the number of movement operations.
        var numMoves = parseInt(rawData[lineIndex++], 10);

        // Arrays to store movement directions and corresponding distances.
        var moveDirections = [];
        var moveDistances = [];

        // Read the movement operations.
        for (var idx1 = 0; idx1 < numMoves; idx1++) {
            // Split the current line to get direction and distance.
            rawData[lineIndex] = rawData[lineIndex].split(" ");
            moveDirections[idx1] = rawData[lineIndex][0]; // Store direction (e.g., 'N', 'S').
            moveDistances[idx1] = parseInt(rawData[lineIndex++][1], 10); // Store distance.
        }

        // Counter for the number of points collected.
        var collectedCount = 0;

        // Initial position of the "collector" on the grid.
        var currentX = 10;
        var currentY = 10;

        // Check if the starting position itself contains a point.
        if (gridState[currentX][currentY]) {
            gridState[currentX][currentY] = false; // Mark as collected.
            collectedCount++;
        }

        // Process each movement operation.
        for (var idx1 = 0; idx1 < numMoves; idx1++) {
            // For each step within the current movement operation.
            for (var loopCounterB = 0; loopCounterB < moveDistances[idx1]; loopCounterB++) {
                // Update current coordinates based on the direction.
                currentX += xOffsets[moveDirections[idx1]];
                currentY += yOffsets[moveDirections[idx1]];

                // Check if the new position contains a point.
                if (gridState[currentX][currentY]) {
                    gridState[currentX][currentY] = false; // Mark as collected.
                    collectedCount++;
                }
            }
        }

        // Determine if all initial points were collected.
        if (collectedCount === numPoints) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
