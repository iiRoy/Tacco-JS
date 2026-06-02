function ProcessInput (rawData) {
    // This function processes the raw input string.
    // It splits the string by spaces and converts each part to a number.
    var numericValues = rawData.split(" ").map(Number);

    // Calculate integer division, remainder, and floating-point division.
    let quotientInteger = Math.floor(numericValues[0] / numericValues[1]);
    let remainderValue = numericValues[0] % numericValues[1];
    let preciseQuotient = (numericValues[0] / numericValues[1]).toFixed(6);

    // Output the results in a formatted string.
    console.log("%d %d %d", quotientInteger, remainderValue, preciseQuotient);
}

// Read input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
