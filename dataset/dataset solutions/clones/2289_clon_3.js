process.stdin.resume();
process.stdin.setEncoding('utf8');

const collectedInputLines = [];

function processAndFormatTokens(tokenSourceArray) {
  const targetValue = tokenSourceArray[1];

  tokenSourceArray[0] = targetValue;
  tokenSourceArray[1] = targetValue;

  return tokenSourceArray.join("");
}

const readlineModule = require('readline');
const inputHandler = readlineModule.createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', (currentInputLine) => {
  collectedInputLines.push(currentInputLine);
});

inputHandler.on('close', () => {
  const initialLineContent = collectedInputLines[0];
  const processedTokens = initialLineContent.split(" ");
  const finalOutputString = processAndFormatTokens(processedTokens);
  console.log(finalOutputString);
});
