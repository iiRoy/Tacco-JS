function processInput(inputString) {
    // Process the raw input string to extract numerical data.
    // It trims whitespace, splits by newline, takes the first line,
    // splits by space, and converts each part to a number.
    var parsedNumbers = inputString.trim().split("\n")[0].split(" ").map(Number);

    // Assign the first two numbers from the parsed data to distinct variables.
    var firstVal = parsedNumbers[0];
    var secondVal = parsedNumbers[1];

    // Initialize a variable to accumulate the result.
    var finalSum = 0;

    // Iterate a fixed number of times (two iterations).
    for (var idx = 0; idx < 2; idx++) {
        // Compare the current values of 'firstVal' and 'secondVal'.
        if (firstVal > secondVal) {
            // If 'firstVal' is greater, add it to the sum and then decrement it.
            finalSum += firstVal;
            firstVal--;
        } else {
            // Otherwise (if 'secondVal' is greater or equal), add 'secondVal' to the sum and decrement it.
            finalSum += secondVal;
            secondVal--;
        }
    }

    // Print the final calculated sum to the standard output.
    console.log(finalSum);
}

// Read the entire content from standard input as a UTF-8 string
// and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
