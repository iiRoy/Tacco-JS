function ProcessInput(rawData) {
    // The raw input string is split into an array of lines.
    let parsedData = rawData.split("\n");

    // Perform a calculation: subtract twice the second number from the first number.
    // If the result is negative, output 0; otherwise, output the calculated result.
    console.log(parsedData[0] - parsedData[1] * 2 < 0 ? 0 : parsedData[0] - parsedData[1] * 2);
}

// This part of the code handles reading data from standard input.
// It should remain unchanged to ensure proper interaction with the execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
