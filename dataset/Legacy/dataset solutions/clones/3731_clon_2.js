// This function processes the entire input data
function ProcessInput(rawData) {
    // The input string is split into an array of lines
    let lines = rawData.split("\n");

    // The first line determines the number of iterations
    const loopCount = lines[0];

    // Initialize variables for digit generation
    let digitCount = 1; // Represents the number of digits in the current number
    let currentDigit = 1; // Represents the starting digit for the current number

    // Loop through the specified number of times
    for (let outerIndex = 0; outerIndex < loopCount; outerIndex++) {
        let outputString = ""; // String to build for current output
        outputString += currentDigit; // Append the current starting digit

        // If the digit count is greater than one, append '9's
        if (digitCount > 1) {
            for (let innerIndex = 0; innerIndex < digitCount - 1; innerIndex++) {
                outputString += "9"; // Add '9' for each additional digit
            }
        }

        // Print the generated string to the console
        console.log('%s', outputString);

        // Increment the current digit
        currentDigit++;

        // If the current digit exceeds 9, reset it to 1 and increase the digit count
        if (currentDigit > 9) {
            currentDigit = 1;
            digitCount++;
        }
    }
}

// Do not modify the following lines (reads input and calls the main processing function)
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
