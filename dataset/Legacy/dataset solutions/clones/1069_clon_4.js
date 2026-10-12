let receivedData = '';

process.stdin.on('data', (chunk) => {
  receivedData += chunk;
});

process.stdin.on('end', () => {
  const lines = receivedData.trimEnd().split('\n').map(line => line.trimEnd());
  const numberStrings = lines[1].split(' ');
  const parsedNumbers = numberStrings.map(val => parseInt(val, 10));

  processNumbers(parsedNumbers);
});

const processNumbers = (numericalSequence) => {
  const pivotFinalPosition = divideAndPlace(numericalSequence, 0, numericalSequence.length - 1);
  let outputParts = [];
  for (let k = 0; k < numericalSequence.length; k++) {
    if (k === pivotFinalPosition) {
      outputParts.push(`[${numericalSequence[k]}]`);
    } else {
      outputParts.push(String(numericalSequence[k]));
    }
  }
  console.log(outputParts.join(' '));
};

const divideAndPlace = (dataCollection, startIdx, endIdx) => {
  const pivotElement = dataCollection[endIdx];
  const smallerOrEqual = [];
  const larger = [];

  for (let currentIdx = startIdx; currentIdx < endIdx; currentIdx++) {
    if (dataCollection[currentIdx] <= pivotElement) {
      smallerOrEqual.push(dataCollection[currentIdx]);
    } else {
      larger.push(dataCollection[currentIdx]);
    }
  }

  let currentWriteIdx = startIdx;
  for (const val of smallerOrEqual) {
    dataCollection[currentWriteIdx++] = val;
  }
  const finalPivotPosition = currentWriteIdx;
  dataCollection[currentWriteIdx++] = pivotElement;
  for (const val of larger) {
    dataCollection[currentWriteIdx++] = val;
  }

  return finalPivotPosition;
};
