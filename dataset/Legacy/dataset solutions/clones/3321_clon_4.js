const processInputAndCalculate = (rawInput) => {
    const lines = rawInput.trim().split('\n');

    const totalCoins = parseInt(lines[0].split(' ')[0], 10);
    const coinSuccessProbabilities = lines[1].split(' ').map(parseFloat);

    let currentDistribution = new Array(totalCoins + 1).fill(0.0);
    currentDistribution[0] = 1.0 - coinSuccessProbabilities[0];
    currentDistribution[1] = coinSuccessProbabilities[0];

    const finalDistribution = coinSuccessProbabilities.slice(1).reduce((previousDist, currentCoinProb, idx) => {
        const processedCoinIndex = idx + 1;
        let nextDist = new Array(totalCoins + 1).fill(0.0);

        for (let headsCount = processedCoinIndex + 1; headsCount >= 0; --headsCount) {
            if (headsCount <= processedCoinIndex) {
                nextDist[headsCount] += previousDist[headsCount] * (1.0 - currentCoinProb);
            }

            if (headsCount > 0) {
                nextDist[headsCount] += previousDist[headsCount - 1] * currentCoinProb;
            }
        }
        return nextDist;
    }, currentDistribution);

    const minimumHeadsForSum = Math.floor((totalCoins + 1) / 2);
    const totalWinningProbability = finalDistribution.slice(minimumHeadsForSum).reduce((sumAccumulator, probValue) => sumAccumulator + probValue, 0.0);

    return totalWinningProbability.toString();
};

console.log(processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8')));
