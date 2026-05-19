// This function processes the entire input data received.
function ProcessInput(rawData) {
    // Split the raw input string by newline characters to get an array of lines.
    var inputLines = rawData.split("\n");
    // The first line of the input contains the primary string for analysis.
    var initialString = inputLines[0];

    // This nested function recursively calculates the lengths of consecutive character segments.
    var calculateSegmentLengths = function(currentSegment, segmentLengths) {

        // Loop through the characters of the current segment.
        segmentLoop: for (var idx = 0; idx < currentSegment.length; idx++) {
            // If a character is found that is different from the very first character of this segment,
            if (currentSegment[idx] !== currentSegment[0]) {
                // The current segment ends here; slice the string to start from the differing character.
                currentSegment = currentSegment.slice(idx);
                // Record the length of the segment just identified.
                segmentLengths.push(idx);
                // Break out of the loop to process the new currentSegment recursively.
                break segmentLoop;
            }
            // If the loop reaches the end of the segment and all characters were the same,
            else if (idx === currentSegment.length - 1) {
                // The entire segment consists of identical characters; clear the string.
                currentSegment = "";
                // Record the full length of this segment.
                segmentLengths.push(idx + 1);
                // Break out of the loop.
                break segmentLoop;
            }
        }

        // If there's still a string left to process, call the function recursively.
        if (currentSegment) {
            return calculateSegmentLengths(currentSegment, segmentLengths);
        }
        // Otherwise, all segments have been processed, return the accumulated lengths.
        else {
            return segmentLengths;
        }
    };

    // Initialize a variable to hold the final computed result.
    var resultValue = 0;
    // Call the helper function to get an array of lengths for all character segments.
    var segmentLengths = calculateSegmentLengths(initialString, []);

    // Logic to determine the final result based on the number of segments found.
    if (segmentLengths.length === 2) {
        // If there are exactly two segments, the result is the length of the longer one.
        if (segmentLengths[0] >= segmentLengths[1]) {
            resultValue = segmentLengths[0];
        } else {
            resultValue = segmentLengths[1];
        }
    } else {
        // If there are more than two segments, initialize the result with the sum of the first two.
        resultValue = segmentLengths[0] + segmentLengths[1];
        // Iterate through the segment lengths to find the minimum sum of any two adjacent segments.
        for (var k = 0; k < segmentLengths.length - 1; k++) {
            // If the sum of the current adjacent pair is less than or equal to the current result, update the result.
            if (resultValue >= segmentLengths[k] + segmentLengths[k + 1]) {
                resultValue = segmentLengths[k] + segmentLengths[k + 1];
            }
        }
    }
    // Output the final calculated result to the console.
    console.log(resultValue);
}

// The following line is for standard input/output handling and should not be altered.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
