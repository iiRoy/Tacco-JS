function processInputData(dataString) {
  const lineSegments = dataString.split('\n');
  const valueTokens = lineSegments[1].split(' ');

  const obtainInteger = (segment) => Number.parseInt(segment, 10);

  const countDivisionsRecursive = (val, currentCount = 0) => {
    if ((val & 1) !== 0) {
      return currentCount;
    } else {
      return countDivisionsRecursive(val >> 1, currentCount + 1);
    }
  };

  const totalDivisions = valueTokens.reduce((currentSum, token) => {
    const numericalValue = obtainInteger(token);

    if (Number.isNaN(numericalValue)) {
      return currentSum;
    }

    const iterations = countDivisionsRecursive(numericalValue);

    return currentSum + iterations;
  }, 0);

  console.log(totalDivisions);
}

processInputData(require("fs").readFileSync("/dev/stdin","utf-8"));