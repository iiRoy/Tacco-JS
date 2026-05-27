'use strict';

// This function processes the input data to find the closest location for each item.
const processInput = (inputData) => {
    // Clean up the input string and split it into an array of lines.
    const lines = inputData.trim().split('\n');

    // Parse the first line to get the number of items (N) and locations (M).
    const [numItemsStr, numLocationsStr] = lines[0].split(' ');
    const numItems = parseInt(numItemsStr, 10); // Number of items
    const numLocations = parseInt(numLocationsStr, 10); // Number of locations

    // Extract the item coordinates and location coordinates from the input lines.
    const itemCoordinateStrings = lines.slice(1, numItems + 1);
    const locationCoordinateStrings = lines.slice(numItems + 1, numItems + numLocations + 1);

    // Helper function to parse a coordinate string into an object with x and y properties.
    const parseCoordinateString = (coordStr) => {
        const [xStr, yStr] = coordStr.split(' ').map(val => parseInt(val, 10));
        return {
            x: xStr,
            y: yStr
        };
    };

    // Convert string arrays to arrays of coordinate objects.
    const itemCoordinates = itemCoordinateStrings.map(parseCoordinateString);
    const locationCoordinates = locationCoordinateStrings.map(parseCoordinateString);

    // This array will store the index of the closest location for each item.
    const closestLocationIndices = [];

    // Iterate through each item to find its nearest location.
    itemCoordinates.forEach((currentItem, itemIdx) => {
        let minimumDistanceFound = Number.MAX_SAFE_INTEGER; // Initialize with a very large distance
        let bestLocationIndex = 0; // Initialize the index of the closest location

        // Compare the current item with all available locations.
        locationCoordinates.forEach((currentLocation, locationIdx) => {
            // Calculate Manhattan distance (L1 distance) between the item and the location.
            const currentDistance = Math.abs(currentItem.x - currentLocation.x) + Math.abs(currentItem.y - currentLocation.y);

            // If this location is closer than the previously found minimum, update.
            if (currentDistance < minimumDistanceFound) {
                minimumDistanceFound = currentDistance;
                bestLocationIndex = locationIdx;
            }
        });

        // Store the index of the closest location for the current item.
        closestLocationIndices.push(bestLocationIndex);
    });

    // Output the 1-based index of the closest location for each item.
    closestLocationIndices.forEach(resultIndex => console.log(resultIndex + 1));
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
