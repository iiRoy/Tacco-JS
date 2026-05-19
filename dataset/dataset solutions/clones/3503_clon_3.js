var fileSystemModule = require('fs');

var rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

function determineTransformedValue(inputCharacter) {
  const characterAsNumber = Number(inputCharacter);
  if (characterAsNumber === 1) {
    return 9;
  } else {
    return 1;
  }
}

var characterSequence = rawInputData.split('');

var processedNumericValues = [];
for (let i = 0; i < characterSequence.length; i++) {
  const currentCharacter = characterSequence[i];
  const transformedDigit = determineTransformedValue(currentCharacter);
  processedNumericValues.push(transformedDigit);
}

var concatenatedString = processedNumericValues.join('');
var finalResultNumber = Number(concatenatedString);

console.log(finalResultNumber);
