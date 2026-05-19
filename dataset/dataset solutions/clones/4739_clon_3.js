const calculateTotal = (rawInput) => {
  const parsedInput = parseInt(rawInput, 10);
  let finalSum = 0;
  let currentRemainder = parsedInput;

  const MAX_ITERATION_DIVISOR = 11;
  const DOUBLE_MULTIPLIER_THRESHOLD = 6;

  for (let currentDivisor = MAX_ITERATION_DIVISOR; currentDivisor > 0; currentDivisor--) {
    const currentQuotient = Math.floor(currentRemainder / currentDivisor);
    let multiplierFactor = 1;

    if (currentDivisor > DOUBLE_MULTIPLIER_THRESHOLD) {
      multiplierFactor = 2;
    }
    
    finalSum += currentQuotient * multiplierFactor;
    currentRemainder %= currentDivisor;
  }
  console.log(finalSum);
};

calculateTotal(require('fs').readFileSync('/dev/stdin', 'UTF-8'));
