const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let storedLines = [];

inputReader.on('line', (currentLine) => {
  storedLines.push(currentLine);
});

inputReader.on('close', () => {
  processEvaluation(storedLines);
});

function processEvaluation(receivedDataLines) {
  const primaryDatum = receivedDataLines[0];

  const valueExtractor = /(\S+)\s+(\S+)/;
  const extractedComponents = primaryDatum.match(valueExtractor);

  const entityA = +extractedComponents[1];
  const entityB = +extractedComponents[2];

  const relationDescriptor = {
    '0': 'a == b',
    '-1': 'a < b',
    '1': 'a > b'
  };

  const differential = entityA - entityB;
  const indicator = Math.sign(differential);

  console.log(relationDescriptor[indicator.toString()]);
}