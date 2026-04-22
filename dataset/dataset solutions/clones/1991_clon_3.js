const analyzeColorSequence = (sequenceLengthString, colorPatternInputString) => {
    // Perform robust input validation and type conversion.
    const sequenceLength = Number(sequenceLengthString);
    if (isNaN(sequenceLength) || !Number.isInteger(sequenceLength) || sequenceLength <= 0) {
        // Log an error and return an indicative value (e.g., 0 or throw an exception)
        console.error("Input Error: The provided sequence length is not a valid positive integer.");
        return 0;
    }

    // Ensure the color pattern string is valid and matches the declared length.
    if (!colorPatternInputString || typeof colorPatternInputString !== 'string' || colorPatternInputString.length !== sequenceLength) {
        console.error("Input Error: Color pattern string is invalid or its length does not match the specified sequence length.");
        return 0;
    }

    // Convert the color pattern string into an array of individual characters.
    // Using Array.from is an alternative to .split('') and can be more explicit.
    const individualColorChars = Array.from(colorPatternInputString);

    // Initialize a frequency map to count occurrences of each color (R, G, B).
    const characterFrequency = new Map();
    // Populate the map by iterating through each character in the sequence.
    for (const currentColorChar of individualColorChars) {
        characterFrequency.set(currentColorChar, (characterFrequency.get(currentColorChar) || 0) + 1);
    }

    // Retrieve the counts for 'R', 'G', 'B'. Default to 0 if a color is absent.
    const redColorCount = characterFrequency.get('R') || 0;
    const greenColorCount = characterFrequency.get('G') || 0;
    const blueColorCount = characterFrequency.get('B') || 0;

    // Calculate the total number of triplets (i, j, k) where S[i], S[j], S[k]
    // are all distinct colors (e.g., one 'R', one 'G', one 'B').
    // This value represents the initial pool of valid triplets before considering position constraints.
    const overallDistinctColorTriplets = redColorCount * greenColorCount * blueColorCount;

    // Initialize a counter for specific triplets that we need to subtract.
    // These are triplets (i, j, k) where S[i], S[j], S[k] are distinct AND
    // their indices form an arithmetic progression (j-i == k-j).
    let tripletsToExcludeDueToProgression = 0;

    // Define a small helper function to check if three given characters are mutually distinct.
    const areAllCharactersUnique = (charA, charB, charC) => {
        return charA !== charB && charA !== charC && charB !== charC;
    };

    // Iterate through all possible starting indices `idxA`.
    for (let idxA = 0; idxA < sequenceLength; ++idxA) {
        // Iterate through all possible middle indices `idxB`, ensuring `idxB > idxA`.
        for (let idxB = idxA + 1; idxB < sequenceLength; ++idxB) {
            // Retrieve the characters at the current `idxA` and `idxB`.
            const charAtA = individualColorChars[idxA];
            const charAtB = individualColorChars[idxB];

            // Optimization: If the first two characters are the same, they cannot form a distinct-color triplet.
            // Skip to the next iteration.
            if (charAtA === charAtB) {
                continue;
            }

            // Calculate the potential third index `idxC` such that `idxA, idxB, idxC` form an
            // arithmetic progression: `idxB - idxA == idxC - idxB`, which simplifies to `idxC = 2 * idxB - idxA`.
            const calculatedThirdIndex = (2 * idxB) - idxA;

            // Check if `calculatedThirdIndex` is within the valid bounds of the sequence.
            const isThirdIndexValid = calculatedThirdIndex < sequenceLength;

            if (isThirdIndexValid) {
                // If `idxC` is valid, retrieve the character at that position.
                const charAtC = individualColorChars[calculatedThirdIndex];

                // Now, check if all three characters (charAtA, charAtB, charAtC) are distinct.
                if (areAllCharactersUnique(charAtA, charAtB, charAtC)) {
                    // If all conditions are met (distinct colors AND arithmetic progression of indices),
                    // increment the counter for triplets that must be excluded from the total.
                    tripletsToExcludeDueToProgression++;
                }
            }
        }
    }

    // The final count is the total number of distinct-color triplets minus those
    // that also satisfy the arithmetic progression condition for their indices.
    return overallDistinctColorTriplets - tripletsToExcludeDueToProgression;
};

// Standard boilerplate for reading input in Node.js for competitive programming.
// Reads the entire standard input stream, decodes it as UTF-8, and splits it into lines.
const standardInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Extract the sequence length and the color pattern string from the input lines.
// Use .trim() to remove any leading/trailing whitespace, including the newline character.
const lengthStringFromInput = standardInputLines[0].trim();
const patternStringFromInput = standardInputLines[1].trim();

// Execute the main analytical function with the parsed input and store the result.
const finalComputedResult = analyzeColorSequence(lengthStringFromInput, patternStringFromInput);

// Output the final calculated result to standard output.
console.log(finalComputedResult);