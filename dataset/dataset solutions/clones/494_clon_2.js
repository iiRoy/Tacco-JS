let dataStream = require('node:fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw data from the standard input source.

const linesOfData = dataStream.trim().split("\n"); // Process the input into an array of individual lines.

while (true) {
    // Loop indefinitely until a termination condition is met.

    let currentParams = linesOfData.shift().split(" ").map(Number); // Extract the initial set of parameters for the current scenario.

    if (currentParams.join(" ") === "0 0 0") {
        // Terminate the processing loop if the sentinel value is encountered.
        break;
    }

    let countX = currentParams[0];    // Represents the number of available options or choices.
    let maxLevel = currentParams[1];  // Denotes the maximum achievable level in the simulation.
    let eventCount = currentParams[2]; // Specifies the total number of special events or conditions.

    const levelIncrements = linesOfData.shift().split(" ").map(Number); // Parse the values representing potential level advancements.

    const specialEvents = []; // An array to store details about special occurrences, indexed by their trigger level.

    for (let eventIdx = 0; eventIdx < eventCount; eventIdx++) {
        // Iterate through each defined special event.
        const eventDetails = linesOfData.shift().split(" ").map(Number); // Retrieve the specific details for the current event.
        specialEvents[eventDetails[0]] = [eventDetails[1], eventDetails[2]]; // Store event properties (type, effect) indexed by their trigger level.
    }

    let dynamicProbabilities = []; // A 2D array for dynamic programming states, representing probabilities.

    for (let currentLvl = 0; currentLvl <= maxLevel; currentLvl++) {
        // Initialize the main dimension (levels) of the DP table.
        dynamicProbabilities[currentLvl] = [];

        for (let currentVal = 0; currentVal <= 5000; currentVal++) {
            // Initialize the secondary dimension (accumulated values) of the DP table with zero probabilities.
            dynamicProbabilities[currentLvl][currentVal] = 0;
        }
    }

    dynamicProbabilities[0][0] = 1; // Set the initial state probability: 100% chance of being at level 0 with value 0.

    // Main dynamic programming loop to calculate probabilities for all states.
    for (let currentLvl = 0; currentLvl < maxLevel; currentLvl++) {
        // Iterate through each possible level up to the maximum (exclusive).
        for (let currentVal = 0; currentVal <= 5000; currentVal++) {
            // Iterate through each possible accumulated value at the current level.

            if (dynamicProbabilities[currentLvl][currentVal] === 0) continue; // Skip states with zero probability.

            for (let optionIdx = 0; optionIdx < countX; optionIdx++) {
                // Consider each available advancement option.

                let nextLvl = Math.min(maxLevel, currentLvl + levelIncrements[optionIdx]); // Calculate the potential next level after an advancement, capped at maxLevel.
                const probabilityContribution = dynamicProbabilities[currentLvl][currentVal] / countX; // The probability distributed to the next state.

                if (specialEvents[nextLvl] !== undefined) {
                    // Check if a special event is triggered at the calculated next level.
                    let eventType = specialEvents[nextLvl][0];    // Type of the special event (1: level, 2: value+, 3: value-).
                    let eventEffect = specialEvents[nextLvl][1]; // Magnitude of the event's effect.

                    if (eventType === 1) {
                        // Event type 1: Level modification.
                        let modifiedLvl = Math.min(maxLevel, nextLvl + eventEffect);
                        dynamicProbabilities[modifiedLvl][currentVal] += probabilityContribution;
                    } else if (eventType === 2) {
                        // Event type 2: Value increase.
                        let modifiedVal = Math.min(5000, currentVal + eventEffect);
                        dynamicProbabilities[nextLvl][modifiedVal] += probabilityContribution;
                    } else if (eventType === 3) {
                        // Event type 3: Value decrease.
                        let modifiedVal = Math.max(0, currentVal - eventEffect);
                        dynamicProbabilities[nextLvl][modifiedVal] += probabilityContribution;
                    }
                } else {
                    // If no special event, just update probability for the next level with the same value.
                    dynamicProbabilities[nextLvl][currentVal] += probabilityContribution;
                }
            }
        }
    }

    let totalExpectedValue = 0; // Accumulator for the final expected value.

    for (let finalVal = 0; finalVal <= 5000; finalVal++) {
        // Calculate the sum of (value * probability) for the final level (maxLevel).
        totalExpectedValue += finalVal * dynamicProbabilities[maxLevel][finalVal];
    }

    console.log(Math.floor(totalExpectedValue)); // Output the integer part of the calculated expected value.
}