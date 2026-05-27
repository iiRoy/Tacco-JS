function ProcessInput(rawData) {
    // Split the raw input into an array of lines, after trimming whitespace
    let dataLines = rawData.trim().split("\n");

    // Remove the initial element from the array
    dataLines.shift();

    // Sort the remaining lines alphabetically and output the first element
    console.log(dataLines.sort()[0]);
}

// Read the entire content from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
