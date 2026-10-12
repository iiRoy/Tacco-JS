function processInput(rawData) {
    // Normalize the incoming data: remove leading/trailing whitespace and split into individual lines.
    rawData = rawData.trim().split("\n");

    // Parse the initial numerical value from the first line of the input.
    // It's assumed the first line contains a single number or a space-separated string where the first part is the number.
    var totalCapacity = parseInt(rawData[0].split(" ")[0], 10);

    // Initialize a variable to accumulate a sum from subsequent data.
    var elapsedTime = 0;

    // Iterate through the elements of the second line of the input.
    // Each element is expected to be a number, separated by spaces.
    rawData[1].split(" ").forEach(currentValue => {
        // Convert the current string element to an integer and add it to the accumulator.
        elapsedTime += parseInt(currentValue, 10);
    });

    // Evaluate the difference between the initial capacity and the accumulated time.
    // If the result is negative, it indicates an overflow or insufficient capacity.
    if (totalCapacity - elapsedTime < 0) {
        // Output a specific error code for negative results.
        console.log(-1);
    } else {
        // Otherwise, output the calculated remaining capacity.
        console.log(totalCapacity - elapsedTime);
    }
}

// Read the entire content of standard input synchronously and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
