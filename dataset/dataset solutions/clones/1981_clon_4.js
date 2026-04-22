process.stdin.setEncoding('utf-8');

process.stdin.on('data', function (incomingText) {
  let highestConsidered = Math.floor(Number(incomingText));

  const calculateArithmeticSum = (limit) => {
    if (limit <= 0) return 0;
    return (limit * (limit + 1)) / 2;
  };

  const determineMultiplesSum = (divisor, boundary) => {
    if (boundary <= 0) return 0;
    const countOfMultiples = Math.floor(boundary / divisor);
    return divisor * calculateArithmeticSum(countOfMultiples);
  };

  const totalPossibleSum = calculateArithmeticSum(highestConsidered);
  const sumOfThrees = determineMultiplesSum(3, highestConsidered);
  const sumOfFives = determineMultiplesSum(5, highestConsidered);
  const sumOfFifteens = determineMultiplesSum(15, highestConsidered);

  const finalAccumulatedValue = totalPossibleSum - sumOfThrees - sumOfFives + sumOfFifteens;

  console.log(finalAccumulatedValue);
});