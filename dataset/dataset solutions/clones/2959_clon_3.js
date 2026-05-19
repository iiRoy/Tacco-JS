function calculateProbabilitySum(rawInputString) {
    const trimmedInputContent = rawInputString.trim();
    const inputDataParts = trimmedInputContent.split(" ");

    const maxNValue = parseInt(inputDataParts[0], 10);
    const targetThreshold = parseInt(inputDataParts[1], 10);

    let cumulativeProbability = 0.0;

    const determineIndividualProbability = (currentIterationValue, thresholdValue, baseProbabilityFraction) => {
        let currentProbabilityContribution = baseProbabilityFraction;
        let currentPowerOfTwoFactor = 1; // Represents 2^exponent

        for (let exponentCounter = 0; exponentCounter < 100000; exponentCounter++) {
            if (thresholdValue <= currentIterationValue * currentPowerOfTwoFactor) {
                return currentProbabilityContribution;
            } else {
                currentProbabilityContribution /= 2;
                currentPowerOfTwoFactor *= 2;
            }
        }
        // If the loop completes without the condition being met,
        // return the final (very small) probability contribution.
        return currentProbabilityContribution;
    };

    const initialBaseProbability = 1.0 / maxNValue;

    for (let currentIterationValue = 1; currentIterationValue <= maxNValue; currentIterationValue++) {
        cumulativeProbability += determineIndividualProbability(currentIterationValue, targetThreshold, initialBaseProbability);
    }

    console.log(cumulativeProbability);
}

calculateProbabilitySum(require("fs").readFileSync("/dev/stdin", "utf8"));
