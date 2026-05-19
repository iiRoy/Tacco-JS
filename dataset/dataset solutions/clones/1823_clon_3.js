const parseIntegerLine = (line) => line.split(' ').map(val => Number(val));

const compareNumbers = (a, b) => a - b;

((inputContent) => {
  const trimmedInput = inputContent.trim();
  const inputLines = trimmedInput.split('\n');

  const [elementCount] = parseIntegerLine(inputLines[0]);

  const rawDataPairs = inputLines.slice(1).map(parseIntegerLine);

  const firstComponentValues = [];
  const secondComponentValues = [];

  for (let i = 0; i < elementCount; i++) {
    const currentPair = rawDataPairs[i];
    firstComponentValues.push(currentPair[0]);
    secondComponentValues.push(currentPair[1]);
  }

  firstComponentValues.sort(compareNumbers);
  secondComponentValues.sort(compareNumbers);

  let finalResult;
  const adjustmentValue = 1;

  const isOddCount = (elementCount % 2 !== 0);

  if (isOddCount) {
    const middleIndex = (elementCount - 1) / 2;
    const medianA = firstComponentValues[middleIndex];
    const medianB = secondComponentValues[middleIndex];
    finalResult = medianB - medianA + adjustmentValue;
  } else {
    const upperMidIndex = elementCount / 2;
    const lowerMidIndex = upperMidIndex - 1;

    const valA1 = firstComponentValues[lowerMidIndex];
    const valA2 = firstComponentValues[upperMidIndex];
    const valB1 = secondComponentValues[lowerMidIndex];
    const valB2 = secondComponentValues[upperMidIndex];

    finalResult = (valB1 + valB2) - (valA1 + valA2) + adjustmentValue;
  }

  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
