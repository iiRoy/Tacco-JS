function processInputData(rawDataLines) {
  const firstLineData = parseLineOfNumbers(rawDataLines[0]);
  const totalItems = firstLineData[0];
  const totalPositions = firstLineData[1];
  const thresholdValue = firstLineData[2];

  const itemCostsData = parseLineOfNumbers(rawDataLines[1]);

  let itemsAboveThresholdCount = 0;
  for (const costItem of itemCostsData) {
    if (costItem > thresholdValue) {
      itemsAboveThresholdCount++;
    }
  }

  const itemsBelowOrEqualThresholdCount = totalPositions - itemsAboveThresholdCount;
  const finalResult = Math.min(itemsAboveThresholdCount, itemsBelowOrEqualThresholdCount);

  console.log(finalResult);
}

function parseLineOfNumbers(inputLineString) {
  const convertToInteger = (str) => parseInt(str, 10);
  const parsedNumbersArray = inputLineString.split(' ').map(convertToInteger);
  return parsedNumbersArray;
}

let accumulatedInputString = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

const handleDataChunk = (dataChunk) => {
  accumulatedInputString += dataChunk;
};

const handleEndOfInput = () => {
  const splitInputLines = accumulatedInputString.split('\n');
  processInputData(splitInputLines);
};

process.stdin.on('data', handleDataChunk);
process.stdin.on('end', handleEndOfInput);
