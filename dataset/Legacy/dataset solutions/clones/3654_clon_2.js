function processInput(dataArray) {
    // Retrieve the first string from the input array.
    let strA = dataArray[0];
    // Retrieve the second string from the input array.
    let strB = dataArray[1];

    // Initialize a boolean variable to store the comparison outcome.
    let resultFlag = false;

    // Check if the lengths of the two strings are unequal.
    // If they are, a rotational match is impossible.
    if (strA.length !== strB.length) {
        resultFlag = false; // Explicitly set, though already initialized to false.
    } else {
        // If string lengths are identical, proceed with the rotational comparison.
        outerLoop: for (let idxOuter = 0; idxOuter < strA.length; idxOuter++) {
            // Iterate through each character of the second string.
            for (let idxInner = 0; idxInner < strB.length; idxInner++) {
                // Compare characters, applying a rotational shift to the first string.
                // The modulo operator handles wrapping around the string's length.
                if (strA[(idxOuter + idxInner) % strA.length] !== strB[idxInner]) {
                    // If a character mismatch is found, this rotation is not a match.
                    // Continue to the next iteration of the outer loop (next possible rotation).
                    continue outerLoop;
                }
            }
            // If the inner loop completes without any mismatches,
            // it means a successful rotational match has been found.
            resultFlag = true;
            // Since a match is found, there's no need to check further rotations.
            // Exit the outer loop.
            break;
        }
    }
    
    // Output the final determination: "Yes" if a match was found, "No" otherwise.
    console.log(resultFlag ? "Yes" : "No");
}

// Read the entire content from standard input,
// decode it as UTF-8, remove any leading/trailing whitespace,
// and then split the content into an array of strings based on newline characters.
// Finally, pass this array to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
