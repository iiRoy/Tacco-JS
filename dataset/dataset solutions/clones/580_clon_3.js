(function (rawInputData) {
    // Process the raw input text: remove carriage return characters and split into individual lines.
    // This array will be consumed line by line to form string pairs.
    const processedInputLines = rawInputData.replace(/\r/g, '').split("\n");

    // An array to store the computed longest common substring lengths for each pair.
    // This allows for collecting all results before printing them.
    const calculatedLengths = [];

    let currentLineA, currentLineB; // Variables to hold the two strings for the current comparison pair.

    // Main loop to iterate through the input lines, processing them in pairs.
    // The loop continues indefinitely until a specific termination condition is met.
    while (true) {
        // Step 1: Attempt to retrieve the first string of the pair.
        // If there are no more lines in the buffer, it means we've exhausted all input.
        if (processedInputLines.length === 0) {
            break; // Exit the loop if no more lines to read.
        }
        currentLineA = processedInputLines.shift();

        // If the first string retrieved is an empty string, it signals the end of valid input pairs.
        if (currentLineA === '') {
            break; // Terminate processing.
        }

        // Step 2: Attempt to retrieve the second string of the pair.
        // If there's no second line, it implies an incomplete pair or malformed input.
        // For robust handling, we assign an empty string as its pair.
        if (processedInputLines.length === 0) {
            currentLineB = ''; // Treat as an empty string if no second line is available.
        } else {
            currentLineB = processedInputLines.shift();
        }

        // Initialize a variable to keep track of the maximum common substring length found for the current pair.
        let maxCommonSubstringSpan = 0;

        // Determine which string is shorter and which is longer.
        // This optimization ensures that we iterate through substrings of the smaller string,
        // which is generally more efficient for the 'indexOf' search.
        let shorterInputString, longerInputString;
        if (currentLineA.length < currentLineB.length) {
            shorterInputString = currentLineA;
            longerInputString = currentLineB;
        } else {
            shorterInputString = currentLineB;
            longerInputString = currentLineA;
        }

        // Edge case handling: If either string in the pair is empty, there can be no common
        // substring of length greater than zero.
        if (shorterInputString.length === 0 || longerInputString.length === 0) {
            calculatedLengths.push(0); // Store 0 as the result for this pair.
            continue; // Skip to the next pair of strings.
        }

        // Iterate through each possible starting position within the shorter string.
        for (let startIndex = 0; startIndex < shorterInputString.length; startIndex++) {
            let currentTrialLength = 1; // Begin checking with substrings of length 1.

            // Inner loop: Continuously extend the current substring and check for its presence
            // in the longer string.
            while (true) {
                // Extract the potential common substring from the shorter string.
                const candidateSubstring = shorterInputString.substring(startIndex, startIndex + currentTrialLength);

                // Check two conditions to determine if we need to stop extending the current substring:
                // 1. If the 'candidateSubstring' is shorter than 'currentTrialLength', it means we've
                //    reached the end of 'shorterInputString'.
                // 2. If the 'candidateSubstring' is not found within 'longerInputString'.
                if (candidateSubstring.length !== currentTrialLength || longerInputString.indexOf(candidateSubstring) === -1) {
                    // The longest common substring starting at 'startIndex' has a length of
                    // 'currentTrialLength - 1' (because 'currentTrialLength' was incremented one too many times).
                    // Update the overall maximum if this one is greater.
                    maxCommonSubstringSpan = Math.max(maxCommonSubstringSpan, currentTrialLength - 1);
                    break; // Exit the inner loop and move to the next starting position.
                }
                currentTrialLength++; // If found, try a longer substring.
            }
        }
        // After checking all possible substrings for the current pair, store the maximum found length.
        calculatedLengths.push(maxCommonSubstringSpan);
    }

    // Finally, iterate through the collected results and print each one to the console.
    calculatedLengths.forEach(resultValue => console.log(resultValue));

// The entire logic is encapsulated in an Immediately Invoked Function Expression (IIFE).
// It reads input from standard input using Node.js 'fs' module.
})(require("fs").readFileSync("/dev/stdin", "utf8"));