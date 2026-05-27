function solveProblem(inputData) {
  const [upperBound, moduloDivisor] = inputData.split(' ').map(Number);

  const checkDivisibilityConditions = (a, b, c, divisor) => {
    const sumAB = a + b;
    const sumBC = b + c;
    const sumCA = c + a;

    const conditionAB = (sumAB % divisor === 0);
    const conditionBC = (sumBC % divisor === 0);
    const conditionCA = (sumCA % divisor === 0);

    return conditionAB && conditionBC && conditionCA;
  };

  const resultTriplets = [];

  for (let val1 = 1; val1 <= upperBound; val1++) {
    for (let val2 = 1; val2 <= upperBound; val2++) {
      for (let val3 = 1; val3 <= upperBound; val3++) {
        if (checkDivisibilityConditions(val1, val2, val3, moduloDivisor)) {
          resultTriplets.push([val1, val2, val3]);
        }
      }
    }
  }

  console.log(resultTriplets.length);
}

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
