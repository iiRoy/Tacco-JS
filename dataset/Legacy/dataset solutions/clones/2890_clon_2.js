// This function processes the provided text.
function ProcessInputData(rawData) {
    // Split the raw input into individual lines.
    var processedLines = rawData.split("\n");

    // Extract the first line for processing.
    var filteredString = processedLines[0];

    // Remove all occurrences of the character 'o' from the string.
    filteredString = filteredString.replace(/o/g, "");

    // Check the length of the modified string.
    if (filteredString.length >= 8) {
        // If the length is 8 or more, print "NO".
        console.log("NO");
    } else {
        // Otherwise, print "YES".
        console.log("YES");
    }
}

// Do not modify the following line; it handles input reading and function invocation.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
