process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputBuffer = [];
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
inputHandler.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});
inputHandler.on('close', () => {
  const fullInput = inputBuffer[0];
  const numberStrings = fullInput.match(/(\S+)\s+(\S+)/);
  const firstVal = Number(numberStrings[1]);
  const secondVal = Number(numberStrings[2]);
  console.log((2 * firstVal + secondVal) / 2);
});
