const performCalculation = () => {
    const gatherRawValues = () => {
        const fileSystem = require('fs');
        const content = fileSystem.readFileSync('/dev/stdin', 'utf8');
        return content.trim().split(/\s+/g).map(Number);
    };

    const numericalSequence = gatherRawValues();
    const sequenceLength = numericalSequence[0];
    const actualNumbers = numericalSequence.slice(1, sequenceLength + 1);

    const evaluateRangeConstraints = (collection) => {
        const initialConstraint = {
            validResult: true,
            minBound: 2,
            maxBound: 2
        };

        const finalConstraint = collection.reduceRight((currentStatus, valueElement) => {
            if (!currentStatus.validResult) {
                return currentStatus;
            }

            const upperLimitForNextStep = currentStatus.maxBound;
            const currentElementValue = valueElement;

            let effectiveMultiple = Math.floor(upperLimitForNextStep / currentElementValue) * currentElementValue;
            if (effectiveMultiple <= upperLimitForNextStep) {
                effectiveMultiple += currentElementValue;
            }

            const calculatedUpper = effectiveMultiple - 1;
            const calculatedLower = effectiveMultiple - currentElementValue;

            if (calculatedUpper < currentElementValue || calculatedLower > calculatedUpper) {
                return { validResult: false, minBound: -1, maxBound: -1 };
            }

            return {
                validResult: true,
                minBound: calculatedLower,
                maxBound: calculatedUpper
            };
        }, initialConstraint);

        if (!finalConstraint.validResult) {
            console.log(-1);
        } else {
            console.log(`${finalConstraint.minBound} ${finalConstraint.maxBound}`);
        }
    };

    evaluateRangeConstraints(actualNumbers);
};

performCalculation();