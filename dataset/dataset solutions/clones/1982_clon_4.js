const ProcessValue = (dataString) => {
  const upperBound = Number.parseInt(dataString.trim(), 10);

  const calculateTotal = (cap) => cap * (cap + 1) / 2;

  const calculateDivisorSum = (divisor, cap) => {
    const count = Math.floor(cap / divisor);
    return divisor * calculateTotal(count);
  };

  const finalSum = calculateTotal(upperBound) -
                   calculateDivisorSum(3, upperBound) -
                   calculateDivisorSum(5, upperBound) +
                   calculateDivisorSum(15, upperBound);

  console.log(finalSum);
  return finalSum;
};

ProcessValue(require('node:fs').readFileSync('/dev/stdin', 'utf8'));