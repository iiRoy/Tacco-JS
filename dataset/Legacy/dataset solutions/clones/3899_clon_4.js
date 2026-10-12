const MAX_VALUE_LIMIT = 109;

function obtainSortedSequence(inputArray) {
  return [...inputArray].sort((firstElement, secondElement) => firstElement - secondElement);
}

function processInputData(rawData) {
  const processedValues = rawData.split(/\n|\s/).map(val => +val);
  const countElements = processedValues[0];
  const actualData = processedValues.slice(1, -1);

  const orderedSequence = obtainSortedSequence(actualData);

  const middleIndex = Math.floor(countElements / 2);
  const centralValue = orderedSequence[middleIndex];
  const precedingCentralValue = orderedSequence[middleIndex - 1];

  actualData.forEach(currentElement => {
    if (currentElement < centralValue) {
      console.log(centralValue);
    } else {
      console.log(precedingCentralValue);
    }
  });
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
