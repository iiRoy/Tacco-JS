// This function processes the entire input data.
function ProcessInput(rawData) {
    // Parse the number of locations from the first line of input.
    let numLocations = +(rawData[0]);

    // Split the second line of input into an array of individual location coordinates.
    const locationCoordinates = rawData[1].split(/\s+/);

    // An array to store the calculated travel costs (differences) between consecutive points.
    let travelCosts = [];

    // A variable to accumulate the total absolute distance traveled.
    let totalDistance = 0;

    // Represents the current coordinate, starting from the origin (0).
    let currentCoord = 0;

    // Loop through each location coordinate provided in the input.
    for (let idx = 0; idx < numLocations; ++idx) {
        // Parse the next coordinate from the array.
        const nextCoord = +(locationCoordinates[idx]);

        // Calculate the difference (cost) from the current coordinate to the next.
        travelCosts.push(currentCoord - nextCoord);

        // Add the absolute value of this difference to the total distance.
        totalDistance += Math.abs(currentCoord - nextCoord);

        // Update the current coordinate to the next coordinate for the subsequent iteration.
        currentCoord = nextCoord;
    }

    // After processing all given locations, calculate the cost to return to the origin (0).
    travelCosts.push(currentCoord - 0);

    // Add the absolute distance for returning to the origin to the total.
    totalDistance += Math.abs(currentCoord - 0);

    // Iterate through each location again to calculate and print the adjusted total distance
    // if a specific segment (from point idx to point idx+1) were to be skipped.
    for (let idx = 0; idx < numLocations; ++idx) {
        // The formula calculates the total distance, then subtracts the absolute costs
        // of the two segments involving point 'idx' and 'idx+1', and finally adds
        // the absolute cost of a single segment directly connecting the points
        // before 'idx' and after 'idx+1'.
        console.log(`${totalDistance - Math.abs(travelCosts[idx]) - Math.abs(travelCosts[idx + 1]) + Math.abs(travelCosts[idx] + travelCosts[idx + 1])}`);
    }
}

// The following line should not be modified. It handles reading input from standard input
// and then calls the main processing function with the read data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
