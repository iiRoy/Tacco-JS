function ProcessInput(rawData) {
    // The raw input string is split into an array of individual lines.
    let parsedLines = rawData.split("\n");

    // The first line of input contains three space-separated configuration values.
    const firstLineParts = parsedLines[0].split(" ");

    // Parse the numerical parameters from the first line.
    // 'boardSize' represents the 'masu' variable from the original.
    const boardSize = parseInt(firstLineParts[0], 10);
    // 'feeCount' represents the 'ryokin_count' variable.
    const feeCount = parseInt(firstLineParts[1], 10);
    // 'initialValue' represents the 'shoki' variable, a threshold for comparison.
    const initialValue = parseInt(firstLineParts[2], 10);

    // The second line contains a list of fee values, also space-separated.
    const feeStrings = parsedLines[1].split(" ");

    // Initialize counters for fees that are greater than the initial value
    // and those that are less than or equal to it.
    let feesAboveInitial = 0;
    let feesBelowOrEqualInitial = 0;

    // Iterate through each fee string to categorize it based on the initial value.
    feeStrings.forEach(function (currentFeeStr) {
        // JavaScript's comparison operator (>) will implicitly convert the string 'currentFeeStr'
        // to a number when comparing it with the number 'initialValue'.
        if (currentFeeStr > initialValue) {
            feesAboveInitial++; // Increment if the current fee is greater than the initial value.
        } else {
            feesBelowOrEqualInitial++; // Increment otherwise (less than or equal).
        }
    });

    // Compare the two counts and output the smaller one.
    if (feesAboveInitial > feesBelowOrEqualInitial) {
        console.log(feesBelowOrEqualInitial); // If more fees are above, output the count of fees below/equal.
    } else {
        console.log(feesAboveInitial); // Otherwise, output the count of fees above.
    }
}

// This line handles reading input from standard input and invoking the processing function.
// It should not be modified to ensure compatibility with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
