const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let gatheredSegments = [];

inputReader.on('line', (individualLine) => {
  gatheredSegments.push(individualLine);
});

inputReader.on('close', () => {
  const processValuesRecursively = (dataCollection, currentPoint) => {
    if (currentPoint >= dataCollection.length) {
      return;
    }

    const textualItem = dataCollection[currentPoint];
    const numericItem = Number(textualItem);

    const preamble = 'Case ' + (currentPoint + 1) + ': ';
    console.log(preamble + numericItem);

    if (numericItem === 0) {
      process.exit(0);
    }

    processValuesRecursively(dataCollection, currentPoint + 1);
  };

  processValuesRecursively(gatheredSegments, 0);
});