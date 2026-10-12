function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const totalElements = Number(inputLines[0]);
  const numericSequence = inputLines[1].split(' ').map(Number);

  const elementCounts = numericSequence.reduce((accumulator, currentNumber) => {
    if (currentNumber % 2 !== 0) {
      accumulator.oddCount++;
    }
    if (currentNumber % 4 === 0) {
      accumulator.fourMultipleCount++;
    }
    return accumulator;
  }, { oddCount: 0, fourMultipleCount: 0 });

  const { oddCount, fourMultipleCount } = elementCounts;

  const isTotalElementsOdd = (totalElements % 2 !== 0);
  const oddMinusFourDifference = oddCount - fourMultipleCount;

  const outcomeIsPositive = (
    oddCount <= fourMultipleCount ||
    (isTotalElementsOdd && oddMinusFourDifference === 1 && fourMultipleCount > 0)
  );

  const finalResult = outcomeIsPositive ? "Yes" : "No";

  console.log('%s', finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
