"use strict";

// Helper function to ascertain the absolute magnitude of a numeric value.
const ascertainAbsoluteMagnitude = (numericValue) => {
    return Math.abs(numericValue);
};

// Utility function to present a given message to the standard output.
const presentOutputMessage = (outputContent) => {
    console.log(outputContent);
};


const conductPrimaryProcessing = (sourceTextData) => {
    // Decompose the incoming textual data into distinct segments based on space delimiters.
    const segmentedParts = sourceTextData.split(" ");

    // Convert the initial segment into an integer, specifying base 10 for clarity.
    const firstNumericalElement = parseInt(segmentedParts[0], 10);
    // Convert the subsequent segment into an integer, also using base 10.
    const secondNumericalElement = parseInt(segmentedParts[1], 10);

    // Compute the absolute difference between the two extracted numerical elements.
    const spanMagnitude = ascertainAbsoluteMagnitude(firstNumericalElement - secondNumericalElement);

    let currentCandidateIndex; // A variable to hold the index of the current candidate point.

    // Initiate an iterative cycle from zero up to, but not including, the span magnitude.
    for (currentCandidateIndex = 0; currentCandidateIndex < spanMagnitude; currentCandidateIndex++) {
        // Evaluate if the absolute displacement from the first element to the current candidate
        // is precisely equivalent to the absolute displacement from the second element.
        if (ascertainAbsoluteMagnitude(firstNumericalElement - currentCandidateIndex) === ascertainAbsoluteMagnitude(secondNumericalElement - currentCandidateIndex)) {
            // Should such an equidistant candidate be located, disclose its value.
            presentOutputMessage(currentCandidateIndex);
            break; // Terminate the iteration as a solution has been identified.
        }
    }

    // Post-loop evaluation: if the loop completed without finding a suitable candidate,
    // currentCandidateIndex will equal spanMagnitude.
    if (currentCandidateIndex === spanMagnitude) {
        presentOutputMessage("NO_EQUILIBRIUM_POINT"); // Signal the absence of a discernible solution.
    }
};

// Engage the primary processing routine by supplying it with data read from the standard input stream.
conductPrimaryProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));