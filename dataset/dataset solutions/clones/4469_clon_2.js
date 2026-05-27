// This function serves as the primary entry point for processing input data.
function ProcessInput(rawData) {
    // The raw input string is first divided into an array of strings,
    // where each element represents a line from the original input.
    let parsedData = rawData.split('\n');

    // The very first line of the parsed data is then further split
    // by spaces to extract individual components.
    const firstLineParts = parsedData[0].split(' ');

    // These components are converted from string representations to numerical values.
    let valA = Number(firstLineParts[0]);
    let valB = Number(firstLineParts[1]);

    // A specific condition is evaluated: if the sum of the two numbers is not
    // divisible by 3, AND the first number is not divisible by 3, AND the
    // second number is not divisible by 3, then the situation is deemed "Impossible".
    // Otherwise, it is considered "Possible".
    if ((valA + valB) % 3 && valA % 3 && valB % 3) {
        console.log("Impossible");
    } else {
        console.log("Possible");
    }
}

// The program initiates by reading the entire content of the standard input
// as a UTF-8 encoded string and then passes this string to the ProcessInput function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
