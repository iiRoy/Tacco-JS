var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input
var lineData = (rawData.replace(/\n$/, "")).split("\n"); // Split input into an array of lines, removing any trailing newline
var numCases = lineData.shift() - 0; // Extract the number of test cases from the first line and convert to number

// Iterate through each test case
for (var caseIdx = 0; caseIdx < numCases; caseIdx++) {
    var caseNums = lineData[caseIdx].split(" ").map(Number); // Parse the current line into an array of numbers
    var startVal = caseNums[0]; // Get the starting value for the current case
    var goalVal = caseNums[1]; // Get the target value for the current case

    var resultPath = [startVal]; // Initialize the path array with the starting value
    var directionModifier = 1; // Initialize a modifier for the special movement logic

    // Case 1: Starting value is less than the goal value
    if (startVal < goalVal) {
        do {
            startVal++; // Increment the value
            resultPath.push(startVal); // Add the new value to the path
        } while (startVal != goalVal); // Continue until the goal is reached
    }
    // Case 2: Starting value is greater than the goal value and less than or equal to 5
    else if (startVal > goalVal && startVal <= 5) {
        do {
            startVal--; // Decrement the value
            resultPath.push(startVal); // Add the new value to the path
        } while (startVal != goalVal); // Continue until the goal is reached
    }
    // Case 3: Starting value is greater than the goal value and greater than or equal to 6 (special movement)
    else if (startVal > goalVal && startVal >= 6) {
        do {
            startVal += directionModifier; // Apply the current direction modifier
            if (startVal === 10) { // If the value reaches 10
                startVal = 5; // Reset it to 5
                directionModifier = -1; // Change direction to decrement
            }
            if (startVal === 0) { // If the value reaches 0
                directionModifier = 1; // Change direction to increment
            }
            resultPath.push(startVal); // Add the current value to the path
        } while (startVal !== goalVal); // Continue until the goal is reached
    }
    // Output the generated path, with values separated by spaces
    console.log(resultPath.join(" "));
}
