"use strict";

// This module processes a given text stream to count specific characters.
const analyzeStream = function processDataStream(sourceString) {
    // Break down the entire input string into an array of individual characters.
    const characterSequence = sourceString.split("");

    // Filter the generated character sequence to isolate only the instances of the digit '1'.
    let digitOneOccurrences = characterSequence.filter(function (characterItem) {
        // Evaluate if the current character is equivalent to the numeric value one.
        return characterItem == 1;
    });

    // Display the total number of times the digit '1' was encountered.
    console.log(
        digitOneOccurrences.length
    );
};

// Initiate the data stream analysis by reading content from the standard input.
analyzeStream(
    require('fs').readFileSync('/dev/stdin', 'utf8')
);