'use strict';

// This script processes spatial data to find the nearest location for each entity.
function ProcessInputData(rawData) {
    const linesArray = rawData.trim().split('\n');
    const dimensions = linesArray[0].split(' ');
    const numEntities = Number(dimensions[0]);
    const numLocations = Number(dimensions[1]);

    // Parse entity coordinates from the input lines
    let entityCoordinates = linesArray
        .slice(1, numEntities + 1)
        .map((lineStr) => lineStr.split(' ').map((valStr) => Number(valStr)));

    // Parse location coordinates from the remaining input lines
    const locationCoordinates = linesArray
        .slice(numEntities + 1)
        .map((lineStr) => lineStr.split(' ').map((valStr) => Number(valStr)));

    // console.log(`Entities: ${numEntities}, Locations: ${numLocations}`);
    // console.log('Entity data:', entityCoordinates);
    // console.log('Location data:', locationCoordinates);

    // Iterate through each entity to find its closest location
    for (const currentEntity of entityCoordinates) {
        let closestLocationIndex = -1;
        let minDistanceFound = Number.MAX_VALUE;

        // Compare the current entity with all available locations
        for (let locIdx = 0; locIdx < numLocations; locIdx++) {
            const currentDist = calculateManhattanDistance(currentEntity, locationCoordinates[locIdx]);

            // If a closer location is found, update the minimum distance and index
            if (currentDist < minDistanceFound) {
                minDistanceFound = currentDist;
                closestLocationIndex = locIdx + 1; // Location indices are 1-based
            }
        }
        // Output the 1-based index of the closest location for the current entity
        console.log(closestLocationIndex);
    }

    return; // Function completes its task
}

// Computes the Manhattan distance between two 2D coordinate points.
function calculateManhattanDistance(coordA, coordB) {
    return Math.abs(coordA[0] - coordB[0]) + Math.abs(coordA[1] - coordB[1]);
}

// Read input from standard input and pass it to the main processing function.
ProcessInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
