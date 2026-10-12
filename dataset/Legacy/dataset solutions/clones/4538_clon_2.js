// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // First, the raw input string is divided into an array of strings,
    // where each element represents a line from the original input.
    let processedData = rawData.split("\n");

    // We then extract the very first line from the processed data array.
    // This line is further split by spaces to separate its constituent parts.
    const firstLineParts = processedData[0].split(" ");

    // The first part of the split line is converted into an integer.
    let firstNumber = parseInt(firstLineParts[0]);
    // Similarly, the second part of the split line is also converted into an integer.
    let secondNumber = parseInt(firstLineParts[1]);

    // A conditional check is performed: if the sum of the two integers
    // is strictly greater than nine, a specific error message is output.
    if (firstNumber + secondNumber > 9) {
        console.log("error");
    }
    // Otherwise, if the sum is nine or less, the actual sum of the two integers
    // is calculated and then displayed to the console.
    else {
        console.log(firstNumber + secondNumber);
    }
}

// The program initiates by reading the content of the standard input file.
// The file is read synchronously and decoded using UTF-8 encoding.
// The obtained content is then passed as an argument to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
