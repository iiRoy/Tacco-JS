"use strict";

const processInputAndSolve = (sourceInput) => {
    const parsedInput = sourceInput.trim().split("\n");
    const delta = parseInt(parsedInput[0]);

    const sequenceGenerator = (startPoint, endPoint) => {
        return Array.from({ length: endPoint - startPoint + 1 }, (_, index) => startPoint + index);
    };

    let solutionPayload = null;

    sequenceGenerator(1, 3500).some(alpha => {
        return sequenceGenerator(1, 3500).some(beta => {
            const firstComponent = 4 * alpha * beta;
            const secondComponent = delta * beta;
            const thirdComponent = delta * alpha;
            const combinedDenominator = firstComponent - secondComponent - thirdComponent;

            if (combinedDenominator === 0) {
                return false;
            }

            const combinedNumerator = delta * alpha * beta;
            const gamma = combinedNumerator / combinedDenominator;

            if (Number.isInteger(gamma)) {
                solutionPayload = `${alpha} ${beta} ${gamma}`;
                return true;
            }
            return false;
        });
        return solutionPayload !== null;
    });

    if (solutionPayload) {
        console.log(solutionPayload);
    }
};

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));