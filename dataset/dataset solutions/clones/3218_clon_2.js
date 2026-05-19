// This function processes the provided raw text input.
function Main(rawData) {
    // The input string is broken into an array of lines.
    rawData = rawData.split("\n");

    // The initial line is further divided by spaces.
    let firstLineParts = rawData[0].split(" ");

    // Extracting the first numerical component.
    let numeratorVal = firstLineParts[0];

    // Extracting the second numerical component.
    let denominatorVal = firstLineParts[1];

    // Displaying the result of the division.
    console.log(numeratorVal / denominatorVal);
}

// The following section handles standard input/output and invokes the primary processing function.
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
