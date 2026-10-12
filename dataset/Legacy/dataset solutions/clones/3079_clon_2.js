function ProcessInput(rawData) {
    // This section parses the incoming raw string data.
    // It first splits by newline, takes the first line, then splits that line by spaces.
    let parsedData = rawData.split("\n")[0].split(" ");

    // Individual components are extracted from the processed array.
    let valX = parsedData[0];
    let valY = parsedData[1];
    let valZ = parsedData[2];

    // A conditional check determines the final output string.
    // The outcome is "Yes" if all three values are strictly equal, otherwise "No".
    const finalOutcome = (valX == valY && valY == valZ) ? "Yes" : "No";

    // The computed outcome is then printed to the standard output.
    console.log('%s', finalOutcome);
}

// This line handles reading input from the standard input stream and initiating the processing.
// It is typically used in competitive programming environments and should remain as is for execution.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
