/*
 * This script processes character sequences obtained from a standard input source.
 * It aims to calculate a cumulative score based on character matching logic
 * across three distinct character sequences.
 */

// Utilize the built-in 'fs' module to synchronously read data from the system's standard input.
var acquiredInputData = require('node:fs')
                                  .readFileSync(
                                      '/dev/stdin' // Path representing standard input stream
                                    , 'utf-8'      // Specify the character encoding for the input data
                                  );


// Parse the raw input string by splitting it into an array of individual line segments.
var processedLineSegments = acquiredInputData.split('\n');


// Convert the first line segment to a numeric value, representing the total count of relevant lines.
const totalLineCount = Number(processedLineSegments[0]);


// Extract and split the next three line segments into arrays of single characters.
var primarySequence = processedLineSegments[1]
                                          .split('');

var secondarySequence = processedLineSegments[2]
                                          .split('');

var tertiarySequence = processedLineSegments[3]
                                          .split('');


// Initialize a variable to store the final accumulated score.
let accumulatedScore = 0;


/**
 * Evaluates whether at least two of the three character sequences have
 * an identical character at a specific zero-based index.
 *
 * @param {number} currentPosition - The numerical index to check within each sequence.
 * @returns {boolean} Returns `true` if any pair of characters at `currentPosition` matches,
 *                    otherwise returns `false`.
 */
const evaluateCharacterSimilarity = ( currentPosition ) => {

    // Compare characters from the three sequences at the given index.
    if ( ( primarySequence[currentPosition] === secondarySequence[currentPosition] ) ||
         ( secondarySequence[currentPosition] === tertiarySequence[currentPosition] ) ||
         ( tertiarySequence[currentPosition] === primarySequence[currentPosition] )
       ) {
        return true; // Indicates that two or more characters are the same.
    }

    return false; // Indicates that all three characters are distinct.
};


// Iterate through each character position across the sequences, up to the determined line count.
for ( let sequenceIterator = 0; sequenceIterator < totalLineCount; sequenceIterator++ ) {

    // Check if no two characters are similar at the current position.
    if ( !evaluateCharacterSimilarity( sequenceIterator ) ) {
        // If all three characters are unique, increment the score by two points.
        accumulatedScore += 2;
    }

    // Else, if all three characters at the current position are identical.
    else if ( ( primarySequence[sequenceIterator] === secondarySequence[sequenceIterator] ) &&
              ( secondarySequence[sequenceIterator] === tertiarySequence[sequenceIterator] )
            ) {
        // In this specific case (all three match), no points are added to the score.
        // This block intentionally performs no operation.
    }

    // Otherwise (exactly two characters are similar).
    else {
        // If precisely two characters are identical, increment the score by one point.
        accumulatedScore += 1;
    }

}


// Display the final calculated accumulated score to the standard output.
console.log(accumulatedScore);