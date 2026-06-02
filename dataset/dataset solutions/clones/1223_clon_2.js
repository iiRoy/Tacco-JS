const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

const parsedNumbers = rawInputData.split(' ').map( (strNum) => parseInt(strNum) );

const orderedValues = parsedNumbers.sort();

const finalOutputString = orderedValues.slice(1).reduce( (accumulatorString, currentValue) => accumulatorString + ' ' + currentValue, orderedValues[0] );

console.log(finalOutputString);
