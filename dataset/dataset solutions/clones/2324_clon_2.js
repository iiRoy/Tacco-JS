'use strict';

// This function processes the provided input string.
const processInputData = (inputArgument) => {
    // Split the entire input into an array of lines.
    const dataLines = inputArgument.split('\n');

    // The first line contains the number of iterations.
    const iterationCount = dataLines[0];

    // The second line contains two space-separated strings.
    const stringParts = dataLines[1].split(' ');

    // Extract the first string.
    const firstComponent = stringParts[0];

    // Extract the second string.
    const secondComponent = stringParts[1];

    // Initialize an empty string to build the final result.
    let finalResult = "";

    // Loop through the characters of the two strings, interleaving them.
    for (let loopIndex = 0; loopIndex < iterationCount; loopIndex++) {
        finalResult += firstComponent.charAt(loopIndex) + secondComponent.charAt(loopIndex);
    }

    // Output the concatenated string to the console.
    console.log(finalResult);
};

// Read input from standard input and pass it to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
