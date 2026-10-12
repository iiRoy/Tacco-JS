const processNumericalSequence = (inputString) => {
  const [firstParam, secondParam] = inputString.trim().split(' ').map(Number);

  if (firstParam === 0) {
    console.log(0);
    return;
  }

  if (firstParam === 1) {
    console.log(secondParam);
    return;
  }

  const multiplierValue = secondParam - 1;
  const iterationCount = firstParam - 1;

  const finalCalculation = Array.from({ length: iterationCount }, () => multiplierValue)
                                .reduce((accumulator, currentFactor) => accumulator * currentFactor, secondParam);

  console.log(finalCalculation);
};

processNumericalSequence(require("fs").readFileSync("/dev/stdin", "utf8"));
