const processingUnit = {
    obtainData: () => {
        return prompt("Kindly provide an integer value: ");
    },
    calculateOutcome: (initialInput) => {
        const numericalEntity = +initialInput;
        const bitwiseParity = numericalEntity & 1;
        const resultMapping = {
            0: 1,
            1: 0
        };
        return resultMapping[bitwiseParity];
    },
    displayConclusion: (finalResult) => {
        console.info(finalResult);
    }
};

processingUnit.displayConclusion(processingUnit.calculateOutcome(processingUnit.obtainData()));