// Entry point function to process coordinate data and find the smallest bounding area.
function ProcessCoordinates(inputSequence) {
    // Ensure the input is an array, as it's expected to be split data.
    if (!Array.isArray(inputSequence)) {
        console.error("Error: Input data must be an array.");
        return;
    }

    // Extract the total number of coordinate sets from the beginning of the input.
    const numberOfCoordinates = parseInt(inputSequence.shift(), 10);

    // Guard clause: If no coordinates are provided, the area is zero.
    if (isNaN(numberOfCoordinates) || numberOfCoordinates <= 0) {
        console.log(0);
        return;
    }

    // Initialize boundary values for different categories of moving points.
    // These variables track the extent of points moving in specific directions.
    let leftMoversMinX = Number.MAX_SAFE_INTEGER;
    let leftMoversMaxX = Number.MIN_SAFE_INTEGER;
    let rightMoversMinX = Number.MAX_SAFE_INTEGER;
    let rightMoversMaxX = Number.MIN_SAFE_INTEGER;

    let upDownMoversMinX = Number.MAX_SAFE_INTEGER; // X-range for points moving Up or Down
    let upDownMoversMaxX = Number.MIN_SAFE_INTEGER;

    let leftRightMoversMinY = Number.MAX_SAFE_INTEGER; // Y-range for points moving Left or Right
    let leftRightMoversMaxY = Number.MIN_SAFE_INTEGER;

    let upMoversMinY = Number.MAX_SAFE_INTEGER;
    let upMoversMaxY = Number.MIN_SAFE_INTEGER;
    let downMoversMinY = Number.MAX_SAFE_INTEGER;
    let downMoversMaxY = Number.MIN_SAFE_INTEGER;

    // Flags to indicate if points of a particular movement type were present in the input.
    let hasLeftMovingPoints = false;
    let hasRightMovingPoints = false;
    let hasUpMovingPoints = false;
    let hasDownMovingPoints = false;

    // Helper function to update min/max bounds.
    const updateMinMaxBounds = (currentMin, currentMax, newValue) => {
        return {
            min: Math.min(currentMin, newValue),
            max: Math.max(currentMax, newValue)
        };
    };

    // Process each set of coordinates from the input data.
    for (let pointIndex = 0; pointIndex < numberOfCoordinates; pointIndex++) {
        // Parse the X, Y coordinates and the movement direction.
        const currentPointX = parseInt(inputSequence[pointIndex * 3], 10);
        const currentPointY = parseInt(inputSequence[pointIndex * 3 + 1], 10);
        const pointDirection = inputSequence[pointIndex * 3 + 2];

        // Apply updates based on the point's movement direction.
        if (pointDirection === "L") {
            const xBounds = updateMinMaxBounds(leftMoversMinX, leftMoversMaxX, currentPointX);
            leftMoversMinX = xBounds.min;
            leftMoversMaxX = xBounds.max;

            const yBoundsLR = updateMinMaxBounds(leftRightMoversMinY, leftRightMoversMaxY, currentPointY);
            leftRightMoversMinY = yBoundsLR.min;
            leftRightMoversMaxY = yBoundsLR.max;

            hasLeftMovingPoints = true;
        } else if (pointDirection === "R") {
            const xBounds = updateMinMaxBounds(rightMoversMinX, rightMoversMaxX, currentPointX);
            rightMoversMinX = xBounds.min;
            rightMoversMaxX = xBounds.max;

            const yBoundsLR = updateMinMaxBounds(leftRightMoversMinY, leftRightMoversMaxY, currentPointY);
            leftRightMoversMinY = yBoundsLR.min;
            leftRightMoversMaxY = yBoundsLR.max;

            hasRightMovingPoints = true;
        } else if (pointDirection === "U") {
            const xBoundsUD = updateMinMaxBounds(upDownMoversMinX, upDownMoversMaxX, currentPointX);
            upDownMoversMinX = xBoundsUD.min;
            upDownMoversMaxX = xBoundsUD.max;

            const yBounds = updateMinMaxBounds(upMoversMinY, upMoversMaxY, currentPointY);
            upMoversMinY = yBounds.min;
            upMoversMaxY = yBounds.max;

            hasUpMovingPoints = true;
        } else if (pointDirection === "D") {
            const xBoundsUD = updateMinMaxBounds(upDownMoversMinX, upDownMoversMaxX, currentPointX);
            upDownMoversMinX = xBoundsUD.min;
            upDownMoversMaxX = xBoundsUD.max;

            const yBounds = updateMinMaxBounds(downMoversMinY, downMoversMaxY, currentPointY);
            downMoversMinY = yBounds.min;
            downMoversMaxY = yBounds.max;

            hasDownMovingPoints = true;
        }
        // Unrecognized directions are ignored.
    }

    // Variable to store the smallest area encountered during simulation.
    let minimumEnclosingArea = Number.MAX_SAFE_INTEGER;
    let simulationTick = 0; // Tracks the number of simulation steps.
    const movementIncrement = 0.5; // The amount by which coordinates change per tick.
    const maximumSimulationTicks = 40000; // Safety limit to prevent infinite loops.

    // Main simulation loop: continues until the overall bounding box stops expanding
    // or a maximum number of iterations is reached.
    while (simulationTick < maximumSimulationTicks) {
        // Aggregate all relevant minimum X-coordinates to find the overall minimum X.
        const allPossibleMinX = [];
        if (hasLeftMovingPoints) allPossibleMinX.push(leftMoversMinX);
        if (hasRightMovingPoints) allPossibleMinX.push(rightMoversMinX);
        if (hasUpMovingPoints || hasDownMovingPoints) allPossibleMinX.push(upDownMoversMinX);
        const currentOverallMinX = allPossibleMinX.length > 0 ? Math.min(...allPossibleMinX) : 0;

        // Aggregate all relevant maximum X-coordinates to find the overall maximum X.
        const allPossibleMaxX = [];
        if (hasLeftMovingPoints) allPossibleMaxX.push(leftMoversMaxX);
        if (hasRightMovingPoints) allPossibleMaxX.push(rightMoversMaxX);
        if (hasUpMovingPoints || hasDownMovingPoints) allPossibleMaxX.push(upDownMoversMaxX);
        const currentOverallMaxX = allPossibleMaxX.length > 0 ? Math.max(...allPossibleMaxX) : 0;

        // Aggregate all relevant minimum Y-coordinates to find the overall minimum Y.
        const allPossibleMinY = [];
        if (hasLeftMovingPoints || hasRightMovingPoints) allPossibleMinY.push(leftRightMoversMinY);
        if (hasUpMovingPoints) allPossibleMinY.push(upMoversMinY);
        if (hasDownMovingPoints) allPossibleMinY.push(downMoversMinY);
        const currentOverallMinY = allPossibleMinY.length > 0 ? Math.min(...allPossibleMinY) : 0;

        // Aggregate all relevant maximum Y-coordinates to find the overall maximum Y.
        const allPossibleMaxY = [];
        if (hasLeftMovingPoints || hasRightMovingPoints) allPossibleMaxY.push(leftRightMoversMaxY);
        if (hasUpMovingPoints) allPossibleMaxY.push(upMoversMaxY);
        if (hasDownMovingPoints) allPossibleMaxY.push(downMoversMaxY);
        const currentOverallMaxY = allPossibleMaxY.length > 0 ? Math.max(...allPossibleMaxY) : 0;

        // Calculate the current width and height of the bounding box.
        const currentWidth = currentOverallMaxX - currentOverallMinX;
        const currentHeight = currentOverallMaxY - currentOverallMinY;
        const calculatedCurrentArea = currentWidth * currentHeight;

        // Update the minimum area found so far.
        minimumEnclosingArea = Math.min(minimumEnclosingArea, calculatedCurrentArea);

        // Check for termination condition: if the overall bounding box is no longer
        // constrained by the leading edges of the moving points.
        const isSteadyStateReached =
            (!hasLeftMovingPoints || currentOverallMinX === leftMoversMinX) &&
            (!hasRightMovingPoints || currentOverallMaxX === rightMoversMaxX) &&
            (!hasDownMovingPoints || currentOverallMinY === downMoversMinY) &&
            (!hasUpMovingPoints || currentOverallMaxY === upMoversMaxY);

        if (isSteadyStateReached) {
            break; // Exit the loop as the area will only increase from now on.
        }

        // Update the coordinates for the next simulation tick.
        if (hasLeftMovingPoints) {
            leftMoversMinX -= movementIncrement;
            leftMoversMaxX -= movementIncrement;
        }
        if (hasRightMovingPoints) {
            rightMoversMinX += movementIncrement;
            rightMoversMaxX += movementIncrement;
        }
        if (hasUpMovingPoints) {
            upMoversMinY += movementIncrement;
            upMoversMaxY += movementIncrement;
        }
        if (hasDownMovingPoints) {
            downMoversMinY -= movementIncrement;
            downMoversMaxY -= movementIncrement;
        }

        simulationTick++; // Advance the simulation tick.
    }

    // Output the smallest bounding area found.
    console.log(minimumEnclosingArea);
}

// Standard input handling for competitive programming environments.
// Reads from /dev/stdin, trims whitespace, and splits by newlines or spaces.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));