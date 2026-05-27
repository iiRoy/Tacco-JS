async function processInput() {
  let fullInputContent = '';
  process.stdin.setEncoding('utf8');
  for await (const dataChunk of process.stdin) {
    fullInputContent += dataChunk;
  }
  const receivedLines = fullInputContent.split('\n');
  performCalculation(receivedLines);
}

function performCalculation(inputDataRows) {
  const numberSequence = inputDataRows[0].split(/\s+/).map(Number);
  const firstCoordX = numberSequence[0];
  const firstCoordY = numberSequence[1];
  const secondCoordX = numberSequence[2];
  const secondCoordY = numberSequence[3];

  const getAbsoluteValue = (val) => val < 0 ? -val : val;

  const xDifference = secondCoordX - firstCoordX;
  const yDifference = secondCoordY - firstCoordY;

  const sumOfAbsoluteDifferences = getAbsoluteValue(xDifference) + getAbsoluteValue(yDifference);
  const calculatedMetric = Math.pow(sumOfAbsoluteDifferences, 0.5);

  console.log(calculatedMetric.toFixed(6));
}

processInput();
