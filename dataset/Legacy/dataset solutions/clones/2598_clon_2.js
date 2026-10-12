function ProcessInputData(rawInputContent) {
    // Split the entire input string by newline characters to get individual lines.
    let inputLines = rawInputContent.split("\n");

    // The first line contains the count of elements as a string.
    let elementCountString = inputLines[0];
    // The second line contains space-separated numbers; parse them into an array of integers.
    let numericValues = inputLines[1].split(" ").map((val) => parseInt(val, 10));

    // Initialize variables to keep track of the maximum non-increasing sequence length.
    let longestDecreasingRun = 0;
    let currentRunLength = 0;

    // Loop backwards through the array of numeric values.
    // The loop starts from (elementCountString - 1) and goes down to 0.
    // JavaScript implicitly converts elementCountString to a number for arithmetic operations.
    for (let loopIndex = (elementCountString - 1); loopIndex >= 0; loopIndex--) {
        // Output the current element and the element before it.
        // This includes cases where loopIndex - 1 is -1, resulting in undefined for numericValues[-1].
        console.log(numericValues[loopIndex], numericValues[loopIndex - 1]);

        // Check if the current element is less than or equal to the preceding element.
        // This condition identifies a non-increasing trend.
        if (numericValues[loopIndex] <= numericValues[loopIndex - 1]) {
            currentRunLength++; // Increment the length of the current non-increasing run.
            // If the current run is longer than the previously recorded longest run, update the maximum.
            if (currentRunLength > longestDecreasingRun) {
                longestDecreasingRun = currentRunLength;
            }
        } else {
            // If the current element is strictly greater than the preceding one, the run is broken.
            currentRunLength = 0; // Reset the current run length.
        }
    }

    // After iterating through all elements, print the maximum non-increasing run length found.
    console.log(longestDecreasingRun);
}

// This line is responsible for reading input from standard input and passing it to the main processing function.
// It uses Node.js's 'fs' module to synchronously read the content of '/dev/stdin' as a UTF-8 string.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
