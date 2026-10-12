var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

var lineCollection = sourceData.trim().split("\n"); // Array of input lines

while (true) {
    // Read the first set of three numbers (x, y, z)
    var dimensions = lineCollection.shift().split(" ").map(Number);

    // Check for the termination condition "0 0 0"
    if (dimensions.join(" ") === "0 0 0") {
        break; // Exit the main loop
    }

    var widthVal = dimensions[0];  // Corresponds to 'x'
    var heightVal = dimensions[1]; // Corresponds to 'y'
    var eventCount = dimensions[2]; // Corresponds to 'z'

    // Read the movement values (v)
    var movementSteps = lineCollection.shift().split(" ").map(Number);

    // Initialize an array to store event configurations
    var eventRegistry = []; // Corresponds to 'nea'

    // Populate the event registry based on 'eventCount' lines
    for (var rowIter = 0; rowIter < eventCount; rowIter++) { // Corresponds to 'i'
        var eventDetails = lineCollection.shift().split(" ").map(Number); // Corresponds to 'Z'
        eventRegistry[eventDetails[0]] = [eventDetails[1], eventDetails[2]];
    }

    // Initialize the dynamic programming table (probability matrix)
    var probTable = []; // Corresponds to 'dp'

    // Fill the probability table with zeros
    for (var rowIter = 0; rowIter <= heightVal; rowIter++) { // Corresponds to 'i'
        probTable[rowIter] = [];
        for (var colIter = 0; colIter <= 5000; colIter++) { // Corresponds to 'j'
            probTable[rowIter][colIter] = 0;
        }
    }

    // Set the initial state: 100% probability at position 0 with 0 penalty
    probTable[0][0] = 1;

    // Iterate through each position up to 'heightVal - 1'
    for (var rowIter = 0; rowIter < heightVal; rowIter++) { // Corresponds to 'i'
        // Iterate through all possible penalty values
        for (var penaltyIter = 0; penaltyIter <= 5000; penaltyIter++) { // Corresponds to 'k'
            // Iterate through each possible movement step
            for (var colIter = 0; colIter < widthVal; colIter++) { // Corresponds to 'j'
                // Calculate the next position, capped at 'heightVal'
                var nextPosition = Math.min(heightVal, rowIter + movementSteps[colIter]); // Corresponds to 'after'

                // Check if there's an event at the 'nextPosition'
                if (eventRegistry[nextPosition] !== undefined) {
                    var eventType = eventRegistry[nextPosition][0]; // Corresponds to 'e'
                    var eventMagnitude = eventRegistry[nextPosition][1]; // Corresponds to 'a'

                    // Apply event effects based on its type
                    if (eventType === 1) {
                        // Type 1: Move forward by 'eventMagnitude'
                        probTable[Math.min(heightVal, nextPosition + eventMagnitude)][penaltyIter] += probTable[rowIter][penaltyIter] / widthVal;
                    } else if (eventType === 2) {
                        // Type 2: Increase penalty by 'eventMagnitude'
                        probTable[nextPosition][Math.min(5000, penaltyIter + eventMagnitude)] += probTable[rowIter][penaltyIter] / widthVal;
                    } else if (eventType === 3) {
                        // Type 3: Decrease penalty by 'eventMagnitude'
                        probTable[nextPosition][Math.max(0, penaltyIter - eventMagnitude)] += probTable[rowIter][penaltyIter] / widthVal;
                    }
                } else {
                    // No event: simply move to the 'nextPosition' with the current penalty
                    probTable[nextPosition][penaltyIter] += probTable[rowIter][penaltyIter] / widthVal;
                }
            }
        }
    }

    // Calculate the total expected penalty at the final position 'heightVal'
    var expectedPenalty = 0; // Corresponds to 'sum'
    for (var rowIter = 0; rowIter <= 5000; rowIter++) { // Corresponds to 'i'
        expectedPenalty += rowIter * probTable[heightVal][rowIter];
    }

    // Output the floor of the calculated expected penalty
    console.log(Math.floor(expectedPenalty));
}
