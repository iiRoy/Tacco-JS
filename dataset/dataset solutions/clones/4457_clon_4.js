process.stdin.resume();
process.stdin.setEncoding('utf8');

const receivedSegments = [];
const dataChannel = require('node:readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const computeBinaryPower = (val) => {
  if (val === 0) return 0;
  if (val % 2 !== 0) return 0;
  return Math.log2(val & -val);
};

dataChannel.on('line', (inputDatum) => {
  receivedSegments.push(inputDatum);
});

dataChannel.on('close', () => {
  const limitValue = Number(receivedSegments[0]);

  const resultTuple = Array.from({ length: limitValue }, (_, idx) => idx + 1)
    .reduce((accumulator, currentNumber) => {
      const currentPower = computeBinaryPower(currentNumber);

      if (currentPower > accumulator[0]) {
        return [currentPower, currentNumber];
      } else {
        return accumulator;
      }
    }, [-1, -1]);

  console.log(resultTuple[1]);
});