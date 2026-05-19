process.stdin.resume();
process.stdin.setEncoding('utf8');

// This function handles incoming data from the standard input stream.
process.stdin.on('data', function (inputData) {
    // Convert the received data chunk to a string and then split it into an array of lines.
    var dataRows = inputData.toString().split('\n'); // Parse input into separate lines

    // Assign the array of parsed lines to a new variable for further processing.
    var numericValues = dataRows; // Prepare data for type conversion

    // Declare a variable to serve as a loop index.
    var idx;

    // Iterate through the array to convert each string element into an integer.
    for (idx = 0; idx < numericValues.length; idx++) {
        numericValues[idx] = parseInt(numericValues[idx]); // Convert string to integer type
    }

    // Perform another iteration over the array to output specific values.
    for (idx = 0; idx < numericValues.length; idx++) {
        // Check if the current numerical value is exactly zero.
        if (numericValues[idx] === 0) {
            // If the value is zero, no action is taken, as per the original logic.
        }
        // If the value is not zero, print it to the console with its corresponding case number.
        else {
            console.log("Case " + idx + ": " + numericValues[idx]); // Display case and its non-zero value
        }
    }
});
