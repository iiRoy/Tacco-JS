function handleWeatherForecast(rawInputString) {
    const inputLines = rawInputString.split("\n");

    const retrieveCurrentCondition = () => {
        // Helper function to abstract getting the first line of input
        return inputLines[0];
    };

    const calculateNextWeatherState = (currentCondition) => {
        // Using a Map for state transitions instead of a switch statement
        const weatherTransitionMapping = new Map();
        weatherTransitionMapping.set("Sunny", "Cloudy");
        weatherTransitionMapping.set("Cloudy", "Rainy");
        weatherTransitionMapping.set("Rainy", "Sunny");

        // Retrieve the next state; returns undefined if currentCondition is not in the map
        const nextState = weatherTransitionMapping.get(currentCondition);
        return nextState;
    };

    // Introduce a temporary variable for the initial state
    const currentObservedCondition = retrieveCurrentCondition();

    // Calculate the predicted state using the helper function
    const predictedFutureCondition = calculateNextWeatherState(currentObservedCondition);

    // Only log if a valid transition was found, preserving original behavior for unknown inputs
    if (predictedFutureCondition !== undefined) {
        console.log(predictedFutureCondition);
    }
}

handleWeatherForecast(require("fs").readFileSync("/dev/stdin", "utf8"));
