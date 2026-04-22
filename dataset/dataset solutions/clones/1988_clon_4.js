const obtainCommonFactor = (num1, num2) => {
    while (num2 !== 0) {
        let tempValue = num2;
        num2 = num1 % num2;
        num1 = tempValue;
    }
    return num1;
};

const determineGreatestCommonDivisor = (numericCollection) => {
    if (numericCollection.length === 0) {
        return 0;
    }
    if (numericCollection.length === 1) {
        return numericCollection[0];
    }
    return numericCollection.reduce((accumulatorValue, currentElement) => {
        return obtainCommonFactor(accumulatorValue, currentElement);
    });
};

const ExecuteCalculation = (dataString) => {
    const upperLimit = Number.parseInt(dataString, 10);
    let cumulativeSum = 0;

    const generateAndSumCombinations = (currentValuesArray, currentPosition) => {
        if (currentPosition === 3) {
            cumulativeSum += determineGreatestCommonDivisor(currentValuesArray);
            return;
        }

        for (let iterationValue = 1; iterationValue <= upperLimit; iterationValue++) {
            currentValuesArray[currentPosition] = iterationValue;
            generateAndSumCombinations(currentValuesArray, currentPosition + 1);
        }
    };

    generateAndSumCombinations(new Array(3), 0);
    console.log(cumulativeSum);
};
//*この行以降は編集しないでください（標準入出力から一度に読み込み、Mainを呼び出します）
ExecuteCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));