const analyzeNumericSequence = (upperBound, criterionValue) => {
    const sequence = Array.from({ length: upperBound - 3 }, (_, i) => i + 4);

    const totalCount = sequence.reduce((accumulator, currentNumber) => {
        const limitForDivisors = Math.floor(Math.sqrt(currentNumber));
        
        const numberContribution = Array.from({ length: limitForDivisors - 1 }, (_, i) => i + 2)
            .filter(primaryFactor => currentNumber % primaryFactor === 0)
            .map(primaryFactor => {
                const secondaryFactor = currentNumber / primaryFactor;
                if (secondaryFactor < 10) {
                    const composite = secondaryFactor * 10 + primaryFactor;
                    if (composite < criterionValue) {
                        return (primaryFactor === secondaryFactor) ? 1 : 2;
                    }
                }
                return 0;
            })
            .reduce((sum, val) => sum + val, 0);

        return accumulator + numberContribution;
    }, 0);

    return totalCount;
};

const processExternalData = (incomingText) => {
    const numericParts = incomingText.split(" ");
    const maximumBound = parseInt(numericParts[0], 10);
    const comparisonThreshold = parseInt(numericParts[1], 10);

    const finalOutcome = analyzeNumericSequence(maximumBound, comparisonThreshold);

    console.log('%d', finalOutcome);
};

processExternalData(require("fs").readFileSync("/dev/stdin", "utf8"));