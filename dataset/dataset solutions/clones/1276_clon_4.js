function processInputContent(rawData) {
  const contentLines = rawData.split('\n');
  const numStringSequence = contentLines[1];
  const numericElements = numStringSequence.split(' ').map(token => parseInt(token, 10));

  const finalResultString = numericElements.reduceRight((accumulator, currentNumber) => {
    return accumulator + currentNumber + ' ';
  }, '');

  console.log(finalResultString.trim());
}

const sourceData = require('fs').readFileSync('/dev/stdin', 'utf-8');
processInputContent(sourceData);