function processInput(rawData) {
    // Split the entire input string into an array of individual lines.
    let inputLines = rawData.split("\n");

    // The very first line of input is the initial string to be manipulated.
    let currentString = inputLines.shift();

    // The second line specifies the total number of operations to perform.
    let operationCount = parseInt(inputLines.shift());

    // Iterate through each operation, from the first to the last.
    for (let opIndex = 0; opIndex < operationCount; opIndex++) {
        // Parse the current operation line, splitting it by spaces to get command parts.
        let commandParts = inputLines[opIndex].split(" ");

        // The first part of the command indicates the type of action to take.
        let commandType = commandParts[0];

        // The second and third parts are typically numerical indices for string manipulation.
        let indices = parseNumbers([commandParts[1], commandParts[2]]);

        // Check the command type and execute the corresponding logic.
        if (commandType === "print") {
            // For a "print" command, extract and display the specified substring.
            console.log(currentString.slice(indices[0], indices[1] + 1));
        } else if (commandType === "replace") {
            // For a "replace" command, the fourth part is the new string segment.
            let replacementText = commandParts[3];
            // Reconstruct the string by replacing the segment between indices[0] and indices[1] with replacementText.
            currentString = currentString.slice(0, indices[0]) + replacementText + currentString.slice(indices[1] + 1);
        } else if (commandType === "reverse") {
            // For a "reverse" command, first extract the segment to be reversed.
            let segmentToReverse = currentString.slice(indices[0], indices[1] + 1);
            // Initialize an empty string to build the reversed segment.
            let reversedSegment = "";
            // Loop through the segmentToReverse from end to beginning to reverse it.
            for (let charIndex = 0; charIndex < segmentToReverse.length; charIndex++) {
                reversedSegment += segmentToReverse[segmentToReverse.length - charIndex - 1];
            }
            // Reconstruct the main string with the original segment replaced by its reversed version.
            currentString = currentString.slice(0, indices[0]) + reversedSegment + currentString.slice(indices[1] + 1);
        }
    }
}

// Helper function to convert an array of string representations of numbers into actual integers.
function parseNumbers(stringArray) {
    return stringArray.map(stringValue => parseInt(stringValue));
}

// Read the entire content from standard input, decode it as UTF-8, and pass it to the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf-8"));
