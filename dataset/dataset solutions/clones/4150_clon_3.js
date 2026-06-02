function processInput(rawData) {
  const whitespaceSeparator = /\s/;
  const numericStringArray = rawData.split(whitespaceSeparator);

  const getParsedInteger = (strValue) => {
    return Number.parseInt(strValue, 10);
  };

  let accumulatedSum = 0;
  for (const currentString of numericStringArray) {
    const parsedNumber = getParsedInteger(currentString);
    accumulatedSum += parsedNumber;
  }

  const numberOfElements = numericStringArray.length;

  const computeCeilingAverage = (total, count) => {
    if (count === 0) {
      // Original code would result in Infinity or NaN if inputNumbers.length is 0.
      // This path should not be hit with typical problem constraints for /dev/stdin.
      // Preserving original behavior for division by zero if it were possible.
      return Math.ceil(total / count);
    }
    return Math.ceil(total / count);
  };

  const finalCalculatedValue = computeCeilingAverage(accumulatedSum, numberOfElements);

  console.log(finalCalculatedValue);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
