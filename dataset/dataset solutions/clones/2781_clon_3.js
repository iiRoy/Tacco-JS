process.stdin.resume();
process.stdin.setEncoding('utf8');

var inputLines = [];
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {

  const isMedianOfThree = (valA, valB, valC) => {
    return (valB >= valA && valB <= valC) || (valB <= valA && valB >= valC);
  };

  const rawNumbersString = inputLines[1];
  const numericValues = rawNumbersString.split(' ').map(Number);

  let middleCount = 0;

  for (let currentIndex = 1; currentIndex < numericValues.length - 1; ++currentIndex) {
    const previousValue = numericValues[currentIndex - 1];
    const currentValue = numericValues[currentIndex];
    const nextValue = numericValues[currentIndex + 1];

    if (isMedianOfThree(previousValue, currentValue, nextValue)) {
      middleCount++;
    }
  }

  console.log(middleCount);

});
