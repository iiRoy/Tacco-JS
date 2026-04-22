/*
 * This module processes a series of numerical inputs
 * to calculate a cumulative value based on specific traversal logic.
 */
function processInput(inputString) { // Main entry point for processing the provided string data.
    // Split the entire input string into an array of individual lines.
    let linesArray = inputString.split("\n");

    // Parse the first line to extract two key configuration values.
    // The first number represents a boundary or maximum limit.
    const boundaryValue = Number.parseInt(linesArray[0].split(" ")[0]);
    // The second number indicates the total number of processing iterations.
    const iterationsCount = Number.parseInt(linesArray[0].split(" ")[1]);

    // Remove the configuration line as it's no longer needed in the data set.
    linesArray.shift();

    // The remaining lines now exclusively contain the data items to be processed.
    let dataItems = linesArray;

    // Initialize the current position tracker. Starts at the beginning.
    let currentPosition = 0;
    // Initialize the accumulator for the final sum.
    let cumulativeSum = 0;

    // Iterate through the data items for the specified number of times.
    for (let loopCounter = 0; loopCounter < iterationsCount; loopCounter++) {
        // Retrieve and parse the first data item in the current sequence.
        const firstElement = Number.parseInt(dataItems[0]);
        // Retrieve and parse the last data item in the current sequence.
        const lastElement = Number.parseInt(dataItems[dataItems.length - 1]);

        // Calculate the distance if moving from the current position to the first element.
        const distanceForward = firstElement - currentPosition;
        // Calculate the distance if moving from the current position to the last element,
        // considering the boundary value.
        const distanceBackward = (boundaryValue - lastElement) + currentPosition;

        // Log intermediate states for debugging or tracing.
        console.log("Current position marker: " + currentPosition);
        console.log("Accumulated value so far: " + cumulativeSum);

        // Determine the optimal path based on calculated distances.
        if (distanceForward > distanceBackward) {
            // If moving forward is more efficient or preferred.
            cumulativeSum += distanceForward; // Add the forward distance to the total.
            dataItems.shift(); // Remove the processed first element.
            currentPosition = firstElement; // Update the current position.
        }
        else {
            // If moving backward is more efficient or preferred.
            cumulativeSum += distanceBackward; // Add the backward distance to the total.
            dataItems.pop(); // Remove the processed last element.
            currentPosition = lastElement; // Update the current position.
        }
    }

    // Output the final computed cumulative sum.
    console.log(cumulativeSum);
}

// Invoke the main processing function with data read from standard input.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));