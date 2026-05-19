process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputData = [];
var ioHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
ioHandler.on('line', (currentLine) => {
  inputData.push(currentLine)
});

ioHandler.on('close', () => {

  const numericValues = inputData[0].split(' ').map(Number);
  numericValues.sort((a, b) => a - b);

  const smallestOne = numericValues[0];
  const smallestTwo = numericValues[1];
  
  console.log(smallestOne + smallestTwo);

});
