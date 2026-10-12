let inputTokens = require('fs').readFileSync('/dev/stdin', 'utf8')
    .replace(/,/g, "")
    .trim()
    .split(/\s/);

let processedSegments = [];
let currentSegment = "";

for (let idx = 0; idx < inputTokens.length; idx++) {
    // Check if the current token contains a period
    if (inputTokens[idx].replace(/\./g, "").length < inputTokens[idx].length) {
        // If it contains a period, check its length after removing periods
        if (inputTokens[idx].replace(/\./g, "").length >= 3 && inputTokens[idx].replace(/\./g, "").length <= 6) {
            // If the period is at the end or not present (after replacement)
            if (inputTokens[idx].search(/\./) >= inputTokens[idx].length - 1) {
                currentSegment += inputTokens[idx].replace(/\./g, "");
                processedSegments.push(currentSegment);
            } else {
                // If period is in the middle, append as is
                currentSegment += inputTokens[idx];
            }
            // Reset current segment after processing a period-containing word
            currentSegment = "";
        } else {
            // If length is not within range, push current segment and reset
            processedSegments.push(currentSegment);
            currentSegment = "";
        }
    } else if (inputTokens[idx].length >= 3 && inputTokens[idx].length <= 6) {
        // If no period and length is within range, append to current segment
        currentSegment += inputTokens[idx] + " ";
    }
}

// Output the collected segments
for (let idx = 0; idx < processedSegments.length;) {
    console.log(processedSegments[idx++]);
}
