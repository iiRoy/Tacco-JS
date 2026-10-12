function ProcessInput(rawData) {
    // Divide the incoming raw data string into an array of separate lines.
    var textRows = rawData.split("\n");

    // Generate an array of labels by taking the first word from each line.
    // This operation skips the initial line and the final two lines of the input.
    var itemLabels = textRows.map(currentRow => currentRow.split(' ')[0]).splice(1, textRows.length - 3);

    // Determine the starting position for summation by finding the index
    // of the second-to-last line's content within the 'itemLabels' array.
    var startIndex = itemLabels.indexOf(textRows[textRows.length - 2]);

    // Initialize an accumulator for the numeric values.
    var totalValue = 0;

    // Loop through a specific segment of the 'textRows' array.
    // The iteration begins two positions after 'startIndex' and concludes
    // two positions before the end of the 'textRows' collection.
    for (var idx = startIndex + 2; idx < textRows.length - 2; idx++) {
        // For each line in the designated segment, extract the second word,
        // convert it to a numerical type, and add it to the running total.
        totalValue += Number(textRows[idx].split(' ')[1]);
    }

    // Display the computed total value to the standard output.
    console.log(totalValue);
}

// Acquire the input content from the standard input stream
// and then invoke the primary processing function with this data.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
