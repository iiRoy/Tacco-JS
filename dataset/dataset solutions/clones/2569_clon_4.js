"use strict";

// A function to acquire the raw textual input from the standard input stream.
// This replaces the direct inline call to require('fs').readFileSync.
const acquireSourceText = () => require('fs').readFileSync('/dev/stdin', 'utf8');

// The central processing unit for the numerical operation.
// It takes the raw text and performs the necessary calculations.
const processNumericalInput = (incomingContent) => {
    // Instead of splitting and trimming, a regular expression extracts the first numeric sequence.
    // If no number is found, it defaults to undefined, which Number() will convert to NaN.
    // This provides equivalent behavior for non-numeric input as parseInt.
    const extractedNumberStr = (incomingContent.match(/^-?\d+/) || [undefined])[0];
    
    // Converts the string representation of the number using the Number constructor,
    // as an alternative to parseInt.
    const initialNumericValue = Number(extractedNumberStr);
    
    // Computes the cube of the number using Math.pow, differing from direct multiplication.
    const cubedResult = Math.pow(initialNumericValue, 3);
    
    // Outputs the final result to standard output using process.stdout.write,
    // which is a different mechanism compared to console.log.
    process.stdout.write(String(cubedResult) + '\n');
};

// Initiates the entire workflow: first acquiring the data, then processing it.
processNumericalInput(acquireSourceText());