process.stdin.resume();
process.stdin.setEncoding('utf8');

const capturedInputLines = [];
const inputLineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputLineReader.on('line', (currentLineContent) => {
  capturedInputLines.push(currentLineContent);
});

inputLineReader.on('close', () => {
  const FIRST_DATA_LINE_OFFSET = 1;

  const itemCountFromInput = parseInt(capturedInputLines[0], 10);

  const uniqueElementCollection = new Set();

  for (let loopCounter = FIRST_DATA_LINE_OFFSET; loopCounter <= itemCountFromInput; loopCounter++) {
    const currentItemValue = capturedInputLines[loopCounter];
    uniqueElementCollection.add(currentItemValue);
  }

  console.log(uniqueElementCollection.size);
});
