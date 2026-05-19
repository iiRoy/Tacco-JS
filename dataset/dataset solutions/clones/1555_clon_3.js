const rawData = `4
141421356 17320508 22360679 244949`;

const parseInteger = (strValue) => parseInt(strValue, 10);

const dataRows = rawData.split('\n');

const countElements = parseInteger(dataRows[0]);
const elementsArray = dataRows[1].split(' ').map(parseInteger);

const moduloValue = 1000000007;

const prefixSums = elementsArray.reduce((accumulator, currentElement, currentIndex) => {
    const previousSum = accumulator[currentIndex];
    const newSum = (previousSum + currentElement) % moduloValue;
    accumulator.push(newSum);
    return accumulator;
}, [0]);

const SHIFT_BITS = 16;
const POWER_OF_TWO_SIXTEEN = 1 << SHIFT_BITS;

const multiplyModulo = (operandA, operandB) => {
    const highPartA = operandA >> SHIFT_BITS;
    const lowPartA = operandA & (POWER_OF_TWO_SIXTEEN - 1);

    const intermediateTerm1 = (highPartA * operandB) % moduloValue;
    const intermediateTerm2 = (intermediateTerm1 * POWER_OF_TWO_SIXTEEN) % moduloValue;
    const intermediateTerm3 = (lowPartA * operandB) % moduloValue;

    return (intermediateTerm2 + intermediateTerm3) % moduloValue;
};

let finalResult = 0;

if (countElements < 2) {
    console.log(0);
} else {
    for (let currentIdx = 1; currentIdx < countElements; currentIdx++) {
        const currentPrefixSum = prefixSums[currentIdx];
        const currentElement = elementsArray[currentIdx];
        const productContribution = multiplyModulo(currentPrefixSum, currentElement);
        finalResult = (finalResult + productContribution) % moduloValue;
    }

    console.log(finalResult);
}
