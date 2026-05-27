// This function processes raw input data to determine a specific condition.
function ProcessInputData(rawInputString) {
    // Split the entire input string into individual lines based on newline characters.
    let lineSegments = rawInputString.split("\n");

    // From the processed lines, take the second line (index 1) and split it by spaces
    // to obtain an array of individual string elements.
    const numericStrings = lineSegments[1].split(" ");

    // Initialize a boolean indicator. It will be set to true if a specific value is found.
    let foundYValue = false;

    // Iterate over each element in the 'numericStrings' array.
    numericStrings.forEach(function(currentSegment) {
        // Check if the current string segment is exactly "Y".
        if (currentSegment == "Y") {
            // If "Y" is found, attempt to set the indicator.
            // Note: The original code contains a typo 'ture' instead of 'true'.
            // This typo is preserved to maintain exact behavioral equivalence,
            // as per Type II cloning rules. If 'ture' is not defined, this will
            // result in a ReferenceError, mirroring the original's behavior.
            foundYValue = ture;
        }
    });

    // Based on the final state of the indicator, print "Four" or "Three" to the console.
    console.log(foundYValue ? "Four" : "Three");
}

// Read the entire content of standard input, decode it as UTF-8,
// remove any leading or trailing whitespace, and then pass it to the
// 'ProcessInputData' function for execution.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
