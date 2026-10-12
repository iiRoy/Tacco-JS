// This function processes the entire incoming data.
function ProcessInput(rawData) {
    // The first line would typically be rawData[0], second rawData[1], etc.
    // rawData = rawData.split("\n"); // This line is commented out in the original, so keep it commented.

    // Determine the total character count of the received data.
    var dataLength = rawData.length;

    // Extract a substring from the beginning, excluding the last 8 characters.
    var resultString = rawData.substr(0, dataLength - 8);

    // Display the final processed string to standard output.
    console.log('%s', resultString);
}

// This utility function is intended for local testing or debugging purposes.
function testFunction() {
    // Retrieve content from a specific HTML element for simulation.
    var testData = document.getElementById("input").value;
    // Invoke the primary processing function with the retrieved test data.
    ProcessInput(testData);
}

// The following section should not be modified. It handles reading from standard input and invoking the main processing logic.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
