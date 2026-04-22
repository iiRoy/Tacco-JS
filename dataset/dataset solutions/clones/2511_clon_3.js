const fileSystemModule = require('fs');

// Path to the standard input file
const standardInputPath = '/dev/stdin';

/**
 * Safely retrieves and processes input lines from a specified file path.
 * Includes basic error handling and input validation.
 * @param {string} filePath - The path to the input file.
 * @returns {string[]} An array of trimmed lines, or a fallback array if an error occurs.
 */
function obtainInputLines(filePath) {
    try {
        const fileContent = fileSystemModule.readFileSync(filePath, 'utf8');
        const cleanedLines = fileContent.trim().split('\n');

        // Ensure we have at least two lines for the string and the multiplier
        if (cleanedLines.length < 2) {
            console.error("Input error: Not enough lines in the provided data. Expected at least 2.");
            // Provide default safe values to prevent further errors
            return ["", "0"];
        }
        return cleanedLines;
    } catch (readError) {
        console.error(`File system error: Could not read from ${filePath}. Details: ${readError.message}`);
        // Fallback with empty string and zero multiplier
        return ["", "0"];
    }
}

// Fetch the raw input data
const rawInputData = obtainInputLines(standardInputPath);

// Extract the primary string and the repetition count
const primarySequence = rawInputData[0];
// Convert the second line to a number, defaulting to 1 if invalid or missing
const sequenceRepeatFactor = Number(rawInputData[1]) || 1;

// Regular expression to find consecutive identical characters
const consecutiveCharRegex = /(.)\1*/g;
const groupedCharacterSegments = primarySequence.match(consecutiveCharRegex);

// Guard clause: If no segments are found (e.g., empty input string), result is 0
if (!groupedCharacterSegments || groupedCharacterSegments.length === 0) {
    console.log(0);
    return;
}

// Calculate the initial number of reductions possible within each segment
let internalSegmentReductions = 0;
for (const segmentUnit of groupedCharacterSegments) {
    const unitLength = segmentUnit.length;
    // Each pair of characters can be reduced. For odd lengths, one character remains.
    internalSegmentReductions += Math.floor(unitLength / 2);
}

// The base cumulative reduction count is the sum of internal reductions multiplied by the repetition factor
let totalEffectiveReductions = internalSegmentReductions * sequenceRepeatFactor;

// Logic to handle potential additional reductions at the boundaries when the sequence is repeated
const firstCharacterGroup = groupedCharacterSegments[0];
const lastCharacterGroup = groupedCharacterSegments[groupedCharacterSegments.length - 1];

// Determine if the first character of the first group matches the first character of the last group
const doBoundaryCharactersMatch = (firstCharacterGroup[0] === lastCharacterGroup[0]);

// Determine if the lengths of the first and last groups are odd
const isFirstGroupLengthOdd = (firstCharacterGroup.length % 2 === 1);
const isLastGroupLengthOdd = (lastCharacterGroup.length % 2 === 1);

// This condition applies only if there's more than one segment, or if the single segment's ends merge
// and if the boundary characters are the same and both end segments have odd lengths.
// When 'primarySequence' is concatenated 'sequenceRepeatFactor' times,
// 'sequenceRepeatFactor - 1' merges occur. Each merge might form an extra pair.
if (groupedCharacterSegments.length > 1 && doBoundaryCharactersMatch && isFirstGroupLengthOdd && isLastGroupLengthOdd) {
    // For each time the string is concatenated (k-1 times), an extra pair forms at the join point.
    totalEffectiveReductions += (sequenceRepeatFactor - 1);
}

// Special edge case: If the original string consists of a single character (e.g., "a")
if (primarySequence.length === 1) {
    // In this scenario, the total reductions are simply half of the total characters, floored.
    // This calculation overrides any previous computations for this specific case.
    totalEffectiveReductions = Math.floor(sequenceRepeatFactor / 2);
}

// Output the final calculated count of effective reductions
console.log(totalEffectiveReductions);