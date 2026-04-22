// This function processes a given string input to identify and count specific character patterns.
// It searches for unique triplets of characters that meet certain positional and distinctness criteria.
function analyzeSequencePatterns(inputStringData) {
    // Step 1: Deconstruct the raw input string into an array of lines.
    // The problem expects the first line to be a number and the second line to be a character sequence.
    const dataLines = inputStringData.split('\n');

    // Step 2: Implement basic input validation.
    // Ensure that we have at least two lines of data to work with.
    if (dataLines.length < 2) {
        // In a production scenario, one might log an error or throw an exception.
        // For this clone, we'll simply return 0, indicating no patterns found due to bad input.
        return 0;
    }

    // Step 3: Extract and parse the required data from the lines.
    // The first line contains the total length of the sequence.
    // Using Number.parseInt for explicit integer conversion, specifying base 10.
    const totalSequenceLength = Number.parseInt(dataLines[0], 10);
    // The second line contains the actual character sequence.
    const characterString = dataLines[1];

    // Step 4: Perform additional validation on the parsed data.
    // Check if the parsed length is a valid positive number and if the character string
    // is at least as long as the specified length.
    if (Number.isNaN(totalSequenceLength) || totalSequenceLength <= 0 || characterString.length < totalSequenceLength) {
        // Again, return 0 for invalid input rather than crashing.
        return 0;
    }

    // Step 5: Initialize a counter for the patterns that satisfy all conditions.
    let matchingPatternCount = 0;

    // Step 6: Iterate through all possible unique combinations of three distinct indices (first, second, third).
    // The loops ensure that firstIndex < secondIndex < thirdIndex, and all indices are 0-based.
    for (let firstIndex = 0; firstIndex < totalSequenceLength; ++firstIndex) {
        for (let secondIndex = firstIndex + 1; secondIndex < totalSequenceLength; ++secondIndex) {
            for (let thirdIndex = secondIndex + 1; thirdIndex < totalSequenceLength; ++thirdIndex) {

                // Step 6a: Extract the characters at the current triplet's positions.
                const charAtFirst = characterString[firstIndex];
                const charAtSecond = characterString[secondIndex];
                const charAtThird = characterString[thirdIndex];

                // Step 6b: Evaluate the first condition: Indices must NOT form an arithmetic progression.
                // This means the difference between the first two indices should not be equal to
                // the difference between the second and third indices.
                const diffBetweenFirstTwo = secondIndex - firstIndex;
                const diffBetweenSecondThird = thirdIndex - secondIndex;
                const indicesAreNonArithmetic = (diffBetweenFirstTwo !== diffBetweenSecondThird);

                // Step 6c: Evaluate the second condition: All three characters must be distinct.
                // This combines the nested 'if' logic from the original into a single boolean expression.
                const charactersAreUnique = (
                    charAtFirst !== charAtSecond &&
                    charAtFirst !== charAtThird &&
                    charAtSecond !== charAtThird
                );

                // Step 6d: If both conditions are met, increment the pattern counter.
                if (indicesAreNonArithmetic && charactersAreUnique) {
                    matchingPatternCount++;
                }
            }
        }
    }

    // Step 7: Output the final count of patterns found to the console.
    console.log(matchingPatternCount);
}

// Main execution block: Reads input from standard input and passes it to the analysis function.
// This setup is common in competitive programming environments for Node.js.
const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
analyzeSequencePatterns(rawInputContent);