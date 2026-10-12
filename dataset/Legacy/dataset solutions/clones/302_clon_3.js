function checkLeapYear(currentYear) {
    const isDivisibleBy400 = currentYear % 400 === 0;
    const isDivisibleBy100 = currentYear % 100 === 0;
    const isDivisibleBy4 = currentYear % 4 === 0;

    if (isDivisibleBy400) {
        return true;
    } else if (isDivisibleBy100) {
        return false;
    } else if (isDivisibleBy4) {
        return true;
    } else {
        return false;
    }
}

function extractYearBounds(lineContent) {
    const yearSegments = lineContent.split(' ');
    const startBound = parseInt(yearSegments[0], 10);
    const endBound = parseInt(yearSegments[1], 10);
    return { startBound, endBound };
}

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
let inputDataLines = rawInputData.split('\n');

let accumulatedOutputSegments = [];

while (true) {
    const currentInputLine = inputDataLines.shift();

    if (currentInputLine === undefined) {
        // This case might happen if the input file doesn't end with a newline,
        // and all lines have been processed. The original code would then
        // try to split undefined, leading to an error.
        // However, `split('\n')` on a string without a trailing newline
        // will not produce an empty string at the end.
        // If the input is "1 2\n0 0", inputDataLines will be ["1 2", "0 0"].
        // After "1 2", "0 0" is processed, inputDataLines is [].
        // The next shift is undefined.
        // The original code would then call `undefined.split(' ')` which throws.
        // To match behavior, we must ensure `extractYearBounds` gets a string.
        // If `currentInputLine` is undefined, it means we've exhausted the lines.
        // The `0 0` check is the primary break. If we get here, it means
        // the input didn't end with `0 0` or was malformed.
        // The original code would crash. Let's assume valid input always ends with `0 0`.
        // If it doesn't, the original code would crash on `undefined.split`.
        // For strict equivalence, we should let it crash or ensure `0 0` is always present.
        // Given the problem context, `0 0` is the sentinel.
        // If `currentInputLine` is `undefined`, it means we've run out of lines before `0 0`.
        // This is an edge case not explicitly handled by the original, but it would crash.
        // For Type III, we assume valid input ends with `0 0`.
        break; // Exit if no more lines, assuming 0 0 was processed or input is malformed.
    }

    const { startBound: startYear, endBound: endYear } = extractYearBounds(currentInputLine);

    if (startYear + endYear === 0) {
        break;
    }

    let currentRangeLeapYearsBuffer = '';
    for (let yearCounter = startYear; yearCounter <= endYear; yearCounter++) {
        if (checkLeapYear(yearCounter)) {
            currentRangeLeapYearsBuffer += yearCounter + '\n';
        }
    }

    if (currentRangeLeapYearsBuffer.length === 0) {
        currentRangeLeapYearsBuffer += 'NA\n';
    }

    accumulatedOutputSegments.push(currentRangeLeapYearsBuffer);
}

let finalCombinedOutput = accumulatedOutputSegments.join('\n');

if (finalCombinedOutput.length > 0) {
    finalCombinedOutput = finalCombinedOutput.slice(0, finalCombinedOutput.length - 2);
}

console.log(finalCombinedOutput);
