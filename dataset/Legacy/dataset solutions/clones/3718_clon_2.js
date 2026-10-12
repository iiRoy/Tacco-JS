// This function is designed to process an entire string of input data.
function ProcessInput(rawData) {
    // A variable to accumulate the final tally, initialized to zero.
    var finalCount = 0;

    // The input string is broken down into an array of individual characters.
    rawData = rawData.split("");

    // Iterate through each character in the newly formed array.
    rawData.forEach(function(charItem) {
        // If the current character is a hyphen, decrement the counter.
        if (charItem === '-') {
            finalCount--;
        }
        // Otherwise, increment the counter. This handles '+' and any other character.
        else {
            finalCount++;
        }
    });

    // Output the computed total, followed by a newline character, to the console.
    console.log(finalCount + '\n');
}

// The following line is responsible for reading input from standard input
// and passing it to the main processing function. It should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
