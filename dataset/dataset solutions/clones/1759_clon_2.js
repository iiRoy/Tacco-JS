function ProcessInput (rawData) {
    // Split the raw input string by newline characters to get an array of lines.
    rawData = rawData.split("\n");

    // Parse the first line of input as an integer for the rotation angle.
    // Note: This value is immediately overwritten below, but the original logic is preserved.
    var rotationAngle = parseInt(rawData[0], 10);

    // The actual rotation angle used in the simulation is fixed at 90 degrees.
    rotationAngle = 90;

    // Initialize current X and Y coordinates.
    var currentX = 0;
    var currentY = 0;

    // An object to store coordinates, though not directly used for movement in the loop.
    var currentPosition = {x: 0, y: 0};

    // Initialize the starting direction (e.g., 90 degrees for North).
    var facingDirection = 90;

    // Initialize a counter for the number of steps taken.
    var stepCounter = 0;

    // Begin an infinite loop to simulate movement until the origin is reached.
    while (true) {
        // Increment the step counter for each iteration.
        stepCounter++;

        // Move one unit in the current facing direction.
        switch (facingDirection) {
            case 90: // North
                currentY += 1;
                break;

            case 180: // East
                currentX += 1;
                break;

            case 270: // South
                currentY -= 1;
                break;

            case 360: // West
                currentX -= 1;
                // No break needed here as it's the last case.
        }

        // Change the facing direction by adding the rotation angle.
        facingDirection += rotationAngle;

        // Check if the current coordinates have returned to the origin (0,0).
        if (currentX === 0 && currentY === 0) {
            // If at origin, exit the loop.
            break;
        }
    }

    // Output the total number of steps taken to return to the origin.
    console.log(stepCounter);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
