(function (rawData) {
    // Initialize variables for processing the input data.
    // `lineData` will store individual lines after initial parsing.
    // `stringPair` will hold the two strings currently being compared.
    // `shorterStr` and `longerStr` will reference the two strings based on their length.
    // `tempVar` is an unused placeholder, mirroring the original's `tmp`.
    // `currentLength` tracks the length of the common substring being evaluated.
    // `maxLength` stores the longest common substring found for the current pair.
    var lineData = rawData.replace(/\r/g, '').split("\n"),
        stringPair = [],
        shorterStr,
        longerStr,
        tempVar, // This variable is declared but not used, consistent with the original.
        currentLength,
        maxLength;

    // Begin an infinite loop to process string pairs until a specific termination condition is met.
    while (true) {
        // Reset the maximum length for each new pair of strings.
        maxLength = 0;

        // Extract the first string for the current comparison from the `lineData` array.
        stringPair[0] = lineData.shift();

        // Check if the first string is empty. An empty string signals the end of input.
        if (stringPair[0] === '') {
            break; // Exit the loop if no more input strings are available.
        }

        // Extract the second string for the current comparison.
        stringPair[1] = lineData.shift();

        // Determine which of the two strings is shorter and which is longer.
        // This optimization helps in iterating through the smaller set of possible substrings.
        if (stringPair[0].length < stringPair[1].length) {
            shorterStr = stringPair[0];
            longerStr = stringPair[1];
        } else {
            shorterStr = stringPair[1];
            longerStr = stringPair[0];
        }

        // Iterate through each possible starting position in the `shorterStr`.
        for (var idx = 0, shortLen = shorterStr.length; idx < shortLen; idx++) {
            // Initialize the `currentLength` for the substring starting at `idx`.
            currentLength = 1;

            // Continuously extend the substring from `idx` as long as:
            // 1. The substring does not exceed the bounds of `shorterStr`.
            // 2. The current substring is found within `longerStr` at an index greater than 0.
            //    Note: The condition `> 0` means substrings found at the very beginning of `longerStr` are not counted.
            while (shorterStr[idx + currentLength] && longerStr.indexOf(shorterStr.slice(idx, idx + currentLength)) > 0) {
                currentLength++; // Increment the length if the extended substring is found.
            }

            // After the inner loop, `currentLength` will be one greater than the actual longest common substring found
            // (because it incremented one last time before the `while` condition failed).
            // So, subtract 1 to get the correct length and update `maxLength` if this is the longest so far.
            if (currentLength > maxLength) {
                maxLength = currentLength - 1;
            }
        }

        // Output the maximum common substring length found for the current pair of strings.
        console.log(maxLength);
    }
// Immediately invoke the function, passing the content of `/dev/stdin` as input.
})(require("fs").readFileSync("/dev/stdin", "utf8"));
