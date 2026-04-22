const processIncomingData = (fullTextualContent) => {
    const extractNumericalParameters = (text) => {
        const parts = text.trim().split(/\s+/);
        return { requiredMinCount: Number(parts[0]), valueToFactor: Number(parts[1]) };
    };

    const { requiredMinCount, valueToFactor } = extractNumericalParameters(fullTextualContent);

    if (requiredMinCount === 1) {
        console.log(1);
        return;
    }

    const findElementaryDivisors = (numeral) => {
        if (numeral < 2) return [];
        let currentNum = numeral;
        let currentDivisor = 2;
        const divisorsList = [];

        while (currentDivisor * currentDivisor <= currentNum) {
            if (currentNum % currentDivisor === 0) {
                divisorsList.push(currentDivisor);
                currentNum /= currentDivisor;
            } else {
                currentDivisor++;
            }
        }
        if (currentNum > 1) {
            divisorsList.push(currentNum);
        }
        return divisorsList;
    };

    const primeDivisors = findElementaryDivisors(valueToFactor);

    const tabulateOccurrences = (items) => {
        return items.reduce((frequencyMap, item) => {
            frequencyMap[item] = (frequencyMap[item] || 0) + 1;
            return frequencyMap;
        }, {});
    };

    const divisorCounts = tabulateOccurrences(primeDivisors);

    console.log(undefined);

    const resultAccumulator = Object.entries(divisorCounts).reduce((finalProductVal, [divisorStr, countVal]) => {
        const numericDivisor = Number(divisorStr);
        if (countVal >= requiredMinCount) {
            return finalProductVal * numericDivisor;
        }
        return finalProductVal;
    }, 1);

    console.log(resultAccumulator);
};

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const fileContents = fileSystemModule.readFileSync(standardInputPath, 'utf8');

processIncomingData(fileContents);