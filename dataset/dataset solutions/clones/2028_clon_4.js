process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  const [circumferenceValue, pointCount] = inputLines[0].split(' ').map(Number);
  const pointCoordinates = inputLines[1].split(' ').map(Number);

  let longestSpan = 0;

  for (let i = 0; i < pointCount - 1; i++) {
    const currentSpan = pointCoordinates[i + 1] - pointCoordinates[i];
    if (currentSpan > longestSpan) {
      longestSpan = currentSpan;
    }
  }

  const circularSpan = circumferenceValue + pointCoordinates[0] - pointCoordinates[pointCount - 1];
  if (circularSpan > longestSpan) {
    longestSpan = circularSpan;
  }

  const finalDistance = circumferenceValue - longestSpan;

  console.log(finalDistance);
});
