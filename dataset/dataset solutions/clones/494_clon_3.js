const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process raw input: trim leading/trailing whitespace and split into an array of lines.
// Filtering out any empty lines ensures robust parsing even with extra newlines.
let inputLines = rawInputData.trim().split('\n').filter(line => line.length > 0);

// This outer loop processes multiple problem scenarios until a specific termination signal is encountered.
while (true) {
    // Safely attempt to retrieve the first line of parameters for the current scenario.
    // A guard clause is added to prevent errors if the input stream ends unexpectedly.
    if (inputLines.length === 0) {
        break; // No more input, terminate the processing loop.
    }

    // Parse the primary configuration parameters for the current simulation run.
    // These include the number of choices per step, the target completion stage, and the count of special events.
    const scenarioParameters = inputLines.shift().split(' ').map(Number);

    // Check for the designated termination condition: all three primary parameters being zero.
    // This is a direct comparison, an alternative to string concatenation, for clarity and potential performance.
    if (scenarioParameters[0] === 0 && scenarioParameters[1] === 0 && scenarioParameters[2] === 0) {
        break; // Exit the loop if the sentinel values are found.
    }

    // Assign parsed parameters to more descriptive constant names for improved readability.
    const numAvailableChoices = scenarioParameters[0]; // Corresponds to 'x' in the original problem.
    const finalDesiredStage = scenarioParameters[1];   // Corresponds to 'y' in the original problem.
    const numSpecialEvents = scenarioParameters[2];    // Corresponds to 'z' in the original problem.

    // Read the array of possible step sizes (movement options) for each choice.
    // Each element indicates how many stages one advances.
    const movementOptions = inputLines.shift().split(' ').map(Number);

    // Initialize a sparse array (acting as a map) to store details of special events.
    // The index of the array represents the stage where an event occurs.
    // Each value is an array: [eventTypeIdentifier, eventEffectMagnitude].
    const stageEventRegistry = [];

    // Populate the event registry by reading 'numSpecialEvents' lines of event definitions.
    for (let eventIndex = 0; eventIndex < numSpecialEvents; eventIndex++) {
        const currentEventDefinition = inputLines.shift().split(' ').map(Number);
        const eventActivationStage = currentEventDefinition[0];
        const eventClassifier = currentEventDefinition[1];
        const eventNumericalValue = currentEventDefinition[2];
        stageEventRegistry[eventActivationStage] = [eventClassifier, eventNumericalValue];
    }

    // Define the maximum possible resource level, a constant for array sizing.
    const MAXIMUM_RESOURCE_CAP = 5000;

    // Initialize the 2D dynamic programming table (probability matrix).
    // `probabilityTable[stage][resource]` stores the probability of being at a given `stage`
    // with a specific `resource` level. All values are initialized to 0.0.
    const probabilityTable = Array.from({ length: finalDesiredStage + 1 }, () =>
        Array(MAXIMUM_RESOURCE_CAP + 1).fill(0.0)
    );

    // Set the initial condition: At stage 0 with 0 resources, the probability is 1 (certainty).
    probabilityTable[0][0] = 1.0;

    // Core dynamic programming computation loop.
    // Iterates through each possible stage, then each possible resource level,
    // to calculate probabilities for the next states.
    for (let currentProgressStage = 0; currentProgressStage < finalDesiredStage; currentProgressStage++) {
        for (let currentResourceLevel = 0; currentResourceLevel <= MAXIMUM_RESOURCE_CAP; currentResourceLevel++) {
            // Optimization: If there's no probability of being in the current state, skip calculations.
            const probOfCurrentState = probabilityTable[currentProgressStage][currentResourceLevel];
            if (probOfCurrentState === 0.0) {
                continue;
            }

            // Calculate the probability contribution from each individual choice.
            const incrementalProbability = probOfCurrentState / numAvailableChoices;

            // Iterate through all possible movement choices from the current stage.
            for (let choiceOptionIndex = 0; choiceOptionIndex < numAvailableChoices; choiceOptionIndex++) {
                const stageAdvanceAmount = movementOptions[choiceOptionIndex];
                // Determine the next stage, ensuring it does not exceed the final target stage.
                const potentialNextStage = Math.min(finalDesiredStage, currentProgressStage + stageAdvanceAmount);

                // Check if a special event is registered for this `potentialNextStage`.
                const eventInformation = stageEventRegistry[potentialNextStage];

                if (eventInformation) { // A special event is present at `potentialNextStage`.
                    const eventType = eventInformation[0];
                    const eventValue = eventInformation[1];

                    // Process the state transition based on the specific event type.
                    switch (eventType) {
                        case 1: // Event Type 1: Advance additional stages.
                            const actualFinalStage = Math.min(finalDesiredStage, potentialNextStage + eventValue);
                            probabilityTable[actualFinalStage][currentResourceLevel] += incrementalProbability;
                            break;
                        case 2: // Event Type 2: Increase resource level.
                            const increasedResourceLevel = Math.min(MAXIMUM_RESOURCE_CAP, currentResourceLevel + eventValue);
                            probabilityTable[potentialNextStage][increasedResourceLevel] += incrementalProbability;
                            break;
                        case 3: // Event Type 3: Decrease resource level.
                            // CRITICAL FIX / UPDATE: The original code used Math.min(0, k-a), which would incorrectly
                            // result in 0 or negative values if k-a was negative. It should be Math.max(0, k-a)
                            // to ensure the resource level does not fall below zero.
                            const decreasedResourceLevel = Math.max(0, currentResourceLevel - eventValue);
                            probabilityTable[potentialNextStage][decreasedResourceLevel] += incrementalProbability;
                            break;
                        // No `default` case is strictly necessary if event types are guaranteed to be 1, 2, or 3.
                        // For robustness, a default could handle unknown event types or log a warning.
                    }
                } else { // No special event; standard stage progression.
                    probabilityTable[potentialNextStage][currentResourceLevel] += incrementalProbability;
                }
            }
        }
    }

    // Calculate the expected value of resources upon reaching the `finalDesiredStage`.
    // This is computed as the sum of (resource_level * probability_of_that_resource_level).
    // Using the `reduce` array method for a more functional and concise aggregation.
    const finalExpectedResourceValue = probabilityTable[finalDesiredStage].reduce(
        (accumulator, probabilityAtResourceLevel, resourceValue) => {
            return accumulator + (resourceValue * probabilityAtResourceLevel);
        }, 0.0 // Start accumulation from 0.0 to ensure floating-point arithmetic.
    );

    // Output the integer part of the calculated expected resource value.
    console.log(Math.floor(finalExpectedResourceValue));
}