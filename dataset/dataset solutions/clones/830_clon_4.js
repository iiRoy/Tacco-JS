const rawContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const contentSegments = rawContent.trim().split('\n');

const solve = (inputSpec) => {
    const dataSize = inputSpec.elementCount;
    const dataSequence = inputSpec.valueList;
    const adjustmentSet = inputSpec.modifierList;

    const cacheVault = new Map();

    const calculatePathValue = (pathStep, resultantLevel) => {
        if (pathStep === 0) {
            return (resultantLevel === 128) ? 0 : Number.MAX_VALUE;
        }

        const cacheKey = `${pathStep}_${resultantLevel}`;
        if (cacheVault.has(cacheKey)) {
            return cacheVault.get(cacheKey);
        }

        let minimalAccumulatedCharge = Number.MAX_VALUE;

        for (let priorLevelOutcome = 0; priorLevelOutcome <= 255; priorLevelOutcome++) {
            const chargeFromPrior = calculatePathValue(pathStep - 1, priorLevelOutcome);

            if (chargeFromPrior === Number.MAX_VALUE) {
                continue;
            }

            for (const factor of adjustmentSet) {
                let prospectiveLevel = priorLevelOutcome + factor;
                prospectiveLevel = Math.max(0, Math.min(255, prospectiveLevel));

                if (prospectiveLevel === resultantLevel) {
                    const segmentCharge = (dataSequence[pathStep - 1] - resultantLevel) * (dataSequence[pathStep - 1] - resultantLevel);
                    minimalAccumulatedCharge = Math.min(minimalAccumulatedCharge, chargeFromPrior + segmentCharge);
                }
            }
        }

        cacheVault.set(cacheKey, minimalAccumulatedCharge);
        return minimalAccumulatedCharge;
    };

    let overallOptimal = Number.MAX_VALUE;
    for (let finalLevel = 0; finalLevel <= 255; finalLevel++) {
        overallOptimal = Math.min(overallOptimal, calculatePathValue(dataSize, finalLevel));
    }

    return overallOptimal;
};

const allProblemInstances = [];
let currentPosition = 0;

while (currentPosition < contentSegments.length) {
    const dimensionInfo = contentSegments[currentPosition].split(' ').map(Number);
    const elementCountForInstance = dimensionInfo[0];
    const modifierCountForInstance = dimensionInfo[1];
    currentPosition++;

    if (elementCountForInstance === 0 && modifierCountForInstance === 0) {
        break;
    }

    const currentModifierCollection = [];
    for (let k = 0; k < modifierCountForInstance; k++) {
        currentModifierCollection.push(Number(contentSegments[currentPosition]));
        currentPosition++;
    }

    const currentValuations = [];
    for (let i = 0; i < elementCountForInstance; i++) {
        currentValuations.push(Number(contentSegments[currentPosition]));
        currentPosition++;
    }

    allProblemInstances.push({
        elementCount: elementCountForInstance,
        modifierCount: modifierCountForInstance,
        modifierList: currentModifierCollection,
        valueList: currentValuations
    });
}

const finalOutcomes = allProblemInstances.map(instance => solve(instance));
console.log(finalOutcomes.join('\n'));