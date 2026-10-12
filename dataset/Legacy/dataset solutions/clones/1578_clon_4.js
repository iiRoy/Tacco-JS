process.stdin.resume();
process.stdin.setEncoding('utf8');

const inputLines = [];
const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

lineProcessor.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

lineProcessor.on('close', () => {
  const countElements = parseInt(inputLines[0], 10);
  const elementStrings = inputLines[1].split(' ');
  
  const numericElements = elementStrings.map(Number);

  const finalResult = numericElements.slice(0, countElements).reduce((accumulator, currentElement) => {
    const newPeak = Math.max(accumulator.runningMax, currentElement);
    const newSum = accumulator.totalDifference + (newPeak - currentElement);
    return { runningMax: newPeak, totalDifference: newSum };
  }, { runningMax: 0, totalDifference: 0 });

  console.log(finalResult.totalDifference);
});
