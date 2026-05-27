// This function processes the incoming data.
function ProcessInput(rawData) {
    // The first element of this array holds the first line, the second holds the second, and so on.
    var inputLines = rawData.split("\n");
    var totalLength = Number(inputLines[0].split(" ")[0]); // The overall length or target.
    var maxJump = Number(inputLines[0].split(" ")[1]);     // The maximum allowed jump distance.
    var pathString = inputLines[1];                        // The string representing valid jump points.
    var finalResult;                                       // Variable to store the computed outcome.

    // Check for a simple base case where the target is within the maximum jump range.
    if (totalLength <= maxJump) {
        finalResult = totalLength; // If so, the answer is just the total length.
    } else {
        // Initialize an array to store the sequence of jumps.
        var jumpSequence = [];
        // Keep track of the current position from the end of the path.
        var currentPosition = 0;

        // Iterate backwards from the maximum jump distance down to zero.
        for (var stepSize = maxJump; stepSize >= 0; stepSize--) {
            // If we've reached the start (stepSize is 0) and no jumps have been recorded yet,
            // it means no valid path was found.
            if (stepSize === 0 && jumpSequence.length === 0) {
                finalResult = -1; // Indicate failure.
                break;            // Exit the loop.
            }

            // Calculate the remaining distance to cover from the current position.
            // If this remaining distance is less than or equal to the current stepSize,
            // we can make the final jump to the beginning.
            if (totalLength - currentPosition - stepSize <= 0) {
                jumpSequence.unshift(totalLength - currentPosition); // Add the final jump to the front.
                break;                                               // Path found, exit loop.
            }

            // Check if the character at the potential landing spot (from the start) is '0'.
            // '0' indicates a valid stepping stone.
            if (pathString[totalLength - currentPosition - stepSize] === "0") {
                jumpSequence.unshift(stepSize); // Add the current step size to the beginning of the sequence.
                currentPosition += stepSize;    // Advance the current position by the step size.
                stepSize = maxJump + 1;         // Reset stepSize to restart the inner loop from maxJump.
                                                // This effectively makes the next iteration start with maxJump.
            }
        }

        // If a valid path was found (finalResult is not -1), format the jump sequence.
        if (finalResult !== -1) {
            finalResult = jumpSequence.join(" "); // Join the jump steps with spaces.
        }
    }

    // Output the final computed result to the console.
    console.log('%s', finalResult);
}

// Do not modify the following line. It handles reading input and calling the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
