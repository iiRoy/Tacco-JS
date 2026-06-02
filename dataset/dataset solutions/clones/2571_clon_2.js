function ProcessInput(rawData) {
    // Split the raw input string into an array of lines
    const parsedLines = rawData.split("\n");

    // Extract the first line and store it as a numeric value
    let numericValue = parsedLines[0];

    // Calculate the cube of the numeric value and print it to the console
    console.log(numericValue * numericValue * numericValue);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
