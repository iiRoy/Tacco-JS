function processInput(sourceText) {
    const newlinePosition = sourceText.indexOf('\n');
    const firstLineContent = sourceText.substring(0, newlinePosition);
    const secondLineContent = sourceText.substring(newlinePosition + 1).trim();

    const configurationValues = firstLineContent.split(' ').map(Number);
    const dataSequence = secondLineContent.split(' ').map(Number);

    const sequenceLength = configurationValues[0];
    const startingPoint = configurationValues[1];
    const referenceWeight = configurationValues[2];

    const candidateDifferences = [];

    // First comparison: absolute difference between starting point and reference weight
    candidateDifferences.push(Math.abs(startingPoint - referenceWeight));

    // Second comparison: absolute difference between the last element of the sequence and reference weight
    candidateDifferences.push(Math.abs(dataSequence[sequenceLength - 1] - referenceWeight));

    // Third comparison: absolute difference between the last two elements of the sequence
    // This requires at least two elements in the sequence.
    // If only one element, the original code would access A[-1] resulting in undefined,
    // leading to Math.abs(number - undefined) which is NaN. We must replicate this behavior.
    if (sequenceLength >= 2) {
        candidateDifferences.push(Math.abs(dataSequence[sequenceLength - 1] - dataSequence[sequenceLength - 2]));
    } else {
        // For sequenceLength < 2 (i.e., 0 or 1), the difference involving A[N-2] is NaN.
        candidateDifferences.push(NaN);
    }

    // Determine the maximum among the candidate differences using a functional approach.
    // Math.max handles NaN correctly: if any value is NaN, the result is NaN.
    const ultimateOutcome = candidateDifferences.reduce((currentMax, value) => Math.max(currentMax, value), -Infinity);

    console.log(ultimateOutcome);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
