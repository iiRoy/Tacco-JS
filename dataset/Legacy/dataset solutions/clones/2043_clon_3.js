const processInputData = function(sourceString) {
    // Helper function to generate a reversed version of a given string.
    // It explicitly converts the input to a string, similar to the original's String constructor usage.
    function getReversedString(originalValue) {
        const currentString = String(originalValue);
        let resultantString = "";
        // Iterates through the string from the beginning and prepends each character
        // to build the reversed string. This is an alternative loop structure.
        for (let charIndex = 0; charIndex < currentString.length; charIndex++) {
            resultantString = currentString.charAt(charIndex) + resultantString;
        }
        return resultantString;
    }

    // A small helper function to determine if a string is a palindrome.
    // It ensures consistent string conversion for its input.
    const isPalindrome = (text) => {
        const processedText = String(text);
        return getReversedString(processedText) === processedText;
    };

    // Explicitly convert the input sourceString to a primitive string for consistent length and substring operations.
    const stringWrapper = String(sourceString);
    const stringLength = stringWrapper.length;

    // The first required output: print the reversed version of the initial input string.
    console.log(getReversedString(sourceString));

    let finalDecision = "No"; // Initialize a flag to store the final "Yes" or "No" decision.

    // Check if the entire input string is a palindrome.
    if (isPalindrome(sourceString)) {
        // Calculate the end index for the first segment.
        // The division (stringLength - 1) / 2 correctly handles both odd and even lengths,
        // as substring implicitly truncates float indices.
        const firstSegmentEndIndex = (stringLength - 1) / 2;
        const firstSegment = stringWrapper.substring(0, firstSegmentEndIndex);

        // If the first segment is also a palindrome.
        if (isPalindrome(firstSegment)) {
            // Calculate the start index for the second segment.
            // (stringLength + 3) / 2 ensures the correct starting point,
            // with substring truncating float indices.
            const secondSegmentStartIndex = (stringLength + 3) / 2;
            // The end index for substring is exclusive, so stringLength - 1 means up to index stringLength - 2.
            const secondSegment = stringWrapper.substring(secondSegmentStartIndex, stringLength - 1);

            // If the second segment is also a palindrome, then all conditions are met.
            if (isPalindrome(secondSegment)) {
                finalDecision = "Yes";
            }
        }
    }

    // Print the final decision based on the palindrome checks.
    console.log(finalDecision);
};

// Read the input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
