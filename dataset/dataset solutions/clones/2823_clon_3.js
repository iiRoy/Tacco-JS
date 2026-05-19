const parseNumbersFromString = (str) => str.split(' ').map(val => parseInt(val, 10));

function processInput(rawData) {
  const lines = rawData.split('\n');

  const firstLineNumbers = parseNumbersFromString(lines[0]);
  const countElements = firstLineNumbers[0];
  const targetSum = firstLineNumbers[1];

  const dataList = parseNumbersFromString(lines[1]);

  let currentAccumulatedSum = 0;
  for (let elementIndex = 0; elementIndex < countElements; elementIndex++) {
    currentAccumulatedSum += dataList[elementIndex];
    if (currentAccumulatedSum > targetSum) {
      console.log(elementIndex + 1);
      return;
    }
  }

  console.log(countElements);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
