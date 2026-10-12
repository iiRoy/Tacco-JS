const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = fileContent.split('\n');

const reduceToSingleDigit = (currentSequence) => {
  if (currentSequence.length === 1) {
    return currentSequence[0];
  }

  const processedSequence = currentSequence.slice(0, -1).map((_val, idx) => {
    return (currentSequence[idx] + currentSequence[idx + 1]) % 10;
  });

  return reduceToSingleDigit(processedSequence);
};

dataRows.slice(0, -1).forEach((digitString) => {
  const initialSequence = Array.from(digitString, Number);
  const finalDigit = reduceToSingleDigit(initialSequence);
  console.log(finalDigit);
});
