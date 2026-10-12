process.stdin.resume();
process.stdin.setEncoding('utf8');

var collectedInputLines = [];
var lineInputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineInputProcessor.on('line', (currentLineText) => {
  collectedInputLines.push(currentLineText);
});

function determineMinimum(stringNumberArray) {
  const numericElements = stringNumberArray.map(Number);
  return Math.min(...numericElements);
}

lineInputProcessor.on('close', () => {
  const firstInputLineContent = collectedInputLines[0];
  const numberStringTokens = firstInputLineContent.split(' ');

  const primaryMinimumValue = determineMinimum(numberStringTokens);

  const remainingNumberStringTokens = numberStringTokens.filter(
    (currentElementStr) => currentElementStr != primaryMinimumValue
  );

  const secondaryMinimumValue = determineMinimum(remainingNumberStringTokens);
  
  console.log(primaryMinimumValue + secondaryMinimumValue);
});
