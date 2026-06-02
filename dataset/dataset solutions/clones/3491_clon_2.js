'use strict';

// This function processes the raw input data to find a minimum value based on a threshold.
function ProcessInput(rawData) {
    // Split the entire input string into an array of lines.
    const linesArray = rawData.split("\n");

    // Extract the threshold value from the first line.
    // The threshold is the second number on the first line.
    const thresholdValue = Number(linesArray[0].split(" ")[1]);

    // Remove the first line as it's already processed for the threshold.
    linesArray.shift();

    // Initialize a variable to store the minimum cost found so far.
    // Using a large number to ensure any valid cost will be smaller.
    let minimumCost = 9999;

    // Iterate through the remaining lines of input.
    for (let idx = 0; idx < linesArray.length; idx++) {
        // Parse the current line into an array of numbers.
        // Each line contains two numbers separated by a space.
        let currentEntry = linesArray[idx].split(" ").map(numStr => Number(numStr));

        // Check if the second number (cost) is within the threshold
        // AND if the first number (value) is less than the current minimum cost.
        if (currentEntry[1] <= thresholdValue && currentEntry[0] < minimumCost) {
            // If both conditions are met, update the minimum cost.
            minimumCost = currentEntry[0];
        }
    }

    // Output the result: if no valid cost was found (minimumCost is still 9999), print "TLE",
    // otherwise print the found minimum cost.
    console.log(minimumCost == 9999 ? "TLE" : minimumCost);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
