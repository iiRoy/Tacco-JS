function ProcessInputData(rawData) {
    // This section transforms the raw input string into an array of numerical values.
    // It splits the string by newline characters and then converts each segment to a number.
    let numericValues = rawData.split("\n").map(Number);

    // We now proceed to compare the first two elements of our processed numerical array.
    if (numericValues[0] === numericValues[1]) {
        // If the initial two numbers are found to be identical, we output a specific message.
        console.log("EQUAL");
    } else {
        // Otherwise, if they are not equal, we determine their relative magnitude.
        // A ternary operator is used for concise conditional output.
        console.log(numericValues[0] > numericValues[1] ? "GREATER" : "LESS");
    }
}

// The primary execution point of the script.
// It reads content from standard input, ensures it's a string, removes leading/trailing whitespace,
// and then passes this prepared data to our main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
