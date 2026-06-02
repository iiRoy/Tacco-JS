function ProcessInput(rawData) {
    // First, we process the raw input string.
    // It's trimmed, split by newlines, and then each line is split by spaces.
    rawData = rawData.trim().split("\n").map(function(lineSegment) {
        return lineSegment.split(" ");
    });

    // Extract numerical values from the processed input.
    // The initial position is parsed from the first element of the first line.
    let initialPosition = parseInt(rawData[0][0], 10);
    // The maximum number of steps allowed is parsed from the second element.
    let maxSteps = parseInt(rawData[0][1], 10);
    // The distance covered per step is parsed from the third element.
    let stepDistance = parseInt(rawData[0][2], 10);
    
    // Calculate how many steps can be taken towards the origin without overshooting.
    // We use the absolute value of the initial position to handle negative starting points.
    let stepsTowardsOrigin = Math.floor(Math.abs(initialPosition) / stepDistance);
    
    // This variable will hold the final calculated minimum distance.
    let finalResult;

    // Determine the final position based on the number of steps.
    // If the available steps are less than or equal to the steps needed to reach or pass the origin.
    if (maxSteps <= stepsTowardsOrigin) {
        // The final position is simply the absolute initial position minus the total distance covered.
        finalResult = Math.abs(initialPosition) - stepDistance * maxSteps;
    } else {
        // If we have more steps than needed to reach or pass the origin.
        // Check if the remaining steps (after reaching/passing origin) are even or odd.
        if ((maxSteps - stepsTowardsOrigin) % 2 === 0) {
            // If the remaining steps are even, we end up at the same side of the origin
            // as if we had only taken 'stepsTowardsOrigin' steps.
            finalResult = Math.abs(initialPosition) - stepDistance * stepsTowardsOrigin;
        } else {
            // If the remaining steps are odd, we end up on the opposite side of the origin
            // compared to taking 'stepsTowardsOrigin' steps.
            // First, calculate the position after 'stepsTowardsOrigin' steps.
            finalResult = Math.abs(initialPosition) - stepDistance * stepsTowardsOrigin;
            // Then, take one more step in the opposite direction from the origin.
            // The distance from origin will be 'stepDistance' minus the current 'finalResult'.
            finalResult = stepDistance - finalResult;
        }
    }

    // Output the computed minimum distance to the console.
    console.log(finalResult);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
