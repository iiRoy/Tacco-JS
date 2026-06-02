function processInputData(rawData) {
  const parseNumbers = (str) => str.split(' ').map(strVal => parseInt(strVal, 10));

  const inputLines = rawData.split('\n');

  const firstLineContent = inputLines.shift();
  const configParams = parseNumbers(firstLineContent);

  const [arraySize, initialValueZ, initialValueW] = configParams;

  const secondLineContent = inputLines.shift();
  const numberSequence = parseNumbers(secondLineContent);

  const zMinusW = initialValueZ - initialValueW;
  const baseDifference = Math.abs(zMinusW);

  const lastElementIndex = arraySize - 1;
  const secondToLastElementIndex = arraySize - 2;

  const lastElement = numberSequence[lastElementIndex];
  const secondToLastElement = numberSequence[secondToLastElementIndex];

  const diffBetweenLastTwo = lastElement - secondToLastElement;
  const lastTwoElementsDiff = Math.abs(diffBetweenLastTwo);

  const diffLastElementAndW = lastElement - initialValueW;
  const lastElementDiff = Math.abs(diffLastElementAndW);

  const finalMaxResult = Math.max(baseDifference, lastTwoElementsDiff, lastElementDiff);

  console.log(finalMaxResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
