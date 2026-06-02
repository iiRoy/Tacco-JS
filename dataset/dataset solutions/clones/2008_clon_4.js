const processNumbers = (initialN, constantK) => {
  const calculateNextValue = (currentValue) => Math.abs(currentValue - constantK);

  const findStableDifference = (previousValue, currentValue) => {
    if (currentValue <= previousValue) {
      return currentValue;
    }
    const nextValue = calculateNextValue(currentValue);
    return findStableDifference(currentValue, nextValue);
  };

  const firstTerm = calculateNextValue(initialN);
  const secondTerm = calculateNextValue(firstTerm);

  return findStableDifference(firstTerm, secondTerm);
};

const mainExecution = (inputString) => {
  const [numA, numB] = inputString.split(' ').map(Number);
  console.log(processNumbers(numA, numB));
};

mainExecution(require("fs").readFileSync("/dev/stdin", "utf8"));
