// This module defines a function for processing a resource interaction scenario.

function ProcessResourceInteraction(rawInputDataString) {
    // The input string is expected to contain four numerical values,
    // separated by spaces, representing different parameters of an interaction.

    // First, split the input string into individual components.
    const numericalTokens = rawInputDataString.split(" ");

    // Basic validation: ensure we have the expected number of input parts.
    // While not present in the original, this adds robustness.
    if (numericalTokens.length !== 4) {
        console.error("Error: Insufficient or excessive input parameters provided. Expected four numeric values.");
        // In a production system, this might throw an exception or handle differently.
        return;
    }

    // Convert the string tokens into their numerical equivalents.
    // Using descriptive names to clarify their roles in the simulation.
    let firstEntityVitality = Number(numericalTokens[0]);   // Corresponds to 'a' in the original context
    const firstEntityImpact = Number(numericalTokens[1]);    // Corresponds to 'b'
    let secondEntityVitality = Number(numericalTokens[2]);  // Corresponds to 'c'
    const secondEntityImpact = Number(numericalTokens[3]);   // Corresponds to 'd'

    // Optional: Introduce a counter to track the number of cycles/rounds in the interaction.
    let interactionCycleCounter = 0;

    // Simulate the cyclical resource depletion process.
    // The loop continues as long as both entities possess positive vitality.
    // The second entity always takes damage first in each cycle.
    while (secondEntityVitality > 0 && firstEntityVitality > 0) {
        interactionCycleCounter++; // Increment the cycle count.

        // The second entity's vitality is reduced by the first entity's impact.
        secondEntityVitality = secondEntityVitality - firstEntityImpact;

        // Check if the second entity's vitality has dropped to zero or below.
        if (secondEntityVitality <= 0) {
            // If the second entity is incapacitated, the interaction concludes.
            // The first entity is considered the "survivor" by default.
            break; // Exit the loop prematurely.
        }

        // If the second entity is still active, it retaliates.
        // The first entity's vitality is reduced by the second entity's impact.
        firstEntityVitality = firstEntityVitality - secondEntityImpact;

        // The loop condition will re-evaluate 'firstEntityVitality > 0'
        // at the start of the next cycle, so no immediate break is needed here.
    }

    // After the interaction concludes, determine the final outcome.
    // The result depends on whether the first entity still has positive vitality.
    let finalOutcomeMessage;
    if (firstEntityVitality > 0) {
        finalOutcomeMessage = 'Yes'; // First entity survived.
    } else {
        finalOutcomeMessage = 'No';  // First entity was incapacitated.
    }

    // Output the determined outcome to the console.
    console.log(finalOutcomeMessage);
}

// The following line handles standard input/output for the execution environment.
// It reads all data from standard input and passes it to the main processing function.
ProcessResourceInteraction(require("fs").readFileSync("/dev/stdin", "utf8"));