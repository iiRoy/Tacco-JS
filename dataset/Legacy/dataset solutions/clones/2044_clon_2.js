function ProcessInput(rawText) {
    // Convert the input string into an array of characters for easier manipulation.
    rawText = rawText.split("");

    // Calculate the middle index for splitting the string into halves.
    // This 'n' represents the length of one half, excluding the middle character if the total length is odd.
    var midPointIdx = (rawText.length - 1) / 2;

    // Extract the first half of the string (from the beginning up to, but not including, the middle character).
    var segmentToCheck = rawText.slice(0, midPointIdx);

    // Initialize a boolean variable to track if the string (and its halves) meets the palindrome criteria.
    // Assume it's a palindrome until a mismatch is found.
    var isPalindromeCandidate = true;

    // --- First Palindrome Check: Entire String ---
    // Iterate through the entire character array to check if it's a palindrome.
    // Compare characters from the beginning with corresponding characters from the end.
    for (var loopCounter = 0; loopCounter < rawText.length; loopCounter++) {
        if (rawText[loopCounter] !== rawText[rawText.length - loopCounter - 1]) {
            // If any pair of characters doesn't match, it's not a palindrome.
            isPalindromeCandidate = false;
        }
    }

    // --- Second Palindrome Check: First Half of the String ---
    // Now, check if the first extracted segment (the first half) is also a palindrome.
    // Iterate only up to the middle of this segment.
    for (loopCounter = 0; loopCounter < Math.ceil(segmentToCheck.length / 2); loopCounter++) {
        if (segmentToCheck[loopCounter] !== segmentToCheck[segmentToCheck.length - loopCounter - 1]) {
            // If any pair in the first half doesn't match, update the flag.
            isPalindromeCandidate = false;
        }
    }

    // --- Re-assign segmentToCheck for the Second Half ---
    // Update 'segmentToCheck' to hold the second half of the original string.
    // This starts from the character immediately after the middle character, up to the end.
    segmentToCheck = rawText.slice(midPointIdx + 1, rawText.length);

    // --- Third Palindrome Check: Second Half of the String ---
    // Finally, check if this newly assigned segment (the second half) is also a palindrome.
    // Iterate only up to the middle of this segment.
    for (loopCounter = 0; loopCounter < Math.ceil(segmentToCheck.length / 2); loopCounter++) {
        if (segmentToCheck[loopCounter] !== segmentToCheck[segmentToCheck.length - loopCounter - 1]) {
            // If any pair in the second half doesn't match, update the flag.
            isPalindromeCandidate = false;
        }
    }

    // --- Output Result ---
    // Based on the final state of the 'isPalindromeCandidate' flag, print the appropriate message.
    if (isPalindromeCandidate) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// Read input from standard input, trim any leading/trailing whitespace, and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
