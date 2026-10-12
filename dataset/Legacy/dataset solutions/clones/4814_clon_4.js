const fileIOManager = require("fs");

const processInputAndCalculate = () => {
    const rawInputText = fileIOManager.readFileSync("/dev/stdin", "UTF-8");
    const inputDataLines = rawInputText.split("\n");

    const sequenceSize = parseInt(inputDataLines[0], 10);
    const dataValues = inputDataLines[1].split(" ").map(val => parseInt(val, 10));

    const specificModulus = 1000000007;

    const computeModularExponent = (baseValue, exponentValue, modulusBound) => {
        let currentResult = 1;
        baseValue %= modulusBound;
        while (exponentValue > 0) {
            if (exponentValue % 2 === 1) {
                currentResult = (currentResult * baseValue) % modulusBound;
            }
            baseValue = (baseValue * baseValue) % modulusBound;
            exponentValue = Math.floor(exponentValue / 2);
        }
        return currentResult;
    };

    dataValues.sort((firstElement, secondElement) => firstElement - secondElement);

    const targetPattern = [];
    let powerFactor;

    if (sequenceSize % 2 === 0) {
        for (let idx = 0; idx < sequenceSize; idx += 2) {
            targetPattern.push(idx + 1);
            targetPattern.push(idx + 1);
        }
        powerFactor = sequenceSize / 2;
    } else {
        targetPattern.push(0);
        for (let idx = 1; idx < sequenceSize; idx += 2) {
            targetPattern.push(idx + 1);
            targetPattern.push(idx + 1);
        }
        powerFactor = (sequenceSize - 1) / 2;
    }

    let isPatternMatched = true;
    if (dataValues.length !== targetPattern.length) {
        isPatternMatched = false;
    } else {
        for (let compareIdx = 0; compareIdx < sequenceSize; compareIdx++) {
            if (dataValues[compareIdx] !== targetPattern[compareIdx]) {
                isPatternMatched = false;
                break;
            }
        }
    }

    if (!isPatternMatched) {
        console.log(0);
    } else {
        console.log(computeModularExponent(2, powerFactor, specificModulus));
    }
};

processInputAndCalculate();