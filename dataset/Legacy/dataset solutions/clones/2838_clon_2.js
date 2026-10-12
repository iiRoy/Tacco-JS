// This function processes incoming text data.
function processInputData(rawData) {
    // Split the entire input string by newline characters.
    let linesOfText = rawData.split("\n");

    // Extract the first line and split it by spaces.
    const firstLineParts = linesOfText[0].split(" ");

    // Parse the first number from the first line.
    const firstValue = parseInt(firstLineParts[0]);
    // Parse the second number from the first line.
    const secondValue = parseInt(firstLineParts[1]);

    // Check a condition based on the first parsed number.
    if (firstValue === 1) {
        // If the first number is one, output zero.
        console.log(0);
    } else {
        // Otherwise, output the difference between the two numbers.
        console.log(firstValue - secondValue);
    }
}

// Do not modify the following line; it handles reading from standard input and invoking the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
