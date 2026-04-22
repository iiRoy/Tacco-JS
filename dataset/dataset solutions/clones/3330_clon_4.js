const gameResolver = (initialQuantity, maximumCount, removalOptions) => {
    const outcomeRegister = new Map();
    outcomeRegister.set(maximumCount + 1, true);

    const evaluateState = (currentCounter) => {
        if (currentCounter < 0) {
            return;
        }

        if (outcomeRegister.get(currentCounter) === true && outcomeRegister.get(currentCounter - 1) === true) {
            evaluateState(currentCounter - 2);
            return;
        }

        const currentStatus = outcomeRegister.has(currentCounter) ? outcomeRegister.get(currentCounter) : undefined;

        if (currentStatus === true) {
            const propagateLosingStates = (stepSize) => {
                if (stepSize > removalOptions[0]) {
                    return;
                }
                const targetCount = currentCounter - stepSize;
                if (targetCount >= 0) {
                    if (!outcomeRegister.has(targetCount) || outcomeRegister.get(targetCount) === undefined) {
                        outcomeRegister.set(targetCount, false);
                    }
                }
                propagateLosingStates(stepSize + 1);
            };
            propagateLosingStates(1);
        } else {
            const propagateWinningStates = (optionIndex) => {
                if (optionIndex >= initialQuantity) {
                    return;
                }
                const chosenRemoval = removalOptions[optionIndex];
                const targetCount = currentCounter - chosenRemoval;
                if (targetCount >= 0) {
                    outcomeRegister.set(targetCount, true);
                }
                propagateWinningStates(optionIndex + 1);
            };
            propagateWinningStates(0);
        }

        evaluateState(currentCounter - 1);
    };

    evaluateState(maximumCount + 1);

    return outcomeRegister.get(0);
};

const rawTextData = String(require('fs').readFileSync('/dev/stdin','utf8'));
const processedNumbers = rawTextData.split(/\s+/).filter(Boolean).map(Number);

const entityCount = processedNumbers[0];
const totalElements = processedNumbers[1];
const availableChoices = processedNumbers.slice(2);

const finalDecision = gameResolver(entityCount, totalElements, availableChoices);

finalDecision ? process.stdout.write('First') : process.stdout.write('Second');