const readline = require('readline');

function processInputContent(allTheInputStrings) {
  let smallestEncountered = undefined;

  for (let currentIdx = 1; currentIdx < allTheInputStrings.length; currentIdx++) {
    const currentLineValue = allTheInputStrings[currentIdx];

    if (smallestEncountered === undefined || currentLineValue.localeCompare(smallestEncountered) < 0) {
      smallestEncountered = currentLineValue;
    }
  }
  process.stdout.write(smallestEncountered + '\n');
}

const inputReader = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

const collectedInputLines = [];

inputReader.on('line', (individualLine) => {
  collectedInputLines.push(individualLine);
});

inputReader.on('close', () => {
  processInputContent(collectedInputLines);
});