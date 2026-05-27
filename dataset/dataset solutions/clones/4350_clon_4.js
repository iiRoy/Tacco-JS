const processSolution = (inputData) => {
    const [
        waterUnit1Amount,
        waterUnit2Amount,
        sugarUnit1Amount,
        sugarUnit2Amount,
        maxSugarPercentage,
        maxTotalSolutionWeight
    ] = inputData.split('\n')[0].split(' ').map(Number);

    const maximumPermittedSugarRatio = (100 * maxSugarPercentage) / (100 + maxSugarPercentage);

    let bestFoundMixture = { liquid: 0, sweetener: 0, concentration: -1 };

    const visitedStates = new Set();

    let currentIterationQueue = [{ liquid: 0, sweetener: 0 }];

    while (currentIterationQueue.length > 0) {
        const nextIterationQueue = [];

        for (const { liquid, sweetener } of currentIterationQueue) {
            const currentTotalWeight = liquid + sweetener;
            const stateKey = `${liquid}-${sweetener}`;

            if (currentTotalWeight > maxTotalSolutionWeight || visitedStates.has(stateKey)) {
                continue;
            }

            visitedStates.add(stateKey);

            const currentConcentration = currentTotalWeight === 0 ? 0 : (100 * sweetener) / currentTotalWeight;

            if (currentConcentration > bestFoundMixture.concentration && currentConcentration <= maximumPermittedSugarRatio) {
                bestFoundMixture = { liquid, sweetener, concentration: currentConcentration };
            }

            // Explore adding water unit 1
            nextIterationQueue.push({ liquid: liquid + 100 * waterUnit1Amount, sweetener: sweetener });
            // Explore adding water unit 2
            nextIterationQueue.push({ liquid: liquid + 100 * waterUnit2Amount, sweetener: sweetener });
            // Explore adding sugar unit 1
            nextIterationQueue.push({ liquid: liquid, sweetener: sweetener + sugarUnit1Amount });
            // Explore adding sugar unit 2
            nextIterationQueue.push({ liquid: liquid, sweetener: sweetener + sugarUnit2Amount });
        }
        currentIterationQueue = nextIterationQueue;
    }

    if (bestFoundMixture.liquid === 0 && bestFoundMixture.sweetener === 0) {
        bestFoundMixture.liquid = 100 * waterUnit1Amount;
    }

    console.log(`${bestFoundMixture.liquid + bestFoundMixture.sweetener} ${bestFoundMixture.sweetener}`);
};

const fileSystemModule = require('fs');
processSolution(fileSystemModule.readFileSync('/dev/stdin', 'UTF-8'));
