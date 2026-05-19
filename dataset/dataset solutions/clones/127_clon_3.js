const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const textEncoding = "utf8";
const lineSeparator = '\n';
const maximumBitPosition = 9;

function extractSetBitsAsPowersOfTwo(inputStringRepresentation) {
    const numericInput = parseInt(inputStringRepresentation, 10);
    let accumulatedOutputString = '';

    // If the input string cannot be parsed as a number,
    // or if it's an empty string, parseInt returns NaN.
    // In JavaScript, NaN & any_number results in 0.
    // The original code implicitly converts non-numeric strings to 0 for bitwise operations.
    // For example, "abc" & 1 is 0. "" & 1 is 0.
    // So, if numericInput is NaN, the loop below will effectively operate on 0,
    // resulting in an empty string, which matches the original behavior.
    // No explicit isNaN check is strictly needed if we rely on bitwise behavior with NaN,
    // but for clarity, we can consider it. However, the loop with NaN will just not add anything.
    // Let's keep it simple and rely on JS's bitwise coercion for NaN.
    // (NaN | 0) is 0, (NaN & 0) is 0, (NaN ^ 0) is 0.
    // So, (NaN & bitValue) will always be 0.

    for (let currentBitIndex = 0; currentBitIndex <= maximumBitPosition; currentBitIndex++) {
        const bitMaskValue = 1 << currentBitIndex;
        if ((numericInput & bitMaskValue) !== 0) {
            accumulatedOutputString += bitMaskValue + ' ';
        }
    }
    return accumulatedOutputString;
}

const rawFileContent = fileSystemModule.readFileSync(standardInputPath, textEncoding);
const processedContentTrimmed = rawFileContent.trim();
const contentLines = processedContentTrimmed.split(lineSeparator);

contentLines.forEach(function(singleLineEntry) {
    const formattedOutput = extractSetBitsAsPowersOfTwo(singleLineEntry);
    console.log(formattedOutput);
});
