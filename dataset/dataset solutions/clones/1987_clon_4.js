const computeCommonDivisor = (firstNum, secondNum) => {
    while (secondNum !== 0) {
        const tempVal = secondNum;
        secondNum = firstNum % secondNum;
        firstNum = tempVal;
    }
    return firstNum;
};

const findGreatestDivisor = (...numericValues) => {
    if (numericValues.length === 0) return 0;
    return numericValues.reduce((accumulator, currentElement) => computeCommonDivisor(accumulator, currentElement));
};

const fileSystemUtility = require("node:fs");
const sourceTextContent = fileSystemUtility.readFileSync("/dev/stdin", "utf8");

const executeCalculation = (rawData) => {
    const contentLines = rawData.split('\n');
    const upperLimit = Number(contentLines[0]);

    let finalAccumulation = 0;

    const numberSequence = Array.from({ length: upperLimit }, (_, index) => index + 1);

    numberSequence.forEach(valA => {
        numberSequence.forEach(valB => {
            numberSequence.forEach(valC => {
                finalAccumulation += findGreatestDivisor(valA, valB, valC);
            });
        });
    });

    console.log(finalAccumulation);
};

executeCalculation(sourceTextContent);