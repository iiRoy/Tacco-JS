const fileSystemModule = require('fs');

// A utility function to safely parse a string line containing space-separated numbers
// into an array of integers. It handles empty lines by returning an empty array.
function parseNumericalSequence(lineContent) {
    if (!lineContent || typeof lineContent !== 'string' || lineContent.trim() === '') {
        return [];
    }
    // Split the string by spaces and convert each part to an integer with base 10.
    return lineContent.split(' ').map(segment => parseInt(segment, 10));
}

// Read the entire standard input stream as a UTF-8 string.
let rawStreamData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Clean up the raw input: remove any trailing newline characters and then split
// the content into an array of individual lines.
let inputLineCollection = rawStreamData.trimEnd().split('\n');

// The very first line of the input specifies the total number of test cases.
// We extract this value and convert it to a numeric type, also removing it from the collection.
let totalScenarioCount = Number(inputLineCollection.shift());

// Implement a basic validation check for the number of scenarios.
// If it's not a valid positive number, we halt execution.
if (isNaN(totalScenarioCount) || totalScenarioCount <= 0) {
    // In a real application, one might log an error or throw an exception.
    // For this problem, simply exiting is sufficient.
    return;
}

// Iterate through each defined scenario to process its specific pathfinding task.
for (let scenarioIdentifier = 0; scenarioIdentifier < totalScenarioCount; ++scenarioIdentifier) {
    // Retrieve the line of data relevant to the current scenario.
    const currentScenarioInput = inputLineCollection[scenarioIdentifier];

    // Parse the initial and target values from the current scenario's input line.
    // Using array destructuring for clear assignment.
    let [startingPoint, finalDestination] = parseNumericalSequence(currentScenarioInput);

    // Initialize an array to record the sequence of steps taken, beginning with the starting point.
    let traversedPath = [startingPoint];
    let currentPosition = startingPoint; // This variable will be mutated as we navigate.

    // Logic to determine the path based on the relationship between startingPoint and finalDestination.
    if (startingPoint < finalDestination) {
        // Condition 1: The starting point is numerically less than the final destination.
        // We increment the current position until the destination is reached.
        while (currentPosition !== finalDestination) {
            currentPosition++;
            traversedPath.push(currentPosition);
        }
    } else if (startingPoint > finalDestination) {
        // Condition 2: The starting point is numerically greater than the final destination.
        // This condition branches further into several sub-scenarios based on value ranges.

        if (startingPoint <= 5) {
            // Sub-condition 2.1: Both starting and final points are within the lower numerical range (e.g., 1-5).
            // We decrement the current position until the destination is achieved.
            while (currentPosition !== finalDestination) {
                currentPosition--;
                traversedPath.push(currentPosition);
            }
        } else if (startingPoint >= 6 && finalDestination >= 6) {
            // Sub-condition 2.2: Both starting and final points are within the higher numerical range (e.g., 6-9),
            // or involve a specific wrap-around rule.
            // We increment the current position, applying a special rule: if 10 is reached, it resets to 5.
            while (currentPosition !== finalDestination) {
                currentPosition++;
                if (currentPosition === 10) {
                    currentPosition = 5; // Implements the specific wrap-around behavior.
                }
                traversedPath.push(currentPosition);
            }
        } else if (startingPoint >= 6 && finalDestination <= 5) {
            // Sub-condition 2.3: The starting point is in the higher range (>=6), but the final destination
            // is in the lower range (<=5). This involves a more complex path with a direction change.
            // We start by incrementing, but upon reaching 10, we reset to 5 AND reverse the direction of movement.
            let currentMovementDirection = 1; // Initially, we move positively (increment).
            while (currentPosition !== finalDestination) {
                currentPosition += currentMovementDirection;
                if (currentPosition === 10) {
                    currentPosition = 5; // Wrap-around rule.
                    currentMovementDirection = -1; // Direction is reversed to negative (decrement).
                }
                traversedPath.push(currentPosition);
            }
        }
    }
    // If `startingPoint === finalDestination`, the `traversedPath` array already correctly contains
    // only the initial point, as none of the `while` loops will execute.

    // Output the complete sequence of positions for the current scenario, joined by spaces.
    console.log(traversedPath.join(' '));
}