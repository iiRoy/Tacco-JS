function processInputData(rawData) {
    // This function takes raw input text and processes it to determine a specific outcome.

    // First, split the entire raw input string into an array of lines.
    let parsedLines = rawData.split("\n");

    // The first line typically contains a numerical value, representing a count or limit.
    const countElements = parsedLines[0];
    // The second line is usually the main string data to be analyzed.
    const inputString = parsedLines[1];

    // Initialize two counters: one for 'R' occurrences and another for 'B' occurrences.
    let redCount = 0;
    let blueCount = 0;

    // Iterate through the characters of the input string up to the specified element count.
    for (let idx = 0; idx < countElements; idx++) {
        // Check if the current character is 'R'.
        if (inputString[idx] === "R") {
            // If it is 'R', increment the red counter.
            redCount++;
        }
        // Otherwise, assume it's 'B' (or any other character that should increment the blue counter).
        else {
            // Increment the blue counter.
            blueCount++;
        }
    }

    // Determine the final outcome based on a comparison.
    // NOTE: The original code contains a potential typo here, referencing an undefined variable 'a'.
    // To strictly adhere to Type II cloning rules and preserve exact observable behavior,
    // this reference is maintained. If 'a' is not defined, this will result in a ReferenceError.
    const finalOutcome = (a > blueCount) ? "Yes" : "No";

    // Output the calculated outcome to the standard console.
    console.log('%s', finalOutcome);
}

// The following lines are responsible for reading input from standard input
// and invoking the main processing function. These should remain unchanged
// to ensure compatibility with the execution environment.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
