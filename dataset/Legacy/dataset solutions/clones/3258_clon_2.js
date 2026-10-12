function ProcessData(rawData) {
    // Split the raw input string into lines
    rawData = rawData.split("\n");

    // Extract the numeric sequence from the second line
    let numericSequence = rawData[1].split(" ");
    // Convert string elements to integers
    numericSequence = numericSequence.map(textVal => parseInt(textVal, 10));

    // Get the length of the sequence from the first line
    const sequenceLength = parseInt(rawData[0], 10);

    // Initialize a variable to accumulate increments
    let totalIncrement = 0;

    // Iterate through the sequence to calculate the total increment
    for (let idx = 0; idx < sequenceLength; idx++) {
        // If it's the first element, add its value directly
        // Otherwise, if the current element is greater than the previous, add the difference
        totalIncrement += (idx === 0) ? numericSequence[idx] : ((numericSequence[idx - 1] < numericSequence[idx]) ? (numericSequence[idx] - numericSequence[idx - 1]) : 0);
    }

    // Output the final calculated total increment
    console.log(totalIncrement);
}

// *This line and below should not be edited (reads from standard input and calls ProcessData)
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
