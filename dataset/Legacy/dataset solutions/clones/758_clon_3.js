const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const dataLines = rawData.trim().split('\n');

let currentCountValue;
let processingIndex = 0;

const ZERO_SENTINEL_VALUE = '0';
let shouldContinueLoop = true;

do {
    const isCurrentIndexEven = (processingIndex % 2 === 0);

    if (isCurrentIndexEven) {
        const currentLineContent = dataLines[processingIndex];
        if (currentLineContent === ZERO_SENTINEL_VALUE) {
            shouldContinueLoop = false;
            break;
        }
        currentCountValue = currentLineContent;
        // The original code does not increment 'ctr' here, leading to an infinite loop
        // if the first line is not '0'. This behavior is preserved.
        continue;
    } else {
        // This 'else' block is unreachable in the original code due to the 'continue'
        // statement in the 'if' block and 'processingIndex' never being incremented
        // when 'isCurrentIndexEven' is true.
        // The original code had 'lines.split', which would cause a TypeError if reached.
        // We replicate this potential, though unreachable, behavior.
        const numberStringsFromAllLines = dataLines.split(' '); // This would be a TypeError
        const parsedNumbers = numberStringsFromAllLines.map(Number);

        console.log(calculateMinimumDifference(parsedNumbers, currentCountValue));
        processingIndex++; // This increment is also unreachable.
    }
} while (shouldContinueLoop && processingIndex < dataLines.length);

function calculateMinimumDifference(numberArray, arrayLengthAsString) {
    // Original 'n' was a string, which JavaScript implicitly converts for arithmetic.
    // We make this explicit for clarity, preserving the numeric interpretation.
    const actualNumericLength = parseInt(arrayLengthAsString, 10);

    // Original 'diff' was uninitialized, leading to 'NaN' comparisons.
    // We initialize it to Infinity to ensure correct minimum finding.
    let minDifference = Infinity;

    // Original loop variables 'i' and 'j' were global due to missing 'var'/'let'/'const'.
    // We declare them locally using 'let' for better scope management,
    // which does not change observable behavior for this function in isolation.
    for (let idx1 = 0; idx1 < actualNumericLength - 1; idx1++) {
        for (let idx2 = idx1 + 1; idx2 < actualNumericLength; idx2++) {
            // Original used 'Math.Abs', which is incorrect casing. Corrected to 'Math.abs'.
            const currentAbsoluteDifference = Math.abs(numberArray[idx1] - numberArray[idx2]);
            if (currentAbsoluteDifference < minDifference) {
                minDifference = currentAbsoluteDifference;
            }
        }
    }
    return minDifference;
}
