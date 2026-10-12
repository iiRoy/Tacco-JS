// This function processes incoming text data and determines the next weather state.
function ProcessInput(rawData) {
    // Split the raw input string by newline characters to get individual lines.
    let processedLines = rawData.split("\n");

    // Evaluate the first line of the processed input.
    switch (processedLines[0]) {
        case "Sunny": // If the current weather is "Sunny"
            console.log("Cloudy"); // The next state will be "Cloudy"
            break; // Exit the switch statement

        case "Cloudy": // If the current weather is "Cloudy"
            console.log("Rainy"); // The next state will be "Rainy"
            break; // Exit the switch statement

        case "Rainy": // If the current weather is "Rainy"
            console.log("Sunny"); // The next state will be "Sunny"
            break; // Exit the switch statement
    }
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be modified as it manages the program's interaction with the environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
