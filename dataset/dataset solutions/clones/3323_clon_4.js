function calculateOutcomeLikelihood(trialCount, successChances) {
    const likelihoodCache = new Map();

    const determineProbability = (numTrials, numSuccesses) => {
        if (numSuccesses < 0 || numSuccesses > numTrials) {
            return 0.0;
        }
        if (numTrials === 0) {
            return numSuccesses === 0 ? 1.0 : 0.0;
        }

        const cacheKey = `${numTrials},${numSuccesses}`;
        if (likelihoodCache.has(cacheKey)) {
            return likelihoodCache.get(cacheKey);
        }

        const currentTrialSuccessProb = successChances[numTrials - 1];
        const currentTrialFailureProb = 1.0 - currentTrialSuccessProb;

        const probIfCurrentSucceeds = currentTrialSuccessProb * determineProbability(numTrials - 1, numSuccesses - 1);
        const probIfCurrentFails = currentTrialFailureProb * determineProbability(numTrials - 1, numSuccesses);

        const totalProb = probIfCurrentSucceeds + probIfCurrentFails;
        likelihoodCache.set(cacheKey, totalProb);

        return totalProb;
    };

    const successThreshold = Math.floor(trialCount / 2) + 1;
    let cumulativeProbability = 0.0;

    for (let s = successThreshold; s <= trialCount; s++) {
        cumulativeProbability += determineProbability(trialCount, s);
    }

    return cumulativeProbability;
}

function processInputAndOutput(externalData) {
    const dataSegments = externalData.split("\n");
    const totalItems = parseInt(dataSegments[0], 10);
    const individualProbabilities = dataSegments[1].split(' ').map(val => parseFloat(val));

    const finalOutcomeLikelihood = calculateOutcomeLikelihood(totalItems, individualProbabilities);
    console.info(finalOutcomeLikelihood);
}

const obtainFileContents = (filePath) => {
    return require('fs').readFileSync(filePath, 'utf8');
};

processInputAndOutput(obtainFileContents('/dev/stdin'));