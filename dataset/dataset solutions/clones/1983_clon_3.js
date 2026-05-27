const calculateSum = (rawData) => {
  const processedInput = rawData.trim();
  const upperLimit = Number(processedInput);
  let accumulatedSum = 0;
  let currentIteration = 1;

  const shouldIncludeNumber = (value) => {
    const isDivisibleByThree = (value % 3 === 0);
    const isDivisibleByFive = (value % 5 === 0);
    return !isDivisibleByThree && !isDivisibleByFive;
  };

  while (currentIteration <= upperLimit) {
    if (shouldIncludeNumber(currentIteration)) {
      accumulatedSum += currentIteration;
    }
    currentIteration++;
  }
  return console.log(accumulatedSum);
};

process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : calculateSum(require('fs').readFileSync('dev/stdin', 'utf8')))
  : calculateSum(require('fs').readFileSync('/dev/stdin', 'utf8'));
