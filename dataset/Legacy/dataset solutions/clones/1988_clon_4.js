const obtainCommonDivisor = (valA, valB) => {
  while (valB !== 0) {
    const temp = valB;
    valB = valA % valB;
    valA = temp;
  }
  return valA;
};

function computeDivisor(valueCollection) {
  if (!Array.isArray(valueCollection) || valueCollection.length === 0) {
    return 0;
  }
  return valueCollection.reduce((accumulator, currentElement) =>
    obtainCommonDivisor(accumulator, currentElement)
  );
}

function processInput(rawData) {
  const limitValue = parseInt(rawData, 10);
  let totalAccumulator = 0;

  const iterateAndSum = (currentA, currentB, currentC) => {
    if (currentA > limitValue) {
      return;
    }

    if (currentC > limitValue) {
      iterateAndSum(currentA, currentB + 1, 1);
      return;
    }

    if (currentB > limitValue) {
      iterateAndSum(currentA + 1, 1, 1);
      return;
    }

    totalAccumulator += computeDivisor([currentA, currentB, currentC]);

    iterateAndSum(currentA, currentB, currentC + 1);
  };

  iterateAndSum(1, 1, 1);

  console.log(totalAccumulator);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
