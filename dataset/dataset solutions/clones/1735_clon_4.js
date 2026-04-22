console.log((inputContentString => {
    const parseInputData = (textualData) => {
        const lineSegments = textualData.trim().split('\n');
        const numCount = BigInt(lineSegments[0].split(' ')[0]);
        const valueArray = lineSegments[1].split(' ').map(BigInt);
        return { countInfo: numCount, numberSet: valueArray };
    };

    const findDesiredValueRecursively = (
        trialCandidate,
        upperLimit,
        initialOperandA,
        initialOperandB,
        constantXorAccumulator
    ) => {
        if (trialCandidate > upperLimit) {
            return null;
        }

        const evaluatedTermA = initialOperandA - trialCandidate;
        const evaluatedTermB = initialOperandB + trialCandidate;
        const xorVerificationResult = evaluatedTermA ^ evaluatedTermB ^ constantXorAccumulator;

        if (xorVerificationResult === 0n) {
            return trialCandidate.toString();
        }

        return findDesiredValueRecursively(
            trialCandidate + 1n,
            upperLimit,
            initialOperandA,
            initialOperandB,
            constantXorAccumulator
        );
    };

    const orchestrateSolution = (content) => {
        const { countInfo: elementCount, numberSet: sequenceOfNumbers } = parseInputData(content);

        const fixedXorSumPortion = sequenceOfNumbers
            .slice(2, Number(elementCount))
            .reduce((accumulator, currentVal) => accumulator ^ currentVal, 0n);

        const solutionCandidate = findDesiredValueRecursively(
            1n,
            sequenceOfNumbers[0],
            sequenceOfNumbers[0],
            sequenceOfNumbers[1],
            fixedXorSumPortion
        );

        return solutionCandidate === null ? '-1' : solutionCandidate;
    };

    return orchestrateSolution(inputContentString);
})(require('fs').readFileSync('/dev/stdin', 'utf8')));