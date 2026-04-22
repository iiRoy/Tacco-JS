// This script processes input data from standard input to calculate an expected value.
var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

// The raw input is split into an array of lines after trimming leading/trailing whitespace.
var lineFragments = dataSource.trim().split("\n");

// Main processing loop, continues until a specific termination condition is met.
while (true) {
    // Extract configuration parameters (width, height, event count) for the current round.
    var dimensions = lineFragments.shift().split(" ").map(Number);

    // Check for the termination condition: all parameters are zero.
    if (dimensions.join(" ") === "0 0 0") {
        break; // Exit the main loop.
    }

    // Assign extracted dimension values to descriptive variables.
    var widthDimension = dimensions[0];
    var heightDimension = dimensions[1];
    var specialEventCount = dimensions[2];

    // Read the array of possible step values for movement.
    var stepValues = lineFragments.shift().split(" ").map(Number);

    // Initialize a map to store special event details.
    // The key is an index, and the value is an array [effectKind, effectMagnitude].
    var eventRegistry = [];

    // Populate the special event registry based on the 'specialEventCount'.
    for (var outerLoopCounter = 0; outerLoopCounter < specialEventCount; outerLoopCounter++) {
        var effectDetails = lineFragments.shift().split(" ").map(Number);
        eventRegistry[effectDetails[0]] = [effectDetails[1], effectDetails[2]];
    }

    // Initialize a 2D array (grid) to store probabilities for dynamic programming.
    // Dimensions are (heightDimension + 1) x 5001.
    var probabilityGrid = [];
    for (var outerLoopCounter = 0; outerLoopCounter <= heightDimension; outerLoopCounter++) {
        probabilityGrid[outerLoopCounter] = [];
        for (var innerLoopCounter = 0; innerLoopCounter <= 5000; innerLoopCounter++) {
            probabilityGrid[outerLoopCounter][innerLoopCounter] = 0; // Initialize all probabilities to zero.
        }
    }

    // Set the initial state: 100% probability of being at height 0 with score 0.
    probabilityGrid[0][0] = 1;

    // Core dynamic programming loop to calculate probabilities for all states.
    // outerLoopCounter iterates through heights up to heightDimension (exclusive).
    for (var outerLoopCounter = 0; outerLoopCounter < heightDimension; outerLoopCounter++) {
        // innerLoopCounter iterates through possible moves/actions based on 'widthDimension'.
        for (var innerLoopCounter = 0; innerLoopCounter < widthDimension; innerLoopCounter++) {
            // Calculate the next potential height after a step.
            var nextHeight = outerLoopCounter + stepValues[innerLoopCounter];
            // Ensure the next height does not exceed the maximum height.
            if (nextHeight > heightDimension) {
                nextHeight = heightDimension;
            }

            // scoreAccumulator iterates through all possible score values.
            for (var scoreAccumulator = 0; scoreAccumulator <= 5000; scoreAccumulator++) {
                // Check if there's a special event at the 'nextHeight'.
                if (eventRegistry[nextHeight] !== undefined) {
                    var effectKind = eventRegistry[nextHeight][0];    // Type of effect (1: height change, 2: score add, 3: score subtract).
                    var effectMagnitude = eventRegistry[nextHeight][1]; // Magnitude of the effect.

                    // Apply the effect based on its type.
                    if (effectKind === 1) {
                        // Effect 1: Change height.
                        // Add probability from current state to new height with same score.
                        probabilityGrid[nextHeight + effectMagnitude][scoreAccumulator] += probabilityGrid[outerLoopCounter][scoreAccumulator] / widthDimension;
                    } else if (effectKind === 2) {
                        // Effect 2: Add to score.
                        // Add probability from current state to same height with increased score.
                        probabilityGrid[nextHeight][scoreAccumulator + effectMagnitude] += probabilityGrid[outerLoopCounter][scoreAccumulator] / widthDimension;
                    } else if (effectKind === 3) {
                        // Effect 3: Subtract from score.
                        // Add probability from current state to same height with decreased score.
                        probabilityGrid[nextHeight][scoreAccumulator - effectMagnitude] += probabilityGrid[outerLoopCounter][scoreAccumulator] / widthDimension;
                    }
                } else {
                    // No special event: simply move to the next height with the same score.
                    probabilityGrid[nextHeight][scoreAccumulator] += probabilityGrid[outerLoopCounter][scoreAccumulator] / widthDimension;
                }
            }
        }
    }

    // Calculate the total expected score by summing (score * probability) for all final states.
    var totalExpectedResult = 0;
    for (var scoreAccumulator = 0; scoreAccumulator <= 5000; scoreAccumulator++) {
        totalExpectedResult += scoreAccumulator * probabilityGrid[heightDimension][scoreAccumulator];
    }

    // Output the final expected score, truncated to an integer.
    console.log(Math.floor(totalExpectedResult));
}