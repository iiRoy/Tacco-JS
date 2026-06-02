const readlineModule = require('readline');
const interfaceConfiguration = {
    input: process.stdin,
    output: process.stdout
};

var inputProcessor = readlineModule.createInterface(interfaceConfiguration);

var receivedLineContent;
inputProcessor.on('line', (currentInputLine) => {
  receivedLineContent = currentInputLine;
});

inputProcessor.on('close', () => {
  const contentSegments = receivedLineContent.split(' ');
  
  const firstNumericString = contentSegments[1];
  const secondNumericString = contentSegments[2];

  const valueA = parseInt(firstNumericString, 10);
  const valueB = parseInt(secondNumericString, 10);

  const intermediateDifference = valueB - valueA - 1;
  const absoluteIntermediateDifference = Math.abs(intermediateDifference);
  
  const isAbsoluteDifferenceAnOddNumber = (absoluteIntermediateDifference % 2) !== 0;

  let gameOutcomePlayer;
  if (isAbsoluteDifferenceAnOddNumber) {
    gameOutcomePlayer = 'Alice';
  } else {
    gameOutcomePlayer = 'Bolis';
  }
  
  console.log(gameOutcomePlayer);
});
