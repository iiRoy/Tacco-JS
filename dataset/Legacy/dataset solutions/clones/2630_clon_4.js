'use strict';

function processData(rawData) {
  const numericValues = rawData.split('\n').at(1).split(' ').map(Number);

  const finalCalculation = 1 / numericValues.reduce((accumulator, currentElement) => {
    return accumulator + (1 / currentElement);
  }, 0);

  console.log(finalCalculation);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim());
