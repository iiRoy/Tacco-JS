const fileSystem = require("fs");

const processMixture = function(dataSourceContent) {
    const componentValues = dataSourceContent.trim().split(' ').map(Number);

    const firstWaterAmount = componentValues[0];
    const secondWaterAmount = componentValues[1];
    const firstSugarAmount = componentValues[2];
    const secondSugarAmount = componentValues[3];
    const maxSugarPercentageInput = componentValues[4];
    const overallWeightLimit = componentValues[5];

    const maxSolutionConcentration = (100 * maxSugarPercentageInput) / (100 + maxSugarPercentageInput);

    const visitedStatesMap = new Map();
    const explorationQueue = [];

    let currentOptimalOutcome = {
        aqueousComponent: 0,
        sweetComponent: 0,
        highestAttainedConcentration: 0
    };

    explorationQueue.push({ aqueousComponent: 0, sweetComponent: 0 });
    visitedStatesMap.set("0_0", true);

    let queueTraversalIndex = 0;
    while (queueTraversalIndex < explorationQueue.length) {
        const currentMaterial = explorationQueue[queueTraversalIndex++];
        const currentTotalMass = currentMaterial.aqueousComponent + currentMaterial.sweetComponent;
        const stateIdentifier = `${currentMaterial.aqueousComponent}_${currentMaterial.sweetComponent}`;

        if (currentTotalMass > overallWeightLimit) {
            continue;
        }

        let currentConcentrationValue = 0;
        if (currentTotalMass > 0) {
            currentConcentrationValue = (100 * currentMaterial.sweetComponent) / currentTotalMass;
        }

        if (currentConcentrationValue > currentOptimalOutcome.highestAttainedConcentration &&
            currentConcentrationValue <= maxSolutionConcentration) {
            currentOptimalOutcome.highestAttainedConcentration = currentConcentrationValue;
            currentOptimalOutcome.aqueousComponent = currentMaterial.aqueousComponent;
            currentOptimalOutcome.sweetComponent = currentMaterial.sweetComponent;
        }

        const possibleOperations = [
            { waterIncrement: 100 * firstWaterAmount, sugarIncrement: 0 },
            { waterIncrement: 100 * secondWaterAmount, sugarIncrement: 0 },
            { waterIncrement: 0, sugarIncrement: firstSugarAmount },
            { waterIncrement: 0, sugarIncrement: secondSugarAmount }
        ];

        for (const operation of possibleOperations) {
            const nextWaterQuantity = currentMaterial.aqueousComponent + operation.waterIncrement;
            const nextSugarQuantity = currentMaterial.sweetComponent + operation.sugarIncrement;
            const nextCombinedQuantity = nextWaterQuantity + nextSugarQuantity;
            const nextStateKey = `${nextWaterQuantity}_${nextSugarQuantity}`;

            if (nextCombinedQuantity <= overallWeightLimit && !visitedStatesMap.has(nextStateKey)) {
                visitedStatesMap.set(nextStateKey, true);
                explorationQueue.push({ aqueousComponent: nextWaterQuantity, sweetComponent: nextSugarQuantity });
            }
        }
    }

    if (currentOptimalOutcome.aqueousComponent === 0 && currentOptimalOutcome.sweetComponent === 0) {
        currentOptimalOutcome.aqueousComponent = 100 * firstWaterAmount;
    }

    console.log(`${currentOptimalOutcome.aqueousComponent + currentOptimalOutcome.sweetComponent} ${currentOptimalOutcome.sweetComponent}`);
};

processMixture(fileSystem.readFileSync("/dev/stdin", "UTF-8"));