function ProcessInput(rawData) {
    // The raw input string is split into an array of strings using space as a delimiter.
    let parsedValues = rawData.split(" ");

    // Calculate the result by subtracting one from each of the first two parsed values,
    // and then multiplying these two decremented numbers.
    // JavaScript automatically converts the string elements to numbers for arithmetic operations.
    console.log((parsedValues[0] - 1) * (parsedValues[1] - 1));
}

// Read the entire content of the standard input file as a UTF-8 string.
// Then, pass this string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
