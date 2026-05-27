function ProcessData(initialInputString) {
    // The entire input string is first split into an array of individual lines.
    // Each element in 'initialInputString' will now correspond to a line from the input.
    initialInputString = initialInputString.split("\n");

    // We parse each line into an integer, then filter out the very first element.
    // The first element is often a metadata line (e.g., count) and not part of the data to be processed.
    let numericData = initialInputString.map((currentLineStr) => parseInt(currentLineStr, 10)).filter((val, lineIndex) => (lineIndex !== 0));

    // This variable is declared but its value is not utilized in the final output logic of this function.
    let unusedCounter = 0;

    // Iterate through each numerical value in the 'numericData' array.
    numericData.forEach((currentNumber, outerIndex) => {
        // For each 'currentNumber', we determine the maximum value among all other numbers in the 'numericData' array.
        // This is achieved by filtering out the 'currentNumber' itself (using 'outerIndex'),
        // and then applying a 'reduce' operation to find the maximum among the remaining elements.
        console.log(
            numericData.filter((innerNumber, innerIndex) => (innerIndex !== outerIndex))
                       .reduce((accumulatorMax, currentComparison) => (Math.max(accumulatorMax, currentComparison)))
        );
    });

    // The 'unusedCounter' variable is not printed to the console in this implementation.
    // console.log(unusedCounter);
}

// The following section handles reading input from a file and invoking the main processing function.
// This part should remain unchanged to ensure proper execution environment interaction.
// ProcessData(require("fs").readFileSync("/dev/stdin", "utf8")); // Uncomment for standard input usage.
ProcessData(require('fs').readFileSync('./input.txt', 'utf-8')); // Reads from 'input.txt' for execution.
