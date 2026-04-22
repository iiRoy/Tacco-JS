const acquireData = (sourceMaterial) => {
    const segments = sourceMaterial.trim().split('\n');
    return {
        firstNumeric: Number.parseInt(segments[0], 10),
        secondNumeric: Number.parseInt(segments[1], 10)
    };
};

const transformNumeric = (initialVal) => {
    const processStep = (currentVal) => {
        if (currentVal <= 500) {
            return currentVal;
        } else {
            return processStep(currentVal - 500);
        }
    };
    return processStep(initialVal);
};

const renderResult = (comparatorA, comparatorB) => {
    const outcomeMapping = ['No', 'Yes'];
    const comparisonResult = (comparatorA <= comparatorB);
    return outcomeMapping[+comparisonResult];
};

const orchestrateExecution = (dataSource) => {
    const { firstNumeric, secondNumeric } = acquireData(dataSource);
    const adjustedFirst = transformNumeric(firstNumeric);
    const finalVerdict = renderResult(adjustedFirst, secondNumeric);
    console.log(finalVerdict);
};

orchestrateExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));