// This module handles the primary logic for processing location data and queries.
// It reads input, organizes location information, calculates distances, and responds to queries.
function processData(rawData) {
    // The raw input string is parsed into individual lines for easier processing.
    var parsedLines = rawData.split("\n");

    // The first line of input contains three critical numbers:
    // countA: the quantity of locations of the first kind.
    // countB: the quantity of locations of the second kind.
    // queryCount: the total number of search operations to perform.
    var firstLineComponents = parsedLines[0].split(" ");
    var countA = Number(firstLineComponents[0]);
    var countB = Number(firstLineComponents[1]);
    var queryCount = Number(firstLineComponents[2]);

    // An array is initialized to hold all location entries.
    var locationEntries = [];
    // A counter to keep track of the current line being read from the input.
    var lineIndex = 1;

    // A loop to read and store all 'type 1' locations.
    // Each location is stored as an object with its kind, position, and an initial minimum distance.
    for (var currentLoop = 0; currentLoop < countA; currentLoop++, lineIndex++) {
        locationEntries.push({
            entryKind: 1, // Denotes the category of this location.
            position: Number(parsedLines[lineIndex]), // The numerical position on a line/axis.
            minDistance: Infinity // Placeholder for the closest distance to another type, set to max initially.
        });
    }

    // A separate loop to read and store all 'type 2' locations.
    // Similar structure to type 1 locations.
    for (var currentLoop = 0; currentLoop < countB; currentLoop++, lineIndex++) {
        locationEntries.push({
            entryKind: 2, // Denotes the category of this location.
            position: Number(parsedLines[lineIndex]), // The numerical position on a line/axis.
            minDistance: Infinity // Placeholder for the closest distance to another type, set to max initially.
        });
    }

    // Variables to temporarily store the last encountered location of each type during iteration.
    var lastTypeOneLocation, lastTypeTwoLocation;

    // The collection of all location entries is sorted based on their positions.
    // This sorting is crucial for efficiently calculating minimum distances and performing binary searches.
    locationEntries.sort((entryA, entryB) => entryA.position - entryB.position);

    // This iteration calculates the minimum distance from each location to a location of the *other* type.
    // It's a single pass after sorting, which is efficient.
    locationEntries.forEach(currentEntry => {
        if (currentEntry.entryKind === 1) {
            // If we've previously seen a type 2 location, calculate distance.
            if (lastTypeTwoLocation) {
                lastTypeTwoLocation.minDistance = Math.min(lastTypeTwoLocation.minDistance, currentEntry.position - lastTypeTwoLocation.position);
                currentEntry.minDistance = currentEntry.position - lastTypeTwoLocation.position;
            }
            lastTypeOneLocation = currentEntry; // Update the reference to the most recent type 1 location.
        } else { // currentEntry.entryKind === 2
            // If we've previously seen a type 1 location, calculate distance.
            if (lastTypeOneLocation) {
                lastTypeOneLocation.minDistance = Math.min(lastTypeOneLocation.minDistance, currentEntry.position - lastTypeOneLocation.position);
                currentEntry.minDistance = currentEntry.position - lastTypeOneLocation.position;
            }
            lastTypeTwoLocation = currentEntry; // Update the reference to the most recent type 2 location.
        }
    });

    // Now, process each of the specified queries.
    for (var currentLoop = 0; currentLoop < queryCount; currentLoop++, lineIndex++) {
        var queryPosition = Number(parsedLines[lineIndex]); // The target position for the current query.
        // Use a binary search helper to find the approximate index of the query position within the sorted locations.
        var foundIndex = findApproximateIndex(locationEntries, queryPosition);
        var finalResult = 0; // Variable to hold the calculated minimum total distance for this query.

        // Determine the final result based on the `foundIndex` from the binary search.
        if (foundIndex < 0) {
            // If the query position is smaller than all known locations, consider only the first location.
            finalResult = Math.abs(locationEntries[0].position - queryPosition) + locationEntries[0].minDistance;
        } else if (foundIndex >= locationEntries.length - 1) {
            // If the query position is larger than or equal to the last location, consider only the last location.
            finalResult = Math.abs(locationEntries[locationEntries.length - 1].position - queryPosition) + locationEntries[locationEntries.length - 1].minDistance;
        } else {
            // In the general case, the query position falls between two locations.
            // We must consider both the location at `foundIndex` and the one immediately after it.
            finalResult = Math.min(
                Math.abs(locationEntries[foundIndex].position - queryPosition) + locationEntries[foundIndex].minDistance,
                Math.abs(locationEntries[foundIndex + 1].position - queryPosition) + locationEntries[foundIndex + 1].minDistance
            );
        }
        console.log(finalResult); // Output the calculated result for the current query.
    }
    return locationEntries; // The function returns the processed list, though its main purpose is side effects (console.log).
}

// Helper function implementing a binary search to find an approximate index for a target value.
// It returns the index of the largest element less than or equal to the target value's position.
function findApproximateIndex(dataCollection, targetValue) {
    var lowBound = 0, highBound = dataCollection.length; // Initialize the search range.
    var midPoint = Math.floor((lowBound + highBound) / 2); // Calculate the initial midpoint.

    // The binary search loop continues as long as the lower bound is less than the upper bound.
    while (lowBound < highBound) {
        // If the position at the midpoint is greater than the target value,
        // it means the target must be in the lower half (or not present).
        if (dataCollection[midPoint].position > targetValue) {
            highBound = midPoint - 1; // Adjust the upper bound.
        } else {
            // Otherwise, the target is in the upper half (or at the midpoint).
            lowBound = midPoint + 1; // Adjust the lower bound.
        }
        midPoint = Math.floor((lowBound + highBound) / 2); // Recalculate the midpoint for the new range.
    }

    // After the loop, `midPoint` (which is equal to `lowBound` and `highBound`)
    // points to a potential candidate. We perform a final check.
    if (dataCollection[midPoint] && dataCollection[midPoint].position > targetValue) {
        return midPoint - 1; // If the element at `midPoint` is too large, the correct index is one before it.
    } else {
        return midPoint; // Otherwise, `midPoint` is the correct index (largest element <= target, or -1 if none).
    }
}

// The script execution starts here, reading input from standard input and passing it to the main processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));