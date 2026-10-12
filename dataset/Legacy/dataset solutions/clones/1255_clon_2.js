process.stdin.resume();
process.stdin.setEncoding('utf8');

// This event listener processes incoming data from standard input.
process.stdin.on('data', function (dataBlock) {
    // Split the raw data into individual lines.
    let lineSegments = dataBlock.split("\n");
    // Initialize an empty string for potential output, though not used in this version.
    let resultString = "";
    // Get the initial count of line segments.
    let segmentCount = lineSegments.length;

    // Iterate through the line segments to remove any empty strings.
    for (let idx = 0; idx < segmentCount; idx++) {
        if (lineSegments[idx] === "") {
            // If an empty segment is found, remove it.
            lineSegments.splice(idx, 1);
            // Decrement the total count and the current index to re-check the new element at 'idx'.
            segmentCount--;
            idx--;
        }
    }

    // The first valid line contains the total count of numbers to expect.
    const totalNumbers = Number(lineSegments[0]);
    // The second valid line contains the space-separated numbers.
    const numberStrings = lineSegments[1].split(" ");

    // Initialize minimum, maximum, and sum with the first number.
    let minimumValue = Number(numberStrings[0]);
    let maximumValue = Number(numberStrings[0]);
    let totalSum = Number(numberStrings[0]);

    // Loop through the remaining numbers, starting from the second one.
    for (let counter = 1; counter < totalNumbers; counter++) {
        const currentNumber = Number(numberStrings[counter]);

        // Update minimum if the current number is smaller.
        if (minimumValue > currentNumber) {
            minimumValue = currentNumber;
        }

        // Update maximum if the current number is larger.
        if (maximumValue < currentNumber) {
            maximumValue = currentNumber;
        }

        // Add the current number to the running total.
        totalSum += currentNumber;
    }

    // Print the calculated minimum, maximum, and sum, separated by spaces.
    console.log(minimumValue + " " + maximumValue + " " + totalSum);
});
