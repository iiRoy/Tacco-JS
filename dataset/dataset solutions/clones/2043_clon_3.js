const ProcessInput = function(sourceText) {
    // Utility function to obtain the reverse of a given string
    const getReversedText = (originalSegment) => {
        // Ensure we're working with a string primitive, even if input is an object or number
        let textToReverse = String(originalSegment);
        let reversedAccumulator = "";
        // Iterate backwards through the string to build the reversed version
        for (let characterIndex = textToReverse.length - 1; characterIndex >= 0; characterIndex--) {
            reversedAccumulator += textToReverse[characterIndex]; // Using bracket notation for character access
        }
        return reversedAccumulator;
    };

    // Helper function to determine if a string is a palindrome
    const isPalindrome = (candidateString) => {
        // A direct comparison with its reversed version determines if it's a palindrome
        return candidateString === getReversedText(candidateString);
    };

    // Standardize input as a string and get its length for subsequent operations
    const mainTextValue = String(sourceText);
    const mainTextLength = mainTextValue.length;

    // Step 1: Check if the entire input string is a palindrome
    let fullStringCheckResult = isPalindrome(mainTextValue);

    // If the main string isn't a palindrome, the overall condition is false
    if (!fullStringCheckResult) {
        console.log("No");
        return; // Exit early as further checks are unnecessary
    }

    // Calculate the length for the first sub-segment.
    // This formula effectively gets the length of the first half, excluding the middle character for odd-length strings.
    // E.g., for "racecar" (length 7), (7-1)/2 = 3. Substring (0,3) gives "rac".
    const firstSegmentEndIdx = (mainTextLength - 1) / 2;

    // Extract the first sub-segment from the beginning of the main string
    const firstSegmentCandidate = mainTextValue.substring(0, firstSegmentEndIdx);
    // Step 2: Check if this first sub-segment is also a palindrome
    let firstSegmentCheckResult = isPalindrome(firstSegmentCandidate);

    // If the first sub-segment isn't a palindrome, the overall condition is false
    if (!firstSegmentCheckResult) {
        console.log("No");
        return; // Exit early
    }

    // Calculate the start and end indices for the second sub-segment.
    // These indices are derived directly from the original problem's specific definition.
    // The original logic for `c` was `x.substring((n+3)/2, n-1)`.
    // E.g., for "racecar" (length 7):
    // start = (7+3)/2 = 5
    // end = 7-1 = 6
    // Substring (5,6) extracts "c" (the character at index 5).
    const secondSegmentStartIdx = (mainTextLength + 3) / 2;
    const secondSegmentEndIdx = mainTextLength - 1;

    // Extract the second sub-segment using the calculated indices
    const secondSegmentCandidate = mainTextValue.substring(secondSegmentStartIdx, secondSegmentEndIdx);
    // Step 3: Check if this second sub-segment is a palindrome
    let secondSegmentCheckResult = isPalindrome(secondSegmentCandidate);

    // Final decision based on all three palindrome checks
    if (secondSegmentCheckResult) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

// This is the entry point of the script, responsible for reading input from standard input
// and initiating the string processing logic. The 'utf8' encoding ensures proper text handling.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));