process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = [];
let lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
lineProcessor.on('line', (currentLine) => {
  inputBuffer.push(currentLine);
});
lineProcessor.on('close', () => {
  let fullInput = inputBuffer[0];
  let processedOutput = fullInput
    .split(' ')
    .slice(1, 2)
    .map(segment => segment + segment)
    .join('');
  console.log(processedOutput);
});
