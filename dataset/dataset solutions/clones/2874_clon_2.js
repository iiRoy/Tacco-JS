var inputLines = [];

var inputReader = require('readline');

var interfaceHandler = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandler.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

interfaceHandler.on('close', function () {
    // Parse the first line of input to extract numerical parameters
    var firstLineData = inputLines[0].split(" ");
    var paramN = Number(firstLineData[0]); // N is read but not used in the logic
    var startA = Number(firstLineData[1]);
    var startB = Number(firstLineData[2]);
    var endC = Number(firstLineData[3]);
    var endD = Number(firstLineData[4]);

    // Convert the second line of input into an array of characters
    var pathString = inputLines[1].split("");

    // Initialize a flag to track if a specific condition (three consecutive dots) is met
    var canPass = false;

    // Iterate through the path string to check for specific patterns and conditions
    for (var idx = 0; idx < pathString.length; idx++) {
        // Condition 1: Check for two consecutive '#' characters that block the path
        // If two '#' are found AND they are within the relevant range for A, C, or D
        if ((pathString[idx] === "#" && pathString[idx + 1] === "#") && startA <= idx && (idx + 1) <= Math.max(endC, endD)) {
            console.log("No"); // Output "No" if this blocking condition is met
            return (0);        // Terminate execution
        }

        // Condition 2: Check for three consecutive '.' characters that allow passage
        // If three '.' are found AND the sequence starts at or after B
        // AND the sequence ends at or before D (or the second dot is at D)
        if ((pathString[idx] === "." && pathString[idx + 1] === "." && pathString[idx + 2] === ".") && startB <= idx && (idx + 3 <= endD || idx + 1 === endD)) {
            canPass = true; // Set the flag to true if this passage condition is met
        }
    }

    // Final condition check, specifically for cases where D is less than C
    // This implies a specific scenario where B might need to pass C to reach D.
    // It checks for obstacles around D and B, and if the 'canPass' flag is false.
    if (endD < endC && (pathString[endD - 2] === "#" || pathString[endD] === "#") && (pathString[startB - 2] === "#" || pathString[startB] === "#") && canPass === false) {
        console.log("No"); // Output "No" if this complex blocking condition is met
        return (0);        // Terminate execution
    }

    // If none of the "No" conditions were met throughout the checks, output "Yes"
    console.log("Yes");
});
