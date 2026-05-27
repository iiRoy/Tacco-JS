let inputTokens = require('fs').readFileSync('/dev/stdin', 'utf8')
    .replace(/,/g, "") // Remove all commas from the input string
    .trim()             // Trim leading/trailing whitespace
    .split(/\s/);       // Split the string by any whitespace characters into an array of tokens

// This array will store the final processed segments.
let resultCollection = [];

// This string accumulates parts of a segment before it's finalized.
let currentSegment = "";

// Iterate through each token obtained from the input.
for (let idx = 0; idx < inputTokens.length; idx++) {
    // Check if the current token contains a period ('.').
    // If its length changes after removing periods, it means it had at least one.
    if (inputTokens[idx].replace(/\./g, "").length < inputTokens[idx].length) {
        // Log the original token if it contains a period.
        console.log("x[i] : " + inputTokens[idx]);

        // Further check if the token (without periods) has a length between 3 and 6 characters.
        if (inputTokens[idx].replace(/\./g, "").length >= 3 && inputTokens[idx].replace(/\./g, "").length <= 6) {
            // If the period is at the very end of the token.
            if (inputTokens[idx].search(/\./) === inputTokens[idx].length - 1) {
                // Append the token (without the trailing period) to the current segment.
                currentSegment += inputTokens[idx].replace(/\./g, "");
                // Add the completed segment to the collection.
                resultCollection.push(currentSegment);
            } else {
                // If the period is not at the end, just append the token as is.
                currentSegment += inputTokens[idx];
            }
        } else {
            // If the token (without periods) is not between 3 and 6 chars, reset the current segment.
            currentSegment = "";
        }
    }
    // If the token does not contain a period, check its length.
    else if (inputTokens[idx].length >= 3 && inputTokens[idx].length <= 6) {
        // If length is between 3 and 6, append it to the current segment followed by a space.
        currentSegment += inputTokens[idx] + " ";
    }
}

// After processing all tokens, iterate through the collected segments and print them.
for (let idx = 0; idx < resultCollection.length;) {
    console.log(resultCollection[idx++]);
}
