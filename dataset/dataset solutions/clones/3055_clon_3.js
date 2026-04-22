const analyzeBinaryStringFlips = (rawInputSequence) => {
    // This function calculates the minimum number of character flips
    // required to transform a binary string into an alternating pattern
    // (either '0101...' or '1010...').

    // Type III: Add a preliminary check for empty or invalid input.
    if (typeof rawInputSequence !== 'string' || rawInputSequence.trim().length === 0) {
        console.log(0); // An empty string or non-string input requires zero modifications.
        return;
    }

    // Type III: Introduce intermediate variables for clarity and processing steps.
    const processedSequence = rawInputSequence.trim();
    // Type III: Use Array.from for character array conversion, a slight variation from split.
    const sequenceAsCharacters = Array.from(processedSequence);

    // Type II: Renaming variables for clarity.
    // Type III: Initializing counters separately.
    let modificationsForZeroOnePattern = 0; // Counts flips needed for '010101...'
    let modificationsForOneZeroPattern = 0; // Counts flips needed for '101010...'

    // Type II: Rename loop index and use 'const' for character values.
    for (let charIndex = 0; charIndex < sequenceAsCharacters.length; charIndex++) {
        // Type III: Parse the character to an integer explicitly.
        const currentNumericalValue = parseInt(sequenceAsCharacters[charIndex], 10);

        // Type III: Refactor the core logic.
        // Instead of nested if/else, directly determine the expected values
        // for each alternating pattern based on the index parity.

        // For the '0101...' pattern:
        // Even indices (0, 2, 4...) should be '0'.
        // Odd indices (1, 3, 5...) should be '1'.
        const expectedForPatternA = charIndex % 2;

        // For the '1010...' pattern:
        // Even indices (0, 2, 4...) should be '1'.
        // Odd indices (1, 3, 5...) should be '0'.
        // This can be expressed as (charIndex + 1) % 2 or 1 - (charIndex % 2).
        const expectedForPatternB = (charIndex + 1) % 2;

        // Type III: Directly compare the actual digit with the expected digits for each pattern.
        if (currentNumericalValue !== expectedForPatternA) {
            modificationsForZeroOnePattern++;
        }

        if (currentNumericalValue !== expectedForPatternB) {
            modificationsForOneZeroPattern++;
        }
    }

    // Type III: Introduce a final variable for the result before logging.
    const minimalRequiredFlips = Math.min(modificationsForZeroOnePattern, modificationsForOneZeroPattern);

    // Type II: Output statement with new variable name.
    console.log(minimalRequiredFlips);
};

// Type II: Rename the module variable and path constant.
// Type III: Explicitly define fs module and stdin path.
const fileSystemHandler = require('fs');
const standardInputDataSource = '/dev/stdin';

// Type III: Wrap the input reading and function call in a try-catch block for robustness.
try {
    const rawDataBuffer = fileSystemHandler.readFileSync(standardInputDataSource, 'UTF-8');
    analyzeBinaryStringFlips(rawDataBuffer);
} catch (dataReadError) {
    // Type III: Add error logging for input operations.
    console.error("An issue occurred while attempting to read input data:", dataReadError.message);
    // Depending on requirements, could also exit with an error code: process.exit(1);
}