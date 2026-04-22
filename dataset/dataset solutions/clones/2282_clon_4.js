process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = [];
let fileReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

fileReader.on('line', (lineContent) => {
  inputBuffer.push(lineContent);
});

fileReader.on('close', () => {
  const permutationSize = Number(inputBuffer[0]);

  const factorialValues = new Array(permutationSize + 1);
  factorialValues[0] = 1;
  for (let index = 1; index <= permutationSize; index++) {
    factorialValues[index] = factorialValues[index - 1] * index;
  }

  const getLexicographicalOrder = (elementSequence, sequenceLength) => {
    let computedOrder = 0;
    const elementUsedStatus = new Array(sequenceLength + 1).fill(false); // 1-indexed

    for (let currentPosition = 0; currentPosition < sequenceLength; currentPosition++) {
      const currentVal = elementSequence[currentPosition];
      let availableSmallerCount = 0;
      for (let checkValue = 1; checkValue < currentVal; checkValue++) {
        if (!elementUsedStatus[checkValue]) {
          availableSmallerCount++;
        }
      }
      computedOrder += availableSmallerCount * factorialValues[sequenceLength - 1 - currentPosition];
      elementUsedStatus[currentVal] = true;
    }
    return computedOrder + 1; // Convert to 1-based rank
  };

  const firstInputSequence = inputBuffer[1].split(' ').map(numberString => Number(numberString));
  const secondInputSequence = inputBuffer[2].split(' ').map(numberString => Number(numberString));

  const firstSequenceRank = getLexicographicalOrder(firstInputSequence, permutationSize);
  const secondSequenceRank = getLexicographicalOrder(secondInputSequence, permutationSize);

  console.log(Math.abs(firstSequenceRank - secondSequenceRank));
});