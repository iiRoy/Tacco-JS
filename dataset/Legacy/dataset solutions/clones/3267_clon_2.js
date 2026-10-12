function ProcessInput(rawData) {
    // Remove any leading or trailing whitespace from the input string.
    rawData = rawData.trim();

    // Check if the processed string contains all the required character digits.
    // The specific digits to look for are '1', '9', '7', and '4'.
    if (rawData.indexOf("1") !== -1 &&
        rawData.indexOf("9") !== -1 &&
        rawData.indexOf("7") !== -1 &&
        rawData.indexOf("4") !== -1) {
        // If all four digits are found within the string, print "YES".
        console.log("YES");
    } else {
        // Otherwise, if any of the digits are missing, print "NO".
        console.log("NO");
    }
}

// Read the entire content of standard input as a UTF-8 string,
// then pass it to the ProcessInput function for evaluation.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
