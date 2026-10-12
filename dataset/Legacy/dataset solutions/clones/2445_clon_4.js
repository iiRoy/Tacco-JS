const MODULUS = 998244353;

function modularExponentiation(baseValue, exponentValue, modulusValue) {
  if (baseValue === undefined || exponentValue === undefined) {
    return NaN;
  }

  if (exponentValue === 0) {
    return 1;
  }
  if (baseValue === 0) {
    return 0;
  }
  if (baseValue === 1) {
    return 1;
  }

  let resultAccumulator = 1;
  let currentBase = baseValue % modulusValue;

  while (exponentValue > 0) {
    if (exponentValue % 2 === 1) {
      resultAccumulator = (resultAccumulator * currentBase) % modulusValue;
    }
    currentBase = (currentBase * currentBase) % modulusValue;
    exponentValue = Math.floor(exponentValue / 2);
  }
  return resultAccumulator;
}

function processInput(rawInputLines) {
  const inputCount = Number(rawInputLines[0]);
  const numericValues = rawInputLines[1].split(" ").map(Number);

  const { frequencyStore, maxVal } = numericValues.reduce(
    (accumulator, currentNumber) => {
      accumulator.frequencyStore.set(
        currentNumber,
        (accumulator.frequencyStore.get(currentNumber) || 0) + 1
      );
      accumulator.maxVal = Math.max(accumulator.maxVal, currentNumber);
      return accumulator;
    },
    { frequencyStore: new Map(), maxVal: 0 }
  );

  const finalResult = Array.from({ length: maxVal }, (_, index) => index + 1).reduce(
    (accumulator, currentIteration) => {
      const baseForTerm = frequencyStore.get(currentIteration - 1);
      const exponentForTerm = frequencyStore.get(currentIteration);
      const currentTerm = modularExponentiation(
        baseForTerm,
        exponentForTerm,
        MODULUS
      );

      return Number.isNaN(currentTerm)
        ? NaN
        : (accumulator * currentTerm) % MODULUS;
    },
    1
  );

  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
