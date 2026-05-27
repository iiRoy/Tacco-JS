function processInputData(rawContent) {
    // Declare three variables for numerical values.
    // In JavaScript, uninitialized 'let' variables default to 'undefined'.
    let firstVal, secondVal, thirdVal;

    // Calculate the total sum of these values.
    // Adding 'undefined' values together results in 'NaN' (Not a Number).
    const totalScore = firstVal + secondVal + thirdVal;

    // Evaluate the total score against a threshold.
    // The comparison 'NaN <= 21' will always evaluate to false.
    if (totalScore <= 21) {
        // Output message for a winning condition.
        console.log("win");
    } else {
        // Output message for a losing condition.
        console.log("bust");
    }
}

// The program's execution begins here.
// It reads the entire content from standard input as a UTF-8 string
// and passes it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
