const fileSystem = require("fs");

function processInputBlock(inputStringSegment) {
    if (inputStringSegment === '') {
        // Replicates original behavior for an empty string segment:
        // j becomes [''], first loop sets j[0]=0, s=0.
        // Then s becomes NaN due to 0/0.
        // The search loop condition (j[n] > -s) becomes (0 > NaN) which is false.
        // n remains 0. console.log(++n) outputs 1.
        return 1;
    }

    const rawStringParts = inputStringSegment.split(',');
    // Convert all parts to numbers. Undefined parts become NaN.
    const numericalValues = rawStringParts.map(Number);

    let runningNegativeSum = 0;
    const cumulativeNegativeSums = [];

    // Mimic the first loop's cumulative negative sum calculation
    // and in-place modification of the first 10 elements, including NaN propagation.
    for (let currentIdx = 0; currentIdx < 10; currentIdx++) {
        // If numericalValues[currentIdx] is NaN (e.g., from undefined or non-numeric string),
        // runningNegativeSum will become NaN and propagate.
        runningNegativeSum -= numericalValues[currentIdx];
        cumulativeNegativeSums.push(runningNegativeSum);
    }

    // Extract values for indices 10 and 11, handling potential undefined values as NaN.
    const valueAtTenthIndex = numericalValues[10];
    const valueAtEleventhIndex = numericalValues[11];

    const divisorTerm = -valueAtTenthIndex - valueAtEleventhIndex;
    const numeratorTerm = valueAtTenthIndex;

    let scalingFactor;
    // Explicitly handle 0/0 case to ensure NaN result, matching JS behavior.
    if (divisorTerm === 0 && numeratorTerm === 0) {
        scalingFactor = NaN;
    } else {
        scalingFactor = numeratorTerm / divisorTerm;
    }

    // Calculate the final threshold value, propagating NaN if present.
    let finalComparisonValue = runningNegativeSum * scalingFactor;

    // Mimic the second loop's search for the index.
    // The original loop increments 'n' as long as j[n] > -s.
    // It stops at the first 'n' where j[n] <= -s, or if j[n] or -s is NaN.
    let foundPosition = 0;
    while (foundPosition < 10) { // The original loop implicitly checks up to index 9 (10 elements)
        const elementToEvaluate = cumulativeNegativeSums[foundPosition];
        // The condition `elementToEvaluate > -finalComparisonValue`
        // If either operand is NaN, the comparison is always false.
        if (!(elementToEvaluate > -finalComparisonValue)) {
            break; // Condition failed, this is the index we're looking for.
        }
        foundPosition++;
    }

    // The original code prints ++n, so we increment the found index by one.
    return foundPosition + 1;
}

const rawInputContent = fileSystem.readFileSync("/dev/stdin", 'utf8');
// Split by any whitespace, including multiple spaces or newlines,
// but keep empty strings if they result from the split (e.g., "a  b" -> ["a", "", "b"])
// to match original behavior of `split(/\s/)`.
const dataSegments = rawInputContent.trim().split(/\s/);

dataSegments.forEach(segment => {
    // The original .map() processes every segment, including empty strings.
    console.log(processInputBlock(segment));
});
