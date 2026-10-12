const fs = require('fs');

// Function to process the input, replicating the original logic
function processInput(inputString) {
    // Original: x=require('fs').readFileSync('/dev/stdin','utf8').replace(/,/g,"").trim().split(/\s/);
    // Replicate input processing: remove commas, trim, split by whitespace
    const words = inputString.replace(/,/g, "").trim().split(/\s/);

    // Using a functional approach with reduce to manage state (results array and current string)
    // The accumulator will hold { outputSegments: [], currentSegment: "" }
    const finalState = words.reduce((accumulator, currentWord) => {
        let { outputSegments, currentSegment } = accumulator;

        const wordWithoutPunctuation = currentWord.replace(/\./g, "");
        const hasPunctuation = wordWithoutPunctuation.length < currentWord.length;

        if (hasPunctuation) {
            // Original: if(x[i].replace(/\./g,"").length>=3&&x[i].replace(/\./g,"").length<=6){
            if (wordWithoutPunctuation.length >= 3 && wordWithoutPunctuation.length <= 6) {
                // Original: if(x[i].search(/\./)>=x[i].length-1){
                if (currentWord.indexOf('.') >= currentWord.length - 1) { // Dot at or near the end
                    outputSegments.push(currentSegment + wordWithoutPunctuation);
                }
                // Original: str=""; (always happens after this inner block)
                currentSegment = "";
            } else {
                // Original: else { str2.push(str); str=""; }
                outputSegments.push(currentSegment);
                currentSegment = "";
            }
        } else {
            // Original: else if(x[i].length>=3&&x[i].length<=6){
            if (currentWord.length >= 3 && currentWord.length <= 6) {
                // Original: str += x[i]+" ";
                currentSegment += currentWord + " ";
            }
            // Original: implicit else (do nothing)
        }

        return { outputSegments, currentSegment };
    }, { outputSegments: [], currentSegment: "" }); // Initial accumulator state

    // The original code does not push the final 'str' if the loop ends without a push condition.
    // So, we just return the accumulated outputSegments.
    return finalState.outputSegments;
}

// Read input from stdin
const rawInput = fs.readFileSync('/dev/stdin', 'utf8');

// Process the input to get the array of strings to print
const processedLines = processInput(rawInput);

// Output each processed line
// Original: for(i=0;i<str2.length;){ console.log(str2[i++]); }
// Using
