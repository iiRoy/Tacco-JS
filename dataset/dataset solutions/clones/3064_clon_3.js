const parseNumberString = (inputString) => {
  return parseInt(inputString, 10);
};

function processInput(rawData) {
  const trimmedContent = rawData.trim();
  const contentLines = trimmedContent.split('\n');

  const numericValues = contentLines.map(parseNumberString);

  const valueA = numericValues[4];
  const valueB = numericValues[0];
  const valueC = numericValues[5];

  const calculatedDifference = valueA - valueB;

  const positiveOutcomeMessage = 'Yay!';
  const negativeOutcomeMessage = ':(';

  if (calculatedDifference <= valueC) {
    console.log(positiveOutcomeMessage);
  } else {
    console.log(negativeOutcomeMessage);
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
