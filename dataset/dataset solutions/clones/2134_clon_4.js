const dataReceiver = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let incomingLines = [];

dataReceiver.on('line', (passage) => {
  incomingLines.push(passage);
});

dataReceiver.on('close', () => {
  console.error('\n↑input ↓output');
  executeLogic();
});

function presentResult(outcomeValue) {
  console.log(outcomeValue);
}

function computeBaseDigits(subjectNumber, radixValue) {
  if (subjectNumber === 0) {
    return 1;
  }

  let countOfDigits = 0;
  let temporaryNumber = subjectNumber;
  
  while (temporaryNumber > 0) {
    temporaryNumber = Math.floor(temporaryNumber / radixValue);
    countOfDigits++;
  }
  return countOfDigits;
}

function executeLogic() {
  const primaryLine = incomingLines[0];
  const parsedValues = primaryLine.split(' ').map(entry => parseInt(entry, 10));

  const numericalValue = parsedValues[0];
  const targetBase = parsedValues[1];

  const finalDigitCount = computeBaseDigits(numericalValue, targetBase);
  presentResult(finalDigitCount);
}