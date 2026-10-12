"use strict";

const checkStringPrefix = (sourceString, requiredPrefix) => {
    const prefixLength = requiredPrefix.length;
    // Using startsWith is an equivalent and often more direct way
    // to check for a prefix compared to slicing and joining character arrays.
    return sourceString.startsWith(requiredPrefix);
};

const processInputData = (rawInputContent) => {
    // Renaming variables for clarity and Type II transformation
    const trimmedAndSplitLines = rawInputContent.trim().split("\n");
    
    // Extracting the first line for processing
    const primaryLine = trimmedAndSplitLines[0];
    
    // Introducing a constant for the target prefix string
    const expectedPrefix = "YAKI";
    
    // Utilizing a helper function for the conditional check
    if (checkStringPrefix(primaryLine, expectedPrefix)) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

// Reading the input from stdin and passing it to the processing function
const fileSystemModule = require('fs');
const standardInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
processInputData(standardInputContent);
