process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputBuffer = [];
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});

inputProcessor.on('close', () => {
  const itemCount = Number(inputBuffer[0]);
  const numericValues = inputBuffer[1].split(' ').map(Number);

  numericValues.sort((valA, valB) => valB - valA);

  const finalScores = numericValues.reduce((accumulator, currentVal, idx) => {
    if (idx % 2 === 1) {
      accumulator.aliceScore += currentVal;
    } else {
      accumulator.bobScore += currentVal;
    }
    return accumulator;
  }, { aliceScore: 0, bobScore: 0 });

  console.log(finalScores.aliceScore - finalScores.bobScore);
});
