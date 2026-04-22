const processInputAndCompute = (inputPayload) => {
  const dataSegments = inputPayload.toString().trim().split("\n");
  const countOfElements = Number(dataSegments[0]);
  const numberSeries = dataSegments[1].split(" ").map(Number);

  if (countOfElements === 0) {
    return 0;
  }

  const totalAggregate = numberSeries.reduce((accum, val) => accum + val, 0);

  const prefixSums = numberSeries.reduce((accumulator, currentNumericValue) => {
    const lastCalculatedSum = accumulator.length > 0 ? accumulator[accumulator.length - 1] : 0;
    accumulator.push(lastCalculatedSum + currentNumericValue);
    return accumulator;
  }, []);

  const allPossibleDifferences = prefixSums.map(firstPartitionSum => {
    const secondPartitionSum = totalAggregate - firstPartitionSum;
    return Math.abs(firstPartitionSum - secondPartitionSum);
  });

  const minimalRange = Math.min(...allPossibleDifferences);
  return minimalRange;
};

const executeProgram = (source) => {
  const processedValue = processInputAndCompute(source);
  console.log(processedValue);
};

executeProgram(
  require("fs")
    .readFileSync("/dev/stdin")
);