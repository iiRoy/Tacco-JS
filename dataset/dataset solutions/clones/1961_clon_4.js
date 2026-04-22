let receivedInput = '';
process.stdin.on('data', (chunk) => {
  receivedInput += chunk;
});
process.stdin.on('end', () => {
  const {
    EOL: lineSeparator
  } = require('os');
  const allLines = receivedInput.split(lineSeparator);
  performCalculation(allLines);
});

const performCalculation = (sourceLines) => {
  let firstLineContent = sourceLines[0];
  let spaceIndex = firstLineContent.indexOf(' ');
  let numericalLimit = parseInt(firstLineContent.substring(0, spaceIndex), 10);

  let secondLineContent = sourceLines[1];
  let accumulatedValue = 0;
  let currentNumberString = '';
  for (let c of secondLineContent) {
    if (c === ' ') {
      if (currentNumberString !== '') {
        accumulatedValue += parseInt(currentNumberString, 10);
        currentNumberString = '';
      }
    } else {
      currentNumberString += c;
    }
  }
  if (currentNumberString !== '') {
    accumulatedValue += parseInt(currentNumberString, 10);
  }

  let difference = numericalLimit - accumulatedValue;
  console.log(Math.max(difference, -1));
};