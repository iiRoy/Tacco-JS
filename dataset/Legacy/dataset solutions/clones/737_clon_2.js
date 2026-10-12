var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input data
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop
while (true) {
    // Get the next line of configuration values
    var configVals = lineSegments.shift();

    // Check for termination condition
    if (configVals === "0 0 0") {
        break;
    }

    // Parse the configuration values into numbers
    configVals = configVals.split(" ").map(Number);

    var totalItems = configVals[0];
    var stepCount = configVals[1];
    var initialPosition = configVals[2];

    // Initialize an array to track item status
    // true means available, false means processed
    var itemStatus = [];
    for (var idx = 0; idx <= totalItems; idx++) {
        itemStatus[idx] = true;
    }

    // Set up variables for the simulation
    var currentPosition = initialPosition;
    var currentStep = 0;
    itemStatus[initialPosition] = false; // Mark the starting item as processed
    var processedCount = 1;

    // Simulation loop
    while (true) {
        // If the current item is available
        if (itemStatus[currentPosition]) {
            currentStep++; // Increment the step counter
            // If the step count matches the required step
            if (currentStep === stepCount) {
                itemStatus[currentPosition] = false; // Mark this item as processed
                currentStep = 0; // Reset step counter
                processedCount++; // Increment total processed count
                // If all but two items are processed, break the loop
                // (ary.length - 2 because index 0 is unused and one item is left)
                if (processedCount === itemStatus.length - 2) {
                    break;
                }
            }
        }

        currentPosition++; // Move to the next position
        // Wrap around if currentPosition exceeds totalItems
        if (itemStatus.length - 1 < currentPosition) {
            currentPosition = 1;
        }
    }

    // Output the remaining available item
    for (var finalIndex = 1; finalIndex <= totalItems; finalIndex++) {
        if (itemStatus[finalIndex]) {
            console.log(finalIndex);
        }
    }
}
