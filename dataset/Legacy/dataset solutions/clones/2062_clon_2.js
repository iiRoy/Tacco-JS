// This function serves as the primary entry point for processing the provided input data.
function ProcessInput(rawData) {
    // The raw input string is first split into an array of individual lines.
    let linesOfData = rawData.split("\n");

    // We iterate through the array of lines, processing two lines at a time.
    // The first line of each pair contains an integer 'N', and the second contains a sequence of digits.
    for (let outerLoopIndex = 0; outerLoopIndex < linesOfData.length; outerLoopIndex += 2) {
        // Parse the current line as an integer, which represents the value 'N' for this iteration.
        let currentNValue = parseInt(linesOfData[outerLoopIndex]);

        // The next line is split into an array of character strings, each representing a digit.
        let charArray = linesOfData[outerLoopIndex + 1].split("");

        // This array of character digits is then mapped to an array of actual numbers.
        let numArray = charArray.map(Number);

        // This nested loop structure performs a specific transformation on the numArray.
        // The outer part of this loop runs from 'N' down to 2.
        for (let innerLoopCounter = currentNValue; innerLoopCounter > 1; innerLoopCounter--) {
            // The inner part of this loop executes 'innerLoopCounter' times.
            for (let innermostLoopIndex = 0; innermostLoopIndex < innerLoopCounter; innermostLoopIndex++) {
                // Calculate the absolute difference between the first two elements of the array.
                let differenceValue = Math.abs(numArray[0] - numArray[1]);
                // Add this calculated difference to the end of the array.
                numArray.push(differenceValue);
                // Remove the first element from the array, effectively shifting elements.
                numArray.shift();
            }
            // After the inner loop completes, the last element of the array is removed.
            numArray.pop();
        }
        // Finally, the first (and only remaining) element of the processed array is printed to the console.
        console.log(numArray[0]);
    }
}

// The program starts by reading the entire content of standard input as a UTF-8 string.
// This content is then passed to the 'ProcessInput' function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
