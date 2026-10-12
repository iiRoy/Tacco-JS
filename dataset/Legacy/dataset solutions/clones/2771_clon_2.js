// This function processes the entire input data provided.
function ProcessInput(rawData) {
    // The first line is rawData[0], second is rawData[1], etc.
    rawData = rawData.split("\n");
    let parts = rawData[1].split(" "); // Split the second line by spaces.

    // Convert string to base-10 integer using parseInt.
    const arraySize = parseInt(rawData[0], 10);

    let elevationData = parseNumbers(parts); // Convert all parts to integers.
    let peakValue = Number.NEGATIVE_INFINITY; // Initialize with the smallest possible number.
    let peakIndex = 0;
    let totalElevation = 0;

    // Find the maximum elevation and its index, and calculate total elevation.
    for (let idx = 0; idx < elevationData.length; idx++) {
        if (elevationData[idx] > peakValue) {
            peakIndex = idx;
            peakValue = elevationData[idx];
        }
        totalElevation += elevationData[idx];
    }

    let totalRainfall = 0;
    let firstRainfallIndex = peakIndex;
    let secondRainfallIndex = (peakIndex + 1) % arraySize;
    let currentRainfallDistribution;
    let hasConflict = true; // Flag to indicate if a valid distribution is found.

    // Iterate through possible rainfall amounts for the first peak.
    for (let iterationCount = 0; iterationCount <= peakValue; iterationCount++) {
        // Assume a distribution for this iteration.
        currentRainfallDistribution = [];
        totalRainfall = 0;

        // Set initial rainfall values based on the current assumption.
        currentRainfallDistribution[firstRainfallIndex] = iterationCount * 2;
        currentRainfallDistribution[secondRainfallIndex] = (peakValue - iterationCount) * 2;

        totalRainfall = currentRainfallDistribution[firstRainfallIndex] + currentRainfallDistribution[secondRainfallIndex];

        // Determine the rest of the rainfall distribution based on the assumption.
        for (let currentIdx = (firstRainfallIndex + 1) % arraySize; ; currentIdx = (currentIdx + 1) % arraySize) {
            let nextIdx = (currentIdx + 1) % arraySize;
            let calculatedRainfall = (elevationData[currentIdx] - (currentRainfallDistribution[currentIdx] / 2)) * 2;

            // Rainfall cannot be negative. This indicates a contradiction.
            if (calculatedRainfall < 0) {
                hasConflict = true;
                break; // Exit inner loop.
            }

            // If not back to the starting point, assign and update sum.
            if (nextIdx !== firstRainfallIndex) {
                currentRainfallDistribution[nextIdx] = calculatedRainfall;
                totalRainfall += currentRainfallDistribution[nextIdx];

                // If total rainfall exceeds total elevation, it's a contradiction.
                if (totalRainfall > totalElevation) {
                    hasConflict = true;
                    break; // Exit inner loop.
                }
            }
            // If we've completed a full circle.
            else {
                // Verify consistency at the starting point.
                if (calculatedRainfall === currentRainfallDistribution[firstRainfallIndex]) {
                    // No contradiction found for this assumption.
                    hasConflict = false;
                    break; // Exit inner loop.
                } else {
                    // Contradiction detected.
                    hasConflict = true;
                    break; // Exit inner loop.
                }
            }
        }
        // If a consistent distribution was found, stop searching.
        if (hasConflict === false) break;
    }

    // Output the final result.
    console.log('%s', formatOutputString(currentRainfallDistribution));
}

// Helper function to convert an array of string numbers to integers.
function parseNumbers(inputStrings) {
    let parsedValues = [];
    for (let idx = 0; idx < inputStrings.length; idx++) {
        parsedValues[idx] = parseInt(inputStrings[idx], 10); // Explicitly use base 10.
    }
    return parsedValues;
}

// Helper function to format an array of numbers into a space-delimited string with a newline.
function formatOutputString(elements) {
    let formattedString = elements.join(' ');
    formattedString += '\n'; // Append a newline character.
    return formattedString;
}

// The following lines handle standard input/output and invoke the main processing function.
// Do not modify this section.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
