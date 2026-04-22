const nodeIO = require('node:fs');

const extractNumbers = (sourceIdentifier) => {
    const rawContent = nodeIO.readFileSync(sourceIdentifier, 'utf8');
    const numericStrings = rawContent.trimEnd().split(/\s+/);
    const num1 = globalThis.BigInt(numericStrings[0]);
    const num2 = globalThis.BigInt(numericStrings[1]);
    return { firstOperand: num1, secondOperand: num2 };
};

const getIntegerPartFloor = (valDividend, valDivisor) => {
    const floatDividend = Number(valDividend);
    const floatDivisor = Number(valDivisor);
    const floatQuotient = floatDividend / floatDivisor;
    return floatQuotient < 0 && floatQuotient % 1 !== 0 ? Math.trunc(floatQuotient) - 1 : Math.trunc(floatQuotient);
};

const getBigIntRemainder = (valDividend, valDivisor) => {
    // BigInt division truncates towards zero. This expression is equivalent to the BigInt % operator.
    return valDividend - (valDividend / valDivisor) * valDivisor;
};

const getFloatingPointQuotient = (valDividend, valDivisor) => {
    return Number(valDividend) / Number(valDivisor);
};

const { firstOperand: valueX, secondOperand: valueY } = extractNumbers(0); // 0 is the file descriptor for stdin

const calculationResult1 = getIntegerPartFloor(valueX, valueY);
const calculationResult2 = getBigIntRemainder(valueX, valueY);
const calculationResult3 = getFloatingPointQuotient(valueX, valueY);

const finalOutputElements = [];
finalOutputElements.push(calculationResult1);
finalOutputElements.push(calculationResult2);
finalOutputElements.push(calculationResult3);

process.stdout.write(finalOutputElements.join(' ') + '\n');