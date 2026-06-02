function ProcessInput(dataArray) {
    // A placeholder variable, not actively used in the original logic.
    var finalOutcome;

    // Parse the total number of entries from the first element of the input array.
    const countItems = parseInt(dataArray.shift());
    // The remaining array elements contain the coordinate and direction data.
    const coordinatesAndDirections = dataArray;

    // Initialize boundary variables for different movement direction groups.
    // These are set to extreme values to ensure any actual coordinate will be smaller/larger.
    var leftMinX = Number.MAX_SAFE_INTEGER;
    var leftMaxX = Number.MIN_SAFE_INTEGER;
    var leftRightMinY = Number.MAX_SAFE_INTEGER;
    var leftRightMaxY = Number.MIN_SAFE_INTEGER;
    var rightMinX = Number.MAX_SAFE_INTEGER;
    var rightMaxX = Number.MIN_SAFE_INTEGER;
    var upDownMinX = Number.MAX_SAFE_INTEGER;
    var upDownMaxX = Number.MIN_SAFE_INTEGER;
    var upMinY = Number.MAX_SAFE_INTEGER;
    var upMaxY = Number.MIN_SAFE_INTEGER;
    var downMinY = Number.MAX_SAFE_INTEGER;
    var downMaxY = Number.MIN_SAFE_INTEGER;

    // Flags to indicate if any points for a specific direction type were encountered.
    var foundLeft = false;
    var foundRight = false;
    var foundUp = false;
    var foundDown = false;

    // Loop through each set of (x, y, direction) data points.
    for (var idx = 0; idx < countItems; idx++) {
        // Extract the x-coordinate, y-coordinate, and direction string for the current point.
        var coordX = parseInt(coordinatesAndDirections[idx * 3]);
        var coordY = parseInt(coordinatesAndDirections[idx * 3 + 1]);
        var directionStr = coordinatesAndDirections[idx * 3 + 2];

        // Use a switch statement to handle different directions.
        switch (directionStr) {
            case "L": // Points moving left
                leftMinX = Math.min(leftMinX, coordX);
                leftMaxX = Math.max(leftMaxX, coordX);
                leftRightMinY = Math.min(leftRightMinY, coordY);
                leftRightMaxY = Math.max(leftRightMaxY, coordY);
                foundLeft = true;
                break;
            case "R": // Points moving right
                rightMinX = Math.min(rightMinX, coordX);
                rightMaxX = Math.max(rightMaxX, coordX);
                leftRightMinY = Math.min(leftRightMinY, coordY);
                leftRightMaxY = Math.max(leftRightMaxY, coordY);
                foundRight = true;
                break;
            case "U": // Points moving up
                upDownMinX = Math.min(upDownMinX, coordX);
                upDownMaxX = Math.max(upDownMaxX, coordX);
                upMinY = Math.min(upMinY, coordY);
                upMaxY = Math.max(upMaxY, coordY);
                foundUp = true;
                break;
            case "D": // Points moving down
                upDownMinX = Math.min(upDownMinX, coordX);
                upDownMaxX = Math.max(upDownMaxX, coordX);
                downMinY = Math.min(downMinY, coordY);
                downMaxY = Math.max(downMaxY, coordY);
                foundDown = true;
                break;
            default:
                // No specific action for unrecognized direction strings.
                break;
        }
    }

    // Initialize the variable to store the minimum bounding box area found.
    var minArea = Number.MAX_SAFE_INTEGER;
    // A boolean flag to control the simulation loop.
    var continueIteration = true;

    // This loop simulates the movement of points and calculates the bounding box area
    // at each step until the area starts increasing or stabilizes.
    while (continueIteration) {
        // Calculate the overall minimum and maximum X coordinates across all relevant groups.
        var currentMinX = Math.min(rightMinX, leftMinX, upDownMinX);
        var currentMaxX = Math.max(rightMaxX, leftMaxX, upDownMaxX);
        // Calculate the overall minimum and maximum Y coordinates across all relevant groups.
        var currentMinY = Math.min(leftRightMinY, upMinY, downMinY);
        var currentMaxY = Math.max(leftRightMaxY, upMaxY, downMaxY);

        // Update the minimum area if the current bounding box area is smaller.
        minArea = Math.min(minArea, (currentMaxX - currentMinX) * (currentMaxY - currentMinY));

        // Determine if the simulation should continue. The loop terminates when
        // the overall bounding box boundaries are determined by points that have
        // already passed their optimal position (or if no such points exist).
        continueIteration = !(
            (currentMinX === leftMinX || !foundLeft) &&
            (currentMaxX === rightMaxX || !foundRight) &&
            (currentMinY === downMinY || !foundDown) &&
            (currentMaxY === upMaxY || !foundUp)
        );

        // Simulate one unit of movement for each group of points.
        // 'L' points move left (x-coordinates decrease).
        leftMinX--;
        leftMaxX--;
        // 'R' points move right (x-coordinates increase).
        rightMinX++;
        rightMaxX++;
        // 'U' points move up (y-coordinates increase).
        upMinY++;
        upMaxY++;
        // 'D' points move down (y-coordinates decrease).
        downMinY--;
        downMaxY--;
    }
    // Print the smallest bounding box area found during the simulation.
    console.log(minArea);
}

// The following line reads input from standard input, processes it, and calls the main function.
// It reads the entire content, trims whitespace, and splits it by newlines or spaces into an array.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
