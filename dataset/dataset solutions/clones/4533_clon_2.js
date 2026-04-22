function ProcessInput(rawText) {
    // Separate the incoming text content into individual lines
    var lines = rawText.split("\n");

    // Extract the numerical value from the first line of input
    var elementCount = parseInt(lines[0]);

    // Break down the second line of input into an array of characters
    var characterStream = lines[1].split("");

    // Initialize an empty array for a potential intermediate result (not directly used as an array later)
    var initialResultHolder = [];

    // A flag to keep track of the current bracket type being processed (0 for '(', 1 for ')')
    var bracketTypeFlag = 0;

    // Create an array to store the counts of consecutive identical characters, sized for all possible segments
    var segmentTallies = new Array(elementCount + 1).fill(0);

    // Initialize the current position within the segmentTallies array
    var segmentPosition = 0;

    // Check the very first character of the input stream
    if (characterStream[0] === ")") {
        // If the first character is a closing bracket, adjust the initial segment position and flag
        segmentPosition = 1;
        bracketTypeFlag = 1;
        segmentTallies[segmentPosition]++;
    } else {
        // Otherwise, it's an opening bracket, so increment the count for the initial segment
        segmentTallies[segmentPosition]++;
    }

    // Iterate through the character stream starting from the second character
    for (var charIterator = 1; charIterator < elementCount; charIterator++) {
        // Compare the current character with the preceding one
        if (characterStream[charIterator] === characterStream[charIterator - 1]) {
            // If they are the same, increment the count for the current segment
            segmentTallies[segmentPosition]++;
        } else {
            // If they differ, advance to the next segment and increment its count
            segmentPosition++;
            segmentTallies[segmentPosition]++;
        }
    }

    // Variable to hold the calculated difference between paired segment counts
    var currentPairDifference = 0;

    // Accumulator for the total difference across all segment pairs
    var overallBalance = 0;

    // Process the segment tallies in steps of two to calculate overall balance
    for (var pairIterator = 0; pairIterator < elementCount; pairIterator = pairIterator + 2) {
        // Determine the difference between the current even-indexed segment and its subsequent odd-indexed segment
        currentPairDifference = segmentTallies[pairIterator] - segmentTallies[pairIterator + 1];
        // Add this difference to the running total of the overall balance
        overallBalance += currentPairDifference;
    }

    // Initialize the string that will hold the final, balanced sequence of brackets
    var finalBracketString = "";

    // Set an auxiliary index for adjustments, starting from the end of the segments
    var adjustmentIndex = elementCount;

    // Apply adjustments to segment counts based on the overall balance
    if (overallBalance < 0) {
        // If the overall balance is negative, add the absolute value to the first segment
        segmentTallies[0] -= overallBalance;
    } else if (overallBalance > 0) {
        // If the overall balance is positive, find a suitable segment to absorb the difference
        while (true) {
            if (segmentTallies[adjustmentIndex] > 0) {
                // If the current segment has a count
                if (adjustmentIndex % 2 === 0) {
                    // If it's an even-indexed segment, add the balance to the next (odd) segment
                    segmentTallies[adjustmentIndex + 1] += overallBalance;
                    break; // Exit the loop after adjustment
                } else {
                    // If it's an odd-indexed segment, add the balance to itself
                    segmentTallies[adjustmentIndex] += overallBalance;
                    break; // Exit the loop
                }
            } else {
                // If the segment is empty, move to the previous one
                adjustmentIndex--;
            }
        }
    } else if (segmentTallies[0] - segmentTallies[1] < 0) {
        // Special condition: if the first two segments show an imbalance (more ')' than '(')
        var initialSegmentImbalance = segmentTallies[1] - segmentTallies[0];
        segmentTallies[0] = segmentTallies[1]; // Equalize the first two segments

        while (true) {
            if (segmentTallies[adjustmentIndex] > 0 && adjustmentIndex % 2 === 0) {
                // If current segment is even and not empty, equalize it with the next segment
                segmentTallies[adjustmentIndex + 1] = segmentTallies[adjustmentIndex];
                break; // Exit
            } else if (segmentTallies[adjustmentIndex] > 0 && adjustmentIndex % 2 === 1) {
                // If current segment is odd and not empty, apply the initial imbalance
                segmentTallies[adjustmentIndex] += initialSegmentImbalance;
                break; // Exit
            } else {
                // If segment is empty, decrement the adjustment index
                adjustmentIndex--;
            }
        }
    }

    // Generate the final bracket string based on the adjusted segment tallies
    for (var sequenceBuilder = 0; sequenceBuilder < elementCount; sequenceBuilder++) {
        if (sequenceBuilder % 2 === 0) {
            // Even-indexed segments correspond to opening brackets
            for (var charGen = 0; charGen < segmentTallies[sequenceBuilder]; charGen++) {
                finalBracketString += "(";
            }
        }

        if (sequenceBuilder % 2 === 1) {
            // Odd-indexed segments correspond to closing brackets
            for (var charGen = 0; charGen < segmentTallies[sequenceBuilder]; charGen++) {
                finalBracketString += ")";
            }
        }
    }

    // Output the resulting balanced bracket string to the console
    console.log(finalBracketString);
}

// Read input from the standard input stream and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));