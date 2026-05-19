function readAndParseInputData() {
  const fileContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
  const lines = fileContent.split('\n');

  const firstLineParts = lines[0].split(' ');
  const selectionCount = Number(firstLineParts[1]);

  const numericValues = lines[1].split(' ').map(Number);

  return { selectionCount, numericValues };
}

function processData() {
  const { selectionCount, numericValues } = readAndParseInputData();

  const derivedSums = [];

  const addDoubledValue = (val) => {
    derivedSums.push(val * 2);
  };

  const addPairSumTwice = (valA, valB) => {
    const currentPairSum = valA + valB;
    derivedSums.push(currentPairSum);
    derivedSums.push(currentPairSum);
  };

  for (let outerIndex = 0; outerIndex < numericValues.length; outerIndex++) {
    const currentValue = numericValues[outerIndex];

    addDoubledValue(currentValue);

    for (let innerIndex = outerIndex + 1; innerIndex < numericValues.length; innerIndex++) {
      addPairSumTwice(currentValue, numericValues[innerIndex]);
    }
  }

  derivedSums.sort((itemA, itemB) => itemB - itemA);

  let totalResult = 0;
  const elementsToSum = derivedSums.slice(0, selectionCount);
  totalResult = elementsToSum.reduce((accumulator, currentElement) => accumulator + currentElement, 0);

  console.log(totalResult);
}

processData();
