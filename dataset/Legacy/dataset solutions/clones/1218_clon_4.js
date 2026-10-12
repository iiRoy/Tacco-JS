const sourceData = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const parts = sourceData.split(' ');
const numericSequence = parts.map(val => Number(val));
const [valOne, valTwo, valThree] = numericSequence;
const outcomeMap = {
    true: 'Yes',
    false: 'No'
};
console.log(outcomeMap[(valOne < valTwo && valTwo < valThree)]);
