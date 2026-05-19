// This function processes the given raw data to count character mismatches.
function ProcessInput(rawData) {
    // Remove any leading or trailing whitespace from the raw input string.
    rawData = rawData.trim();

    // Initialize a variable to keep track of the number of differing characters.
    var mismatchesCount = 0;

    // Define the fixed string that the input will be compared against.
    var targetString = "CODEFESTIVAL2016";

    // Loop through the input string, character by character, using an index.
    for (var idx = 0; idx < rawData.length; idx++) {
        // Extract a single character from the input string at the current position.
        var charFromInput = rawData.slice(idx, idx + 1);
        // Extract the corresponding single character from the target string.
        var charFromTarget = targetString.slice(idx, idx + 1);

        // Check if the character from the input does not match the character from the target.
        if (charFromInput !== charFromTarget) {
            // If they are different, increment the mismatch counter.
            mismatchesCount++;
        }
    }

    // Print the final count of mismatches to the console.
    console.log(mismatchesCount);
}

// Read the entire content from standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
