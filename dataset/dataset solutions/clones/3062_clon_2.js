"use strict"; // Enforce strict mode for cleaner code execution

/*
 * This function processes the raw input string to determine if
 * a set of sensor positions meets a specific distance criterion.
 */
const processInput = (inputData) => {
    // Split the input string into an array of lines.
    inputData = inputData.split("\n");

    // Extract the maximum allowed distance (k) from the end of the input.
    // The last line is expected to be the integer 'k'.
    const maxDistance = parseInt(inputData.pop());

    // Parse the first five lines as sensor positions (integers).
    // The original code implies only the first 5 lines are relevant for antennas.
    const sensorPositions = inputData.slice(0, 5).map((numStr) => parseInt(numStr));

    // Iterate through all unique pairs of sensor positions.
    // Outer loop for the first sensor.
    for (let idxA = 0; idxA < sensorPositions.length; idxA++) {
        // Inner loop for the second sensor, starting from the next position
        // to avoid duplicate pairs and comparing a sensor with itself.
        for (let idxB = idxA + 1; idxB < sensorPositions.length; idxB++) {
            // Check if the distance between any two sensors exceeds the maximum allowed distance.
            // The problem implies sensorPositions[idxB] will always be >= sensorPositions[idxA]
            // if the input is sorted, or we're just checking the difference.
            if (sensorPositions[idxB] - sensorPositions[idxA] > maxDistance) {
                // If an invalid pair is found, print an error message and exit.
                console.log(":(");
                return; // Terminate the function early.
            }
        }
    }

    // If all sensor pairs satisfy the distance condition, print a success message.
    console.log("Yay!");
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
