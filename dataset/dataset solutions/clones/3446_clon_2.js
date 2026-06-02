process.stdin.resume();

process.stdin.setEncoding('utf8');

let inputData = [];

const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', (currentLine) => {
  inputData.push(currentLine);
});

inputProcessor.on('close', () => {
  var parsedValues = inputData[0].split(' ');
  console.log(parsedValues[0] * 1.0 + parsedValues[2] / 2.0);
});
