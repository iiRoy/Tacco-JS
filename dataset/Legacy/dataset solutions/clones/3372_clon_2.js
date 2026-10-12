// This function processes raw input data to identify and count specific entries.
function ProcessData(rawData) {
    // The initial raw data string is split into an array of lines.
    rawData = rawData.split("\n");

    // The first line of the input contains critical threshold values, separated by spaces.
    var thresholds = rawData[0].split(" ");

    // A counter is initialized to keep track of entries that meet the specified criteria.
    var countValid = 0;

    // We iterate through the input lines, starting from the second line (index 1),
    // as the first line was used for thresholds.
    for (var idx = 1; idx < rawData.length; idx++) {
        // Each subsequent line represents an item, with its properties separated by spaces.
        var currentItem = rawData[idx].split(" ");

        // Two conditions must be met for an item to be considered valid:
        // 1. The first property of the current item must be greater than or equal to the second threshold.
        // 2. The second property of the current item must be greater than or equal to the third threshold.
        if (currentItem[0] >= thresholds[1] && currentItem[1] >= thresholds[2]) {
            countValid++; // If both conditions are true, increment the valid items counter.
        }
    }

    // Finally, the total count of valid items is printed to the console.
    console.log(countValid);
}

// The program execution starts by reading input from standard input.
// The input is read as a UTF-8 string, any leading/trailing whitespace is removed,
// and then this processed string is passed to the main data processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
