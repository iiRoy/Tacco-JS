console.log((function (inputData) {
    const linesOfInput = inputData.split('\n').filter(Boolean);
    const totalFlips = Number(linesOfInput[0]);
    const flipProbabilities = linesOfInput[1].split(' ').map(Number);

    const recurseAndCombine = (idx, priorDistribution) => {
        if (idx === totalFlips) {
            return priorDistribution;
        }

        const currentCoinChance = flipProbabilities[idx];
        const currentCoinInverseChance = 1.0 - currentCoinChance;
        const nextDistribution = new Map();

        for (const [headsCount, probValue] of priorDistribution.entries()) {
            const probTails = nextDistribution.get(headsCount) || 0.0;
            nextDistribution.set(headsCount, probTails + probValue * currentCoinInverseChance);

            const probHeads = nextDistribution.get(headsCount + 1) || 0.0;
            nextDistribution.set(headsCount + 1, probHeads + probValue * currentCoinChance);
        }

        return recurseAndCombine(idx + 1, nextDistribution);
    };

    const initialDistributionForRecursion = new Map();
    initialDistributionForRecursion.set(0, 1.0);

    const finalOutcomeDistribution = recurseAndCombine(0, initialDistributionForRecursion);

    const minimumRequiredSuccesses = Math.ceil(totalFlips / 2);
    let aggregatedProbability = 0.0;

    for (let s = minimumRequiredSuccesses; s <= totalFlips; ++s) {
        aggregatedProbability += finalOutcomeDistribution.get(s) || 0.0;
    }

    return aggregatedProbability.toString();
})(require('fs').readFileSync('/dev/stdin', 'utf8')));