"use strict";

// This function processes the given input string to find the minimum possible difference
// between the largest and smallest areas when a rectangle is divided into three pieces.
const processInput = (inputString) => {
    // First, clean up the input: remove any leading/trailing whitespace and split by newline characters.
    inputString = inputString.trim().split("\n");

    // Extract the initial dimensions (height and width) from the first line of the input.
    // The dimensions are space-separated integers.
    let heightVal = parseInt(inputString[0].split(" ")[0]);
    let widthVal = parseInt(inputString[0].split(" ")[1]);

    // Initialize a variable to store the minimum area difference found.
    // We start with a large value, typically the total area, as the maximum possible difference.
    let minAreaDiff = heightVal * widthVal;

    // Create an array to hold the areas of the three segments after each division.
    // It's initialized with 3 undefined elements.
    let areaSegments = [...Array(3)];

    // The problem requires considering two orientations of the rectangle (original and 90-degree rotated).
    // This loop runs twice to cover both scenarios.
    for (let rotationIdx = 0; rotationIdx < 2; rotationIdx++) {
        // Iterate through all possible horizontal split points for the first cut.
        // 'splitHeight' represents the height of the first piece, ranging from 1 to heightVal - 1.
        for (let splitHeight = 1; splitHeight < heightVal; splitHeight++) {
            // --- Scenario 1: First cut is horizontal, then the remaining part is split vertically. ---
            // Calculate the area of the first piece (a rectangle of splitHeight x widthVal).
            areaSegments[0] = splitHeight * widthVal;
            // The remaining rectangle has dimensions (heightVal - splitHeight) x widthVal.
            // This remaining part is then split vertically into two pieces.
            areaSegments[1] = (heightVal - splitHeight) * (widthVal / 2);
            // The third piece takes the remaining area.
            areaSegments[2] = (heightVal * widthVal) - (areaSegments[0] + areaSegments[1]);

            // Sort the areas of the three segments in ascending order.
            areaSegments.sort((a, b) => a - b);
            // Update the minimum difference if the current difference (largest - smallest) is smaller.
            minAreaDiff = Math.min(minAreaDiff, areaSegments[2] - areaSegments[0]);

            // --- Scenario 2: First cut is horizontal, then the remaining part is split horizontally. ---
            // The first piece is the same as in Scenario 1.
            areaSegments[0] = splitHeight * widthVal;
            // The remaining rectangle has dimensions (heightVal - splitHeight) x widthVal.
            // This remaining part is then split horizontally into two pieces.
            areaSegments[1] = ((heightVal - splitHeight) / 2) * widthVal;
            // The third piece takes the remaining area.
            areaSegments[2] = (heightVal * widthVal) - (areaSegments[0] + areaSegments[1]);

            // Sort the areas of the three segments again.
            areaSegments.sort((a, b) => a - b);
            // Update the minimum difference if the current difference is smaller.
            minAreaDiff = Math.min(minAreaDiff, areaSegments[2] - areaSegments[0]);
        }

        // After checking all possible splits for the current orientation,
        // swap the height and width values to simulate a 90-degree rotation for the next iteration.
        let temporaryDim = heightVal;
        heightVal = widthVal;
        widthVal = temporaryDim;
    }

    // Output the final calculated minimum area difference to the console.
    console.log(minAreaDiff);
};

// Read the entire content of standard input, decode it as UTF-8, and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
