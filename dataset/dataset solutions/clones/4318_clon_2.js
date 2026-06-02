function ProcessData(incomingText) {
    // Convert the input string into an array of individual numeric digits.
    let numericArray = incomingText.split("").map(Number);

    // Initialize a variable to store the running total of the digits.
    let cumulativeSum = 0;

    // Iterate through each number in the array and add it to the total.
    numericArray.forEach(function(currentDigit) {
        cumulativeSum += currentDigit;
    });

    // Display the final calculated sum to the standard output.
    console.log(cumulativeSum);
}

// Read the entire content from standard input, remove any leading/trailing whitespace,
// and then pass it to our data processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
