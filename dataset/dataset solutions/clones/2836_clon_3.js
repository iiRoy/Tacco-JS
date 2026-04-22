function computeMinimalEnclosingArea(sourceDataArray) {
    // This function calculates the smallest possible bounding box area
    // that encloses a set of moving points over time.
    // Points move horizontally (L/R) or vertically (U/D).

    // Extract the total number of points from the beginning of the input array.
    const totalEntityCount = Number(sourceDataArray.shift());

    // --- Guard Clause: Handle cases with no points ---
    // If there are no points, the minimal area is 0.
    if (totalEntityCount === 0) {
        console.log(0);
        return;
    }

    // --- Initialize Boundary Variables for Each Movement Type ---
    // These variables track the current min/max X or Y coordinates for points
    // moving in specific directions. They are updated in each simulation step.
    // Initialized with Infinity/-Infinity to ensure any real coordinate will update them.
    let leftwardGroupMinX = Infinity;
    let leftwardGroupMaxX = -Infinity;
    let rightwardGroupMinX = Infinity;
    let rightwardGroupMaxX = -Infinity;
    let upwardGroupMinY = Infinity;
    let upwardGroupMaxY = -Infinity;
    let downwardGroupMinY = Infinity;
    let downwardGroupMaxY = -Infinity;

    // These variables track the *fixed* bounds for the *other* coordinate.
    // For horizontal movers (L/R), their Y-coordinates remain constant.
    let horizontalMoversFixedYMin = Infinity;
    let horizontalMoversFixedYMax = -Infinity;
    // For vertical movers (U/D), their X-coordinates remain constant.
    let verticalMoversFixedXMin = Infinity;
    let verticalMoversFixedXMax = -Infinity;

    // Flags to indicate if any points of a specific movement type were found.
    let hasLeftwardMovers = false;
    let hasRightwardMovers = false;
    let hasUpwardMovers = false;
    let hasDownwardMovers = false;

    // --- First Pass: Parse Input Data and Initialize Initial Boundaries ---
    // Iterate through the input data to extract point coordinates and directions.
    for (let pointIndex = 0; pointIndex < totalEntityCount; ++pointIndex) {
        // Each point is represented by three consecutive elements: X, Y, Direction.
        const currentCoordX = Number(sourceDataArray[pointIndex * 3]);
        const currentCoordY = Number(sourceDataArray[pointIndex * 3 + 1]);
        const movementDirectionCode = sourceDataArray[pointIndex * 3 + 2];

        // Update the respective boundary variables based on the point's movement direction.
        switch (movementDirectionCode) {
            case "L":
                leftwardGroupMinX = Math.min(leftwardGroupMinX, currentCoordX);
                leftwardGroupMaxX = Math.max(leftwardGroupMaxX, currentCoordX);
                horizontalMoversFixedYMin = Math.min(horizontalMoversFixedYMin, currentCoordY);
                horizontalMoversFixedYMax = Math.max(horizontalMoversFixedYMax, currentCoordY);
                hasLeftwardMovers = true;
                break;
            case "R":
                rightwardGroupMinX = Math.min(rightwardGroupMinX, currentCoordX);
                rightwardGroupMaxX = Math.max(rightwardGroupMaxX, currentCoordX);
                horizontalMoversFixedYMin = Math.min(horizontalMoversFixedYMin, currentCoordY);
                horizontalMoversFixedYMax = Math.max(horizontalMoversFixedYMax, currentCoordY);
                hasRightwardMovers = true;
                break;
            case "U":
                upwardGroupMinY = Math.min(upwardGroupMinY, currentCoordY);
                upwardGroupMaxY = Math.max(upwardGroupMaxY, currentCoordY);
                verticalMoversFixedXMin = Math.min(verticalMoversFixedXMin, currentCoordX);
                verticalMoversFixedXMax = Math.max(verticalMoversFixedXMax, currentCoordX);
                hasUpwardMovers = true;
                break;
            case "D":
                downwardGroupMinY = Math.min(downwardGroupMinY, currentCoordY);
                downwardGroupMaxY = Math.max(downwardGroupMaxY, currentCoordY);
                verticalMoversFixedXMin = Math.min(verticalMoversFixedXMin, currentCoordX);
                verticalMoversFixedXMax = Math.max(verticalMoversFixedXMax, currentCoordX);
                hasDownwardMovers = true;
                break;
            // No default case: assuming input always provides valid direction codes.
        }
    }

    // Initialize the variable to store the smallest area found during the simulation.
    let smallestOverallArea = Infinity;
    // Flag to control the simulation loop.
    let simulationIsActive = true;
    // let timeElapsed = 0; // An optional counter for simulation steps.

    // --- Simulation Loop: Calculate Bounding Box Area Over Time ---
    // The loop continues as long as the bounding box is still contracting
    // due to the movement of the outermost points.
    while (simulationIsActive) {
        // timeElapsed++; // Increment time step

        // Initialize variables for the overall bounding box at the current time step.
        let currentOverallMinX = Infinity;
        let currentOverallMaxX = -Infinity;
        let currentOverallMinY = Infinity;
        let currentOverallMaxY = -Infinity;

        // Aggregate all relevant boundary values from different mover groups
        // to determine the global bounding box for the current moment.
        if (hasLeftwardMovers) {
            currentOverallMinX = Math.min(currentOverallMinX, leftwardGroupMinX);
            currentOverallMaxX = Math.max(currentOverallMaxX, leftwardGroupMaxX);
            currentOverallMinY = Math.min(currentOverallMinY, horizontalMoversFixedYMin);
            currentOverallMaxY = Math.max(currentOverallMaxY, horizontalMoversFixedYMax);
        }
        if (hasRightwardMovers) {
            currentOverallMinX = Math.min(currentOverallMinX, rightwardGroupMinX);
            currentOverallMaxX = Math.max(currentOverallMaxX, rightwardGroupMaxX);
            currentOverallMinY = Math.min(currentOverallMinY, horizontalMoversFixedYMin);
            currentOverallMaxY = Math.max(currentOverallMaxY, horizontalMoversFixedYMax);
        }
        if (hasUpwardMovers) {
            currentOverallMinY = Math.min(currentOverallMinY, upwardGroupMinY);
            currentOverallMaxY = Math.max(currentOverallMaxY, upwardGroupMaxY);
            currentOverallMinX = Math.min(currentOverallMinX, verticalMoversFixedXMin);
            currentOverallMaxX = Math.max(currentOverallMaxX, verticalMoversFixedXMax);
        }
        if (hasDownwardMovers) {
            currentOverallMinY = Math.min(currentOverallMinY, downwardGroupMinY);
            currentOverallMaxY = Math.max(currentOverallMaxY, downwardGroupMaxY);
            currentOverallMinX = Math.min(currentOverallMinX, verticalMoversFixedXMin);
            currentOverallMaxX = Math.max(currentOverallMaxX, verticalMoversFixedXMax);
        }

        // --- Robustness Check: Handle cases where no valid points were processed ---
        // If no movers were found (e.g., N > 0 but all directions were invalid or ignored),
        // the min/max will remain Infinity/-Infinity. In this edge case, the area is 0.
        if (currentOverallMinX === Infinity || currentOverallMaxX === -Infinity ||
            currentOverallMinY === Infinity || currentOverallMaxY === -Infinity) {
            smallestOverallArea = 0;
            simulationIsActive = false; // Terminate the simulation.
            break; // Exit the loop immediately.
        }

        // Calculate the width and height of the current bounding box.
        const currentBoundingBoxWidth = currentOverallMaxX - currentOverallMinX;
        const currentBoundingBoxHeight = currentOverallMaxY - currentOverallMinY;

        // Update the minimum area found so far.
        smallestOverallArea = Math.min(smallestOverallArea, currentBoundingBoxWidth * currentBoundingBoxHeight);

        // --- Determine Simulation Termination Condition ---
        // The simulation stops when the global bounding box is no longer
        // determined by the 'leading edge' of any specific mover group.
        // This means the box has reached its minimum possible size in each dimension
        // with respect to the initial positions and movement directions.
        const xMinBoundaryStable = (!hasLeftwardMovers || currentOverallMinX === leftwardGroupMinX);
        const xMaxBoundaryStable = (!hasRightwardMovers || currentOverallMaxX === rightwardGroupMaxX);
        const yMinBoundaryStable = (!hasDownwardMovers || currentOverallMinY === downwardGroupMinY);
        const yMaxBoundaryStable = (!hasUpwardMovers || currentOverallMaxY === upwardGroupMaxY);

        // The simulation continues if ANY boundary is still contracting.
        // It stops when ALL boundaries are stable.
        simulationIsActive = !(xMinBoundaryStable && xMaxBoundaryStable && yMinBoundaryStable && yMaxBoundaryStable);

        // If the simulation is about to terminate, there's no need to update positions for the next step.
        if (!simulationIsActive) {
            break;
        }

        // --- Update Point Positions for the Next Time Step ---
        // Points move one unit per time step in their respective directions.
        if (hasLeftwardMovers) {
            leftwardGroupMinX--;
            leftwardGroupMaxX--;
        }
        if (hasRightwardMovers) {
            rightwardGroupMinX++;
            rightwardGroupMaxX++;
        }
        if (hasUpwardMovers) {
            upwardGroupMinY++;
            upwardGroupMaxY++;
        }
        if (hasDownwardMovers) {
            downwardGroupMinY--;
            downwardGroupMaxY--;
        }
    }

    // Output the calculated minimal bounding area.
    console.log(smallestOverallArea);
}

// Standard input processing for competitive programming environments.
// This reads the entire input, trims whitespace, and splits by newlines or spaces.
computeMinimalEnclosingArea(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));