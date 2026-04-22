const acquireData = (sourcePath) => require('fs').readFileSync(sourcePath, 'utf8');

const processInputLines = (textContent) => textContent.trim().split('\n');

const maximumAccumulatedValue = 5000;

const constructLikelihoodGrid = (maxStageIdentifier) => {
    const gridRows = Array.from({ length: maxStageIdentifier + 1 }, () =>
        Array.from({ length: maximumAccumulatedValue + 1 }, () => 0.0)
    );
    gridRows[0][0] = 1.0;
    return gridRows;
};

const evaluateScenario = (scenarioDetails) => {
    const { branchFactor, finalStageIdentifier, stepIncrements, specialEffectRegistry } = scenarioDetails;

    let likelihoodMatrix = constructLikelihoodGrid(finalStageIdentifier);

    const resultingMatrix = Array.from({ length: finalStageIdentifier }).reduce((currentMatrixState, currentStageIndex) => {
        currentMatrixState[currentStageIndex].forEach((probabilityValue, currentScoreValue) => {
            if (probabilityValue === 0) return;

            stepIncrements.forEach(stepMagnitude => {
                let potentialNextStage = Math.min(currentStageIndex + stepMagnitude, finalStageIdentifier);
                const contributionFraction = probabilityValue / branchFactor;

                const appliedEffect = specialEffectRegistry.get(potentialNextStage);

                if (appliedEffect) {
                    const [effectKind, effectAmount] = appliedEffect;
                    let ultimateStage = potentialNextStage;
                    let ultimateScore = currentScoreValue;

                    const effectDispatchers = {
                        1: () => { ultimateStage = Math.min(potentialNextStage + effectAmount, finalStageIdentifier); },
                        2: () => { ultimateScore = currentScoreValue + effectAmount; },
                        3: () => { ultimateScore = currentScoreValue - effectAmount; }
                    };
                    (effectDispatchers[effectKind] || (() => {}))();

                    // Allow JavaScript to handle out-of-bounds indices for `ultimateScore`.
                    // This will result in `undefined + contributionFraction` which yields `NaN`,
                    // replicating the original code's behavior for probabilities moving out of bounds.
                    currentMatrixState[ultimateStage][ultimateScore] += contributionFraction;
                } else {
                    currentMatrixState[potentialNextStage][currentScoreValue] += contributionFraction;
                }
            });
        });
        return currentMatrixState;
    }, likelihoodMatrix);

    const finalExpectedValue = resultingMatrix[finalStageIdentifier].reduce((totalAccumulated, finalProbability, finalScore) => {
        return totalAccumulated + finalScore * finalProbability;
    }, 0);

    return Math.floor(finalExpectedValue);
};

const processAllInputs = (dataFilePath) => {
    const allTextLines = processInputLines(acquireData(dataFilePath));
    let linePointer = 0;

    const retrieveNumbersFromLine = (lineCount = 1) => {
        const lineContent = allTextLines[linePointer++];
        return lineContent.split(' ').map(Number);
    };

    const outputContainer = [];

    while (true) {
        const primaryParameters = retrieveNumbersFromLine(3);
        if (primaryParameters.every(val => val === 0)) {
            break;
        }

        const [bf, fsId, meCount] = primaryParameters;
        const stepIncrementsData = retrieveNumbersFromLine(bf);

        const eventRegistry = new Map();
        for (let idx = 0; idx < meCount; ++idx) {
            const [targetId, kind, amount] = retrieveNumbersFromLine(3);
            eventRegistry.set(targetId, [kind, amount]);
        }

        const currentScenario = {
            branchFactor: bf,
            finalStageIdentifier: fsId,
            stepIncrements: stepIncrementsData,
            specialEffectRegistry: eventRegistry
        };

        outputContainer.push(evaluateScenario(currentScenario));
    }
    outputContainer.forEach(res => console.log(res));
};

processAllInputs('/dev/stdin');