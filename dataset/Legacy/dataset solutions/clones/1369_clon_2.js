function ProcessInputData (rawData) {
    // Split the entire input string by newline characters to get an array of individual lines.
    let inputLines = rawData.split("\n");

    // Begin an infinite loop to process each line of input.
    while (true) {
        // Retrieve the first line from the array, remove it, and then split it into an array of characters.
        let currentDigits = inputLines.shift().split("");

        // Check if the very first character of the current line is the digit '0'.
        if (currentDigits[0] === '0') {
            // If it is '0', this signifies the end of input, so break out of the loop.
            break;
        }

        // Convert each character in the 'currentDigits' array to a number,
        // then sum all these numbers using the reduce method.
        // Finally, print the calculated sum to the console.
        console.log(
            currentDigits.map(Number).reduce(function (accumulator, currentValue) {
                return accumulator + currentValue; // Add the current number to the running total.
            })
        );
    }
}

// Read the entire content of the standard input file synchronously,
// using UTF-8 encoding, and pass it to our processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
