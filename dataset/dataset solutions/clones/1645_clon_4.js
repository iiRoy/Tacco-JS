const acquireData = (sourceMaterial) => {
    const numberMatches = sourceMaterial.match(/(\d+)\s(\d+)\s(\d+)\n(\d+)/);
    const alphaInitial = Number(numberMatches[1]);
    const betaInitial = Number(numberMatches[2]);
    const gammaInitial = Number(numberMatches[3]);
    const cycleCount = Number(numberMatches[4]);

    const transformRecursive = (currentAlpha, currentBeta, currentGamma, cyclesLeft) => {
        if (cyclesLeft === 0) {
            return {
                resultX: currentAlpha,
                resultY: currentBeta,
                resultZ: currentGamma
            };
        }

        let nextBetaValue = currentBeta;
        let nextGammaValue = currentGamma;

        nextGammaValue = (currentBeta >= currentGamma) ? (currentGamma * 2) : currentGamma;
        nextBetaValue = (currentBeta < currentGamma && currentAlpha >= currentBeta) ? (currentBeta * 2) : currentBeta;

        return transformRecursive(currentAlpha, nextBetaValue, nextGammaValue, cyclesLeft - 1);
    };

    const finalValues = transformRecursive(alphaInitial, betaInitial, gammaInitial, cycleCount);

    const conditionSatisfied = (finalValues.resultY <= finalValues.resultZ) && (finalValues.resultX <= finalValues.resultY);

    const outcomeMessages = ['no', 'yes'];
    process.stdout.write(outcomeMessages[Number(conditionSatisfied)] + '\n');
};

const filesystemAccess = require('node:fs');
const readTextContent = filesystemAccess.readFileSync;
const obtainedText = readTextContent('/dev/stdin', 'utf8');
acquireData(obtainedText);