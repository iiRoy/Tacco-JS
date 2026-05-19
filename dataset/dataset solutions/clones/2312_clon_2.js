// This function serves as the primary entry point for processing input data.
function ProcessData(rawData) {
    // The incoming raw string is first divided into individual components based on spaces.
    let dataParts = rawData.split(" ");

    // We then extract three distinct values from the parsed components.
    // JavaScript will automatically handle type coercion from string to number during arithmetic operations.
    let firstVal = dataParts[0];
    let secondVal = dataParts[1];
    let thirdVal = dataParts[2];

    // A variable is initialized to hold the final computed outcome.
    let finalOutcome = 0;

    // A conditional check is performed on the relationship between the third and second values.
    // If the remainder of their difference divided by two is zero, indicating an even difference...
    if ((thirdVal - secondVal) % 2 === 0) {
        // ...the outcome is determined by halving this even difference.
        finalOutcome = (thirdVal - secondVal) / 2;
    } else {
        // Otherwise, if the difference is odd, an alternative calculation path is taken.
        // Calculate the difference between the first and second values.
        let diffOne = firstVal - secondVal;
        // Compute an adjusted version of the third value.
        let adjustedThird = thirdVal - 1;

        // The final outcome in this scenario is the smaller of the two newly calculated values.
        finalOutcome = Math.min(diffOne, adjustedThird);
    }

    // The computed result is then displayed to the standard output.
    console.log(finalOutcome);
}

// The program initiates by reading content from standard input,
// decoding it as UTF-8, and passing it to the main processing function.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8"));
