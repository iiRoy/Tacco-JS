function processInput(rawData) {
  const parsedValues = rawData.split(' ');
  const valA = Number(parsedValues[0]);
  const valB = Number(parsedValues[1]);
  const targetIndex = Number(parsedValues[2]);

  let smallerVal;
  let largerVal;

  if (valA < valB) {
    smallerVal = valA;
    largerVal = valB;
  } else {
    smallerVal = valB;
    largerVal = valA;
  }

  const isPerfectlyDivisible = (dividend, divisor) => {
    if (divisor === 0) {
      return false;
    }
    return Number.isInteger(dividend / divisor);
  };

  const commonDivisors = [];
  for (let currentDivisor = 1; currentDivisor <= smallerVal; ++currentDivisor) {
    const isDivisorOfSmaller = isPerfectlyDivisible(smallerVal, currentDivisor);
    const isDivisorOfLarger = isPerfectlyDivisible(largerVal, currentDivisor);

    if (isDivisorOfSmaller && isDivisorOfLarger) {
      commonDivisors.push(currentDivisor);
    }
  }

  const actualIndexFromEnd = commonDivisors.length - targetIndex;
  const desiredDivisor = commonDivisors.splice(actualIndexFromEnd, 1)[0];

  console.log(desiredDivisor);
}
