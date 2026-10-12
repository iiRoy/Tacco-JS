'use strict';

// This function processes the input data to find the closest checkpoint for each initial location.
const processInput = (inputData) => {
    // Clean up the raw input string and split it into individual lines.
    let processedLines = inputData.trim().split('\n');

    // Parse the first line to get the number of initial locations (N) and checkpoints (M).
    const [numEntriesStr, numCheckpointsStr] = processedLines[0].split(' ');
    const numEntries = parseInt(numEntriesStr, 10); // Number of student locations
    const numCheckpoints = parseInt(numCheckpointsStr, 10); // Number of checkpoint locations

    // Extract the lines corresponding to initial locations and checkpoint coordinates.
    let initialLocationsRaw = processedLines.slice(1, numEntries + 1);
    let checkpointCoordsRaw = processedLines.slice(numEntries + 1, numCheckpoints + numEntries + 1);

    // Helper function to convert a coordinate string "x y" into an object { coordX: x, coordY: y }.
    const parseCoordinates = (coordinateString) => {
        const parsedValues = coordinateString.split(' ').map(singleValueStr => parseInt(singleValueStr, 10));
        return {
            coordX: parsedValues[0],
            coordY: parsedValues[1]
        };
    };

    // Convert raw string arrays into arrays of coordinate objects.
    let initialLocations = initialLocationsRaw.map(parseCoordinates);
    let checkpointCoords = checkpointCoordsRaw.map(parseCoordinates);

    // This array will store the 0-based index of the closest checkpoint for each initial location.
    let closestCheckpointIndices = [];

    // Iterate through each initial location to find its nearest checkpoint.
    initialLocations.forEach((currentLocation, locationIndex) => {
        let minimumDistanceFound = 1e9; // Initialize with a very large distance
        let closestCheckpointIdx = 0; // Stores the index of the closest checkpoint found so far

        // Compare the current initial location with all available checkpoints.
        checkpointCoords.forEach((currentCheckpoint, checkpointIndex) => {
            // Calculate Manhattan distance (L1 distance) between the two points.
            const manhattanDistance = Math.abs(currentLocation.coordX - currentCheckpoint.coordX) +
                                      Math.abs(currentLocation.coordY - currentCheckpoint.coordY);

            // If this checkpoint is closer than the previously found minimum, update.
            if (manhattanDistance < minimumDistanceFound) {
                minimumDistanceFound = manhattanDistance;
                closestCheckpointIdx = checkpointIndex;
            }
        });

        // After checking all checkpoints, store the index of the closest one.
        closestCheckpointIndices.push(closestCheckpointIdx);
    });

    // Output the 1-based index for each initial location's closest checkpoint.
    closestCheckpointIndices.forEach(resultIndex => console.log(resultIndex + 1));
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
