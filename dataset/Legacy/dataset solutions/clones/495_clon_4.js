const parseNumericLine = (lineContent) => lineContent.split(" ").map(Number);

const executeSimulation = (sourceLines) => {
    let currentLineIndex = 0;

    while (true) {
        const simulationParameters = parseNumericLine(sourceLines[currentLineIndex++]);
        if (simulationParameters.join(" ") === "0 0 0") break;

        const [moveOptionCount, maximumSteps, specialConditionCount] = simulationParameters;
        const stepValueOptions = parseNumericLine(sourceLines[currentLineIndex++]);

        const conditionMap = new Map();
        for (let conditionIdx = 0; conditionIdx < specialConditionCount; conditionIdx++) {
            const conditionDetails = parseNumericLine(sourceLines[currentLineIndex++]);
            conditionMap.set(conditionDetails[0], [conditionDetails[1], conditionDetails[2]]);
        }

        const probabilityMatrix = Array.from({ length: maximumSteps + 1 }, () =>
            Array(5001).fill(0)
        );
        probabilityMatrix[0][0] = 1;

        for (let currentPosition = 0; currentPosition < maximumSteps; currentPosition++) {
            for (let currentKState = 0; currentKState <= 5000; currentKState++) {
                const probabilityAtCurrentState = probabilityMatrix[currentPosition][currentKState];

                if (probabilityAtCurrentState === 0) continue;

                for (let moveChoice = 0; moveChoice < moveOptionCount; moveChoice++) {
                    const stepAdvance = stepValueOptions[moveChoice];
                    let potentialNextPosition = currentPosition + stepAdvance;
                    
                    if (potentialNextPosition > maximumSteps) {
                        potentialNextPosition = maximumSteps;
                    }

                    const probabilityContribution = probabilityAtCurrentState / moveOptionCount;

                    const conditionEffect = conditionMap.get(potentialNextPosition);

                    if (conditionEffect) {
                        const [effectType, effectMagnitude] = conditionEffect;
                        if (effectType === 1) {
                            let finalPosition = potentialNextPosition + effectMagnitude;
                            if (finalPosition > maximumSteps) {
                                finalPosition = maximumSteps;
                            }
                            probabilityMatrix[finalPosition][currentKState] += probabilityContribution;
                        } else if (effectType === 2) {
                            let finalKState = currentKState + effectMagnitude;
                            if (finalKState > 5000) {
                                finalKState = 5000;
                            }
                            probabilityMatrix[potentialNextPosition][finalKState] += probabilityContribution;
                        } else if (effectType === 3) {
                            let finalKState = currentKState - effectMagnitude;
                            if (finalKState < 0) {
                                finalKState = 0;
                            }
                            probabilityMatrix[potentialNextPosition][finalKState] += probabilityContribution;
                        }
                    } else {
                        probabilityMatrix[potentialNextPosition][currentKState] += probabilityContribution;
                    }
                }
            }
        }

        const finalExpectedValue = Array.from({ length: 5001 }, (_, k) => k)
            .reduce((accumulatedValue, kState) => {
                return accumulatedValue + kState * probabilityMatrix[maximumSteps][kState];
            }, 0);

        console.log(Math.floor(finalExpectedValue));
    }
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trim().split("\n");
executeSimulation(processedInputLines);
