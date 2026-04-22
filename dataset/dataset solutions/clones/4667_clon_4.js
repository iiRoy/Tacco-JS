const reportOutcome = (dataUnit) => {
    console.log(dataUnit.toString());
};

const ascertainNumericalScale = (numericEntity) => {
    return Math.floor(Math.log10(numericEntity)) + 1;
};

const evaluateCombinedScale = (firstComponent, secondComponent) => {
    return Math.max(
        ascertainNumericalScale(firstComponent),
        ascertainNumericalScale(secondComponent)
    );
};

const executeAnalysis = (incomingDatum) => {
    const integralValue = Number.parseInt(incomingDatum, 10);

    if (integralValue === 1) {
        reportOutcome("1");
        return;
    }

    const traverseFactorsRecursively = (
        currentTestFactor,
        minimumObservedScale
    ) => {
        if (currentTestFactor * currentTestFactor > integralValue) {
            return minimumObservedScale;
        }

        let updatedMinimumScale = minimumObservedScale;

        if (integralValue % currentTestFactor === 0) {
            const correspondingFactor = integralValue / currentTestFactor;
            updatedMinimumScale = Math.min(
                minimumObservedScale,
                evaluateCombinedScale(currentTestFactor, correspondingFactor)
            );
        }

        return traverseFactorsRecursively(
            currentTestFactor + 1,
            updatedMinimumScale
        );
    };

    const finalResultScale = traverseFactorsRecursively(1, 20);
    reportOutcome(finalResultScale);
};

const systemFileAccessor = require("fs");
const rawInputContent = systemFileAccessor
    .readFileSync("/dev/stdin", "utf8")
    .trim();

executeAnalysis(rawInputContent);