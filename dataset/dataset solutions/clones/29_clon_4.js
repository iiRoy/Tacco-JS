const computeFinalBalance = (currentAmount, cyclesRemaining, rateMultiplier) => {
  if (cyclesRemaining === 0) {
    return currentAmount;
  } else {
    const intermediateAmount = currentAmount * rateMultiplier;
    const adjustedAmount = Math.ceil(intermediateAmount / 1000) * 1000;
    return computeFinalBalance(adjustedAmount, cyclesRemaining - 1, rateMultiplier);
  }
};

const initialCapital = 100000;
const numberOfPeriods = 5;
const annualGrowth = 1.05;

const finalValue = computeFinalBalance(initialCapital, numberOfPeriods, annualGrowth);
console.log(finalValue);