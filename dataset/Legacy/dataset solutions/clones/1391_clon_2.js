function ProcessInput(rawData) {
    // The raw input string is split into an array of individual lines.
    // Each element in the 'lineData' array represents one line from the input.
    let lineData = rawData.split("\n");

    // Iterate through each processed line until a line starting with the character "0" is encountered.
    // The loop variable 'idx' serves as the current index for accessing elements in 'lineData'.
    for (let idx = 0; lineData[idx][0] !== "0"; idx++) {
        // For the current line, it's split by spaces, and each resulting substring is converted to a number.
        // This array of numbers, typically containing two elements, is stored in 'numPair'.
        const numPair = lineData[idx].split(" ").map(Number);

        // Extract the first and second numerical values from the 'numPair' array.
        let firstVal = numPair[0];
        let secondVal = numPair[1];

        // Compare the two extracted numbers to determine their order.
        // The goal is to print them to the console in ascending order.
        if (firstVal > secondVal) {
            // If 'firstVal' is greater than 'secondVal', print 'secondVal' followed by 'firstVal'.
            console.log(secondVal + " " + firstVal);
        } else {
            // Otherwise (if 'firstVal' is less than or equal to 'secondVal'),
            // print 'firstVal' followed by 'secondVal'.
            console.log(firstVal + " " + secondVal);
        }
    }
}

// This line reads the entire content from standard input (typically a file or piped data)
// using Node.js's 'fs' module, decodes it as UTF-8, and then passes the resulting string
// to the 'ProcessInput' function for processing.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
