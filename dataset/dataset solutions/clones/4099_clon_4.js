'use strict';

const performTransformation = (inputSource) => {
    // Obtain the first segment of text, typically the first line, from the provided input string.
    // This operation isolates the relevant part of the input.
    const targetString = inputSource.split('\n')[0];

    // Deconstruct the target string into three parts for modification:
    // 1. `frontSegment`: Characters from the beginning up to, but not including, index 3.
    //    If the string is shorter than 3 characters, it will contain all available characters.
    const frontSegment = targetString.slice(0, 3);

    // 2. `backSegment`: Characters from index 4 onwards.
    //    If the string is shorter than 4 characters, this will be an empty string.
    const backSegment = targetString.slice(4);

    // Reconstruct the string by inserting '8' at the fourth position (index 3).
    // This concatenation effectively replaces the character at index 3 if it exists,
    // or appends '8' after the first three characters if the string is shorter.
    const finalResult = frontSegment + '8' + backSegment;

    // Display the modified string.
    console.log(finalResult);
};

// Execute the transformation by reading the full content of standard input
// and passing it as a UTF-8 encoded string.
performTransformation(require("node:fs").readFileSync("/dev/stdin", "utf8"));