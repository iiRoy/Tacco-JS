function processInput(rawData) {
  const lines = rawData.split('\n');
  let numericArray = lines[1].split(' ').map(valStr => parseInt(valStr, 10));

  let isValidSequence = true;
  const sequenceLength = numericArray.length;

  for (let currentIdx = 1; currentIdx < sequenceLength - 1; currentIdx++) {
    const previousVal = numericArray[currentIdx - 1];
    const currentVal = numericArray[currentIdx];
    const nextVal = numericArray[currentIdx + 1];

    const computedXor = previousVal ^ nextVal;

    if (computedXor !== currentVal) {
      isValidSequence = false;
      break;
    }
  }

  if (isValidSequence) {
    const elementBeforeLast = numericArray[sequenceLength - 2];
    const firstElement = numericArray[0];
    const lastElement = numericArray[sequenceLength - 1];

    const xorForLastElement = elementBeforeLast ^ firstElement;

    if (xorForLastElement !== lastElement) {
      isValidSequence = false;
    }
  }

  if (isValidSequence) {
    const secondElement = numericArray[1];
    const lastElementForFirstCheck = numericArray[sequenceLength - 1];
    const targetFirstElement = numericArray[0];

    const xorForFirstElement = secondElement ^ lastElementForFirstCheck;

    if (xorForFirstElement !== targetFirstElement) {
      isValidSequence = false;
    }
  }

  const finalResultString = isValidSequence ? 'Yes' : 'No';

  console.log('%s', finalResultString);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
