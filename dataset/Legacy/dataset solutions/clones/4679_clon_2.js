"use strict"; // Enforce strict mode for cleaner code execution.

// This function processes the input string to calculate the minimum distance between two segments.
const processInput = (inputString) => {
    // Split the entire input string into an array of lines based on newline characters.
    let inputLines = inputString.split("\n");

    // The first line contains three space-separated integer values.
    // Split this first line to get the individual string parts.
    const firstLineValues = inputLines[0].split(" ");

    // Parse the string parts into integers.
    // 'widthVal' represents the width of the segments.
    const widthVal = parseInt(firstLineValues[0], 10);
    // 'positionA' represents the starting position of the first segment.
    const positionA = parseInt(firstLineValues[1], 10);
    // 'positionB' represents the starting position of the second segment.
    const positionB = parseInt(firstLineValues[2], 10);

    // Check if the two segments overlap or touch.
    // A segment starting at 'positionA' with 'widthVal' ends at 'positionA + widthVal'.
    // If the end of segment A is past the start of segment B, OR
    // if the end of segment B is past the start of segment A, then they overlap or touch.
    if ((positionA + widthVal) > positionB || (positionB + widthVal) > positionA) {
        // If there is any overlap or touching, the minimum distance is 0.
        console.log(0);
        return; // Exit the function as the result is found.
    }

    // If no overlap, calculate the actual minimum distance between the segments.
    // This involves finding which segment starts earlier and calculating the gap.
    // If segment A starts before segment B, the distance is 'positionB' minus the end of segment A.
    // Otherwise (segment B starts before segment A), the distance is 'positionA' minus the end of segment B.
    console.log(positionA < positionB ? positionB - (positionA + widthVal) : positionA - (positionB + widthVal));
};

// Read the entire content from standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, pass the read content to the 'processInput' function for calculation.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
