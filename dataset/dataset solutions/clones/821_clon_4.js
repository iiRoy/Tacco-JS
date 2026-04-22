let dataBuffer = '';

const acquireNumericDatum = () => {
    const nextItem = dataBuffer.pop();
    return (nextItem === undefined) ? null : +nextItem;
};

const emitResult = (outcome) => {
    console.log(outcome);
};

// Pure function to compute the k-th triangular number: T_k = k * (k + 1) / 2
const computeTriangularValue = (index) => index * (index + 1) / 2;

// Pure function to determine if a given value is a triangular number T_k
// where k is a non-negative integer and k <= maximumAllowedIndex.
const checkTriangularMembership = (valueCandidate, maximumAllowedIndex) => {
    if (valueCandidate < 0) return false;

    // Solve for k in k * (k + 1) / 2 = valueCandidate
    // k^2 + k - 2 * valueCandidate = 0
    // Using quadratic formula: k = (-1 +/- sqrt(1 - 4*1*(-2*valueCandidate))) / 2
    // k = (-1 + sqrt(1 + 8 * valueCandidate)) / 2
    const delta = 1 + 8 * valueCandidate;
    if (delta < 0) return false; // No real solution
    
    const squareRootOfDelta = Math.sqrt(delta);
    if (squareRootOfDelta % 1 !== 0) return false; // Not an integer root, so valueCandidate is not a triangular number

    const derivedIndex = (-1 + squareRootOfDelta) / 2;
    
    // Ensure the derived index is a non-negative integer and within the specified upper bound
    return Number.isInteger(derivedIndex) && derivedIndex >= 0 && derivedIndex <= maximumAllowedIndex;
};

const orchestrateExecution = () => {
    let processingParameter;
    while ((processingParameter = acquireNumericDatum()) !== null) {
        // Generate a sequence of integer indices from 0 up to (processingParameter - 1)
        const sequenceOfIndices = Array.from({ length: processingParameter }, (_, currentIdx) => currentIdx);

        // Use functional array methods to filter and count elements
        const matchingElementsCount = sequenceOfIndices.filter(currentIdx => {
            const termA = computeTriangularValue(currentIdx);
            const sumToVerify = termA + processingParameter;
            // Check if (T_currentIdx + processingParameter) is a triangular number T_j where j <= processingParameter
            return checkTriangularMembership(sumToVerify, processingParameter);
        }).length;

        emitResult(matchingElementsCount);
    }
};

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
    dataBuffer += chunk;
});
process.stdin.on('end', () => {
    dataBuffer = dataBuffer.trim().split(/\s+/).reverse();
    orchestrateExecution();
});