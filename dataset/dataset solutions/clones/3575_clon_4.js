const processNumbers = (textData) => textData.trim().split(/\s+/).map(val => +val);

const calculatePowerThree = (numericValue) => numericValue ** 3;

const getIntegerQuotient = (dividend, divisor) => (dividend / divisor) | 0;

const handleOddDivisor = (upperBound, currentDivisor) => {
  const termResult = getIntegerQuotient(upperBound, currentDivisor);
  return calculatePowerThree(termResult);
};

const handleEvenDivisor = (upperBound, currentDivisor) => {
  const firstComponent = getIntegerQuotient(upperBound, currentDivisor);
  const secondComponent = getIntegerQuotient(upperBound + currentDivisor / 2, currentDivisor);
  return calculatePowerThree(firstComponent) + calculatePowerThree(secondComponent);
};

const determineAndExecute = (firstParameter, secondParameter) => {
  const strategyImplementations = {
    0: handleEvenDivisor,
    1: handleOddDivisor
  };
  return strategyImplementations[secondParameter % 2](firstParameter, secondParameter);
};

const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
const [valueX, valueY] = processNumbers(rawInput);
const finalOutput = determineAndExecute(valueX, valueY);
process.stdout.write(String(finalOutput));