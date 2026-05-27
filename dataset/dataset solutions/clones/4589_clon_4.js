process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputBuffer = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});

inputReader.on('close', () => {
  const initialValues = inputBuffer[0].split(' ');
  const valA = Number(initialValues[0]);
  const valB = Number(initialValues[1]);
  const valC = Number(initialValues[2]);

  const calculateTransformations = (currentA, currentB, currentC, iterationCount) => {
    if (currentA % 2 !== 0 || currentB % 2 !== 0 || currentC % 2 !== 0) {
      return iterationCount;
    }

    const nextA = currentB / 2 + currentC / 2;
    const nextB = currentA / 2 + currentC / 2;
    const nextC = currentB / 2 + currentA / 2;

    return calculateTransformations(nextA, nextB, nextC, iterationCount + 1);
  };

  if (valA === valB && valB === valC) {
    console.log("-1");
  } else {
    const finalCount = calculateTransformations(valA, valB, valC, 0);
    console.log(finalCount);
  }
});
