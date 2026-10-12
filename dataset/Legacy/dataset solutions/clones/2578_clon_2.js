function ProcessInput(rawData) {
    // First, we parse the initial value from the input array.
    // This value typically represents the total number of elements to process.
    var countElements = parseInt(rawData[0], 10);

    // Next, we prepare the main data array by slicing the input
    // (removing the first element which was 'countElements')
    // and converting each remaining string element into an integer.
    const dataArray = rawData.slice(1).map(itemStr => parseInt(itemStr, 10));

    // Initialize a variable to accumulate the total sum.
    // The first element of our processed data array is added directly to start.
    var totalValue = dataArray[0];

    // We then iterate through the data array, starting from the second element.
    // The loop continues until we have processed all 'countElements'.
    for (var idx = 1; idx < countElements; idx++) {
        // Inside the loop, we check for a special condition:
        // if the current index 'idx' points to the very last element.
        if (idx === countElements - 1) {
            // If it's the last element, we add the value of the *previous* element
            // to our running total.
            totalValue += dataArray[idx - 1];
        } else {
            // For all other elements (not the last one),
            // we add the minimum value between the current element and the previous element
            // to our running total.
            totalValue += Math.min(dataArray[idx - 1], dataArray[idx]);
        }
    }

    // Finally, the computed total sum is printed to the console.
    console.log(totalValue);
}

// This section handles reading input from the standard input stream.
// It reads the entire content, converts it to a UTF-8 string,
// removes leading/trailing whitespace, and then splits it into an array
// using newline or space characters as delimiters.
// This prepared array is then passed to our main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
