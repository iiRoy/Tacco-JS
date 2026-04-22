const acquireSourceData = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const transformRawText = (textualPayload) => textualPayload.trim().split('\n');

const evaluateGridUnits = (remainingLineFragments, accumulatedResults = []) => {
    if (remainingLineFragments.length === 0) {
        return accumulatedResults;
    }

    const currentInstructionLine = remainingLineFragments[0];
    const subsequentFragments = remainingLineFragments.slice(1);

    if (currentInstructionLine === '0 0') {
        return accumulatedResults;
    }

    const numericalParameters = currentInstructionLine.split(' ').map(Number);
    const primaryDimension = numericalParameters[0];
    const auxiliaryOperations = numericalParameters[1];

    // The original code initializes an N*N*N 3D array with zeros.
    // It then proceeds with 'auxiliaryOperations' steps, but the actual
    // modification logic for the 3D array is commented out.
    // This means the 3D array always remains entirely filled with zeros.
    // The final step counts the zeros, which is always N*N*N.
    // Therefore, we directly calculate the cube of the primary dimension.
    const computedVolume = primaryDimension * primaryDimension * primaryDimension;

    // Skip the lines corresponding to the 'auxiliaryOperations'
    // to correctly advance the input stream, matching the original's behavior.
    const nextBatchOfFragments = subsequentFragments.slice(auxiliaryOperations);

    return evaluateGridUnits(nextBatchOfFragments, [...accumulatedResults, computedVolume]);
};

const initialPayload = acquireSourceData();
const segmentedText = transformRawText(initialPayload);
const finalCalculations = evaluateGridUnits(segmentedText);

finalCalculations.forEach(individualOutcome => console.log(individualOutcome));