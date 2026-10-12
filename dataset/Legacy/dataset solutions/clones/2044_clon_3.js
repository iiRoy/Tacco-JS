function processInputData(rawData) {
    const charArray = rawData.split("");
    const arrayLength = charArray.length;

    // Helper function to determine if a given character array is a palindrome
    const isSegmentPalindrome = (segmentChars) => {
        const segmentLength = segmentChars.length;
        // Iterate only up to the middle of the segment
        for (let k = 0; k < Math.floor(segmentLength / 2); k++) {
            if (segmentChars[k] !== segmentChars[segmentLength - 1 - k]) {
                return false; // Mismatch found, not a palindrome
            }
        }
        return true; // All checks passed, it's a palindrome
    };

    let overallPalindromeStatus = true; // Assume true initially

    // First check: The entire input string must be a palindrome
    if (!isSegmentPalindrome(charArray)) {
        overallPalindromeStatus = false;
    }

    // Calculate the index for splitting the string into its first and second halves.
    // This calculation matches the original logic, effectively excluding the middle character
    // for odd-length strings, and splitting at the conceptual midpoint for even-length strings.
    const firstHalfBoundaryIndex = (arrayLength - 1) / 2;

    // Second check: The first half of the string must be a palindrome
    // The slice extracts characters from index 0 up to (but not including) firstHalfBoundaryIndex.
    const firstSegmentOfInput = charArray.slice(0, firstHalfBoundaryIndex);
    if (!isSegmentPalindrome(firstSegmentOfInput)) {
        overallPalindromeStatus = false;
    }

    // Third check: The second half of the string must be a palindrome
    // The slice extracts characters from firstHalfBoundaryIndex + 1 up to the end of the array.
    const secondHalfStartingIndex = firstHalfBoundaryIndex + 1;
    const secondSegmentOfInput = charArray.slice(secondHalfStartingIndex, arrayLength);
    if (!isSegmentPalindrome(secondSegmentOfInput)) {
        overallPalindromeStatus = false;
    }

    // Output the final result based on all checks
    if (overallPalindromeStatus) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// Read input from stdin, trim whitespace, and pass to the main processing function
const inputStringFromStandardInput = require("fs").readFileSync("/dev/stdin", "utf8").trim();
processInputData(inputStringFromStandardInput);
