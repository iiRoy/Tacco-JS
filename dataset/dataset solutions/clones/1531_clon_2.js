function ProcessData(incomingText) {
    // Convert the provided string input into a numerical representation.
    const integerValue = Number(incomingText);

    // Compute the intermediate value using the formula N*N - N.
    // This is equivalent to N * (N - 1).
    const calculatedResult = integerValue * integerValue - integerValue;

    // Display the final result, which is the intermediate value
    // modulo a large prime number (10^9 + 7), to the console.
    console.log(calculatedResult % (10 ** 9 + 7));
}

// Read the entire content from standard input,
// decode it as UTF-8, and remove any leading or trailing whitespace.
// Then, invoke the primary processing function with this cleaned input.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
