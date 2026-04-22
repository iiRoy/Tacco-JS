function solveJourneyRecursively(currentLocation, currentOrientationIndex, totalMarches) {
    const displacementVectors = [
        [0, 1],   // Corresponds to 90 degrees (North)
        [1, 0],   // Corresponds to 180 degrees (East)
        [0, -1],  // Corresponds to 270 degrees (South)
        [-1, 0]   // Corresponds to 360 degrees (West)
    ];

    // Termination condition: If we've returned to the starting point [0,0] after at least one step
    if (totalMarches > 0 && currentLocation[0] === 0 && currentLocation[1] === 0) {
        return totalMarches;
    }

    // Determine the vector for the current orientation
    const currentDisplacement = displacementVectors[currentOrientationIndex];

    // Calculate the subsequent location
    const subsequentLocation = [
        currentLocation[0] + currentDisplacement[0],
        currentLocation[1] + currentDisplacement[1]
    ];

    // Calculate the subsequent orientation (rotate 90 degrees clockwise, cycling through the indices)
    const subsequentOrientationIndex = (currentOrientationIndex + 1) % displacementVectors.length;

    // Recursive call with updated state
    return solveJourneyRecursively(subsequentLocation, subsequentOrientationIndex, totalMarches + 1);
}

function orchestrateSimulation(initialSourceData) {
    // Initial state: location [0,0], orientation North (index 0), 0 steps taken
    const resultSteps = solveJourneyRecursively([0, 0], 0, 0);
    console.log(resultSteps);
}

orchestrateSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));