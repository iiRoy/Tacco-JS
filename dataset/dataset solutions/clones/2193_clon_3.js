function processInputData(rawData) {
  const processedLines = rawData.trim().split('\n');

  const firstLineContent = processedLines[0];
  const firstLineParts = firstLineContent.split(' ');
  const skipCount = Number(firstLineParts[1]);

  const dataLineString = processedLines[1];
  const stringNumbers = dataLineString.split(' ');

  const numericValues = stringNumbers.map(Number);

  const sortDescending = (valA, valB) => valB - valA;
  const sortedNumericValues = numericValues.sort(sortDescending);

  const valuesToSum = sortedNumericValues.slice(skipCount);

  const finalSum = valuesToSum.reduce((currentSum, currentValue) => currentSum + currentValue, 0);

  console.log(finalSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
