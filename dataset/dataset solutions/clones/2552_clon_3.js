// This module processes a weather observation to predict the next state.
function predictNextWeatherState(incomingWeatherString) {
    // Validate the incoming data string.
    // If it's not a string or is effectively empty, log an error and exit.
    if (typeof incomingWeatherString !== 'string' || incomingWeatherString.trim().length === 0) {
        console.error("Input error: The weather report string is invalid or empty.");
        return; // Halt execution for bad input.
    }

    // Split the input into individual lines.
    // We are primarily interested in the first line for the current weather condition.
    const reportLines = incomingWeatherString.split('\n');

    // Ensure there's at least one non-empty line to process.
    if (reportLines.length === 0 || reportLines[0].trim().length === 0) {
        console.error("Processing error: No discernible weather condition found in the first line.");
        return; // Halt execution.
    }

    // Extract and normalize the current weather condition from the first line.
    const observedCurrentCondition = reportLines[0].trim();

    // Define the weather state transition rules using a Map for clarity and extensibility.
    // This replaces a traditional switch statement with a data-driven approach.
    const weatherTransitionRules = new Map();
    weatherTransitionRules.set("Sunny", "Cloudy");
    weatherTransitionRules.set("Cloudy", "Rainy");
    weatherTransitionRules.set("Rainy", "Sunny");
    // No explicit 'break' statements needed with this pattern, simplifying flow.

    let resultingPredictedState = "Indeterminate"; // Initialize with a default 'unknown' state.

    // Check if the observed condition is one of our known states.
    if (weatherTransitionRules.has(observedCurrentCondition)) {
        // Retrieve the corresponding next state.
        resultingPredictedState = weatherTransitionRules.get(observedCurrentCondition);
    } else {
        // Handle cases where the input condition is not recognized.
        // This is an added validation/error handling fragment.
        console.warn(`Alert: The observed condition '${observedCurrentCondition}' is not a recognized state. Outputting default.`);
    }

    // Prepare the final message for display.
    // This is an intermediate variable introduction.
    const outputMessage = resultingPredictedState;

    // Log the predicted next weather state to the console.
    console.log(outputMessage);
}

// --- Standard Input Handling Section ---
// DO NOT EDIT THE LINES BELOW THIS POINT.
// This code snippet handles reading input from standard input and
// passes it to the main processing function 'predictNextWeatherState'.
predictNextWeatherState(require("fs").readFileSync("/dev/stdin", "utf8"));