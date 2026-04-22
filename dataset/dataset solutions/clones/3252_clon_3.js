const fileSystemInterface = require("fs");
const inputSourceIdentifier = "/dev/stdin";

let rawDataBuffer;

try {
    rawDataBuffer = fileSystemInterface.readFileSync(inputSourceIdentifier, "utf8");
} catch (readError) {
    console.error(`ERROR: Failed to read from standard input '${inputSourceIdentifier}'. Details: ${readError.message}`);
    rawDataBuffer = '';
}

const valueSeparatorCharacter = ' ';
let processedNumericalValues = [];

if (typeof rawDataBuffer !== 'string' || rawDataBuffer.trim().length === 0) {
    console.warn("WARNING: Input content is either not a string or is entirely empty/whitespace. Proceeding with no values.");
} else {
    const stringValueSegments = rawDataBuffer.trim().split(valueSeparatorCharacter);

    processedNumericalValues = stringValueSegments.map(segmentText => {
        const currentNumericalCandidate = Number(segmentText);

        if (isNaN(currentNumericalCandidate) || !isFinite(currentNumericalCandidate)) {
            console.error(`Invalid numerical segment identified: '${segmentText}'. This value will be treated as NaN.`);
            return NaN;
        }
        return currentNumericalCandidate;
    });
}

const requiredOperandCount = 2;
if (processedNumericalValues.length < requiredOperandCount) {
    console.error(`CRITICAL ERROR: Insufficient numerical data. Expected at least ${requiredOperandCount} values, but received ${processedNumericalValues.length}.`);
    console.log("Output: 0.0");
    process.exit(1);
}

const primaryOperand = processedNumericalValues[0];
const secondaryOperand = processedNumericalValues[1];

if (isNaN(primaryOperand) || isNaN(secondaryOperand)) {
    console.error("CRITICAL ERROR: One or both primary operands are not valid numbers (NaN). Aborting calculation.");
    console.log("Output: Calculation aborted.");
    process.exit(1);
}

const intermediateProduct = primaryOperand * secondaryOperand;
const divisionFactor = 2;

const finalComputationalOutcome = intermediateProduct / divisionFactor;

console.log(`The computed area-like value is: ${finalComputationalOutcome}`);