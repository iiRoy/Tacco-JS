let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove any trailing newline and split into an array of lines.
let lineArray = (rawData.replace(/\n$/, "")).split("\n");

// The first line contains the total number of test cases. Convert it to a number.
let numCases = lineArray.shift() - 0;

// Iterate through each individual test case.
for (let caseIdx = 0; caseIdx < numCases; caseIdx++) {
    // For the current test case, parse the line into an array of two numbers.
    let currentNums = lineArray[caseIdx].split(" ").map(Number);

    // Extract the starting value and the target value.
    let startVal = currentNums[0];
    let goalVal = currentNums[1];

    // Initialize an array to store the sequence of values, starting with the initial value.
    let resultPath = [startVal];

    // Determine the path based on the relationship between startVal and goalVal.
    if (startVal === goalVal) {
        // If start and goal are the same, no further steps are needed.
        // The path already contains the startVal.
    } else if (startVal < goalVal) {
        // If startVal is less than goalVal, increment startVal until it reaches goalVal.
        do {
            startVal++;
            resultPath.push(startVal);
        } while (startVal !== goalVal);
    } else if (startVal > goalVal && startVal <= 5) {
        // If startVal is greater than goalVal and also less than or equal to 5,
        // decrement startVal until it reaches goalVal.
        do {
            startVal--;
            resultPath.push(startVal);
        } while (startVal !== goalVal);
    } else {
        // This is the special case: startVal > goalVal and startVal > 5.
        // Increment startVal, but if it hits 10, reset it to 5.
        do {
            startVal++;
            if (startVal === 10) {
                startVal = 5;
            }
            resultPath.push(startVal);
        } while (startVal !== goalVal);
    }

    // Print the generated path, with values separated by spaces.
    console.log(resultPath.join(" "));
}
