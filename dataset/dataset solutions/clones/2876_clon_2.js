var inputRows = []; // Array to store lines read from standard input
var readInputModule = require('readline'); // Import the 'readline' module for input handling

// Create an interface for reading input line by line
var inputHandler = readInputModule.createInterface({
    input: process.stdin, // Use standard input stream
    output: process.stdout, // Use standard output stream (though not directly used for writing here)
});

// Event listener for each line of input received
inputHandler.on('line', function (currentLineData) {
    inputRows.push(currentLineData); // Add the current line to our array of input rows
});

// Event listener for when the input stream closes
inputHandler.on('close', function () {
    // Parse the first line of input to extract numerical parameters
    var firstLineParts = inputRows[0].split(" ");
    var firstParam = Number(firstLineParts[0]); // Corresponds to N in original
    var secondParam = Number(firstLineParts[1]); // Corresponds to A in original
    var thirdParam = Number(firstLineParts[2]); // Corresponds to B in original
    var fourthParam = Number(firstLineParts[3]); // Corresponds to C in original
    var fifthParam = Number(firstLineParts[4]); // Corresponds to D in original

    // Get the character sequence from the second line of input
    var pathString = inputRows[1].split(""); // Corresponds to S in original

    var hasThreeDots = false; // Flag to track if a specific pattern is found

    // Iterate through the character sequence
    for (var loopIndex = 0; loopIndex < pathString.length; loopIndex++) {
        // Check for two consecutive '#' characters within a specific range
        if ((pathString[loopIndex] === "#" && pathString[loopIndex + 1] === "#") &&
            secondParam <= loopIndex && loopIndex + 1 <= Math.max(fourthParam, fifthParam)) {
            console.log("No"); // Output "No" and terminate if condition met
            return 0; // Exit the function
        }

        // Check for three consecutive '.' characters within another specific range
        if ((pathString[loopIndex] === "." && pathString[loopIndex + 1] === "." && pathString[loopIndex + 2] === ".") &&
            thirdParam <= loopIndex + 1 && loopIndex + 1 <= fifthParam) {
            hasThreeDots = true; // Set the flag if condition met
        }
    }

    // Final conditional check based on parameters and the flag
    if (fifthParam < fourthParam &&
        (pathString[thirdParam - 2] === "#" || pathString[thirdParam] === "#" ||
         pathString[fifthParam - 2] === "#" || pathString[fifthParam] === "#") &&
        hasThreeDots === false) {
        console.log("No"); // Output "No"
    } else {
        console.log("Yes"); // Otherwise, output "Yes"
    }
});
