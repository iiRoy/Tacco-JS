function processInputData(inputData) {
    // The input string is split into an array of substrings based on spaces.
    inputData = inputData.split(" ");
    // The result of the comparison function is printed to the console.
    console.log(evaluateComparison(inputData));
}

function evaluateComparison(stringParts) {
    // This function checks if the first and second elements of the provided array are identical.
    if (stringParts[0] === stringParts[1]) {
        // If they are the same, it returns the character "H".
        return "H";
    } else {
        // Otherwise, it returns the character "D".
        return "D";
    }
}

// The program reads the content of standard input as a UTF-8 string
// and then passes it to the primary processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
