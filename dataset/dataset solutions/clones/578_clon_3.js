(function (rawInputText) {
    // This section handles initial input parsing and preparation.
    // It removes all carriage return characters (`\r`) to ensure consistent line endings
    // and then splits the entire input string into an array of individual lines,
    // using the newline character (`\n`) as a delimiter.
    const inputLinesArray = rawInputText.replaceAll('\r', '').split("\n");

    // A temporary array to hold the two strings currently being processed from the input.
    let stringPair = [];

    // This variable will store the length of the longest common substring found
    // for the current pair of strings being analyzed.
    let maxCommonLengthResult;

    /**
     * Determines the length of the longest common substring between two provided strings.
     * This implementation uses a nested loop approach, iterating through all possible
     * substrings of the shorter string and checking for their presence in the longer string.
     * An optimization is included to start checking substring lengths from the
     * previously discovered maximum to potentially reduce redundant checks.
     *
     * @param {string} primaryString - The first string for comparison.
     * @param {string} secondaryString - The second string for comparison.
     * @returns {number} The integer length of the longest common substring found.
     */
    const computeLongestCommonSubstring = (primaryString, secondaryString) => {
        let currentIterationMax = 0; // Tracks the maximum length found within this function call.
        let stringForShorterLoop;     // Will hold the string determined to be shorter.
        let stringForLongerCheck;     // Will hold the string determined to be longer.

        // Optimize by iterating over the shorter string and checking against the longer one.
        if (primaryString.length < secondaryString.length) {
            stringForShorterLoop = primaryString;
            stringForLongerCheck = secondaryString;
        } else {
            stringForShorterLoop = secondaryString;
            stringForLongerCheck = primaryString;
        }

        const lengthOfShorter = stringForShorterLoop.length;

        // Iterate through each character of the shorter string as a potential starting point
        // for a common substring.
        for (let currentStartIndex = 0; currentStartIndex < lengthOfShorter; currentStartIndex++) {
            // Initialize the length of the substring we are currently testing.
            // Optimization: Start checking from `currentIterationMax + 1`. If we've already found
            // a common substring of length X, we don't need to re-verify substrings of length 1 to X;
            // we can immediately look for longer ones.
            let testedSubstringLength = currentIterationMax + 1;

            // Continuously extend the current substring as long as two conditions are met:
            // 1. The substring remains within the bounds of the shorter string.
            // 2. The extended substring is found anywhere within the longer string.
            //    (Note: The original code used `indexOf(...) > 0`. This clone uses `includes()`
            //    for a standard "is present anywhere" check, which is equivalent to `indexOf(...) !== -1`).
            while (
                (currentStartIndex + testedSubstringLength <= lengthOfShorter) &&
                stringForLongerCheck.includes(stringForShorterLoop.substring(currentStartIndex, currentStartIndex + testedSubstringLength))
            ) {
                testedSubstringLength++; // Increment the length to test a longer substring.
            }

            // After the inner `while` loop, `testedSubstringLength` will be one greater than
            // the actual longest common substring found starting at `currentStartIndex`.
            // We subtract 1 to get the true length and update `currentIterationMax` if it's
            // a new overall maximum.
            if ((testedSubstringLength - 1) > currentIterationMax) {
                currentIterationMax = testedSubstringLength - 1;
            }
        }
        return currentIterationMax; // Return the maximum length found for this pair.
    };

    // --- Core Application Loop ---
    // This loop processes pairs of strings from the `inputLinesArray` until a specific
    // termination condition is met.
    while (true) {
        // Attempt to extract the first string of the next pair from the beginning of the array.
        stringPair[0] = inputLinesArray.shift();

        // Termination condition: If the first string is empty or undefined (indicating no more lines),
        // the processing stops.
        if (stringPair[0] === '' || stringPair[0] === undefined) {
            break;
        }

        // Attempt to extract the second string of the current pair.
        stringPair[1] = inputLinesArray.shift();

        // Robustness check: If there's an odd number of lines in the input, `shift()` might
        // return `undefined` for the second string. In such cases, we treat it as an empty string.
        if (stringPair[1] === undefined) {
            stringPair[1] = '';
        }

        // Invoke the helper function to calculate the longest common substring length
        // for the current pair of strings.
        maxCommonLengthResult = computeLongestCommonSubstring(stringPair[0], stringPair[1]);

        // Output the calculated length to standard output, followed by a newline character.
        // Using `process.stdout.write` for direct stream output, similar to `console.log`
        // but often preferred in competitive programming for potentially faster I/O.
        process.stdout.write(maxCommonLengthResult + '\n');
    }

// This Immediately Invoked Function Expression (IIFE) is called with the content
// of the standard input (`/dev/stdin`), which is read synchronously as UTF-8 text.
})(require("fs").readFileSync("/dev/stdin", "utf8"));