const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// The input data is initially read as a single string.
// We then process it by splitting it into individual lines.
let lineSegments = rawData.trim().split("\n");

// This main loop continues to process sets of data until a specific termination signal is encountered.
while (true) {
    // Retrieve the first line from the array of input segments.
    let currentLine = lineSegments.shift();

    // Check if the current line signifies the end of input.
    if (currentLine === "0 0") {
        break; // Exit the processing loop.
    }

    // Parse the current line to extract two numerical dimensions.
    const dimensions = currentLine.split(" ").map(Number);

    // Initialize arrays to hold the height and width values for the current test case.
    const heightsList = [];
    const widthsList = [];

    // Populate the heightsList array based on the first dimension.
    // Each height value is read from a new line in the input.
    for (let idx = 0; idx < dimensions[0]; idx++) {
        heightsList.push(Number(lineSegments.shift()));
    }

    // Populate the widthsList array based on the second dimension.
    // Each width value is also read from a new line.
    for (let idx = 0; idx < dimensions[1]; idx++) {
        widthsList.push(Number(lineSegments.shift()));
    }

    // Create a frequency map for all possible contiguous sub-array sums within the heightsList.
    const heightSumsMap = {};
    for (let outerIdx = 0; outerIdx < heightsList.length; outerIdx++) {
        let partialSumH = 0; // This variable accumulates sums for sub-arrays starting at outerIdx.
        for (let innerIdx = outerIdx; innerIdx < heightsList.length; innerIdx++) {
            // If it's not the very first element of the current sub-array, add it to the partial sum.
            if (innerIdx !== outerIdx) {
                partialSumH += heightsList[innerIdx];
            }
            // The full sum for the sub-array from outerIdx to innerIdx is heightsList[outerIdx] + partialSumH.
            const currentSubarraySumH = heightsList[outerIdx] + partialSumH;
            // Increment the count for this sum in the map, or initialize it to 1 if it's new.
            if (heightSumsMap.hasOwnProperty(currentSubarraySumH)) {
                heightSumsMap[currentSubarraySumH]++;
            } else {
                heightSumsMap[currentSubarraySumH] = 1;
            }
        }
    }

    // Create a frequency map for all possible contiguous sub-array sums within the widthsList.
    const widthSumsMap = {};
    for (let outerIdx = 0; outerIdx < widthsList.length; outerIdx++) {
        let partialSumW = 0; // This variable accumulates sums for sub-arrays starting at outerIdx.
        for (let innerIdx = outerIdx; innerIdx < widthsList.length; innerIdx++) {
            // If it's not the very first element of the current sub-array, add it to the partial sum.
            if (innerIdx !== outerIdx) {
                partialSumW += widthsList[innerIdx];
            }
            // The full sum for the sub-array from outerIdx to innerIdx is widthsList[outerIdx] + partialSumW.
            const currentSubarraySumW = widthsList[outerIdx] + partialSumW;
            // Increment the count for this sum in the map, or initialize it to 1 if it's new.
            if (widthSumsMap.hasOwnProperty(currentSubarraySumW)) {
                widthSumsMap[currentSubarraySumW]++;
            } else {
                widthSumsMap[currentSubarraySumW] = 1;
            }
        }
    }

    // Calculate the total number of pairs of sub-arrays (one from heights, one from widths)
    // that have the same sum.
    let matchCount = 0;
    // Iterate through each unique sum found in the heightSumsMap.
    for (const keyVal in heightSumsMap) {
        // If this sum also exists in the widthSumsMap, it means we have matching sub-arrays.
        if (widthSumsMap.hasOwnProperty(keyVal)) {
            // Multiply the frequencies of this sum from both maps and add to the total count.
            matchCount += heightSumsMap[keyVal] * widthSumsMap[keyVal];
        }
    }

    // Output the final calculated count for the current test case.
    console.log(matchCount);
}
