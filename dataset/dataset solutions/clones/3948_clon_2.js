let stringRows = []; // This list holds each line of text input.

let lineReaderTool = require('readline'); // Obtain the module for reading input line by line.

let inputHandler = lineReaderTool.createInterface({ // Set up an interface for standard I/O.
    input: process.stdin,   // Input stream comes from standard input.
    output: process.stdout  // Output stream goes to standard output.
});

inputHandler.on('line', function (receivedText) { // When a new line of text is received,
    stringRows.push(receivedText);                 // add it to our collection of lines.
});

inputHandler.on('close', function () { // Once the input stream is closed, execute the main processing routine.

    let numItems = Number(stringRows[0]); // Parse the first line as a number, representing the count of main items.

    // Process the second line: split by spaces, convert each part to a numeric value,
    // then insert sentinel zeros at the beginning and end of the sequence.
    let valueSequence = stringRows[1].split(" ").map(valStr => Number(valStr));
    valueSequence.unshift(0);
    valueSequence.push(0);

    let cumulativeVal = 0; // Initialize a variable to accumulate the total absolute difference.
    // Loop through the extended sequence to calculate the sum of absolute differences between adjacent elements.
    for (let idx = 1; idx < numItems + 2; idx++) {
        cumulativeVal += Math.abs(valueSequence[idx] - valueSequence[idx - 1]);
    }

    // Now, iterate through the actual data points (excluding the sentinels)
    // to compute and display a modified sum for each point.
    for (let idx = 1; idx < numItems + 1; idx++) {
        // The modification involves:
        // 1. Subtracting the absolute difference between the current element and its left neighbor.
        // 2. Subtracting the absolute difference between the current element and its right neighbor.
        // 3. Adding the absolute difference directly between the left and right neighbors (bypassing the current element).
        let currentOutput = cumulativeVal
            - (Math.abs(valueSequence[idx] - valueSequence[idx - 1]) + Math.abs(valueSequence[idx + 1] - valueSequence[idx]))
            + Math.abs(valueSequence[idx - 1] - valueSequence[idx + 1]);
        console.log(currentOutput); // Print the calculated result for the current item.
    }

});