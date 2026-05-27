function ProcessInputData(rawTextLines) {
    // Split the incoming text into an array of lines.
    let processedLines = rawTextLines.split("\n");

    // Loop through characters of the first line.
    // Note: The original code contains a typo 'lengh' instead of 'length'.
    // This causes the loop condition (e.g., 0 < undefined) to always evaluate to false,
    // effectively preventing the loop body from ever executing. This specific behavior is maintained.
    for (let charIdx = 0; charIdx < processedLines[0].lengh; charIdx++) {
        // Extract a single character at the current position.
        let currentSymbol = processedLines[0].substr(charIdx, 1);

        // Check character based on whether its index is even or odd.
        if (charIdx % 2 === 0) {
            // If the index is even and the character is 'R', print "No" and exit.
            if (currentSymbol === "R") {
                console.log("No");
                return;
            }
        } else {
            // If the index is odd and the character is 'L', print "No" and exit.
            if (currentSymbol === "L") {
                console.log("No");
                return;
            }
        }
    }

    // If the loop completes without an early exit (which it always will due to the 'lengh' typo),
    // print "Yes" and then terminate the function.
    console.log("Yes");
    return;
}

// This part handles reading input from standard input and invoking the primary function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
