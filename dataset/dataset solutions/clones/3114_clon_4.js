const dataExtractor = (sourceContent) => Number.parseInt(sourceContent.match(/^\d+/)[0], 10);

const calculateInitialValue = (val) => (val % 2 === 0) ? (val - 2) * val / 2 : (val - 3) * (val - 1) / 2 + (val - 1);

const generateFilteredPairs = (maxVal) => {
    const conditionChecker = (pItem) => {
        const sumOfElements = pItem.firstElement + pItem.secondElement;
        return (maxVal % 2 === 0) ? (sumOfElements !== (maxVal + 1)) : (sumOfElements !== maxVal);
    };

    const allCombinations = Array.from({ length: maxVal }, (_, indexA) => indexA + 1)
        .flatMap(primaryElement =>
            Array.from({ length: maxVal - primaryElement }, (_, indexB) => primaryElement + 1 + indexB)
                .map(secondaryElement => ({ firstElement: primaryElement, secondElement: secondaryElement }))
        );

    return allCombinations.filter(conditionChecker)
                          .map(pItem => `${pItem.firstElement} ${pItem.secondElement}`);
};

const MasterProcessor = (sourceContent) => {
    const numericalParameter = dataExtractor(sourceContent);
    const leadingOutput = calculateInitialValue(numericalParameter);
    const subsequentOutputs = generateFilteredPairs(numericalParameter);

    const outputCollection = [leadingOutput, ...subsequentOutputs];
    const finalRender = outputCollection.join('\n');

    console.log(finalRender);
    return finalRender;
};

MasterProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));