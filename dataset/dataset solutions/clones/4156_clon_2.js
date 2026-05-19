"use strict";

const processInput = inputData => {
    // Process the first line of input: split by newline, take the first part,
    // then split into characters, sort them alphabetically, and join back.
    const firstSortedString = inputData.split("\n")[0].split("").sort().join("");

    // Process the second line of input: split by newline, take the second part,
    // then split into characters, sort them alphabetically, reverse the order, and join back.
    const secondReversedString = inputData.split("\n")[1].split("").sort().reverse().join("");
    
    // Compare the two resulting strings lexicographically and print "Yes" or "No".
    console.log(firstSortedString < secondReversedString ? "Yes" : "No");
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
