function calculateProductModulo(inputLines) {
  const totalElementsCount = Number(inputLines[0]);

  const numberFrequencies = {};
  let maximumValueEncountered = 0;

  const numbersAsString = inputLines[1].split(" ");
  for (const numStr of numbersAsString) {
    const parsedNumber = Number(numStr);
    if (numberFrequencies[parsedNumber]) {
      numberFrequencies[parsedNumber]++;
    } else {
      numberFrequencies[parsedNumber] = 1;
    }
    maximumValueEncountered = Math.max(maximumValueEncountered, parsedNumber);
  }

  let cumulativeProduct = 1;
  const MODULO_VALUE = 998244353;

  for (let currentIteration = 1; currentIteration <= maximumValueEncountered; ++currentIteration) {
    const baseValue = numberFrequencies[currentIteration - 1];
    const exponentValue = numberFrequencies[currentIteration];

    const termPower = Math.pow(baseValue, exponentValue);

    cumulativeProduct *= termPower;
    cumulativeProduct %= MODULO_VALUE;
  }

  console.log(cumulativeProduct);
}

calculateProductModulo(require('fs').readFileSync('/dev/stdin', 'utf8').split("\n"));
