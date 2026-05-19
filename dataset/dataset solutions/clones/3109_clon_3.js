const addValueAtPosition = (targetArray, valueToInsert) => {
  const insertionPoint = valueToInsert - 1;
  targetArray.splice(insertionPoint, 0, valueToInsert);
};

function processInputData(inputString) {
  const inputLines = inputString.split("\n");
  const numberSequenceLine = inputLines[1];
  const inputNumbers = numberSequenceLine.split(" ").map(Number);

  const inputCount = inputNumbers.length;
  let resultArray = [];
  let hasMissingElement = false;

  for (let currentIdx = 0; currentIdx < inputCount; currentIdx++) {
    const expectedMax = currentIdx + 1;
    const currentNumber = inputNumbers[currentIdx];

    if (currentNumber > expectedMax) {
      hasMissingElement = true;
    }
    addValueAtPosition(resultArray, currentNumber);
  }

  if (hasMissingElement) {
    console.log(-1);
    return;
  }

  for (let outputIndex = 0; outputIndex < inputNumbers.length; outputIndex++) {
    const elementToLog = resultArray[outputIndex];
    console.log(elementToLog);
  }
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
