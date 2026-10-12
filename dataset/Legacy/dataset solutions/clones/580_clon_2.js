(function (rawData) {
    // This self-executing function processes input data to find the longest common substring
    // between pairs of strings provided in the input.

    // Initialize variables:
    // lineData: An array of strings, obtained by cleaning and splitting the raw input.
    // stringPair: An array to temporarily hold the two strings being compared in each iteration.
    // shorterString, longerString: References to the two strings, assigned based on length for efficiency.
    // tempVar: An unused variable, maintained for structural consistency with the original.
    // currentLength: Tracks the length of the common substring being checked from a given starting point.
    // maxLength: Stores the maximum common substring length found for the current pair of strings.
    var lineData = rawData.replace(/\r/g, '').split("\n"),
        stringPair = [],
        shorterString,
        longerString,
        tempVar,
        currentLength,
        maxLength;

    // The main processing loop continues indefinitely until an empty string signals the end of input.
    while (true) {
        // Reset the maximum length for each new pair of strings.
        maxLength = 0;

        // Extract the first string of the current pair from the beginning of the lineData array.
        stringPair[0] = lineData.shift();

        // Check if the extracted string is empty. An empty string indicates the end of input data.
        if (stringPair[0] === '') {
            break; // Exit the loop if no more input strings are available.
        }

        // Extract the second string of the current pair.
        stringPair[1] = lineData.shift();

        // Determine which string is shorter and which is longer.
        // This optimization helps in iterating over the smaller string for potential substrings.
        if (stringPair[0].length < stringPair[1].length) {
            shorterString = stringPair[0];
            longerString = stringPair[1];
        } else {
            shorterString = stringPair[1];
            longerString = stringPair[0];
        }

        // Iterate through each possible starting character in the shorter string.
        for (var idx = 0, shortLen = shorterString.length; idx < shortLen; idx++) {
            currentLength = 1; // Start checking for a common substring of length 1.

            // Expand the current substring from 'idx' as long as:
            // 1. The character at 'idx + currentLength - 1' exists in the shorter string (prevents out-of-bounds).
            // 2. The substring from 'idx' to 'idx + currentLength' is found within the longer string.
            while (shorterString[idx + currentLength - 1] && longerString.indexOf(shorterString.slice(idx, idx + currentLength)) >= 0) {
                currentLength++; // Increment the length of the potential common substring.
            }

            // After the inner loop, 'currentLength' will be one greater than the actual
            // longest common substring found starting at 'idx'.
            // Update the overall maximum length if the current common substring is longer.
            if (currentLength > maxLength) {
                maxLength = currentLength - 1;
            }
        }
        // Output the maximum common substring length found for the current pair of strings.
        console.log(maxLength);
    }
// The input is read from standard input using Node.js file system module.
})(require("fs").readFileSync("/dev/stdin", "utf8"));
