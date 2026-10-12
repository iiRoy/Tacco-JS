// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // The raw input string is divided into segments based on a space delimiter.
    let parsedSegments = rawData.split(" ");

    // The initial segment is assigned to a variable.
    let firstPart = parsedSegments[0];
    // The subsequent segment is assigned to another variable.
    let secondPart = parsedSegments[1];

    // The concatenated value of the second part followed by the first part is printed to the console.
    console.log(secondPart + firstPart);
}

// This section handles standard input/output and should not be altered.
// It reads the entire content from standard input and passes it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
