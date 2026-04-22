const areAllElementsIdentical = (charArr) => {
    // This helper determines if all characters within a given array are the same.
    // It serves as an alternative to checking `new Set(charArr).size === 1`.
    // A guard clause for empty or invalid input arrays.
    if (!Array.isArray(charArr) || charArr.length === 0) {
        return false; // An empty array is not considered to consist of a single unique character.
    }
    // We compare all subsequent characters against the first character.
    const initialCharacter = charArr[0];
    for (let currentPosition = 1; currentPosition < charArr.length; currentPosition++) {
        if (charArr[currentPosition] !== initialCharacter) {
            return false; // If any character differs, it's not homogeneous.
        }
    }
    return true; // All characters were identical to the first one.
};

// This is the core routine that processes an input string to determine a specific property.
function examineStringForSpecialCondition(rawInputContent) {
    // Step 1: Input processing and normalization.
    // Convert the input to a string, remove any leading/trailing whitespace,
    // extract the very first line, and then break it down into an array of individual characters.
    const characterSequence = String(rawInputContent).trim().split('\n')[0].split('');

    // Step 2: Determine the length and its parity.
    const sequenceTotalLength = characterSequence.length;
    const hasEvenLength = (sequenceTotalLength % 2 === 0);

    let primarySlice; // Represents the 'a' variable from the original code.
    let secondarySliceReversed; // Represents the 'b' variable from the original code.

    // Step 3: Conditional slicing based on string length parity.
    // This logic precisely replicates the original, including its specific slicing for even lengths.
    if (hasEvenLength) {
        // For an even-length sequence, the first segment takes characters from index 0 up to (length/2 - 1).
        primarySlice = characterSequence.slice(0, Math.floor(sequenceTotalLength / 2) - 1);
        // The second segment takes characters from index 0 up to (length/2), then reverses them.
        secondarySliceReversed = characterSequence.slice(0, Math.floor(sequenceTotalLength / 2)).reverse();
    } else {
        // For an odd-length sequence, calculate the middle index.
        const centralPosition = Math.floor((sequenceTotalLength - 1) / 2);
        // The first segment takes characters from index 0 up to the middle index (exclusive).
        primarySlice = characterSequence.slice(0, centralPosition);
        // The second segment takes characters from after the middle index to the end, then reverses them.
        secondarySliceReversed = characterSequence.slice(centralPosition + 1).reverse();
    }

    // Step 4: Compare the stringified versions of the two derived character arrays.
    // Using `join('')` provides an explicit and clear way to compare array contents as strings.
    const doSegmentsAlign = (primarySlice.join('') === secondarySliceReversed.join(''));

    // Step 5: If the segments align based on the specific slicing logic, perform a homogeneity check.
    if (doSegmentsAlign) {
        // Here, we check if both the primary and secondary (reversed) slices consist of only one unique character.
        // This effectively replaces the original code's `new Set(a).size == 1 && new Set(b).size == 1` check.
        const isPrimaryHomogeneous = areAllElementsIdentical(primarySlice);
        const isSecondaryHomogeneous = areAllElementsIdentical(secondarySliceReversed);

        // This particular condition (segments align AND both are homogeneous) triggers the "NO" output.
        if (isPrimaryHomogeneous && isSecondaryHomogeneous) {
            process.stdout.write("NO\n"); // Using process.stdout.write for output, an alternative to console.log.
            return; // Exit early as the condition is met.
        }
    }

    // Step 6: If the special "NO" condition was not met, the default output is "YES".
    process.stdout.write("YES\n");
    // No explicit 'return' statement is needed here, as the function naturally concludes.
}

// Entry point for script execution.
// Reads the entire content from standard input synchronously using Node.js's 'fs' module,
// decodes it as UTF-8, and passes it to our main processing function.
examineStringForSpecialCondition(require("fs").readFileSync("/dev/stdin", "utf8"));