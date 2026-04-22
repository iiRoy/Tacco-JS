const findLargestElementIndex = (collection) => {
  let greatestValue = -1n;
  let position = -1;

  for (let currentPos = 0; currentPos < collection.length; currentPos++) {
    if (collection[currentPos] > greatestValue) {
      greatestValue = collection[currentPos];
      position = currentPos;
    }
  }

  return position;
};

const processInputData = (rawData) => {
  const parsedLines = rawData.trim().split('\n');
  const numericValues = parsedLines[1].split(' ').map((valString) => BigInt(valString));

  numericValues.sort((first, second) => second - first);

  let resultArray = [numericValues.shift()];

  let finalSum = 0n;
  while (numericValues.length) {
    const currentNum = numericValues.shift();

    const insertionPoint = findLargestElementIndex(resultArray);
    finalSum += resultArray[insertionPoint];

    resultArray = [
      ...resultArray.slice(0, insertionPoint),
      currentNum,
      currentNum,
      ...resultArray.slice(insertionPoint + 1),
    ];
  }

  console.log(`${finalSum}`);
};

if (process.env.RUN_TEST_SCENARIO) {
  const executeTestScenario = () => {
    // This is a placeholder for any test specific functionality.
    // In a real application, this would contain test cases.
  };
  executeTestScenario();
} else {
  processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
}