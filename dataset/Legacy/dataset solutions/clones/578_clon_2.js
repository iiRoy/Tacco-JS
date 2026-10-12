(function (rawData) {
    // This section initializes variables and processes the raw input data.
    // The rawData is first cleaned by removing carriage return characters,
    // then split into an array of individual lines based on newline characters.
    var lineSegments = rawData.replace(/\r/g, '').split("\n"),
        stringPair = [],     // An array to temporarily hold the two strings being compared in each iteration.
        shorterText,         // Will store the string with the lesser length.
        longerText,          // Will store the string with the greater length.
        temporaryVar,        // An auxiliary variable, declared but not utilized in the current logic.
        currentLength,       // Keeps track of the length of the substring currently being examined.
        maxLength;           // Stores the longest common substring length found for the current pair.

    // The main processing loop continues indefinitely until an explicit break condition is met.
    while (true) {
        maxLength = 0x0; // Reset the maximum length for each new pair of strings.

        // Retrieve the first string for the current comparison from the input segments.
        stringPair[0x0] = lineSegments.shift();

        // If the first string retrieved is empty, it signals the end of the input data,
        // and the loop is terminated.
        if (stringPair[0x0] === '') {
            break;
        }

        // Retrieve the second string for the current comparison.
        stringPair[0x1] = lineSegments.shift();

        // Determine which of the two strings is shorter and which is longer.
        // This optimization helps in iterating over the smaller string for efficiency.
        if (stringPair[0x0].length < stringPair[0x1].length) {
            shorterText = stringPair[0x0];
            longerText = stringPair[0x1];
        } else {
            shorterText = stringPair[0x1];
            longerText = stringPair[0x0];
        }

        // Iterate through each possible starting position within the shorter string.
        for (var idx = 0x0, shortLen = shorterText.length; idx < shortLen; idx++) {
            // Initialize the current substring length to one greater than the maximum found so far.
            // This allows for checking progressively longer substrings.
            currentLength = maxLength + 0x1;

            // This inner loop attempts to extend the current substring.
            // It continues as long as:
            // 1. The substring being checked is still within the bounds of the shorterText.
            // 2. The substring exists within the longerText, and its starting index in longerText is not 0.
            //    (Note: The original logic specifically checks for `> 0`, meaning substrings starting at index 0 of `longerText` are not counted by this loop.)
            while (shorterText[idx + currentLength] && longerText.indexOf(shorterText.slice(idx, idx + currentLength)) > 0x0) {
                currentLength++; // Increment the length of the substring if it meets the criteria.
            }

            // After the inner loop, if the `currentLength` (which was incremented one too many times)
            // indicates a longer common substring than `maxLength`, update `maxLength`.
            if (currentLength > maxLength) {
                maxLength = currentLength - 0x1; // Adjust by subtracting one to get the actual length.
            }
        }
        // Output the determined maximum length of the common substring for the current pair of strings.
        console.log(maxLength);
    }
})(require("fs").readFileSync("/dev/stdin", "utf8")); // The entire function is immediately invoked with input read from standard input.
