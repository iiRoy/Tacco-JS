function ProcessInput(rawData) {
    // This function takes a string representing total seconds and converts it into hours, minutes, and seconds.
    // It then prints the result in HH:MM:SS format.

    // First, parse the input string into an integer to get the total number of seconds.
    let totalSeconds = parseInt(rawData); // For example, if rawData is "46979", totalSeconds becomes 46979.

    // Calculate the number of complete hours. There are 3600 seconds in one hour.
    let hoursCount = Math.floor(totalSeconds / 3600); // If totalSeconds is 46979, hoursCount will be 13.

    // Determine the seconds remaining after accounting for the full hours.
    let remainingSecondsAfterHours = totalSeconds % 3600; // For 46979, this leaves 179 seconds.

    // Calculate the number of complete minutes from the remaining seconds. There are 60 seconds in one minute.
    let minutesCount = Math.floor(remainingSecondsAfterHours / 60); // With 179 seconds, minutesCount will be 2.

    // Determine the final seconds remaining after accounting for the full minutes.
    let remainingSecondsAfterMinutes = remainingSecondsAfterHours % 60; // From 179 seconds, this leaves 59 seconds.

    // Assign the final calculated seconds to a dedicated variable for clarity.
    let secondsCount = remainingSecondsAfterMinutes; // So, secondsCount is 59.

    // Output the formatted time to the console.
    console.log(hoursCount + ":" + minutesCount + ":" + secondsCount);
}

// This helper function is typically used for debugging purposes within a web browser environment.
// It retrieves input from a specific HTML element and passes it to the main processing logic.
function performDebugOperation() {
    // Access the value property of the HTML element identified by "input".
    let debugInputValue = document.getElementById("input").value;
    // Invoke the primary time conversion function with the retrieved debug data.
    ProcessInput(debugInputValue);
}

// The following line is crucial for execution in environments like Node.js,
// where input is provided via standard input. It should not be altered.
// It reads the entire content of the standard input stream, decodes it as UTF-8,
// and then passes this content to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
