const lineReaderInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let accumulatedLines = [];

lineReaderInterface.on('line', (individualLine) => {
  accumulatedLines.push(individualLine);
});

lineReaderInterface.on('close', () => {
  let haltProcessing = false;
  accumulatedLines.forEach((currentEntry) => {
    if (haltProcessing) return;

    const numericRepresentation = Number(currentEntry);
    
    if (numericRepresentation === 0) {
      haltProcessing = true;
      return;
    }
    
    const computedResult = determineTrailingZeros(numericRepresentation);
    console.log(computedResult);
  });
});

function determineTrailingZeros(val) {
  if (val < 5) {
    return 0;
  }
  return Math.floor(val / 5) + determineTrailingZeros(Math.floor(val / 5));
}