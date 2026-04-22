(function (sourceText) {
    /*
     * This anonymous function serves as the main entry point for processing
     * textual input to determine a specific type of longest common substring
     * between successive pairs of lines from the input.
     * It simulates reading from a standard input stream.
     */

    // First, preprocess the raw input: standardize line endings (remove carriage returns)
    // and then split the entire text into an array of individual lines.
    const processedLines = sourceText.replace(/\r/g, '').split("\n");

    // Declare all variables that will be used within this scope.
    let stringHolder = [];         // An array to temporarily hold the two current strings being compared.
    let shorterSegment;            // Will store the string with fewer characters for optimization.
    let longerSegment;             // Will store the string with more characters.
    let unnecessaryPlaceholder;    // A variable declared for structural consistency, but not utilized.
    let currentMatchLength;        // Tracks the potential length of a common substring being evaluated.
    let peakMatchLength;           // Stores the maximum length found for the current pair of strings.

    // Initiate an infinite loop to process pairs of lines until a specific termination condition is met.
    while (true) {
        // Reset the maximum match length for each new pair of strings.
        peakMatchLength = 0;

        // Extract the first line for the current comparison pair from the beginning of the `processedLines` array.
        stringHolder[0] = processedLines.shift();

        // Check if the extracted line is empty. An empty string signals the end of input.
        if (stringHolder[0] === '') {
            break; // Exit the loop if no more input lines are available.
        }

        // Extract the second line for the current comparison pair.
        stringHolder[1] = processedLines.shift();

        // Determine which of the two strings is shorter and which is longer.
        // This assignment helps to optimize the nested loop by iterating over the shorter string.
        if (stringHolder[0].length < stringHolder[1].length) {
            shorterSegment = stringHolder[0];
            longerSegment  = stringHolder[1];
        } else {
            shorterSegment = stringHolder[1];
            longerSegment  = stringHolder[0];
        }

        // Iterate through each possible starting character position within the shorter segment.
        for (let charIndex = 0, segmentLimit = shorterSegment.length; charIndex < segmentLimit; charIndex++) {
            // Initialize `currentMatchLength` for the potential substring.
            // It starts one greater than the `peakMatchLength` to attempt finding a longer match.
            currentMatchLength = peakMatchLength + 1;

            // Expand the potential common substring from the `shorterSegment` as long as:
            // 1. The substring remains within the bounds of `shorterSegment`.
            // 2. The substring is found within the `longerSegment` at an index *greater than 0*.
            //    Note: The condition `> 0` means it must not be found at the very beginning of `longerSegment`.
            while (shorterSegment[charIndex + currentMatchLength] && longerSegment.indexOf(shorterSegment.slice(charIndex, charIndex + currentMatchLength)) > 0) {
                currentMatchLength++; // Increment the length of the potential match.
            }

            // After the inner loop, if the `currentMatchLength` (adjusted by -1 because it increments one too many)
            // is greater than the `peakMatchLength` found so far for this pair, update the peak.
            if (currentMatchLength > peakMatchLength) {
                peakMatchLength = currentMatchLength - 1; // Store the new maximum length.
            }
        }

        // Output the final `peakMatchLength` for the current pair of strings to the console.
        console.log(peakMatchLength);
    }
})(
    // This immediately invoked function expression (IIFE) is called with the
    // content of the standard input file, read synchronously as UTF-8 text.
    require("fs").readFileSync("/dev/stdin", "utf8")
);