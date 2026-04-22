const processStringEvaluation = (sourceText) => {
    // A mapping for character-to-point conversion
    const pointAllocation = new Map([
        ['o', 100]
    ]);

    // Define the fixed bonus value
    const constantBonus = 700;

    // Convert the first three characters of the input string into an array
    // This uses Array.from and substring for distinct syntax from direct indexing or iteration
    const relevantCharacters = Array.from(sourceText.substring(0, 3));

    // Use a functional approach (reduce) to sum up points based on the character mapping
    const accumulatedScore = relevantCharacters.reduce((currentTotal, charElement) => {
        // Get points for the current character, defaulting to 0 if not in the map
        const charPoints = pointAllocation.get(charElement) || 0;
        return currentTotal + charPoints;
    }, 0); // Start the accumulation from 0

    // Output the final computed value
    console.log(accumulatedScore + constantBonus);
};

// --- Input handling mechanism, distinct from original ---
// Destructure and alias the 'fs' module's readFileSync method
const { readFileSync: obtainFileContents } = require('fs');

// Read the content from standard input using the aliased function
const rawDataSource = obtainFileContents('/dev/stdin', 'utf8');

// Invoke the core processing function with the obtained data
processStringEvaluation(rawDataSource);