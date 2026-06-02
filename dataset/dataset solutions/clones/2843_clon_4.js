const processInput = (rawInput) => {
    const inputLines = rawInput.split('\n');
    const pointCount = Number.parseInt(inputLines.shift(), 10);

    const coordinatePairs = inputLines.slice(0, pointCount).map(line =>
        line.split(' ').map(Number.parseFloat)
    );

    const forwardDisplacementVectors = coordinatePairs.flatMap((pA, idxA) =>
        coordinatePairs.slice(idxA + 1).map(pB => [pA[0] - pB[0], pA[1] - pB[1]])
    );

    const backwardDisplacementVectors = coordinatePairs.flatMap((pA, idxA) =>
        coordinatePairs.slice(idxA + 1).map(pB => [pB[0] - pA[0], pB[1] - pA[1]])
    );

    forwardDisplacementVectors.sort((vA, vB) => {
        if (vA[0] !== vB[0]) return vA[0] - vB[0];
        return vA[1] - vB[1];
    });

    backwardDisplacementVectors.sort((vA, vB) => {
        if (vA[0] !== vB[0]) return vA[0] - vB[0];
        return vA[1] - vB[1];
    });

    let maximumConsecutiveCount = 0;
    let currentConsecutiveCount = 1;

    const evaluateVectorSequences = (vectorIndex) => {
        if (vectorIndex >= forwardDisplacementVectors.length - 1) {
            return;
        }

        const currentVectorString = JSON.stringify(forwardDisplacementVectors[vectorIndex]);
        const nextVectorString = JSON.stringify(forwardDisplacementVectors[vectorIndex + 1]);
        const nextBackwardVectorString = JSON.stringify(backwardDisplacementVectors[vectorIndex + 1]);

        if (currentVectorString === nextVectorString || currentVectorString === nextBackwardVectorString) {
            currentConsecutiveCount++;
        } else {
            if (maximumConsecutiveCount < currentConsecutiveCount) {
                maximumConsecutiveCount = currentConsecutiveCount;
            }
            currentConsecutiveCount = 1;
        }
        evaluateVectorSequences(vectorIndex + 1);
    };

    if (forwardDisplacementVectors.length > 0) {
        evaluateVectorSequences(0);
    }

    const finalResult = pointCount - maximumConsecutiveCount;
    console.log(finalResult);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
