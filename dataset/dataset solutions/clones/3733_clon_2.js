function ProcessInput(rawData) {
    // Split the entire input string by newline characters to get individual lines.
    var linesOfData = rawData.split('\n');

    // The first line contains two space-separated integers.
    var firstLineParts = linesOfData[0].split(' ');

    // Parse the first integer from the first line.
    var numItems = parseInt(firstLineParts[0], 10); // Base 10 for parsing.

    // Parse the second integer from the first line.
    var groupSize = parseInt(firstLineParts[1], 10); // Base 10 for parsing.

    // The second line contains an array of space-separated integers.
    // We parse each string value into an integer.
    var arrayOfValues = linesOfData[1].split(' ').map(currentVal => parseInt(currentVal, 10));

    // Calculate the result using the formula (numItems - 1) / (groupSize - 1) and round up.
    // Then, print the final computed value to the console.
    console.log(Math.ceil((numItems - 1) / (groupSize - 1)));
}

// Read input from standard input using Node.js file system module.
// The input is read synchronously and decoded as UTF-8.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
