const processInput = (rawText) => {
  const [firstComponent, secondComponent] = rawText.split(' ').map(Number);
  const adjustedN = firstComponent + 1;
  const kFactor = secondComponent;
  const calculationLimit = adjustedN - kFactor + 1;

  const MOD_VALUE = 10 ** 9 + 7;

  // The original loop calculates the sum of an arithmetic series:
  // (calculationLimit - 0) + (calculationLimit - 1) + ... + (calculationLimit - (calculationLimit - 1))
  // This simplifies to: calculationLimit + (calculationLimit - 1) + ... + 1
  // Which is the sum of integers from 1 to calculationLimit.
  // The formula for the sum of the first N positive integers is N * (N + 1) / 2.
  const finalSum = (calculationLimit * (calculationLimit + 1)) / 2;

  console.log(finalSum % MOD_VALUE);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
