"use strict"

// This module defines a function designed to parse and combine specific parts of textual input.
const ProcessInput = (sourceText) => {

    // Output the complete raw text received as an initial step.
    console.log(sourceText);

    // First, clean up the input by removing any leading or trailing whitespace,
    // then segment it into an array where each element is a distinct line of text.
    // The splitting occurs at each newline character.
    const textLines = sourceText
                        .trim()
                        .split(/\n/);

    // Deconstruct the initial line of the input.
    // It's broken into sub-parts using any non-digit character as a separator.
    const lineOneParts = textLines[0]
                                  .split(/\D/);

    // Similarly, process the second line from the input.
    // Apply the identical non-digit splitting pattern to segment this line.
    const lineTwoParts = textLines[1]
                                  .split(/\D/);

    // Take the third line and apply the same splitting logic.
    // This yields its own set of sub-parts based on non-digit delimiters.
    const lineThreeParts = textLines[2]
                                    .split(/\D/);

    // Assemble the final string result.
    // This is achieved by concatenating the first element from the first line's segments,
    // the second element from the second line's segments,
    // and the third element from the third line's segments.
    const compositeValue = `${lineOneParts[0]}${lineTwoParts[1]}${lineThreeParts[2]}`;

    // Present the final constructed string to the standard output.
    console.log(compositeValue);

};


// The main execution block: reads content from standard input and passes it to the processor.
// The 'fs' (file system) module is employed for synchronous file reading,
// with 'utf8' specified as the character encoding for the input stream.
ProcessInput(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
);