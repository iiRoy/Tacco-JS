/*
 This script processes raw input data to calculate a specific count.
 It involves parsing numbers from the input and iterating through them
 to apply a set of conditional rules.
*/
function ProcessInput(rawData) {
    // Split the entire input string into individual lines.
    const dataLines = rawData.split("\n");

    // Take the first line and split it by space to get initial parameters.
    const firstLineParts = dataLines[0].split(" ");

    // Convert the first part to a number, representing the upper limit for iteration.
    const upperBound = Number(firstLineParts[0]);

    // Convert the second part to a number, representing the minimum required remainder.
    const minimumRemainder = Number(firstLineParts[1]);

    // Initialize a counter for the final result.
    let resultCount = 0;

    // Outer loop: iterate from 'minimumRemainder' (or 1 if 'minimumRemainder' is falsy) up to 'upperBound'.
    for (let firstNum = minimumRemainder || 1; firstNum <= upperBound; firstNum++) {
        // Inner loop: iterate from 'minimumRemainder' (or 1 if 'minimumRemainder' is falsy) up to 'upperBound'.
        for (let secondNum = minimumRemainder || 1; secondNum <= upperBound; secondNum++) {
            // Check if the first number is strictly less than the second number.
            if (firstNum < secondNum) {
                // If true, increment the result counter.
                resultCount++;
            } else {
                // Otherwise, check if the remainder of 'firstNum' divided by 'secondNum'
                // is greater than or equal to 'minimumRemainder'.
                if (firstNum % secondNum >= minimumRemainder) {
                    // If this condition is met, increment the result counter.
                    resultCount++;
                }
            }
        }
    }

    // Output the final calculated count to the console.
    console.log(resultCount);
}

// The following line handles standard input/output and should not be modified.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
