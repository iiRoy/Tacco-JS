function computeSequenceSum(rawData) {
    const parsedLines = rawData.trim().split("\n");
    const numericParameters = parsedLines[0].split(" ").map(Number);

    let termCount = numericParameters[0];
    let initialValue = numericParameters[1];
    const moduloBase = numericParameters[2];

    const visitedTermIndices = new Map();
    const generatedSequence = [];
    const cumulativeSums = [0];

    let currentTerm = initialValue;
    let currentSequenceIndex = 1;
    let finalAccumulatedSum = 0;

    while (currentSequenceIndex <= termCount) {
        if (visitedTermIndices.has(currentTerm)) {
            const cycleStartIdx = visitedTermIndices.get(currentTerm);
            const cycleLength = currentSequenceIndex - cycleStartIdx;

            const sumOfCycleElements = cumulativeSums[currentSequenceIndex - 1] - cumulativeSums[cycleStartIdx - 1];

            const termsRemainingFromCycleStart = termCount - (cycleStartIdx - 1);

            const fullCycleIterations = Math.floor(termsRemainingFromCycleStart / cycleLength);

            finalAccumulatedSum += (fullCycleIterations * sumOfCycleElements);

            const partialCycleTermsCount = termsRemainingFromCycleStart % cycleLength;

            for (let k = 0; k < partialCycleTermsCount; k++) {
                finalAccumulatedSum += generatedSequence[cycleStartIdx + k - 1];
            }
            break;
        }

        visitedTermIndices.set(currentTerm, currentSequenceIndex);
        generatedSequence.push(currentTerm);
        cumulativeSums.push(cumulativeSums[currentSequenceIndex - 1] + currentTerm);
        finalAccumulatedSum += currentTerm;

        currentTerm = (currentTerm * currentTerm) % moduloBase;
        currentSequenceIndex++;
    }

    console.log(finalAccumulatedSum);
}

computeSequenceSum(require("fs").readFileSync("/dev/stdin", "utf8"));
