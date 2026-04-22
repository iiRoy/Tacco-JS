"use strict";
// This script processes a sequence and a threshold value
// to determine a specific character output.

function analyzeSequence (inputDataStream)
{
    // The input data is expected to be a multi-line string.
    // We split it into an array of individual lines.
    let lineFragments = inputDataStream.split('\n');

    // The first line contains the main string sequence to be analyzed.
    const primarySequence = lineFragments[0];

    // The second line contains a numerical threshold.
    // We parse it as an integer with base 10.
    const thresholdValue = parseInt(lineFragments[1], 10);

    // We search for the index of the first character that is not '1'.
    // If no such character is found, 'firstNonDigitOnePosition' will be -1.
    let firstNonDigitOnePosition = primarySequence.search(/[^1]+/);

    // Check if a non-'1' character was found AND if its position
    // is within the bounds defined by the threshold value.
    if (firstNonDigitOnePosition >= 0 && firstNonDigitOnePosition <= thresholdValue - 1)
    {
        // If both conditions are met, output the character at that position.
        console.log(primarySequence[firstNonDigitOnePosition]);
    }

    else
    {
        // Otherwise (if no non-'1' character or it's beyond the threshold),
        // output the default digit '1'.
        console.log(1);
    }
}

// The program initiates by reading input from standard input,
// then passing it to the core analysis function.
analyzeSequence( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) );