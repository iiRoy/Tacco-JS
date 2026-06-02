function executeProgram(programInput) {
  const inputLines = programInput.split('\n');
  const numberSequenceString = inputLines[0];
  const iterationCount = Number(inputLines[1]);

  let currentNumericValues = numberSequenceString.split(' ').map(Number);

  const finalNumericValues = Array.from({ length: iterationCount }).reduce((accumulatorArray) => {
    let highestValue = -Infinity;
    let highestValueIndex = -1;

    accumulatorArray.forEach((valElement, idxPosition) => {
      if (valElement > highestValue) {
        highestValue = valElement;
        highestValueIndex = idxPosition;
      }
    });

    return accumulatorArray.map((valElement, idxPosition) => {
      return idxPosition === highestValueIndex ? valElement * 2 : valElement;
    });
  }, currentNumericValues);

  console.log(finalNumericValues.reduce((totalSum, currentElement) => totalSum + currentElement, 0));
}

executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
