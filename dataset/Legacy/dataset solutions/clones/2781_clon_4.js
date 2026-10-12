process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {

  const numericSequence = inputLines[1].split(' ').map(Number);

  const determineMiddleElement = (firstVal, middleVal, lastVal) => {
    return (middleVal >= firstVal && middleVal <= lastVal) || (middleVal <= firstVal && middleVal >= lastVal);
  };

  const localMedianCount = numericSequence.slice(1, -1).reduce((accumulator, currentElement, relativePosition) => {
    const absolutePosition = relativePosition + 1;
    const precedingElement = numericSequence[absolutePosition - 1];
    const succeedingElement = numericSequence[absolutePosition + 1];

    return accumulator + (determineMiddleElement(precedingElement, currentElement, succeedingElement) ? 1 : 0);
  }, 0);

  console.log(localMedianCount);

});
