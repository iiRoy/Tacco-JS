// This function processes the entire input data provided.
function ProcessInput(rawData) {
    // The input string is split into an array of lines.
    let lineData = rawData.split("\n");

    // The first line is further split by spaces to get individual parts.
    let firstLineParts = lineData[0].split(" ");

    // Convert the first part of the first line to an integer, using base 10.
    const numericValue = parseInt(firstLineParts[0], 10);

    // A variable to store the computed result.
    let resultValue = 0;

    // Check if the number is even.
    if (numericValue % 2 === 0) {
        console.log(numericValue / 2);
    }
    // If not even, check if it's exactly 1.
    else if (numericValue === 1) {
        console.log("1");
    }
    // For any other odd number.
    else {
        // Calculate the ceiling of half the number.
        resultValue = Math.ceil(numericValue / 2);
        console.log(resultValue);
    }
}

// Do not modify the following line (it handles reading from standard input and calling the main processing function).
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
