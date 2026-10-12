function getInputData() {
    // This function reads the entire content from standard input.
    // It uses Node.js 'fs' module to synchronously read the file.
    var inputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // The input content is then split into an array of lines.
    // It handles both Unix-style (\n) and Windows-style (\r\n) line endings.
    return inputContent.split(/\n\r?/);
}

// Call the input reading function and iterate over each line using 'every'.
// The 'every' method continues as long as the callback returns a truthy value.
getInputData().every(function(currentLine) {
    // Split the current line by space to separate the two numeric values.
    var lineParts = currentLine.split(' '),
        // Convert the first part to a number, representing the height.
        heightVal = +lineParts[0],
        // Convert the second part to a number, representing the width.
        widthVal = +lineParts[1];

    // This is the termination condition for the 'every' loop.
    // If both heightVal and widthVal are zero, it means the end of input.
    // In this case, 'false' is returned, stopping the iteration.
    // Otherwise, the pattern generation and printing logic is executed.
    return !heightVal && !widthVal
        ? false // Stop processing if both dimensions are zero.
        : !console.log( // Print the generated pattern to the console.
            // Create a string of 'heightVal' rows.
            new Array(heightVal + 1).join(
                // Create a single row string consisting of 'widthVal' '#' characters followed by a newline.
                new Array(widthVal + 1).join('#') + "\n"
            )
        );
});
