function ProcessInput(rawData) {
    // Split the raw input string into an array of lines.
    var inputLines = rawData.split("\n");

    // Parse the first line to get the total length of the character sequence.
    var sequenceLength = parseInt(inputLines[0], 10);

    // Split the second line into an array of individual characters.
    var charSequence = inputLines[1].split("");

    // This variable is declared as an array but will be re-declared as a string later.
    var resultString = [];

    // currentTypeIndicator: 0 typically represents '(', 1 represents ')'.
    var currentTypeIndicator = 0;

    // segmentCounts: An array to store the lengths of consecutive runs of identical characters.
    // For example, segmentCounts[0] might store the count of the first run of '(',
    // segmentCounts[1] the count of the first run of ')', and so on.
    var segmentCounts = new Array(sequenceLength + 1).fill(0);

    // segmentIndex: Used to track the current position within the segmentCounts array.
    var segmentIndex = 0;

    // Handle the very first character of the sequence.
    if (charSequence[0] === ")") {
        // If the first character is ')', it means the first segment is of type ')'.
        // We advance the segmentIndex to 1 (for the first ')' segment) and update the indicator.
        segmentIndex = 1;
        currentTypeIndicator = 1;
        segmentCounts[segmentIndex]++;
    } else {
        // If the first character is '(', it's the initial segment.
        segmentCounts[segmentIndex]++;
    }

    // Iterate through the rest of the character sequence to build up segmentCounts.
    for (var k = 1; k < sequenceLength; k++) {
        // If the current character is the same as the previous one, extend the current segment.
        if (charSequence[k] === charSequence[k - 1]) {
            segmentCounts[segmentIndex]++;
        } else {
            // If the character changes, it signifies the start of a new segment.
            // Increment segmentIndex and start counting for the new segment.
            segmentIndex++;
            segmentCounts[segmentIndex]++;
        }
    }

    // Variables to calculate and accumulate differences between alternating segments.
    var segmentDifference = 0;
    var overallBalance = 0;

    // Loop through the segmentCounts array, comparing counts of alternating segment types.
    // For instance, comparing segment 0 (e.g., '(') with segment 1 (e.g., ')'),
    // then segment 2 ('(') with segment 3 (')'), and so on.
    for (var k = 0; k < sequenceLength; k += 2) {
        segmentDifference = segmentCounts[k] - segmentCounts[k + 1];
        overallBalance += segmentDifference;
    }

    // Re-declare resultString as an empty string, discarding the previous array declaration.
    var resultString = "";
    // Reset segmentIndex to the total sequence length for backward iteration logic.
    segmentIndex = sequenceLength;

    // Adjust the segmentCounts based on the calculated overall balance to ensure a valid parenthesis structure.
    if (overallBalance < 0) {
        // If there's an overall deficit of '(' (i.e., an excess of ')'),
        // add the absolute value of the deficit to the first '(' segment.
        segmentCounts[0] -= overallBalance;
    } else if (overallBalance > 0) {
        // If there's an overall surplus of '(', find the last non-zero segment.
        while (true) {
            if (segmentCounts[segmentIndex] > 0) {
                if (segmentIndex % 2 === 0) {
                    // If the last non-zero segment is an '(' type, add the surplus to the *next* ')' type segment.
                    segmentCounts[segmentIndex + 1] += overallBalance;
                    break;
                } else {
                    // If the last non-zero segment is a ')' type, add the surplus to *this* ')' type segment.
                    segmentCounts[segmentIndex] += overallBalance;
                    break;
                }
            } else {
                // Move to the previous segment if the current one is zero.
                segmentIndex--;
            }
        }
    } else if (segmentCounts[0] - segmentCounts[1] < 0) {
        // This handles a specific edge case: overall balance is zero, but the initial '(' segment
        // is shorter than the initial ')' segment (e.g., "())(").
        var initialMismatch = segmentCounts[1] - segmentCounts[0];
        segmentCounts[0] = segmentCounts[1]; // Make the first '(' segment equal to the first ')' segment.

        // Find the last non-zero segment and adjust it or the next one.
        while (true) {
            if (segmentCounts[segmentIndex] > 0 && segmentIndex % 2 === 0) {
                // If the last non-zero segment is an '(' type, make the *next* ')' type segment equal to it.
                segmentCounts[segmentIndex + 1] = segmentCounts[segmentIndex];
                break;
            } else if (segmentCounts[segmentIndex] > 0 && segmentIndex % 2 === 1) {
                // If the last non-zero segment is a ')' type, add the initial mismatch to *this* ')' type segment.
                segmentCounts[segmentIndex] += initialMismatch;
                break;
            } else {
                // Move to the previous segment if the current one is zero.
                segmentIndex--;
            }
        }
    }

    // Construct the final output string based on the (potentially adjusted) segmentCounts.
    for (var k = 0; k < sequenceLength; k++) {
        if (k % 2 === 0) {
            // Even-indexed segments correspond to '(' characters.
            for (var m = 0; m < segmentCounts[k]; m++) {
                resultString += "(";
            }
        }

        if (k % 2 === 1) {
            // Odd-indexed segments correspond to ')' characters.
            for (var m = 0; m < segmentCounts[k]; m++) {
                resultString += ")";
            }
        }
    }

    // Print the final generated string to the console.
    console.log(resultString);
}

// Read the entire input from standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
