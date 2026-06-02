process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = [];
const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});

lineProcessor.on('close', () => {
  const itemQuantity = Number(inputBuffer[0]);
  const rangeLimit = Number(inputBuffer[1]);
  const dataPoints = inputBuffer[2].split(' ').map(Number);

  const cumulativeResult = dataPoints.reduce((currentTotal, currentPoint) => {
    const lowerThreshold = Math.floor(rangeLimit / 2);
    const upperThreshold = rangeLimit / 2;

    const pointContribution = 2 * (
      (currentPoint < lowerThreshold) * currentPoint +
      (currentPoint > upperThreshold) * (rangeLimit - currentPoint)
    );

    return currentTotal + pointContribution;
  }, 0);

  console.log(cumulativeResult);
});
