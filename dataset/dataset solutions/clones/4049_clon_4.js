const obtainNumericalData = (rawData) => rawData.split("\n").map(Number);

const determineOptions = (itemIndex, currentAccumulation, limitsArray, targetValue) => {
    const denominationValues = [500, 100, 50];
    const totalItemTypes = denominationValues.length;

    if (itemIndex === totalItemTypes) {
        return currentAccumulation === targetValue ? 1 : 0;
    }

    let validCombinationCount = 0;
    const currentItemValue = denominationValues[itemIndex];
    const maxAllowedCount = limitsArray[itemIndex];

    for (let countOfCurrentItem = 0;
         countOfCurrentItem <= maxAllowedCount && currentAccumulation + (countOfCurrentItem * currentItemValue) <= targetValue;
         countOfCurrentItem++) {

        validCombinationCount += determineOptions(
            itemIndex + 1,
            currentAccumulation + (countOfCurrentItem * currentItemValue),
            limitsArray,
            targetValue
        );
    }
    return validCombinationCount;
};

const calculatePossibilities = (inputString) => {
    const numericalComponents = obtainNumericalData(inputString);
    const [limitA, limitB, limitC, desiredTotal] = numericalComponents;

    const itemLimits = [limitA, limitB, limitC];

    const resultCount = determineOptions(0, 0, itemLimits, desiredTotal);

    process.stdout.write(resultCount.toString() + "\n");
};

calculatePossibilities(require('node:fs').readFileSync(0, 'utf8'));