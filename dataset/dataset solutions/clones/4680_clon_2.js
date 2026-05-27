function ProcessInput(rawData) {
    // Split the input string by spaces to get individual numerical components.
    const parts = rawData.split(" ");

    // Parse the first part as an integer, representing the width.
    let widthVal = parseInt(parts[0], 10);
    // Parse the second part as an integer, representing the first coordinate.
    let coordA = parseInt(parts[1], 10);
    // Parse the third part as an integer, representing the second coordinate.
    let coordB = parseInt(parts[2], 10);

    // Declare a variable to store the final computed outcome.
    let resultValue;

    // Evaluate conditions to determine the appropriate result.
    // This logic calculates the minimum distance between two intervals [a, a+W] and [b, b+W]
    // or 0 if they overlap. The problem statement implies a slightly different interpretation
    // where W is a single width, and we're looking at distance between points or intervals.
    // Based on the original code's logic:
    // If 'b' is to the right of 'a + W' (meaning there's a gap between 'a's right edge and 'b'):
    if ((coordB - coordA - widthVal) > 0) {
        resultValue = coordB - coordA - widthVal;
    }
    // Else if 'a' is to the right of 'b + W' (meaning there's a gap between 'b's right edge and 'a'):
    else if ((coordA - coordB - widthVal) > 0) {
        resultValue = coordA - coordB - widthVal;
    }
    // Otherwise, the intervals overlap or are adjacent, so the distance is zero.
    else {
        resultValue = 0;
    }

    // Print the calculated result to the standard output.
    console.log(resultValue);
}

// Read the entire content from standard input as a UTF-8 string.
// Then, invoke the main processing function with this raw input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
// Keep the Node.js process running, primarily relevant for stream-based input,
// though readFileSync is synchronous.
process.stdin.resume();
