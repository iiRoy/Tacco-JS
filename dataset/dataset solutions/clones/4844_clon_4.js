const obtainProcessedResult = (initialData) => {
    const lines = initialData.trim().split('\n');

    const [firstLineContents] = lines;
    const initialParameters = firstLineContents.split(' ').map(numericString => parseInt(numericString, 10));
    const [numberOfElements, thresholdValue] = initialParameters;

    const elementValues = lines[1].split(' ').map(numericString => parseInt(numericString, 10));

    if (numberOfElements <= 1) {
        return 0;
    }

    const finalAccumulation = elementValues.slice(1).reduce((currentStatus, currentItemOriginalValue) => {
        const adjacentSum = currentStatus.previousEffectiveValue + currentItemOriginalValue;

        if (adjacentSum > thresholdValue) {
            const surplusAmount = adjacentSum - thresholdValue;
            const adjustedCurrentElement = Math.max(0, currentItemOriginalValue - surplusAmount);

            return {
                totalModifications: currentStatus.totalModifications + surplusAmount,
                previousEffectiveValue: adjustedCurrentElement
            };
        } else {
            return {
                totalModifications: currentStatus.totalModifications,
                previousEffectiveValue: currentItemOriginalValue
            };
        }
    }, { totalModifications: 0, previousEffectiveValue: elementValues[0] });

    return finalAccumulation.totalModifications;
};

const executeCalculation = () => {
    const rawInputText = require('fs').readFileSync('/dev/stdin', 'utf8');
    const computedOutcome = obtainProcessedResult(rawInputText);
    console.log(computedOutcome);
};

executeCalculation();