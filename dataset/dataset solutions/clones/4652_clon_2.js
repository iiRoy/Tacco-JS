"use strict";

// This function orchestrates the primary logic for processing the input data.
const executeLogic = (rawData) => {
    // Initial data preparation: remove leading/trailing spaces and split by newline characters.
    rawData = rawData.trim().split("\n");

    // Parse the first line to determine the total number of subsequent strings.
    const lineCount = parseInt(rawData[0], 10);

    // Extract the relevant input strings based on the 'lineCount'.
    const stringCollection = rawData.slice(1, lineCount + 1);

    // Define the complete set of lowercase English characters for analysis.
    const letterPool = "abcdefghijklmnopqrstuvwxyz".split("");

    // Initialize an array to store the characters that are common across all input strings.
    let outputChars = [];

    // Begin iterating through each individual character in our predefined 'letterPool'.
    for (let charIndex in letterPool) {
        // Initialize a variable to track the minimum occurrences of the current character
        // found across all strings. Start with a very high value.
        let leastCount = Infinity;

        // For each character, iterate through every string in the 'stringCollection'.
        for (let stringIndex in stringCollection) {
            // Get the current string being examined from the collection.
            let currentStr = stringCollection[stringIndex];
            // Calculate the frequency of the current character within the current string.
            let currentCount = currentStr.split("").filter(itemChar => itemChar === letterPool[charIndex]).length;

            // Check if the current character was present in the current string.
            if (currentCount > 0) {
                // If present, update 'leastCount' to be the minimum of its current value
                // and the 'currentCount' found in this string.
                leastCount = Math.min(currentCount, leastCount);
            } else {
                // If the character is not found in even one string, its overall common
                // occurrence across all strings is zero.
                leastCount = 0;
                // Since it's confirmed not to be common, we can stop checking other strings
                // for this particular character.
                break;
            }
        }

        // After analyzing all strings for the current character, append it to the
        // 'outputChars' array 'leastCount' times.
        for (let repeatCount = 0; repeatCount < leastCount; repeatCount++) {
            outputChars.push(letterPool[charIndex]);
        }
    }

    // Finally, concatenate all the characters in 'outputChars' into a single string
    // and print it to the console.
    console.log(outputChars.join(""));
};

// Read the entire content of standard input, decode it as UTF-8, and pass it
// to our primary processing function 'executeLogic'.
executeLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));