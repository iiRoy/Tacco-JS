"use strict";

/*
 * This module defines a primary function to process textual input.
 * It reads two lines of text, manipulates them, and then performs a comparison.
 */
const AnalyzeStrings = (rawText) => {
    // First, we prepare the incoming data.
    // The entire input string is trimmed of leading/trailing whitespace,
    // and then split into an array of individual lines based on newline characters.
    let textLines = rawText.trim().split('\n');

    // We extract the first line from our array of lines.
    // This line is then broken down into an array of its constituent characters.
    let firstStringPart = textLines[0].split('');

    // Similarly, we take the second line from the input array.
    // This line is also converted into an array of characters.
    let secondStringPart = textLines[1].split('');

    // Now, we transform the character arrays into new string representations.
    // For the first part, characters are sorted alphabetically (ascending)
    // and then concatenated back into a single string.
    firstStringPart = firstStringPart.sort().join('');

    // For the second part, characters are first sorted alphabetically (ascending),
    // then the order of these sorted characters is reversed (descending),
    // and finally, they are joined to form a single string.
    secondStringPart = secondStringPart.sort().reverse().join('');

    // A lexicographical comparison is performed between the two resulting strings.
    // If the first processed string is "less than" the second processed string,
    // according to standard string comparison rules, we output 'Yes'.
    if (firstStringPart < secondStringPart) {
        console.log('Yes');
    }
    // Otherwise, if the first string is greater than or equal to the second,
    // we output 'No'.
    else {
        console.log('No');
    }
};

// The program's execution begins here.
// It reads the entire content of the standard input stream ('/dev/stdin')
// as a UTF-8 encoded string.
// This content is then passed to our main processing function, AnalyzeStrings.
AnalyzeStrings(require('fs').readFileSync('/dev/stdin', 'utf8'));
