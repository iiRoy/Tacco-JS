process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputLines = [];
const lineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

lineReader.on('close', () => {
  const TARGET_SEQUENCE = "ABC";
  const REPLACEMENT_SEQUENCE = "BCA";

  let inputString = inputLines[0];
  let transformationCount = 0;

  let foundIndex = inputString.indexOf(TARGET_SEQUENCE);

  while (foundIndex !== -1) {
    inputString = inputString.substring(0, foundIndex) + REPLACEMENT_SEQUENCE + inputString.substring(foundIndex + TARGET_SEQUENCE.length);
    transformationCount++;
    foundIndex = inputString.indexOf(TARGET_SEQUENCE);
  }

  console.log(transformationCount);
});
