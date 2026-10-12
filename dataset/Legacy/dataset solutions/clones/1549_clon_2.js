function ProcessInput(rawData) {
    // The incoming rawData string is expected to contain two lines of text.
    // We first split the input by newline to separate the lines.
    // Then, each line is further split into an array of individual characters.
    let firstStringChars = (rawData.split("\n")[0]).split("");
    let secondStringChars = (rawData.split("\n")[1]).split("");

    // A variable to keep track of character mismatches during comparison.
    // Declared with 'var' inside the loop, its scope is effectively the entire function
    // due to hoisting, but it is re-initialized to zero in each iteration of the outer loop.
    var mismatchCount = 0;

    // This outer loop iterates through all possible starting positions
    // in the 'firstStringChars' array where 'secondStringChars' could potentially align.
    // The loop continues as long as there's enough remaining length in 'firstStringChars'
    // to accommodate the entire 'secondStringChars'.
    for (let outerIndex = 0; outerIndex <= firstStringChars.length - secondStringChars.length; outerIndex++) {
        // For each new starting position, the mismatch counter is reset to zero.
        mismatchCount = 0;

        // The inner loop performs a character-by-character comparison
        // between 'secondStringChars' and the current segment of 'firstStringChars'.
        for (let innerIndex = 0; innerIndex < secondStringChars.length; innerIndex++) {
            // If a character in 'secondStringChars' does not match
            // the corresponding character in the current window of 'firstStringChars',
            // the mismatch counter is incremented.
            if (secondStringChars[innerIndex] != firstStringChars[outerIndex + innerIndex]) {
                mismatchCount++;
            }
        }
    }

    // After the loops have completed, 'mismatchCount' will hold the total number of mismatches
    // from the *very last* comparison window (i.e., when 'outerIndex' was at its maximum value).
    // The final output is determined by comparing this count with the length of 'secondStringChars'.
    if (mismatchCount > secondStringChars.length) {
        // If the final mismatch count is greater than the total length of 'secondStringChars',
        // the program outputs the length of 'secondStringChars'.
        console.log(secondStringChars.length);
    } else {
        // Otherwise, if the mismatch count is less than or equal to the length,
        // the program outputs the final mismatch count itself.
        console.log(mismatchCount);
    }
}

// The program initiates by reading its input from standard input.
// It uses Node.js's 'fs' module to synchronously read the entire file content
// from '/dev/stdin' as a UTF-8 encoded string, and then passes this string
// to the 'ProcessInput' function for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
