function processInput(inputString) {
    // Initialize a character array by trimming the input and splitting it.
    let charArray = inputString.trim().split("");

    // Define an array of numerical indices for potential character insertions.
    const insertionPoints = [0, 4, 6, 8];

    // Iterate through each specified insertion point.
    for (let idx = 0; idx < insertionPoints.length; idx++) {
        // Check if the character at the current index in the array is not 'A'.
        // If it's not 'A', insert 'A' at that specific position.
        if (charArray[insertionPoints[idx]] !== 'A') {
            charArray.splice(insertionPoints[idx], 0, "A");
        }
    }

    // Join the modified character array back into a single string.
    // Then, compare this resulting string with the target "AKIHABARA".
    // Output "YES" if they are identical, otherwise output "NO".
    console.log(charArray.join("") === "AKIHABARA" ? "YES" : "NO");
}

// Read the entire content from standard input as a UTF-8 string.
// Pass this string to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
