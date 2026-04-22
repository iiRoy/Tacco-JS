const acquireAndParseData = (sourceMaterial) => {
    const dataExtractor = /^(\S+)\s+(\S+)\n(\d+)\s+(\d+)\n(\S+)$/;
    const capturedGroups = sourceMaterial.match(dataExtractor);

    const [_, firstToken, secondToken, firstNumeric, secondNumeric, queryToken] = capturedGroups;

    return {
        firstLabel: firstToken,
        secondLabel: secondToken,
        initialValueA: Number(firstNumeric),
        initialValueB: Number(secondNumeric),
        targetQuery: queryToken
    };
};

const computeAdjustedValues = (processedInputs) => {
    const { firstLabel, secondLabel, initialValueA, initialValueB, targetQuery } = processedInputs;

    const currentQuantities = [initialValueA, initialValueB];

    const adjustmentMap = new Map();
    adjustmentMap.set(firstLabel, 0);
    adjustmentMap.set(secondLabel, 1);

    const indexToDecrement = adjustmentMap.get(targetQuery);

    currentQuantities[indexToDecrement]--;

    return currentQuantities.join(" ");
};

const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const structuredData = acquireAndParseData(sourceContent);
const finalOutcome = computeAdjustedValues(structuredData);

console.log(finalOutcome);