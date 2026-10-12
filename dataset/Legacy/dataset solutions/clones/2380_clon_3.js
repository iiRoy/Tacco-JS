const parseNumericRow = (rowString) => rowString.split(' ').map(strVal => parseInt(strVal, 10));

const computeFinalProduct = (elementsCount, dataArray) => {
  const moduloConstant = 1000000007;
  const frequencyTracker = Array(elementsCount + 1).fill(0);
  frequencyTracker[0] = 3;

  let runningProduct = 1;

  for (let loopIndex = 0; loopIndex < elementsCount; loopIndex++) {
    const currentElementValue = dataArray[loopIndex];
    const currentFrequency = frequencyTracker[currentElementValue];

    runningProduct = (runningProduct * currentFrequency) % moduloConstant;

    frequencyTracker[currentElementValue]--;
    frequencyTracker[currentElementValue + 1]++;
  }

  return `${runningProduct}`;
};

const processInputAndOutput = (rawInputString) => {
  const lines = rawInputString.trim().split('\n');
  const [elementsCount] = parseNumericRow(lines[0]);
  const dataArray = parseNumericRow(lines[1]);

  return computeFinalProduct(elementsCount, dataArray);
};

console.log(processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8')));
