function ProcessInputData(rawText) {
    // The incoming raw text is split into an array of lines.
    var lineSegments = rawText.split("\n");

    // A variable to hold the running total of calculated values.
    var cumulativeTotal = 0;

    // Loop through the array of lines, starting from the second element (index 1).
    // The first line is often a header or not part of the data to be processed.
    for (var segmentIndex = 1; segmentIndex < lineSegments.length; segmentIndex++) {
        // Each line is further split by a space to get two boundary values.
        var boundaryValues = lineSegments[segmentIndex].split(" ");

        // Calculate the count within the current range [boundaryValues[0], boundaryValues[1]]
        // and add it to the cumulative total. The calculation is (end - start + 1).
        cumulativeTotal += boundaryValues[1] - boundaryValues[0] + 1;
    }

    // Output the final computed sum to the standard console.
    console.log(cumulativeTotal);
}

// This line reads the entire content from standard input,
// decodes it as UTF-8, removes any leading or trailing whitespace,
// and then passes this cleaned string to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
