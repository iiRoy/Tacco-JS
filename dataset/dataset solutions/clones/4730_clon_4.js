const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (incomingLine) => {
  const numericValue = Number(incomingLine.trim());
  const outcomeArray = ["ARC", "ABC"];
  const decisionIndex = Number(numericValue < 1200);
  console.log(outcomeArray[decisionIndex]);
  inputProcessor.close();
});