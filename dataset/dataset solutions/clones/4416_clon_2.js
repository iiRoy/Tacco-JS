/*
 * This module computes the length of the intersection of two intervals.
 * The input is expected to be a string containing four space-separated integers.
 */
function CalculateIntersectionLength(rawStringData) {
    // Split the input string into individual string components.
    let numericValuesArray = rawStringData.split(" ");


    // Parse each string component into an integer.
    // The radix '10' ensures decimal parsing.
    numericValuesArray[0] = parseInt(numericValuesArray[0], 10);
    numericValuesArray[1] = parseInt(numericValuesArray[1], 10);
    numericValuesArray[2] = parseInt(numericValuesArray[2], 10);
    numericValuesArray[3] = parseInt(numericValuesArray[3], 10);


    // Check if the intervals do not overlap at all.
    // Condition 1: The second interval starts at or after the first interval ends.
    if (numericValuesArray[2] >= numericValuesArray[1]) {
        console.log(0); // No overlap, so length is zero.
    }
    // Condition 2: The second interval ends at or before the first interval starts.
    else if (numericValuesArray[3] <= numericValuesArray[0]) {
        console.log(0); // No overlap, so length is zero.
    }
    // If neither of the above conditions is met, an overlap exists.
    else {
        // Determine the starting point of the intersection.
        // This is the maximum of the two interval start points.
        let intersectionStart;
        if (numericValuesArray[0] < numericValuesArray[2]) {
            intersectionStart = numericValuesArray[2];
        } else {
            intersectionStart = numericValuesArray[0];
        }


        // Determine the ending point of the intersection.
        // This is the minimum of the two interval end points.
        let intersectionEnd;
        if (numericValuesArray[1] < numericValuesArray[3]) {
            intersectionEnd = numericValuesArray[1];
        } else {
            intersectionEnd = numericValuesArray[3];
        }


        // Calculate and display the length of the overlapping segment.
        console.log('%d', intersectionEnd - intersectionStart);
    }
}

// Invoke the main processing function with data read from standard input.
// This assumes a Node.js environment where 'fs' module is available.
CalculateIntersectionLength(require("fs").readFileSync("/dev/stdin", "utf8"));