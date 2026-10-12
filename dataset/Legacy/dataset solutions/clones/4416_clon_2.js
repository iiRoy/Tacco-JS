function ProcessInput(rawData) {
    // The raw input string is expected to contain four space-separated numbers.
    // These numbers define two intervals: [num1, num2] and [num3, num4].
    // We aim to find the length of their intersection.

    // First, split the input string into an array of string representations of numbers.
    let parsedValues = rawData.split(" ");

    // Convert each string component to an integer using base 10.
    // The first element is the start of the first interval.
    parsedValues[0] = parseInt(parsedValues[0], 10);
    // The second element is the end of the first interval.
    parsedValues[1] = parseInt(parsedValues[1], 10);
    // The third element is the start of the second interval.
    parsedValues[2] = parseInt(parsedValues[2], 10);
    // The fourth element is the end of the second interval.
    parsedValues[3] = parseInt(parsedValues[3], 10);

    // Check for cases where there is no overlap or the overlap length is zero.
    // If the second interval begins at or after the first interval concludes, there's no positive overlap.
    if (parsedValues[2] >= parsedValues[1]) {
        console.log(0); // Output 0 as the intersection length.
    }
    // Alternatively, if the second interval finishes at or before the first interval commences, there's no positive overlap.
    else if (parsedValues[3] <= parsedValues[0]) {
        console.log(0); // Output 0 as the intersection length.
    }
    // If the above conditions are not met, an overlap exists, and we need to calculate its length.
    else {
        let overlapStartPoint; // This variable will store the starting coordinate of the intersection.
        // Determine the actual start of the overlapping segment. It's the maximum of the two interval start points.
        if (parsedValues[0] < parsedValues[2]) {
            overlapStartPoint = parsedValues[2]; // The second interval starts later.
        } else {
            overlapStartPoint = parsedValues[0]; // The first interval starts later or at the same point.
        }

        let overlapEndPoint; // This variable will store the ending coordinate of the intersection.
        // Determine the actual end of the overlapping segment. It's the minimum of the two interval end points.
        if (parsedValues[1] < parsedValues[3]) {
            overlapEndPoint = parsedValues[1]; // The first interval ends earlier.
        } else {
            overlapEndPoint = parsedValues[3]; // The second interval ends earlier or at the same point.
        }

        // The length of the intersection is the difference between its end and start points.
        console.log('%d', overlapEndPoint - overlapStartPoint);
    }
}

// Read the entire content from standard input, assuming UTF-8 encoding.
// Then, pass this content to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
